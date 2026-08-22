import { describe, expect, it } from 'vitest'
import { calculateStandings, inDateRange } from './standings'
import type { Match, Team } from './types'
const team = (id: string): Team => ({ id, name: `Club ${id}`, shortName: id, logo: '' })
const match = (id: string, home: string, away: string, homeScore: number, awayScore: number): Match => ({
  id, date: '2026-02-01T00:00Z', completed: true, status: 'FT', round: '', note: '', home: team(home), away: team(away), homeScore, awayScore,
  homeWinner: homeScore > awayScore, awayWinner: awayScore > homeScore, homeShootout: null, awayShootout: null,
})
describe('calculateStandings', () => {
  it('awards win and draw points', () => {
    const rows = calculateStandings([match('1', 'A', 'B', 2, 0), match('2', 'A', 'C', 1, 1)])
    expect(rows.find((row) => row.id === 'A')).toMatchObject({ played: 2, won: 1, drawn: 1, points: 4, goalsFor: 3, goalsAgainst: 1 })
    expect(rows.find((row) => row.id === 'C')?.points).toBe(1)
  })
  it('uses goal difference and goals scored as tie breakers', () => {
    const rows = calculateStandings([match('1', 'A', 'B', 3, 1), match('2', 'C', 'D', 2, 0)])
    expect(rows.slice(0, 2).map((row) => row.id)).toEqual(['A', 'C'])
    expect(rows.map((row) => row.position)).toEqual([1, 2, 3, 4])
  })
})
describe('inDateRange', () => {
  it('includes both season boundaries', () => {
    expect(inDateRange('2025-07-01T01:00Z', '2025-07-01', '2026-06-30')).toBe(true)
    expect(inDateRange('2026-06-30T23:00Z', '2025-07-01', '2026-06-30')).toBe(true)
    expect(inDateRange('2026-07-01T00:00Z', '2025-07-01', '2026-06-30')).toBe(false)
  })
})
