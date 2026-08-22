import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronDown, CircleAlert, Clock3, ExternalLink, Info, Shield, Sparkles, Trophy } from 'lucide-react'
import { calculateSeasonStandings, inDateRange } from './standings'
import type { FootballData, Match, SeasonDefinition, StandingRow, Team } from './types'

const seasons: SeasonDefinition[] = [
  { id: '2025-26', label: '2025/26', start: '2025-07-01', end: '2026-06-30', state: 'finalizada' },
  { id: '2026-27', label: '2026/27', start: '2026-07-01', end: '2027-06-30', state: 'en-curso' },
]

const roundNames: Record<string, string> = {
  final: 'Final',
  semifinals: 'Semifinales',
  'quarter-finals': 'Cuartos de final',
  'round-of-16': 'Octavos de final',
  'round-of-32': '16avos de final',
  'round-of-64': '32avos de final',
}

type View = 'liga' | 'copa' | 'supercopa'

const positionClass = (position: number) => {
  if (position === 1) return 'champion'
  if (position <= 6) return 'libertadores'
  if (position <= 12) return 'sudamericana'
  if (position === 17) return 'promotion'
  if (position >= 18) return 'relegation'
  return ''
}

function TeamBadge({ team, small = false }: { team: Team; small?: boolean }) {
  return team.logo ? (
    <img className={small ? 'team-logo small' : 'team-logo'} src={team.logo} alt="" loading="lazy" />
  ) : (
    <span className={small ? 'logo-fallback small' : 'logo-fallback'}>{team.name.charAt(0)}</span>
  )
}

function StandingsTable({ rows }: { rows: StandingRow[] }) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr><th>Pos</th><th className="team-heading">Club</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={positionClass(row.position)}>
              <td><span className="position"><i />{row.position}</span></td>
              <td><div className="team-cell"><TeamBadge team={row} /><span>{row.name}</span>{row.position === 1 && <Trophy size={15} />}</div></td>
              <td>{row.played}</td><td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td>
              <td>{row.goalsFor}</td><td>{row.goalsAgainst}</td><td>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td><td className="points">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty"><CircleAlert size={22} /><p>{text}</p></div>
}

function LeagueView({ data, season }: { data: FootballData; season: SeasonDefinition }) {
  const matches = useMemo(() => data.league.filter((match) => inDateRange(match.date, season.start, season.end)), [data, season])
  const seasonTable = useMemo(() => calculateSeasonStandings(matches), [matches])
  const standings = seasonTable.standings
  const visible = standings.slice(0, 20)
  const excluded = standings.slice(20)
  const played = seasonTable.regularMatches.filter((match) => match.completed).length
  const playoffsExcluded = matches.filter((match) => match.completed && !match.round.startsWith('torneo-')).length

  return (
    <>
      <div className="section-title-row">
        <div><span className="eyebrow">TABLA GENERAL · SÓLO FASE REGULAR</span><h2>La liga que debería ser</h2><p>{played} partidos regulares computados · {playoffsExcluded} partidos de playoff excluidos</p></div>
        <div className="status-stack"><span className="regular-pill"><Shield size={12} /> Sin playoffs</span><span className={`season-status ${season.state}`}><i />{season.state === 'en-curso' ? 'En curso' : 'Finalizada'}</span></div>
      </div>
      {visible.length ? <StandingsTable rows={visible} /> : <EmptyState text="Todavía no hay partidos finalizados en esta temporada." />}
      {excluded.length > 0 && (
        <details className="excluded">
          <summary><span><ChevronDown size={18} /> Excluidos de la liga</span><b>{excluded.length} clubes</b></summary>
          <div className="excluded-list">
            {excluded.map((team) => <div key={team.id}><span>{team.position}</span><TeamBadge team={team} small /><strong>{team.name}</strong><b>{team.points} pts</b></div>)}
          </div>
        </details>
      )}
      {seasonTable.partial.length > 0 && (
        <details className="excluded partial">
          <summary><span><ChevronDown size={18} /> Participación parcial</span><b>{seasonTable.partial.length} clubes fuera de la tabla</b></summary>
          <div className="excluded-list">
            {seasonTable.partial.map((team) => <div key={team.id}><span>–</span><TeamBadge team={team} small /><strong>{team.name}</strong><b>{team.played} PJ</b></div>)}
          </div>
        </details>
      )}
      <Rules />
    </>
  )
}

function Rules() {
  const rules = [
    ['gold', 'Campeón', '1.º'], ['blue', 'Copa Libertadores', '1.º al 6.º'], ['green', 'Copa Sudamericana', '7.º al 12.º'],
    ['orange', 'Promoción', '17.º'], ['red', 'Descenso directo', '18.º al 20.º'],
  ]
  return (
    <section className="rules-card">
      <div className="rules-copy"><Info size={21} /><div><h3>Cómo funciona esta liga</h3><p>Contamos únicamente la fase regular de cada torneo: octavos, cuartos, semifinales y finales no suman. Así ningún club obtiene partidos extra por clasificar a playoffs. Si un club participó sólo en uno de los dos semestres, figura como participación parcial y queda fuera de la tabla. Victoria 3 puntos, empate 1.</p></div></div>
      <div className="legend">{rules.map(([color, label, range]) => <div key={label}><i className={color} /><span>{label}</span><b>{range}</b></div>)}</div>
    </section>
  )
}

function MatchCard({ match }: { match: Match }) {
  const date = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(match.date))
  return (
    <article className="match-card">
      <div className="match-meta"><span>{date}</span><span>{match.completed ? 'Final' : match.status}</span></div>
      <div className="match-team"><span><TeamBadge team={match.home} small />{match.home.shortName}</span><b>{match.homeScore ?? '–'}</b></div>
      <div className="match-team"><span><TeamBadge team={match.away} small />{match.away.shortName}</span><b>{match.awayScore ?? '–'}</b></div>
      {match.note && <small>{match.note}</small>}
    </article>
  )
}

function CupView({ data }: { data: FootballData }) {
  const years = [...new Set(data.cup.map((match) => match.date.slice(0, 4)))].sort().reverse()
  const [year, setYear] = useState(years[0] ?? '2026')
  const matches = data.cup.filter((match) => match.date.startsWith(year))
  const roundOrder = ['final', 'semifinals', 'quarter-finals', 'round-of-16', 'round-of-32', 'round-of-64']
  const rounds = roundOrder.map((round) => [round, matches.filter((match) => match.round === round)] as const).filter(([, items]) => items.length)

  return (
    <>
      <div className="section-title-row">
        <div><span className="eyebrow">FORMATO REAL · SIN CAMBIOS</span><h2>Copa Argentina</h2><p>El camino federal, partido a partido.</p></div>
        <select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Año de Copa Argentina">{years.map((item) => <option key={item}>{item}</option>)}</select>
      </div>
      {rounds.length ? rounds.map(([round, items]) => (
        <section className="cup-round" key={round}>
          <div className="round-heading"><span>{roundNames[round] ?? round}</span><i /> <b>{items.length} {items.length === 1 ? 'partido' : 'partidos'}</b></div>
          <div className="match-grid">{items.map((match) => <MatchCard key={match.id} match={match} />)}</div>
        </section>
      )) : <EmptyState text="Todavía no hay partidos disponibles para esta edición." />}
    </>
  )
}

function findCupChampion(matches: Match[], year: string): Team | null {
  const final = matches.find((match) => match.date.startsWith(year) && match.round === 'final' && match.completed)
  if (!final) return null
  return final.homeWinner ? final.home : final.awayWinner ? final.away : null
}

function Finalist({ team, label }: { team: Team | null; label: string }) {
  return <div className="finalist">{team ? <TeamBadge team={team} /> : <span className="mystery">?</span>}<div><small>{label}</small><strong>{team?.name ?? 'Por definirse'}</strong></div></div>
}

function SupercupView({ data, season }: { data: FootballData; season: SeasonDefinition }) {
  const table = calculateSeasonStandings(data.league.filter((match) => inDateRange(match.date, season.start, season.end))).standings
  const leagueChampion = season.state === 'finalizada' ? table[0] ?? null : null
  const cupYear = season.id.slice(0, 4)
  const cupChampion = findCupChampion(data.cup, cupYear)
  return (
    <>
      <div className="section-title-row"><div><span className="eyebrow">UN PARTIDO · DOS CAMPEONES</span><h2>Supercopa Realista</h2><p>La final que conecta nuestra liga con la Copa Argentina real.</p></div></div>
      <div className="supercup-card">
        <div className="supercup-glow" />
        <span className="final-label">SUPERCOPA {season.label}</span>
        <Trophy className="big-trophy" size={54} />
        <div className="finalists"><Finalist team={leagueChampion} label="Campeón de Liga" /><span className="versus">VS</span><Finalist team={cupChampion} label={`Copa Argentina ${cupYear}`} /></div>
        <p>{leagueChampion && cupChampion ? 'Los dos finalistas están confirmados.' : 'El partido se confirmará cuando estén definidos ambos campeones.'}</p>
      </div>
    </>
  )
}

function App() {
  const [data, setData] = useState<FootballData | null>(null)
  const [error, setError] = useState(false)
  const [view, setView] = useState<View>('liga')
  const [seasonId, setSeasonId] = useState('2026-27')
  const season = seasons.find((item) => item.id === seasonId)!

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/football.json`).then((response) => {
      if (!response.ok) throw new Error('Data unavailable')
      return response.json()
    }).then(setData).catch(() => setError(true))
  }, [])

  return (
    <div className="app">
      <div className="topline" />
      <header>
        <a className="brand" href="#"><span className="brand-mark"><span>AR</span></span><div><strong>FÚTBOL ARGENTINO</strong><small>REALISTA</small></div></a>
        <nav aria-label="Secciones">
          <button className={view === 'liga' ? 'active' : ''} onClick={() => setView('liga')}>Liga</button>
          <button className={view === 'copa' ? 'active' : ''} onClick={() => setView('copa')}>Copa Argentina</button>
          <button className={view === 'supercopa' ? 'active' : ''} onClick={() => setView('supercopa')}>Supercopa</button>
        </nav>
        <div className="live-pill"><i /> DATOS REALES</div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy"><span className="hero-kicker"><Sparkles size={14} /> EL TORNEO QUE MERECEMOS</span><h1>Fútbol argentino.<br /><em>Pero bien hecho.</em></h1><p>Resultados reales. Una temporada larga. Una tabla simple.<br />Sin zonas, sin vueltas.</p></div>
          <div className="hero-number"><span>20</span><div>CLUBES<br /><b>UNA LIGA</b></div></div>
        </section>

        <aside className="ad-banner"><span>ESPACIO PUBLICITARIO</span><div><Shield size={23} /><strong>Tu marca puede jugar acá</strong></div><a href="mailto:publicidad@futbolargentinorealista.com">Contactar <ExternalLink size={13} /></a></aside>

        <section className="content-card">
          <div className="toolbar">
            <div className="mobile-tabs"><button className={view === 'liga' ? 'active' : ''} onClick={() => setView('liga')}>Liga</button><button className={view === 'copa' ? 'active' : ''} onClick={() => setView('copa')}>Copa</button><button className={view === 'supercopa' ? 'active' : ''} onClick={() => setView('supercopa')}>Supercopa</button></div>
            {view !== 'copa' && <label><CalendarDays size={17} /><span>Temporada</span><select value={seasonId} onChange={(event) => setSeasonId(event.target.value)}>{seasons.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>}
            {data && <span className="updated"><Clock3 size={14} /> Actualizado {new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(data.metadata.updatedAt))}</span>}
          </div>
          <div className="content-body">
            {error && <EmptyState text="No pudimos cargar los datos. Probá de nuevo en unos minutos." />}
            {!data && !error && <div className="loading"><i /><span>Cargando resultados reales…</span></div>}
            {data && view === 'liga' && <LeagueView data={data} season={season} />}
            {data && view === 'copa' && <CupView data={data} />}
            {data && view === 'supercopa' && <SupercupView data={data} season={season} />}
          </div>
        </section>
      </main>
      <footer><span>Fútbol Argentino Realista</span><p>Sitio independiente. No afiliado a AFA ni a sus competencias. Datos deportivos de acceso público.</p><b>Hecho en Argentina 🇦🇷</b></footer>
    </div>
  )
}

export default App
