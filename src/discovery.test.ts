import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
import { campaignUrl, clubPath, publishedTeams, rivalries, rivalryPath, seasons, seasonTable, shareLinks } from './discovery'
import { ClubPage, RivalryPage } from './discovery-pages'
import App from './App'
import fixture from '../public/data/football.json'
import type { FootballData } from './types'

const data = fixture as FootballData

describe('discoverable football content', () => {
  it('renders actual standings and safe club links before JavaScript runs', () => {
    const html = renderToString(createElement(App, { initialData: data }))
    expect(html).toContain('<table>')
    expect(html).toContain('href="/clubes/')
    expect(html).not.toContain('Cargando resultados reales')
    expect(html).not.toContain('class="adsbygoogle"')
    expect(html).not.toContain('adsterra-frame.html')
  })

  it('preserves the loading fallback when no snapshot is provided', () => {
    expect(renderToString(createElement(App))).toContain('Cargando resultados reales')
  })

  it('makes accent-free paths with IDs to distinguish names that normalize alike', () => {
    expect(clubPath({ id: '1', name: 'Unión de Santa Fe' })).toBe('/clubes/union-de-santa-fe-1.html')
    expect(clubPath({ id: '2', name: 'Union de Santa Fe' })).not.toBe(clubPath({ id: '1', name: 'Unión de Santa Fe' }))
  })

  it('publishes profiles for partially participating clubs without ranking them', () => {
    const table = seasonTable(data, seasons[0])
    expect(table.partial.length).toBeGreaterThan(0)
    const partial = table.partial[0]
    expect(publishedTeams(data).some((team) => team.id === partial.id)).toBe(true)
    const html = renderToString(createElement(ClubPage, { data, team: partial }))
    expect(html).toContain('tiene participación parcial')
    expect(html).toContain('no integra la clasificación')
  })

  it('uses the same points and match counts in club content and the league', () => {
    const leader = seasonTable(data, seasons[1]).standings[0]
    const html = renderToString(createElement(ClubPage, { data, team: leader }))
    expect(html).toContain(`con ${leader.points} puntos en ${leader.played} partidos regulares.`)
    expect(html).toContain('no es la tabla oficial de AFA')
  })

  it('preserves the shared club and season while replacing old attribution', () => {
    const url = new URL(campaignUrl('/?vista=clubes&club=5&temporada=2025-26&utm_source=old&utm_content=old', 'whatsapp'))
    expect(url.searchParams.get('club')).toBe('5')
    expect(url.searchParams.get('temporada')).toBe('2025-26')
    expect(url.searchParams.get('utm_source')).toBe('whatsapp')
    expect(url.searchParams.has('utm_content')).toBe(false)
  })

  it('encodes Spanish text and a valid tracked target in sharing URLs', () => {
    const links = shareLinks('/clubes/', '¿Y tu club? #Fútbol & datos')
    const x = new URL(links.x)
    expect(x.searchParams.get('text')).toBe('¿Y tu club? #Fútbol & datos')
    expect(new URL(x.searchParams.get('url')!).searchParams.get('utm_source')).toBe('x')
    expect(new URL(links.whatsapp).searchParams.get('text')).toContain('utm_source=whatsapp')
  })

  it('publishes a substantial, shareable comparison for every configured rivalry', () => {
    for (const rivalry of rivalries) {
      const html = renderToString(createElement(RivalryPage, { data, rivalry }))
      expect(rivalryPath(rivalry)).toMatch(/^\/clasicos\/[a-z0-9-]+\.html$/)
      expect(html).toContain('La foto actual de la temporada')
      expect(html).toContain('Cruces presentes en nuestros datos')
      expect(html).toContain('utm_source%3Dwhatsapp')
      expect(html).toContain('no una tabla oficial de AFA')
    }
  })
})
