import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { socialCard } from './social-card.mjs'

const dist = new URL('../dist/', import.meta.url)
const server = await import(new URL('../.prerender/entry-server.js', import.meta.url).href)
const { render, renderClub, renderDirectory, renderNews, renderRivalry, renderRivalryDirectory, clubPath, clubSlug, publishedTeams, rivalries, rivalryPath, rivalryTeams, seasons, seasonTable, siteUrl, defaultSeasonId, campaignUrl } = server
const html = await readFile(new URL('index.html', dist), 'utf8')
const data = JSON.parse(await readFile(new URL('data/football.json', dist), 'utf8'))
const marker = '<div id="root"></div>'
if (!html.includes(marker)) throw new Error('Prerender marker was not found in dist/index.html')
const escape = (value) => String(value).replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char])
const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
const season = seasons.find((item) => item.id === defaultSeasonId)
const table = seasonTable(data, season)
const teams = publishedTeams(data)
const verifiedDate = new Date(data.metadata.updatedAt).toISOString().slice(0, 10)
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const contentVersion = hash(await readFile(new URL('../.prerender/entry-server.js', import.meta.url), 'utf8'))
const manifest = {
  '/': hash([contentVersion, data.league, data.cup]),
  '/clubes/': hash([contentVersion, teams]),
  '/clasicos/': hash([contentVersion, rivalries]),
  '/novedades.html': hash([contentVersion, table.standings.slice(0, 5), table.regularMatches]),
}
const dateLabel = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(data.metadata.updatedAt))
const analytics = html.match(/<!-- Cloudflare Web Analytics -->[\s\S]*?<!-- End Cloudflare Web Analytics -->/)?.[0] ?? ''
const feedHead = `<link rel="alternate" type="application/rss+xml" title="Fútbol Argentino Realista: resultados" href="${siteUrl}/feed.xml" />`
const responsiveBanner = '<aside class="static-ad" aria-label="Publicidad"><span>PUBLICIDAD</span><div><script src="/adsterra-static.js"></script></div></aside>'

const socialHead = (title, description, path, imagePath) => `
<meta property="og:type" content="website" />
<meta property="og:locale" content="es_AR" />
<meta property="og:site_name" content="Fútbol Argentino Realista" />
<meta property="og:title" content="${escape(title)}" />
<meta property="og:description" content="${escape(description)}" />
<meta property="og:url" content="${siteUrl}${path}" />
<meta property="og:image" content="${siteUrl}${imagePath}" />
<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" /><meta property="og:image:alt" content="${escape(title)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escape(title)}" />
<meta name="twitter:description" content="${escape(description)}" />
<meta name="twitter:image" content="${siteUrl}${imagePath}" />
${feedHead}`

const staticPage = ({ title, description, path, imagePath = '/social/liga.png', body }) => `<!doctype html>
<html lang="es-AR"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escape(title)}</title><meta name="description" content="${escape(description)}" /><meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${siteUrl}${path}" /><link rel="stylesheet" href="/legal.css" /><link rel="stylesheet" href="/discovery.css" />
${socialHead(title, description, path, imagePath)}
<script type="application/ld+json">${safeJson({ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: `${siteUrl}${path}`, inLanguage: 'es-AR', isPartOf: { '@type': 'WebSite', name: 'Fútbol Argentino Realista', url: siteUrl } })}</script>
</head><body>${body.replace(/(<p class="lead">[\s\S]*?<\/p>)/, `$1${responsiveBanner}`)}${analytics}</body></html>`

await mkdir(new URL('clubes/', dist), { recursive: true })
await mkdir(new URL('clasicos/', dist), { recursive: true })
await mkdir(new URL('social/', dist), { recursive: true })
const homepageTitle = `Tabla del fútbol argentino ${season.label}, sin playoffs | Fútbol Realista`
const homepageDescription = `Consultá la tabla alternativa del fútbol argentino ${season.label}: puntos, posiciones, rachas y comparador de clubes. Resultados reales en una temporada larga.`
let homepage = html.replace(/<title>.*?<\/title>/, `<title>${escape(homepageTitle)}</title>`)
  .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escape(homepageDescription)}" />`)
  .replace('</head>', `${socialHead(homepageTitle, homepageDescription, '/', '/social/liga.png')}\n</head>`)
  .replace(marker, `<div id="root">${render(data)}</div><script id="initial-data" type="application/json">${safeJson(data)}</script>`)
await writeFile(new URL('index.html', dist), homepage)
await writeFile(new URL('social/liga.png', dist), socialCard({ title: 'Fútbol argentino. Pero bien hecho.', subtitle: 'Resultados reales. Una temporada larga. Sin playoffs.', stats: [{ value: season.label, label: 'TEMPORADA' }, { value: '20', label: 'PUESTOS EN LA LIGA' }, { value: '3 / 1 / 0', label: 'PUNTOS POR RESULTADO' }], footer: 'Explorá la tabla y compará a tu equipo.' }))

const generatedPaths = ['/clubes/', '/clasicos/', '/novedades.html']
for (const team of teams) {
  const path = clubPath(team)
  const row = table.standings.find((item) => item.id === team.id)
  const description = row
    ? `${team.name}: puesto ${row.position}, ${row.points} puntos en ${row.played} partidos de la tabla alternativa ${season.label}. Rachas, resultados y comparación entre clubes.`
    : `Estadísticas de ${team.name} en Fútbol Argentino Realista: resultados regulares, temporadas disponibles y participación en la tabla alternativa.`
  const imagePath = `/social/${clubSlug(team)}.png`
  manifest[path] = hash([contentVersion, team, seasons.map((item) => {
    const seasonData = seasonTable(data, item)
    return { row: seasonData.standings.find((row) => row.id === team.id) ?? seasonData.partial.find((row) => row.id === team.id), matches: seasonData.regularMatches.filter((match) => match.home.id === team.id || match.away.id === team.id) }
  })])
  await writeFile(new URL(path.slice(1), dist), staticPage({ title: `${team.name}: puntos, posición y resultados | Fútbol Realista`, description, path, imagePath, body: renderClub(data, team) }))
  await writeFile(new URL(imagePath.slice(1), dist), socialCard({ title: team.name, subtitle: row ? `Su lugar en nuestra liga ${season.label}, sin playoffs.` : 'Resultados y estadísticas de las temporadas disponibles.', stats: row ? [{ value: `${row.position}.º`, label: 'POSICIÓN ALTERNATIVA' }, { value: row.points, label: 'PUNTOS' }, { value: row.played, label: 'PARTIDOS REGULARES' }] : [], footer: `Datos verificados: ${dateLabel}` }))
  generatedPaths.push(path)
}
await writeFile(new URL('clubes/index.html', dist), staticPage({ title: 'Clubes del fútbol argentino: estadísticas y resultados | Fútbol Realista', description: 'Fichas de clubes del fútbol argentino: puntos, posición, rachas y resultados por temporada, con un comparador bajo las mismas reglas.', path: '/clubes/', body: renderDirectory(data) }))
await writeFile(new URL('clasicos/index.html', dist), staticPage({ title: `Clásicos del fútbol argentino: comparador ${season.label} | Fútbol Realista`, description: 'Compará Boca–River, Racing–Independiente, el clásico rosarino, el santafesino y Huracán–San Lorenzo: puntos, posiciones, goles, rachas y cruces.', path: '/clasicos/', imagePath: '/social/clasicos.png', body: renderRivalryDirectory(data) }))
await writeFile(new URL('social/clasicos.png', dist), socialCard({ title: 'Los clásicos, cara a cara', subtitle: `Comparador actualizado de la temporada ${season.label}.`, stats: [{ value: '5', label: 'CLÁSICOS' }, { value: '10', label: 'EQUIPOS' }, { value: '1', label: 'MISMA REGLA' }], footer: `Datos verificados: ${dateLabel}` }))
for (const rivalry of rivalries) {
  const rivalryPair = rivalryTeams(data, rivalry)
  if (!rivalryPair) continue
  const path = rivalryPath(rivalry)
  const imagePath = `/social/${rivalry.slug}.png`
  const [first, second] = rivalryPair
  const rows = rivalryPair.map((team) => table.standings.find((row) => row.id === team.id) ?? table.partial.find((row) => row.id === team.id))
  manifest[path] = hash([contentVersion, rivalry, rows, data.league.filter((match) => rivalry.teamIds.includes(match.home.id) && rivalry.teamIds.includes(match.away.id)), data.cup.filter((match) => rivalry.teamIds.includes(match.home.id) && rivalry.teamIds.includes(match.away.id))])
  await writeFile(new URL(path.slice(1), dist), staticPage({ title: `${rivalry.name}: puntos, posiciones y resultados ${season.label} | Fútbol Realista`, description: `${first.name} vs. ${second.name}: compará puntos, posición, goles, rachas y cruces con datos actualizados de la temporada ${season.label}.`, path, imagePath, body: renderRivalry(data, rivalry) }))
  await writeFile(new URL(imagePath.slice(1), dist), socialCard({ title: rivalry.name, subtitle: `Cara a cara en nuestra liga larga ${season.label}.`, stats: rows.map((row, index) => ({ value: row ? `${row.points} pts` : 'Sin datos', label: rivalryPair[index].shortName.toUpperCase() })), footer: 'Posiciones, forma, goles y cruces disponibles.' }))
  generatedPaths.push(path)
}
await writeFile(new URL('novedades.html', dist), staticPage({ title: `Novedades y resultados ${season.label} | Fútbol Realista`, description: `Los primeros puestos y los últimos resultados de nuestra liga alternativa ${season.label}. Seguí la temporada larga del fútbol argentino sin playoffs.`, path: '/novedades.html', body: renderNews(data) }))
const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8')
await writeFile(new URL('sitemap.xml', dist), sitemap.replace('</urlset>', generatedPaths.map((path) => `  <url><loc>${siteUrl}${path}</loc><lastmod>${verifiedDate}</lastmod></url>`).join('\n') + '\n</urlset>'))

// Stable match IDs prevent a new verification/build from producing duplicate RSS items.
const recent = table.regularMatches.filter((match) => match.completed && match.homeScore !== null && match.awayScore !== null).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)
const feedItems = recent.map((match) => `<item><title>${escape(`${match.home.name} ${match.homeScore}–${match.awayScore} ${match.away.name}`)}</title><link>${escape(campaignUrl(clubPath(match.home), 'rss', 'resultados'))}</link><guid isPermaLink="false">futbolrealista:partido:${escape(match.id)}</guid><pubDate>${new Date(match.date).toUTCString()}</pubDate><description>${escape(`Resultado de fase regular incluido en la temporada ${season.label}. Consultá las estadísticas del club y la tabla alternativa en Fútbol Argentino Realista. No es una clasificación oficial de AFA.`)}</description></item>`).join('\n')
await writeFile(new URL('feed.xml', dist), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Fútbol Argentino Realista: resultados</title><link>${siteUrl}/novedades.html</link><description>Resultados reales y fichas de clubes de nuestra liga alternativa, sin playoffs.</description><language>es-ar</language><atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/><lastBuildDate>${new Date(data.metadata.updatedAt).toUTCString()}</lastBuildDate>${feedItems}</channel></rss>`)

// Reviewable campaign assets. This file is a build artifact, never a record of sent posts.
const campaign = 'lanzamiento-fichas'
const posts = [
  { channel: 'x', text: '¿Y si el fútbol argentino tuviera una temporada larga, sin zonas ni playoffs? En Fútbol Argentino Realista reunimos resultados reales en una tabla alternativa. Mirá dónde queda tu club.', path: '/' },
  { channel: 'comunidad', text: 'Somos Fútbol Argentino Realista, un proyecto independiente que reorganiza los resultados reales en temporadas de julio a junio. Publicamos fichas por club, rachas y un comparador. No es la tabla oficial de AFA; las reglas y las limitaciones están explicadas en el sitio. Nos interesa saber qué mejorarían de esta forma de mirar el torneo.', path: '/clubes/' },
  ...(table.standings[0] ? [{ channel: 'x', text: `${table.standings[0].name} lidera nuestra tabla alternativa ${season.label} con ${table.standings[0].points} puntos en ${table.standings[0].played} partidos. Datos verificados el ${dateLabel}. Resultados reales, sin sumar playoffs.`, path: clubPath(table.standings[0]) }] : []),
].map((post) => ({ ...post, url: campaignUrl(post.path, post.channel, campaign), status: 'draft', id: createHash('sha256').update(post.text + post.path).digest('hex').slice(0, 16) }))
await mkdir(new URL('../.growth/', import.meta.url), { recursive: true })
await writeFile(new URL('search-manifest.json', dist), JSON.stringify(manifest))
await writeFile(new URL('../.growth/current-search.json', import.meta.url), JSON.stringify(manifest))
await writeFile(new URL('../.growth/posts.json', import.meta.url), JSON.stringify({ generatedAt: data.metadata.updatedAt, posts }, null, 2) + '\n')
await rm(new URL('../.prerender/', import.meta.url), { recursive: true, force: true })
console.log(`Prerendered the full table, ${teams.length} club profiles, directory, news, social PNGs and RSS. Draft campaign: .growth/posts.json.`)
