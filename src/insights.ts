import { calculateStandings, isRegularLeagueMatch } from './standings'
import type { Match, StandingRow } from './types'

export type FormResult = 'G' | 'E' | 'P'

export interface PositionPoint {
  date: string
  position: number
}

export function resultForTeam(match: Match, teamId: string): FormResult | null {
  if (!match.completed || match.homeScore === null || match.awayScore === null) return null
  const isHome = match.home.id === teamId
  if (!isHome && match.away.id !== teamId) return null
  if (match.homeScore === match.awayScore) return 'E'
  const won = isHome ? match.homeScore > match.awayScore : match.awayScore > match.homeScore
  return won ? 'G' : 'P'
}

export function teamMatches(matches: Match[], teamId: string) {
  return matches
    .filter((match) => match.home.id === teamId || match.away.id === teamId)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function recentForm(matches: Match[], teamId: string, limit = 5): FormResult[] {
  return teamMatches(matches, teamId)
    .map((match) => resultForTeam(match, teamId))
    .filter((result): result is FormResult => Boolean(result))
    .slice(-limit)
}

export function currentStreak(matches: Match[], teamId: string) {
  const form = recentForm(matches, teamId, Number.POSITIVE_INFINITY)
  const latest = form.at(-1)
  if (!latest) return 'Sin partidos'
  let count = 0
  for (let index = form.length - 1; index >= 0 && form[index] === latest; index -= 1) count += 1
  const labels: Record<FormResult, [string, string]> = {
    G: ['victoria', 'victorias'], E: ['empate', 'empates'], P: ['derrota', 'derrotas'],
  }
  const consecutive = latest === 'E' ? (count === 1 ? 'seguido' : 'seguidos') : (count === 1 ? 'seguida' : 'seguidas')
  return `${count} ${labels[latest][count === 1 ? 0 : 1]} ${consecutive}`
}

export function biggestWin(matches: Match[]) {
  return matches
    .filter((match) => match.completed && match.homeScore !== null && match.awayScore !== null)
    .reduce<Match | null>((best, match) => {
      const margin = Math.abs(match.homeScore! - match.awayScore!)
      const bestMargin = best ? Math.abs(best.homeScore! - best.awayScore!) : -1
      return margin > bestMargin ? match : best
    }, null)
}

export function latestCompleted(matches: Match[], limit = 6) {
  return matches.filter((match) => match.completed).sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit)
}

export function nextScheduled(matches: Match[], limit = 6) {
  const latestDate = matches.filter((match) => match.completed).sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? ''
  return matches.filter((match) => !match.completed && match.date >= latestDate).sort((a, b) => a.date.localeCompare(b.date)).slice(0, limit)
}

export function positionHistory(matches: Match[], teamId: string): PositionPoint[] {
  const regular = matches.filter(isRegularLeagueMatch)
  const phases = new Map<string, Set<string>>()
  regular.forEach((match) => {
    const phase = `${match.date.slice(0, 4)}-${match.round}`
    const clubs = phases.get(phase) ?? new Set<string>()
    clubs.add(match.home.id)
    clubs.add(match.away.id)
    phases.set(phase, clubs)
  })
  const phaseClubs = [...phases.values()]
  const eligibleIds = phaseClubs.length
    ? new Set([...phaseClubs[0]].filter((id) => phaseClubs.every((clubs) => clubs.has(id))))
    : new Set<string>()
  const completed = regular
    .filter((match) => match.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
  const dates = [...new Set(completed.map((match) => match.date.slice(0, 10)))]
  const accumulated: Match[] = []
  const history: PositionPoint[] = []

  dates.forEach((date) => {
    const daily = completed.filter((match) => match.date.startsWith(date))
    accumulated.push(...daily)
    if (!daily.some((match) => match.home.id === teamId || match.away.id === teamId)) return
    const ranked = calculateStandings(accumulated).filter((item) => eligibleIds.has(item.id))
    const row = ranked.find((item) => item.id === teamId)
    if (row) history.push({ date, position: row.position })
  })

  return history
}

export function leaderBy(rows: StandingRow[], key: 'goalsFor' | 'goalsAgainst', lowest = false) {
  return [...rows].sort((a, b) => lowest ? a[key] - b[key] : b[key] - a[key])[0] ?? null
}
