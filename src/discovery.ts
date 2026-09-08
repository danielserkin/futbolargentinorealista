import { calculateSeasonStandings, inDateRange } from './standings'
import type { FootballData, SeasonDefinition, Team } from './types'

export const siteUrl = 'https://futbolrealista.com.ar'
export const seasons: SeasonDefinition[] = [
  { id: '2025-26', label: '2025/26', start: '2025-07-01', end: '2026-06-30', state: 'finalizada' },
  { id: '2026-27', label: '2026/27', start: '2026-07-01', end: '2027-06-30', state: 'en-curso' },
]
export const defaultSeasonId = '2026-27'

export function clubSlug(team: Pick<Team, 'id' | 'name'>) {
  return `${team.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${team.id}`
}

export function clubPath(team: Pick<Team, 'id' | 'name'>) {
  return `/clubes/${clubSlug(team)}.html`
}

export function seasonTable(data: FootballData, season: SeasonDefinition) {
  return calculateSeasonStandings(data.league.filter((match) => inDateRange(match.date, season.start, season.end)))
}

export function publishedTeams(data: FootballData): Team[] {
  const teams = new Map<string, Team>()
  for (const season of seasons) {
    const table = seasonTable(data, season)
    for (const team of [...table.standings, ...table.partial]) teams.set(team.id, team)
  }
  return [...teams.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export function campaignUrl(path: string, source: string, campaign = 'compartir') {
  const url = new URL(path, siteUrl)
  // Never carry somebody else's campaign attribution into a new share.
  for (const key of [...url.searchParams.keys()]) if (key.startsWith('utm_')) url.searchParams.delete(key)
  url.searchParams.set('utm_source', source)
  url.searchParams.set('utm_medium', source === 'rss' ? 'feed' : 'social')
  url.searchParams.set('utm_campaign', campaign)
  return url.toString()
}

export function shareLinks(path: string, text: string) {
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${campaignUrl(path, 'whatsapp')}`)}`,
    x: `https://twitter.com/intent/tweet?${new URLSearchParams({ text, url: campaignUrl(path, 'x') })}`,
  }
}
