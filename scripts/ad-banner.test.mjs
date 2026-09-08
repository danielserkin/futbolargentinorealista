import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('../public/adsterra-static.js', import.meta.url), 'utf8')
function selectBanner(pathname, search, mobileViewport) {
  const window = { location: { pathname, search }, matchMedia: () => ({ matches: mobileViewport }) }
  const written = []
  runInNewContext(source, { window, URLSearchParams, document: { write: (value) => written.push(value) } })
  return { options: window.atOptions, written }
}

describe('responsive advertising format', () => {
  it('keeps the desktop unit when the iframe starts with a small viewport', () => {
    const { options, written } = selectBanner('/adsterra-frame.html', '?formato=desktop', true)
    expect(options.width).toBe(728)
    expect(written[0]).toContain('a7a339e0dd5f5bab6b60562ae8566a9a/invoke.js')
  })
  it('uses the mobile unit requested by the parent', () => {
    expect(selectBanner('/adsterra-frame.html', '?formato=mobile', false).options.width).toBe(320)
  })
  it('uses the page viewport on static content, ignoring unrelated query parameters', () => {
    expect(selectBanner('/clubes/boca-juniors-5.html', '?formato=desktop', true).options.width).toBe(320)
    expect(selectBanner('/novedades.html', '', false).options.width).toBe(728)
  })
})
