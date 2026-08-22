import { describe, expect, it } from 'vitest'
import { canShowAds, type MonetizationState } from './monetization'

const ready: MonetizationState = {
  enabled: true, configured: true, view: 'liga', hasData: true, hasError: false, standingCount: 20,
}

describe('canShowAds', () => {
  it('allows only a configured league with substantial loaded content', () => {
    expect(canShowAds(ready)).toBe(true)
  })

  it.each([
    { enabled: false }, { configured: false }, { view: 'copa' as const }, { view: 'supercopa' as const },
    { hasData: false }, { hasError: true }, { standingCount: 9 },
  ])('blocks unsafe state %o', (change) => {
    expect(canShowAds({ ...ready, ...change })).toBe(false)
  })
})
