import { describe, expect, it } from 'vitest'
import { canShowAds, type MonetizationState } from './monetization'

const ready: MonetizationState = {
  enabled: true, configured: true, view: 'liga', hasData: true, hasError: false, standingCount: 20,
}

describe('canShowAds', () => {
  it('allows every substantial content view', () => {
    expect(canShowAds(ready)).toBe(true)
    expect(canShowAds({ ...ready, view: 'clubes' })).toBe(true)
    expect(canShowAds({ ...ready, view: 'copa' })).toBe(true)
    expect(canShowAds({ ...ready, view: 'supercopa' })).toBe(true)
  })

  it.each([
    { enabled: false }, { configured: false }, { hasData: false }, { hasError: true }, { standingCount: 9 },
  ])('blocks unsafe state %o', (change) => {
    expect(canShowAds({ ...ready, ...change })).toBe(false)
  })
})
