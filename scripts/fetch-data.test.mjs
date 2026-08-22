import { describe, expect, it, vi } from 'vitest'
import { clean, fetchJson, fetchSeason, loadData, mergeMatches, recentDateRange, validateData } from './fetch-data.mjs'

const normalizedMatch = (id, date = '2026-08-22T19:00Z', score = 0) => ({
  id, date, completed: true, status: 'Final', round: 'torneo-clausura', note: '',
  home: { id: `h-${id}`, name: 'Local', shortName: 'LOC', logo: '' },
  away: { id: `a-${id}`, name: 'Visitante', shortName: 'VIS', logo: '' },
  homeScore: score, awayScore: 0, homeWinner: score > 0, awayWinner: false,
  homeShootout: null, awayShootout: null,
})

const event = (id) => ({
  id, date: '2026-08-22T19:00Z', status: { type: { completed: true, shortDetail: 'Final' } },
  season: { slug: 'torneo-clausura' }, competitions: [{ competitors: [
    { id: `h-${id}`, homeAway: 'home', score: '1', winner: true, team: { id: `h-${id}`, displayName: 'Local', shortDisplayName: 'LOC' } },
    { id: `a-${id}`, homeAway: 'away', score: '0', winner: false, team: { id: `a-${id}`, displayName: 'Visitante', shortDisplayName: 'VIS' } },
  ] }],
})

describe('incremental football data', () => {
  it('replaces changed matches, adds new ones and keeps history without duplicates', () => {
    const merged = mergeMatches(
      [normalizedMatch('old'), normalizedMatch('changed', '2026-08-20T19:00Z', 0)],
      [normalizedMatch('changed', '2026-08-20T19:00Z', 2), normalizedMatch('new')],
    )
    expect(merged.map((match) => match.id)).toEqual(['changed', 'old', 'new'])
    expect(merged.find((match) => match.id === 'changed')?.homeScore).toBe(2)
    expect(new Set(merged.map((match) => match.id)).size).toBe(3)
  })

  it('uses a five-day UTC window', () => {
    expect(recentDateRange(new Date('2026-08-22T23:00:00Z'))).toBe('20260820-20260824')
  })

  it('rejects malformed and undersized snapshots', () => {
    expect(() => validateData({ league: [], cup: [] })).toThrow('League validation failed')
    expect(() => validateData({ nope: true })).toThrow('Invalid football data shape')
  })

  it('rejects HTTP errors, invalid JSON and malformed ESPN payloads', async () => {
    await expect(fetchJson('https://example.test', async () => ({ ok: false, status: 500 }))).rejects.toThrow('HTTP 500')
    await expect(fetchJson('https://example.test', async () => ({ ok: true, json: async () => { throw new SyntaxError('bad json') } }))).rejects.toThrow('bad json')
    await expect(fetchSeason('arg.1', '2026', async () => ({ ok: true, json: async () => ({ nope: [] }) }))).rejects.toThrow('Invalid ESPN payload')
  })

  it('falls back to a full refresh when the published base is unavailable', async () => {
    const fetchImpl = vi.fn(async (url) => {
      if (String(url).includes('published.example')) return { ok: false, status: 503, json: async () => ({}) }
      return { ok: true, status: 200, json: async () => ({ events: [event(String(url).includes('arg.copa') ? 'cup' : 'league')] }) }
    })
    const data = await loadData({
      mode: 'recent', baseUrl: 'https://published.example/data.json', fetchImpl,
      years: [2026], minimums: { league: 1, cup: 1 }, now: new Date('2026-08-22T00:00:00Z'),
    })
    expect(data.league).toHaveLength(1)
    expect(data.cup).toHaveLength(1)
    expect(fetchImpl).toHaveBeenCalledTimes(3)
  })

  it('normalizes duplicate events only once', () => {
    expect(clean([event('1'), event('1')])).toHaveLength(1)
  })
})
