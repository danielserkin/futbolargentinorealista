import { mkdir, writeFile } from 'node:fs/promises'
const endpoint = 'https://site.api.espn.com/apis/site/v2/sports/soccer'
const years = [2025, 2026, 2027]
async function fetchSeason(competition, year) {
  const response = await fetch(`${endpoint}/${competition}/scoreboard?dates=${year}&limit=1000`, { headers: { 'User-Agent': 'futbol-argentino-realista/1.0' } })
  if (!response.ok) throw new Error(`ESPN ${competition} ${year}: HTTP ${response.status}`)
  return (await response.json()).events ?? []
}
function teamFrom(competitor) {
  const team = competitor.team ?? {}
  return { id: String(team.id ?? competitor.id), name: team.displayName ?? team.name ?? 'Equipo', shortName: team.shortDisplayName ?? team.name ?? 'Equipo', logo: team.logo ?? '' }
}
function scoreFrom(competitor) { const score = Number(competitor.score); return Number.isFinite(score) ? score : null }
function normalize(event) {
  const competition = event.competitions?.[0] ?? {}
  const competitors = competition.competitors ?? []
  const home = competitors.find((item) => item.homeAway === 'home') ?? competitors[0]
  const away = competitors.find((item) => item.homeAway === 'away') ?? competitors[1]
  if (!home || !away) return null
  return {
    id: String(event.id), date: event.date, completed: Boolean(event.status?.type?.completed), status: event.status?.type?.shortDetail ?? event.status?.type?.description ?? 'Programado',
    round: event.season?.slug ?? '', note: competition.notes?.[0]?.headline ?? competition.notes?.[0]?.text ?? '', home: teamFrom(home), away: teamFrom(away),
    homeScore: scoreFrom(home), awayScore: scoreFrom(away), homeWinner: Boolean(home.winner), awayWinner: Boolean(away.winner),
    homeShootout: Number.isFinite(home.shootoutScore) ? home.shootoutScore : null, awayShootout: Number.isFinite(away.shootoutScore) ? away.shootoutScore : null,
  }
}
function clean(events) {
  const unique = new Map()
  events.map(normalize).filter(Boolean).forEach((event) => unique.set(event.id, event))
  return [...unique.values()].sort((a, b) => a.date.localeCompare(b.date))
}
const [leagueGroups, cupGroups] = await Promise.all([
  Promise.all(years.map((year) => fetchSeason('arg.1', year))), Promise.all(years.map((year) => fetchSeason('arg.copa', year))),
])
const output = { metadata: { updatedAt: new Date().toISOString(), source: 'ESPN public scoreboard' }, league: clean(leagueGroups.flat()), cup: clean(cupGroups.flat()) }
if (output.league.length < 100) throw new Error(`League validation failed: only ${output.league.length} matches`)
if (output.cup.length < 20) throw new Error(`Cup validation failed: only ${output.cup.length} matches`)
await mkdir(new URL('../public/data/', import.meta.url), { recursive: true })
await writeFile(new URL('../public/data/football.json', import.meta.url), `${JSON.stringify(output)}\n`)
console.log(`Saved ${output.league.length} league matches and ${output.cup.length} cup matches.`)
