import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, CalendarDays, ChevronDown, CircleAlert, Clock3, Goal, Info, Share2, Shield, Sparkles, Swords, TrendingUp, Trophy } from 'lucide-react'
import { calculateSeasonStandings, inDateRange } from './standings'
import { biggestWin, currentStreak, latestCompleted, leaderBy, nextScheduled, positionHistory, recentForm, teamMatches } from './insights'
import { canShowAds } from './monetization'
import type { FootballData, Match, SeasonDefinition, StandingRow, Team } from './types'
import { clubPath, defaultSeasonId, seasons } from './discovery'
import { ShareLinks } from './ShareLinks'

const roundNames: Record<string, string> = {
  final: 'Final',
  semifinals: 'Semifinales',
  'quarter-finals': 'Cuartos de final',
  'round-of-16': 'Octavos de final',
  'round-of-32': '16avos de final',
  'round-of-64': '32avos de final',
}

export type View = 'liga' | 'clubes' | 'copa' | 'supercopa'

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[]
  }
}

const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT?.trim()
const adsenseSlot = import.meta.env.VITE_ADSENSE_SLOT?.trim()
const adsenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true'
const adsenseConfigured = /^ca-pub-\d+$/.test(adsenseClient ?? '') && /^\d+$/.test(adsenseSlot ?? '')
const adProvider = import.meta.env.VITE_AD_PROVIDER === 'adsterra' ? 'adsterra' : 'adsense'
const adsEnabled = import.meta.env.VITE_ADS_ENABLED === 'true' || adsenseEnabled
const adsterraDesktopKey = import.meta.env.VITE_ADSTERRA_DESKTOP_KEY?.trim()
const adsterraDesktopScript = import.meta.env.VITE_ADSTERRA_DESKTOP_SCRIPT?.trim()
const adsterraMobileKey = import.meta.env.VITE_ADSTERRA_MOBILE_KEY?.trim()
const adsterraMobileScript = import.meta.env.VITE_ADSTERRA_MOBILE_SCRIPT?.trim()
const validAdsterraUnit = (key?: string, script?: string) => /^[a-zA-Z0-9]+$/.test(key ?? '') && /^https:\/\//.test(script ?? '')
const adsterraConfigured = validAdsterraUnit(adsterraDesktopKey, adsterraDesktopScript) || validAdsterraUnit(adsterraMobileKey, adsterraMobileScript)
const adsConfigured = adProvider === 'adsterra' ? adsterraConfigured : adsenseConfigured

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

function StandingsTable({ rows, onTeamSelect }: { rows: StandingRow[]; onTeamSelect?: (teamId: string) => void }) {
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
              <td><a className="team-cell team-link" href={clubPath(row)} onClick={(event) => {
                if (onTeamSelect && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                  event.preventDefault()
                  onTeamSelect(row.id)
                }
              }}><TeamBadge team={row} /><span>{row.name}</span>{row.position === 1 && <Trophy size={15} />}</a></td>
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

function FormDots({ results }: { results: ReturnType<typeof recentForm> }) {
  return <span className="form-dots" aria-label={`Últimos resultados: ${results.join(', ')}`}>
    {results.map((result, index) => <i className={result.toLowerCase()} key={`${result}-${index}`}>{result}</i>)}
  </span>
}

function LeaguePulse({ matches, rows }: { matches: Match[]; rows: StandingRow[] }) {
  const attack = leaderBy(rows, 'goalsFor')
  const defense = leaderBy(rows.filter((row) => row.played > 0), 'goalsAgainst', true)
  const inForm = [...rows].sort((a, b) => {
    const points = (row: StandingRow) => recentForm(matches, row.id).reduce((total, result) => total + (result === 'G' ? 3 : result === 'E' ? 1 : 0), 0)
    return points(b) - points(a) || b.goalDifference - a.goalDifference
  })[0] ?? null
  const widest = biggestWin(matches)
  const recent = latestCompleted(matches, 3)
  const upcoming = nextScheduled(matches, 3)

  return (
    <section className="league-pulse" aria-labelledby="pulse-title">
      <div className="block-heading"><div><span className="eyebrow">RADAR DE LA TEMPORADA</span><h3 id="pulse-title">La liga, de un vistazo</h3></div><p>Estadísticas calculadas sobre los partidos regulares.</p></div>
      <div className="insight-grid">
        <article><Goal size={19} /><small>Mejor ataque</small><strong>{attack?.name ?? '—'}</strong><span>{attack ? `${attack.goalsFor} goles` : 'Sin datos'}</span></article>
        <article><Shield size={19} /><small>Mejor defensa</small><strong>{defense?.name ?? '—'}</strong><span>{defense ? `${defense.goalsAgainst} recibidos` : 'Sin datos'}</span></article>
        <article><TrendingUp size={19} /><small>Mejor forma</small><strong>{inForm?.name ?? '—'}</strong>{inForm && <FormDots results={recentForm(matches, inForm.id)} />}</article>
        <article><Activity size={19} /><small>Mayor diferencia</small><strong>{widest ? `${widest.home.shortName} ${widest.homeScore}–${widest.awayScore} ${widest.away.shortName}` : '—'}</strong><span>{widest ? new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(widest.date)) : 'Sin datos'}</span></article>
      </div>
      <div className="schedule-grid">
        <div><h4>Últimos resultados</h4><div className="mini-match-grid">{recent.map((match) => <MatchCard match={match} key={match.id} />)}</div></div>
        <div><h4>Lo próximo</h4>{upcoming.length ? <div className="mini-match-grid">{upcoming.map((match) => <MatchCard match={match} key={match.id} />)}</div> : <p className="quiet">No hay próximos partidos confirmados.</p>}</div>
      </div>
    </section>
  )
}

function PositionChart({ matches, team }: { matches: Match[]; team: StandingRow }) {
  const history = positionHistory(matches, team.id).slice(-16)
  if (history.length < 2) return <p className="quiet">La evolución aparecerá cuando haya más fechas disputadas.</p>
  const maxPosition = Math.max(...history.map((point) => point.position), 2)
  const points = history.map((point, index) => {
    const x = 4 + (index / (history.length - 1)) * 92
    const y = 8 + ((point.position - 1) / (maxPosition - 1)) * 70
    return `${x},${y}`
  }).join(' ')
  return (
    <div className="position-chart">
      <svg viewBox="0 0 100 86" role="img" aria-label={`Evolución de posiciones de ${team.name}`} preserveAspectRatio="none">
        <line x1="4" y1="8" x2="96" y2="8" /><line x1="4" y1="78" x2="96" y2="78" />
        <polyline points={points} />
        {history.map((point, index) => {
          const [x, y] = points.split(' ')[index].split(',')
          return <circle key={`${point.date}-${index}`} cx={x} cy={y} r="1.5"><title>{point.date}: puesto {point.position}</title></circle>
        })}
      </svg>
      <div><span>Hace {history.length - 1} fechas: <b>{history[0].position}.º</b></span><span>Ahora: <b>{history.at(-1)?.position}.º</b></span></div>
    </div>
  )
}

function ComparisonBar({ label, first, second, lowerWins = false }: { label: string; first: number; second: number; lowerWins?: boolean }) {
  const max = Math.max(first, second, 1)
  const firstWins = lowerWins ? first < second : first > second
  const secondWins = lowerWins ? second < first : second > first
  return <div className="comparison-row"><span>{label}</span><div><b className={firstWins ? 'winner' : ''}>{first}</b><i style={{ width: `${(first / max) * 100}%` }} /></div><div><i style={{ width: `${(second / max) * 100}%` }} /><b className={secondWins ? 'winner' : ''}>{second}</b></div></div>
}

function ClubExplorer({ matches, rows, selectedId, onSelect }: { matches: Match[]; rows: StandingRow[]; selectedId: string | null; onSelect: (teamId: string) => void }) {
  const initialId = selectedId && rows.some((row) => row.id === selectedId) ? selectedId : rows[0]?.id ?? ''
  const [firstId, setFirstId] = useState(initialId)
  const [secondId, setSecondId] = useState(rows.find((row) => row.id !== initialId)?.id ?? '')
  const [shared, setShared] = useState(false)

  useEffect(() => {
    if (selectedId && rows.some((row) => row.id === selectedId)) setFirstId(selectedId)
  }, [selectedId, rows])

  const first = rows.find((row) => row.id === firstId) ?? rows[0]
  const second = rows.find((row) => row.id === secondId) ?? rows.find((row) => row.id !== first?.id)
  if (!first) return <EmptyState text="Todavía no hay clubes para explorar." />
  const clubResults = teamMatches(matches, first.id).filter((match) => match.completed).slice(-6).reverse()

  const changeFirst = (teamId: string) => {
    setFirstId(teamId)
    if (teamId === secondId) setSecondId(rows.find((row) => row.id !== teamId)?.id ?? '')
    onSelect(teamId)
  }
  const share = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set('vista', 'clubes')
    url.searchParams.set('club', first.id)
    try {
      await navigator.clipboard.writeText(url.toString())
      setShared(true)
      window.setTimeout(() => setShared(false), 1800)
    } catch { window.prompt('Copiá este enlace', url.toString()) }
  }

  return (
    <section className="club-explorer" aria-labelledby="club-title">
      <div className="club-picker"><div><span className="eyebrow">FICHA DEL CLUB</span><h2 id="club-title">Explorador de equipos</h2></div><label>Elegí un club<select value={first.id} onChange={(event) => changeFirst(event.target.value)}>{rows.map((row) => <option value={row.id} key={row.id}>{row.name}</option>)}</select></label></div>
      <div className="club-hero">
        <TeamBadge team={first} />
        <div><small>PUESTO {first.position}</small><h3>{first.name}</h3><FormDots results={recentForm(matches, first.id)} /></div>
        <div className="club-points"><strong>{first.points}</strong><span>PUNTOS</span></div>
        <button className="share-button" onClick={share}><Share2 size={15} />{shared ? 'Enlace copiado' : 'Compartir'}</button>
      </div>
      <a className="club-profile-link" href={clubPath(first)}>Ver ficha pública de {first.name}</a>
      <div className="club-stat-grid">
        <div><span>Partidos</span><strong>{first.played}</strong></div><div><span>Ganados</span><strong>{first.won}</strong></div><div><span>Empatados</span><strong>{first.drawn}</strong></div><div><span>Perdidos</span><strong>{first.lost}</strong></div><div><span>Diferencia</span><strong>{first.goalDifference > 0 ? `+${first.goalDifference}` : first.goalDifference}</strong></div><div><span>Racha</span><strong>{currentStreak(matches, first.id)}</strong></div>
      </div>
      <div className="club-detail-grid"><div><h4>Evolución reciente</h4><PositionChart matches={matches} team={first} /></div><div><h4>Últimos partidos</h4><div className="mini-match-grid">{clubResults.map((match) => <MatchCard match={match} key={match.id} />)}</div></div></div>
      {second && <section className="comparison"><div className="block-heading"><div><span className="eyebrow">CARA A CARA</span><h3><Swords size={20} /> Comparador</h3></div><select value={second.id} onChange={(event) => setSecondId(event.target.value)} aria-label="Segundo club">{rows.filter((row) => row.id !== first.id).map((row) => <option value={row.id} key={row.id}>{row.name}</option>)}</select></div><div className="comparison-names"><strong>{first.shortName}</strong><span>VS</span><strong>{second.shortName}</strong></div><ComparisonBar label="Puntos" first={first.points} second={second.points} /><ComparisonBar label="Victorias" first={first.won} second={second.won} /><ComparisonBar label="Goles a favor" first={first.goalsFor} second={second.goalsFor} /><ComparisonBar label="Goles recibidos" first={first.goalsAgainst} second={second.goalsAgainst} lowerWins /></section>}
    </section>
  )
}

function AdsenseBanner() {
  const adRef = useRef<HTMLModElement>(null)

  useEffect(() => {
    const ad = adRef.current
    if (!adsEnabled || !adsenseConfigured || !adsenseClient || !ad || ad.dataset.initialized) return

    ad.dataset.initialized = 'true'
    if (!document.getElementById('adsense-script')) {
      const script = document.createElement('script')
      script.id = 'adsense-script'
      script.async = true
      script.crossOrigin = 'anonymous'
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`
      document.head.appendChild(script)
    }

    window.adsbygoogle = window.adsbygoogle ?? []
    window.adsbygoogle.push({})
  }, [])

  return (
    <>
      <ins
        ref={adRef}
        className="adsbygoogle"
        data-ad-client={adsenseClient}
        data-ad-slot={adsenseSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </>
  )
}

function AdsterraUnit() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 600px)')
    const update = () => setMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const width = mobile ? 320 : 728
  const height = mobile ? 50 : 90
  return <iframe className="adsterra-frame" title="Publicidad" width={width} height={height} src={`${import.meta.env.BASE_URL}adsterra-frame.html?formato=${mobile ? 'mobile' : 'desktop'}`} sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" />
}

function AdBanner() {
  return <aside className="ad-banner ad-banner-live" aria-label="Publicidad"><span>PUBLICIDAD</span>{adProvider === 'adsterra' ? <div className="adsterra-units"><AdsterraUnit /></div> : <AdsenseBanner />}</aside>
}

function EditorialOverview() {
  return (
    <section className="editorial" aria-labelledby="editorial-title">
      <div className="editorial-heading">
        <span className="eyebrow">CRITERIO EDITORIAL Y DATOS ABIERTOS</span>
        <h2 id="editorial-title">Una tabla comparable, no otro torneo inventado</h2>
        <p>Fútbol Argentino Realista reorganiza resultados verdaderos para responder una pregunta concreta: cómo quedaría el fútbol local si todos los clubes compitieran en una temporada larga, con reglas estables y sin sumar los playoffs.</p>
      </div>
      <div className="editorial-grid">
        <article><h3>Explorá cada club</h3><p>Consultá forma reciente, rachas, evolución de posición y compará dos equipos bajo exactamente las mismas reglas y temporada.</p><a href="/?vista=clubes">Abrir clubes y comparador</a></article>
        <article><h3>Reglas transparentes</h3><p>Cada victoria vale tres puntos y cada empate uno. La diferencia de gol, los goles a favor y las victorias resuelven los empates. Los clubes que no disputaron ambos semestres quedan identificados fuera de la tabla principal.</p><a href="/formato.html">Ver el formato completo</a></article>
        <article><h3>Resultados verificables</h3><p>La tabla se calcula a partir del marcador público de ESPN. Un proceso automático normaliza equipos, fechas y marcadores, excluye fases eliminatorias y valida la instantánea antes de publicarla.</p><a href="/metodologia.html">Leer la metodología</a></article>
        <article><h3>Una temporada terminada</h3><p>La edición 2025/26 reunió 480 partidos regulares de dos semestres. Boca Juniors terminó primero por diferencia de gol tras igualar 59 puntos con Rosario Central.</p><a href="/temporada-2025-26.html">Analizar la temporada 2025/26</a></article>
      </div>
      <p className="editorial-note">El proyecto es independiente y no está afiliado a AFA, ESPN ni a los clubes. Los datos pueden recibir correcciones posteriores de la fuente.</p>
    </section>
  )
}

function LeagueView({ data, season, onTeamSelect }: { data: FootballData; season: SeasonDefinition; onTeamSelect: (teamId: string) => void }) {
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
      {visible.length ? <><LeaguePulse matches={seasonTable.regularMatches} rows={standings} /><StandingsTable rows={visible} onTeamSelect={onTeamSelect} /></> : <EmptyState text="Todavía no hay partidos finalizados en esta temporada." />}
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

function ClubsView({ data, season, selectedId, onSelect }: { data: FootballData; season: SeasonDefinition; selectedId: string | null; onSelect: (teamId: string) => void }) {
  const matches = useMemo(() => data.league.filter((match) => inDateRange(match.date, season.start, season.end)), [data, season])
  const table = useMemo(() => calculateSeasonStandings(matches), [matches])
  return <ClubExplorer matches={table.regularMatches} rows={table.standings} selectedId={selectedId} onSelect={onSelect} />
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

function App({ initialData = null }: { initialData?: FootballData | null }) {
  const [data, setData] = useState<FootballData | null>(initialData)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState(false)
  const [view, setView] = useState<View>('liga')
  const [seasonId, setSeasonId] = useState(defaultSeasonId)
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null)
  const season = seasons.find((item) => item.id === seasonId)!
  const standingCount = useMemo(() => {
    if (!data) return 0
    const matches = data.league.filter((match) => inDateRange(match.date, season.start, season.end))
    return calculateSeasonStandings(matches).standings.length
  }, [data, season])
  const showAd = canShowAds({
    enabled: adsEnabled && mounted,
    configured: adsConfigured,
    view,
    hasData: Boolean(data),
    hasError: error,
    standingCount,
  })

  useEffect(() => {
    setMounted(true)
    if (initialData) return
    fetch(`${import.meta.env.BASE_URL}data/football.json`).then((response) => {
      if (!response.ok) throw new Error('Data unavailable')
      return response.json()
    }).then(setData).catch(() => setError(true))
  }, [initialData])

  useEffect(() => {
    const readRoute = () => {
      const params = new URLSearchParams(window.location.search)
      const requestedView = params.get('vista')
      setView(requestedView === 'clubes' || requestedView === 'copa' || requestedView === 'supercopa' ? requestedView : 'liga')
      const requestedSeason = params.get('temporada')
      setSeasonId(seasons.some((item) => item.id === requestedSeason) ? requestedSeason! : defaultSeasonId)
      setSelectedClubId(params.get('club'))
    }
    readRoute()
    window.addEventListener('popstate', readRoute)
    return () => window.removeEventListener('popstate', readRoute)
  }, [])

  useEffect(() => {
    const labels: Record<View, string> = { liga: 'Tabla', clubes: 'Clubes y comparador', copa: 'Copa Argentina', supercopa: 'Supercopa' }
    document.title = `${labels[view]} ${season.label} | Fútbol Argentino Realista`
  }, [view, season])

  const navigate = (nextView: View, clubId: string | null = selectedClubId) => {
    setView(nextView)
    setSelectedClubId(clubId)
    const url = new URL(window.location.href)
    if (nextView === 'liga') url.searchParams.delete('vista')
    else url.searchParams.set('vista', nextView)
    if (nextView === 'clubes' && clubId) url.searchParams.set('club', clubId)
    else url.searchParams.delete('club')
    if (seasonId === '2026-27') url.searchParams.delete('temporada')
    else url.searchParams.set('temporada', seasonId)
    window.history.pushState({}, '', url)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const changeSeason = (nextSeason: string) => {
    setSeasonId(nextSeason)
    const url = new URL(window.location.href)
    if (nextSeason === '2026-27') url.searchParams.delete('temporada')
    else url.searchParams.set('temporada', nextSeason)
    window.history.replaceState({}, '', url)
  }

  return (
    <div className="app">
      <div className="topline" />
      <header>
        <a className="brand" href="/"><span className="brand-mark"><span>AR</span></span><div><strong>FÚTBOL ARGENTINO</strong><small>REALISTA</small></div></a>
        <nav aria-label="Secciones">
          <button className={view === 'liga' ? 'active' : ''} onClick={() => navigate('liga')}>Liga</button>
          <button className={view === 'clubes' ? 'active' : ''} onClick={() => navigate('clubes')}>Clubes</button>
          <button className={view === 'copa' ? 'active' : ''} onClick={() => navigate('copa')}>Copa Argentina</button>
          <button className={view === 'supercopa' ? 'active' : ''} onClick={() => navigate('supercopa')}>Supercopa</button>
        </nav>
        <div className="live-pill"><i /> DATOS REALES</div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy"><span className="hero-kicker"><Sparkles size={14} /> EL TORNEO QUE MERECEMOS</span><h1>Fútbol argentino.<br /><em>Pero bien hecho.</em></h1><p>Resultados reales. Una temporada larga. Una tabla simple.<br />Sin zonas, sin vueltas.</p></div>
          <div className="hero-number"><span>20</span><div>CLUBES<br /><b>UNA LIGA</b></div></div>
        </section>

        {showAd && <AdBanner />}

        <section className="content-card">
          <div className="toolbar">
            <div className="mobile-tabs"><button className={view === 'liga' ? 'active' : ''} onClick={() => navigate('liga')}>Liga</button><button className={view === 'clubes' ? 'active' : ''} onClick={() => navigate('clubes')}>Clubes</button><button className={view === 'copa' ? 'active' : ''} onClick={() => navigate('copa')}>Copa</button><button className={view === 'supercopa' ? 'active' : ''} onClick={() => navigate('supercopa')}>Supercopa</button></div>
            {view !== 'copa' && <label><CalendarDays size={17} /><span>Temporada</span><select value={seasonId} onChange={(event) => changeSeason(event.target.value)}>{seasons.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>}
            {data && <span className="updated"><Clock3 size={14} /> Datos verificados {new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(data.metadata.updatedAt))}</span>}
          </div>
          <div className="content-body">
            {error && <EmptyState text="No pudimos cargar los datos. Probá de nuevo en unos minutos." />}
            {!data && !error && <div className="loading"><i /><span>Cargando resultados reales…</span></div>}
            {data && view === 'liga' && <LeagueView data={data} season={season} onTeamSelect={(teamId) => navigate('clubes', teamId)} />}
            {data && view === 'clubes' && <ClubsView data={data} season={season} selectedId={selectedClubId} onSelect={(teamId) => navigate('clubes', teamId)} />}
            {data && view === 'copa' && <CupView data={data} />}
            {data && view === 'supercopa' && <SupercupView data={data} season={season} />}
          </div>
        </section>
        <ShareLinks path={`/?${new URLSearchParams({ temporada: seasonId, ...(view === 'liga' ? {} : { vista: view }), ...(view === 'clubes' && selectedClubId ? { club: selectedClubId } : {}) })}`} text={`¿Cómo quedaría el fútbol argentino en una liga larga? Mirá la temporada ${season.label}: resultados reales, sin sumar playoffs.`} />
        <EditorialOverview />
      </main>
      <footer>
        <span>Fútbol Argentino Realista</span>
        <p>Sitio independiente. No afiliado a AFA ni a sus competencias. Datos deportivos de acceso público.</p>
        <div className="footer-end">
          <b>Hecho en Argentina 🇦🇷</b>
          <div className="footer-links"><a href="/clubes/">Fichas de clubes</a><a href="/novedades.html">Novedades</a><a href="/feed.xml">RSS</a><a href="https://primal.net/p/npub1m9e2k4v2ftsekncwkjhjtwk94rs8x299f29muywqgklw9ddfmdwq2e8q7l" rel="me">Seguinos en Nostr</a><a href="/herramientas.html">Estadísticas</a><a href="/metodologia.html">Metodología</a><a href="/formato.html">Formato</a><a href="/acerca.html">Acerca</a><a href="/contacto.html">Contacto</a><a href="/privacidad.html">Privacidad</a></div>
        </div>
      </footer>
    </div>
  )
}

export default App
