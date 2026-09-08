import { StrictMode } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import App from './App'
import type { FootballData, Team } from './types'
import { ClubDirectory, ClubPage, NewsPage } from './discovery-pages'
export { clubPath, clubSlug, campaignUrl, publishedTeams, seasons, seasonTable, siteUrl, defaultSeasonId } from './discovery'

export function render(data: FootballData) {
  return renderToString(
    <StrictMode>
      <App initialData={data} />
    </StrictMode>,
  )
}

export const renderClub = (data: FootballData, team: Team) => renderToStaticMarkup(<ClubPage data={data} team={team} />)
export const renderDirectory = (data: FootballData) => renderToStaticMarkup(<ClubDirectory data={data} />)
export const renderNews = (data: FootballData) => renderToStaticMarkup(<NewsPage data={data} />)
