import type { Match, StandingRow } from './types'

export function inDateRange(date: string, start: string, end: string) {
  const value = date.slice(0, 10)
  return value >= start && value <= end
}

export function calculateStandings(matches: Match[]): StandingRow[] {
  const table = new Map<string, Omit<StandingRow, 'position' | 'goalDifference'>>()

  const ensure = (team: Match['home']) => {
    if (!table.has(team.id)) {
      table.set(team.id, {
        ...team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      })
    }
    return table.get(team.id)!
  }

  matches.filter((match) => match.completed && match.homeScore !== null && match.awayScore !== null).forEach((match) => {
    const home = ensure(match.home)
    const away = ensure(match.away)
    const homeScore = match.homeScore!
    const awayScore = match.awayScore!

    home.played += 1
    away.played += 1
    home.goalsFor += homeScore
    home.goalsAgainst += awayScore
    away.goalsFor += awayScore
    away.goalsAgainst += homeScore

    if (homeScore > awayScore) {
      home.won += 1
      home.points += 3
      away.lost += 1
    } else if (awayScore > homeScore) {
      away.won += 1
      away.points += 3
      home.lost += 1
    } else {
      home.drawn += 1
      away.drawn += 1
      home.points += 1
      away.points += 1
    }
  })

  return [...table.values()]
    .map((row) => ({ ...row, goalDifference: row.goalsFor - row.goalsAgainst }))
    .sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      b.won - a.won ||
      a.name.localeCompare(b.name, 'es'),
    )
    .map((row, index) => ({ ...row, position: index + 1 }))
}

export function isRegularLeagueMatch(match: Match) {
  return match.round.startsWith('torneo-')
}

export function calculateSeasonStandings(matches: Match[]) {
  const regularMatches = matches.filter(isRegularLeagueMatch)
  const phases = new Map<string, Set<string>>()

  regularMatches.forEach((match) => {
    const phase = `${match.date.slice(0, 4)}-${match.round}`
    if (!phases.has(phase)) phases.set(phase, new Set())
    phases.get(phase)!.add(match.home.id)
    phases.get(phase)!.add(match.away.id)
  })

  const phaseTeams = [...phases.values()]
  const eligibleIds = phaseTeams.length
    ? new Set([...phaseTeams[0]].filter((id) => phaseTeams.every((teams) => teams.has(id))))
    : new Set<string>()
  const allRows = calculateStandings(regularMatches)
  const standings = allRows
    .filter((row) => eligibleIds.has(row.id))
    .map((row, index) => ({ ...row, position: index + 1 }))
  const partial = allRows.filter((row) => !eligibleIds.has(row.id))

  return { regularMatches, standings, partial, phaseCount: phases.size }
}
