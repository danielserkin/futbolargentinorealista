import { mkdir, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export const endpoint = 'https://site.api.espn.com/apis/site/v2/sports/soccer'
export const defaultYears = [2025, 2026, 2027]
export const defaultBaseUrl = 'https://futbolrealista.com.ar/data/football.json'

export async function fetchJson(url, fetchImpl = fetch) {
  const response = await fetchImpl(url, { headers: { 'User-Agent': 'futbol-argentino-realista/1.0' } })
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  return response.json()
}

export async function fetchSeason(competition, dates, fetchImpl = fetch) {
  const payload = await fetchJson(`${endpoint}/${competition}/scoreboard?dates=${dates}&limit=1000`, fetchImpl)
  if (!Array.isArray(payload.events)) throw new Error(`Invalid ESPN payload for ${competition} ${dates}`)
  return payload.events
}

export function teamFrom(competitor) {
  const team = competitor.team ?? {}
  return {
    id: String(team.id ?? competitor.id),
    name: team.displayName ?? team.name ?? 'Equipo',
    shortName: team.shortDisplayName ?? team.name ?? 'Equipo',
    logo: team.logo ?? '',
  }
}

export function scoreFrom(competitor) {
  const score = Number(competitor.score)
  return Number.isFinite(score) ? score : null
}

export function normalize(event) {
  const competition = event.competitions?.[0] ?? {}
  const competitors = competition.competitors ?? []
  const home = competitors.find((item) => item.homeAway === 'home') ?? competitors[0]
  const away = competitors.find((item) => item.homeAway === 'away') ?? competitors[1]
  if (!home || !away || !event.id || !event.date) return null

  return {
    id: String(event.id),
    date: event.date,
    completed: Boolean(event.status?.type?.completed),
    status: event.status?.type?.shortDetail ?? event.status?.type?.description ?? 'Programado',
    round: event.season?.slug ?? '',
    note: competition.notes?.[0]?.headline ?? competition.notes?.[0]?.text ?? '',
    home: teamFrom(home),
    away: teamFrom(away),
    homeScore: scoreFrom(home),
    awayScore: scoreFrom(away),
    homeWinner: Boolean(home.winner),
    awayWinner: Boolean(away.winner),
    homeShootout: Number.isFinite(home.shootoutScore) ? home.shootoutScore : null,
    awayShootout: Number.isFinite(away.shootoutScore) ? away.shootoutScore : null,
  }
}

export function clean(events) {
  const unique = new Map()
  events.map(normalize).filter(Boolean).forEach((event) => unique.set(event.id, event))
  return [...unique.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function mergeMatches(existing, incoming) {
  const merged = new Map(existing.map((match) => [match.id, match]))
  incoming.forEach((match) => merged.set(match.id, match))
  return [...merged.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function validateData(data, minimums = { league: 100, cup: 20 }) {
  if (!data || !Array.isArray(data.league) || !Array.isArray(data.cup)) throw new Error('Invalid football data shape')
  if (data.league.length < minimums.league) throw new Error(`League validation failed: only ${data.league.length} matches`)
  if (data.cup.length < minimums.cup) throw new Error(`Cup validation failed: only ${data.cup.length} matches`)
  return data
}

function compactDate(date) {
  return date.toISOString().slice(0, 10).replaceAll('-', '')
}

export function recentDateRange(now = new Date()) {
  const start = new Date(now)
  const end = new Date(now)
  start.setUTCDate(start.getUTCDate() - 2)
  end.setUTCDate(end.getUTCDate() + 2)
  return `${compactDate(start)}-${compactDate(end)}`
}

export async function fetchFull({ fetchImpl = fetch, years = defaultYears } = {}) {
  const [leagueGroups, cupGroups] = await Promise.all([
    Promise.all(years.map((year) => fetchSeason('arg.1', year, fetchImpl))),
    Promise.all(years.map((year) => fetchSeason('arg.copa', year, fetchImpl))),
  ])
  return { league: clean(leagueGroups.flat()), cup: clean(cupGroups.flat()) }
}

export async function loadData({
  mode = 'full', baseUrl = defaultBaseUrl, fetchImpl = fetch, now = new Date(),
  years = defaultYears, minimums,
} = {}) {
  let matches

  if (mode === 'recent') {
    let base
    try {
      base = validateData(await fetchJson(baseUrl, fetchImpl), minimums)
    } catch (error) {
      console.warn(`Recent base unavailable (${error.message}); running a full refresh.`)
      matches = await fetchFull({ fetchImpl, years })
    }

    if (base) {
      const dates = recentDateRange(now)
      const [leagueEvents, cupEvents] = await Promise.all([
        fetchSeason('arg.1', dates, fetchImpl), fetchSeason('arg.copa', dates, fetchImpl),
      ])
      matches = {
        league: mergeMatches(base.league, clean(leagueEvents)),
        cup: mergeMatches(base.cup, clean(cupEvents)),
      }
    }
  } else if (mode === 'full') {
    matches = await fetchFull({ fetchImpl, years })
  } else {
    throw new Error(`Unknown fetch mode: ${mode}`)
  }

  return validateData({
    metadata: { updatedAt: now.toISOString(), source: 'ESPN public scoreboard' },
    ...matches,
  }, minimums)
}

function readArgument(name, fallback) {
  const prefix = `--${name}=`
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length) ?? fallback
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode = readArgument('mode', 'full')
  const baseUrl = readArgument('base-url', defaultBaseUrl)
  const output = await loadData({ mode, baseUrl })
  await mkdir(new URL('../public/data/', import.meta.url), { recursive: true })
  await writeFile(new URL('../public/data/football.json', import.meta.url), `${JSON.stringify(output)}\n`)
  console.log(`Saved ${output.league.length} league matches and ${output.cup.length} cup matches (${mode} mode).`)
}
