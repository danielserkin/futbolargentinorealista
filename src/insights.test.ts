import { describe, expect, it } from 'vitest'
import { biggestWin, currentStreak, positionHistory, recentForm, resultForTeam } from './insights'
import type { Match, Team } from './types'

const team = (id: string): Team => ({ id, name: `Club ${id}`, shortName: id, logo: '' })
const match = (id: string, date: string, home: string, away: string, homeScore: number, awayScore: number): Match => ({
  id, date, completed: true, status: 'Final', round: 'torneo-clausura', note: '', home: team(home), away: team(away), homeScore, awayScore,
  homeWinner: homeScore > awayScore, awayWinner: awayScore > homeScore, homeShootout: null, awayShootout: null,
})

const matches = [
  match('1', '2026-07-01T20:00Z', 'A', 'B', 2, 0),
  match('2', '2026-07-08T20:00Z', 'C', 'A', 1, 1),
  match('3', '2026-07-15T20:00Z', 'A', 'C', 0, 3),
]

describe('team insights', () => {
  it('reads results from the selected team perspective', () => {
    expect(resultForTeam(matches[0], 'A')).toBe('G')
    expect(resultForTeam(matches[0], 'B')).toBe('P')
    expect(recentForm(matches, 'A')).toEqual(['G', 'E', 'P'])
  })

  it('describes the current streak and finds the biggest win', () => {
    expect(currentStreak([...matches, match('4', '2026-07-22T20:00Z', 'B', 'A', 1, 0)], 'A')).toBe('2 derrotas seguidas')
    expect(biggestWin(matches)?.id).toBe('3')
  })

  it('builds a position history only when the club plays', () => {
    const history = positionHistory(matches, 'A')
    expect(history).toHaveLength(3)
    expect(history.at(-1)?.position).toBeGreaterThan(0)
  })
})
