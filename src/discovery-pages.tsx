import type { ReactNode } from 'react'
import { clubPath, defaultSeasonId, publishedTeams, seasons, seasonTable, shareLinks } from './discovery'
import { currentStreak, latestCompleted, recentForm, teamMatches } from './insights'
import type { FootballData, Match, Team } from './types'

const dateLabel = (date: string) => new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(date))

function Layout({ children }: { children: ReactNode }) {
  return <><div className="topline" /><header><a className="brand" href="/">FÚTBOL ARGENTINO <b>REALISTA</b></a><nav className="site-nav"><a href="/">Tabla</a><a href="/clubes/">Clubes</a><a href="/novedades.html">Novedades</a></nav></header>
    <main>{children}</main><footer><span>Fútbol Argentino Realista · Proyecto independiente</span><a href="/metodologia.html">Metodología</a><a href="/formato.html">Formato</a><a href="/feed.xml">RSS</a><a href="https://primal.net/p/npub1m9e2k4v2ftsekncwkjhjtwk94rs8x299f29muywqgklw9ddfmdwq2e8q7l" rel="me">Seguinos en Nostr</a><a href="/contacto.html">Contacto</a><a href="/privacidad.html">Privacidad</a></footer></>
}

function Sharing({ path, text }: { path: string; text: string }) {
  const links = shareLinks(path, text)
  return <nav className="sharing" aria-label="Compartir"><span>Compartí el debate</span><a className="button" href={links.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a><a className="button" href={links.x} target="_blank" rel="noopener noreferrer">X</a></nav>
}

function Results({ matches }: { matches: Match[] }) {
  return <ul className="results-list">{matches.map((match) => <li key={match.id}><time dateTime={match.date}>{dateLabel(match.date)}</time><span><a href={clubPath(match.home)}>{match.home.name}</a> <strong>{match.homeScore}–{match.awayScore}</strong> <a href={clubPath(match.away)}>{match.away.name}</a></span></li>)}</ul>
}

export function ClubPage({ data, team }: { data: FootballData; team: Team }) {
  return <Layout><div className="eyebrow">FICHA DEL CLUB · RESULTADOS REALES</div><h1>{team.name}</h1>
    <p className="lead">Puntos, posición y últimos resultados de {team.name} en nuestra tabla alternativa del fútbol argentino. Temporadas de julio a junio, sin sumar partidos de playoffs.</p>
    <p>Datos verificados el <time dateTime={data.metadata.updatedAt}>{dateLabel(data.metadata.updatedAt)}</time>. Fuente: marcador público de ESPN.</p>
    <Sharing path={clubPath(team)} text={`¿Dónde queda ${team.name} en una liga larga? Mirá sus puntos, racha y resultados en Fútbol Argentino Realista.`} />
    {[...seasons].reverse().map((season) => {
      const table = seasonTable(data, season)
      const ranked = table.standings.find((row) => row.id === team.id)
      const row = ranked ?? table.partial.find((item) => item.id === team.id)
      if (!row) return null
      const results = latestCompleted(teamMatches(table.regularMatches, team.id), 5)
      const form = recentForm(table.regularMatches, team.id)
      return <article className="season-article" id={`temporada-${season.id}`} key={season.id}>
        <span className="eyebrow">{season.state === 'finalizada' ? 'TEMPORADA FINALIZADA' : 'TEMPORADA EN CURSO'}</span><h2>Temporada {season.label}</h2>
        <p>{ranked ? `${team.name} ocupa el puesto ${row.position} de ${table.standings.length} clubes clasificados, con ${row.points} puntos en ${row.played} partidos regulares.` : `${team.name} tiene participación parcial: sus resultados se muestran como referencia, pero no integra la clasificación de esta temporada.`} {ranked && row.position > 20 ? 'Está fuera de los 20 puestos visibles de la liga propuesta.' : ''}</p>
        <div className="stat-grid"><div><strong>{row.points}</strong><span>Puntos</span></div><div><strong>{row.played}</strong><span>Partidos</span></div><div><strong>{ranked ? `${row.position}.º` : 'Parcial'}</strong><span>{ranked ? 'Posición alternativa' : 'Participación'}</span></div></div>
        <p>{row.won} victorias, {row.drawn} empates y {row.lost} derrotas. {row.goalsFor} goles a favor y {row.goalsAgainst} en contra; diferencia de gol: {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}.</p>
        <h3>Forma y racha</h3><p>Últimos {form.length} partidos, del más antiguo al más reciente: <strong>{form.join(' · ')}</strong> (G: ganado, E: empatado, P: perdido). Racha: {currentStreak(table.regularMatches, team.id)}.</p>
        <h3>Últimos resultados de {season.label}</h3><Results matches={results} />
        {ranked && <a className="button" href={`/?${new URLSearchParams({ vista: 'clubes', club: team.id, temporada: season.id })}`}>Comparar {team.name} con otro club</a>}
      </article>
    })}
    <article className="season-article"><h2>Cómo se calcula esta ficha</h2><p>Se usan los resultados reales de las fases regulares: victoria suma tres puntos y empate uno. Los desempates se resuelven por diferencia de gol, goles a favor, victorias y nombre. No se agregan encuentros hipotéticos ni se incluyen playoffs.</p><p>Esta clasificación es una propuesta independiente; no es la tabla oficial de AFA. Las zonas y los calendarios de los torneos originales pueden producir diferencias en rivales y partidos disputados. <a href="/metodologia.html">Consultá la metodología y sus límites</a>.</p><a className="button" href="/clubes/">Explorar todos los clubes</a></article>
  </Layout>
}

export function ClubDirectory({ data }: { data: FootballData }) {
  return <Layout><span className="eyebrow">EL FÚTBOL ARGENTINO, CLUB POR CLUB</span><h1>Fichas de clubes</h1><p className="lead">Buscá tu equipo: puntos, rachas y últimos partidos bajo las mismas reglas. Cada ficha reúne las temporadas disponibles y permite abrir el comparador.</p><ul className="club-directory">{publishedTeams(data).map((team) => <li key={team.id}><a href={clubPath(team)}>{team.name}<span>Ver estadísticas →</span></a></li>)}</ul><p>La participación parcial se identifica en cada ficha. <a href="/formato.html">Conocé el formato de la liga propuesta</a>.</p></Layout>
}

export function NewsPage({ data }: { data: FootballData }) {
  const season = seasons.find((item) => item.id === defaultSeasonId)!
  const table = seasonTable(data, season)
  const leader = table.standings[0]
  const recent = latestCompleted(table.regularMatches, 10)
  return <Layout><span className="eyebrow">LA TEMPORADA, AL DÍA</span><h1>Novedades de la liga</h1><p className="lead">Así va la temporada {season.label} en Fútbol Argentino Realista: los resultados reales del fútbol local, reunidos en una tabla larga sin playoffs.</p>
    <p>Datos verificados el <time dateTime={data.metadata.updatedAt}>{dateLabel(data.metadata.updatedAt)}</time>.</p>
    {leader && <article><h2>{leader.name}, primero en nuestra tabla</h2><p><a href={clubPath(leader)}>{leader.name}</a> encabeza la clasificación alternativa con {leader.points} puntos en {leader.played} partidos. La diferencia de gol es {leader.goalDifference > 0 ? '+' : ''}{leader.goalDifference}.</p><p>Estos son los cinco primeros. Compará también los partidos jugados: los equipos pueden tener encuentros pendientes.</p><ol className="leaders">{table.standings.slice(0, 5).map((row) => <li key={row.id}><a href={clubPath(row)}>{row.name}</a><strong>{row.points} pts · {row.played} PJ</strong></li>)}</ol><a className="button" href="/">Ver la tabla completa</a></article>}
    <Sharing path="/novedades.html" text={`¿Cómo va la liga sin zonas? Mirá la tabla alternativa ${season.label} y los últimos resultados.`} />
    <article><h2>Últimos partidos regulares</h2><Results matches={recent} /><p>Los playoffs no suman puntos en este proyecto. <a href="/metodologia.html">Ver cómo seleccionamos los partidos</a>.</p></article>
    <p className="note">Podés seguir los resultados con <a href="/feed.xml">nuestro feed RSS</a>: copiá el enlace en tu lector de noticias. No hace falta registrarse.</p>
  </Layout>
}
