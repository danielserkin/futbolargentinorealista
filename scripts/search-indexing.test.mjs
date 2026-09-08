import { describe, expect, it } from 'vitest'
import { changedUrls } from './search-indexing.mjs'

describe('search notifications', () => {
  it('submits new, changed and removed pages, leaving unchanged pages alone', () => {
    expect(changedUrls({ '/': 'old', '/clubes/': 'same', '/clubes/retirado-1.html': 'old' }, { '/': 'new', '/clubes/': 'same', '/novedades.html': 'new' })).toEqual([
      'https://futbolrealista.com.ar/', 'https://futbolrealista.com.ar/clubes/retirado-1.html', 'https://futbolrealista.com.ar/novedades.html',
    ])
  })
  it('does not submit anything for a verification-only refresh', () => {
    expect(changedUrls({ '/': 'stable-content-hash' }, { '/': 'stable-content-hash' })).toEqual([])
  })
  it.each(['//elsewhere.example/', '/?utm_source=x', '/indexnow-key.txt', '/clubes/../../privacidad.html'])('rejects an unsupported path: %s', (path) => {
    expect(() => changedUrls({}, { [path]: 'new' })).toThrow()
  })
})
