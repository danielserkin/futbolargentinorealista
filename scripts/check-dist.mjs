import { access, readFile, readdir } from 'node:fs/promises'

const dist = new URL('../dist/', import.meta.url)
const index = await readFile(new URL('index.html', dist), 'utf8')
const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8')
const requiredPages = ['metodologia.html', 'formato.html', 'herramientas.html', 'temporada-2025-26.html']
const adsterraLoader = await readFile(new URL('adsterra-static.js', dist), 'utf8')
const adsterraFrame = await readFile(new URL('adsterra-frame.html', dist), 'utf8')

if (index.includes('<div id="root"></div>')) throw new Error('Homepage root is empty after prerender')
if (!index.includes('<table>') || index.includes('Cargando resultados reales')) throw new Error('The actual league table must be available without JavaScript')
if (!index.includes('id="initial-data"')) throw new Error('Hydration data is missing')
for (const match of index.matchAll(/(?:src|href)="([^" ]*assets\/[^" ]+)"/g)) {
  await access(new URL(match[1].replace(/^\.\//, '').replace(/^\//, ''), dist))
}
if (!index.includes('Una tabla comparable, no otro torneo inventado')) throw new Error('Editorial homepage content is missing')
if (!index.includes('name="google-adsense-account"')) throw new Error('AdSense verification meta tag is missing')
if (index.includes('pagead2.googlesyndication.com') || index.includes('class="adsbygoogle"')) {
  throw new Error('Homepage requests or renders ads during review')
}

for (const page of requiredPages) {
  await access(new URL(page, dist))
  if (!sitemap.includes(`/${page}`)) throw new Error(`${page} is missing from sitemap.xml`)
  const content = await readFile(new URL(page, dist), 'utf8')
  if (!content.includes('/adsterra-static.js')) throw new Error(`${page} is missing its responsive banner`)
}

if (!adsterraLoader.includes('728') || !adsterraLoader.includes('320')) throw new Error('Responsive Adsterra units are incomplete')
if (!adsterraFrame.includes('/adsterra-static.js') || !adsterraFrame.includes('noindex')) throw new Error('Adsterra frame is incomplete')

const directory = await readFile(new URL('clubes/index.html', dist), 'utf8')
const clubPages = (await readdir(new URL('clubes/', dist))).filter((name) => name.endsWith('.html') && name !== 'index.html')
if (clubPages.length < 20) throw new Error('Expected at least 20 real club profiles')
const paths = ['index.html', 'clubes/index.html', 'novedades.html', ...clubPages.map((name) => `clubes/${name}`)]
for (const path of paths) {
  const content = await readFile(new URL(path, dist), 'utf8')
  if (path !== 'index.html' && !content.includes('/adsterra-static.js')) throw new Error(`${path}: responsive advertising is missing`)
  const canonical = content.match(/rel="canonical" href="([^"]+)"/)?.[1]
  if (!canonical || !sitemap.includes(`<loc>${canonical}</loc>`)) throw new Error(`${path}: canonical missing from sitemap`)
  if (!content.includes('property="og:image"') || !content.includes('name="twitter:card"')) throw new Error(`${path}: social preview missing`)
  const imageUrl = content.match(/property="og:image" content="([^"]+)"/)?.[1]
  const png = await readFile(new URL(new URL(imageUrl).pathname.slice(1), dist))
  if (png.toString('hex', 0, 8) !== '89504e470d0a1a0a' || png.readUInt32BE(16) !== 1200 || png.readUInt32BE(20) !== 630) throw new Error(`${path}: invalid social PNG`)
  for (const match of content.matchAll(/href="(\/clubes\/[^"?#]*)/g)) {
    const target = match[1].endsWith('/') ? `${match[1]}index.html` : match[1]
    await access(new URL(target.slice(1), dist))
  }
  if (path.startsWith('clubes/') && path !== 'clubes/index.html') {
    if (!directory.includes(`/${path}`)) throw new Error(`${path}: orphaned club profile`)
    if (!content.includes('Últimos resultados de') || !content.includes('Cómo se calcula esta ficha')) throw new Error(`${path}: club content incomplete`)
  }
}
const feed = await readFile(new URL('feed.xml', dist), 'utf8')
const ids = [...feed.matchAll(/<guid isPermaLink="false">(.*?)<\/guid>/g)].map((match) => match[1])
if (ids.length === 0 || new Set(ids).size !== ids.length || ids.some((id) => !id.startsWith('futbolrealista:partido:'))) throw new Error('RSS match IDs are missing or duplicated')
console.log(`Validated full-table HTML, hydration, ads, ${clubPages.length} linked profiles, social PNGs, sitemap and RSS.`)
