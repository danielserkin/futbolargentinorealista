export interface MonetizationState {
  enabled: boolean
  configured: boolean
  view: 'liga' | 'clubes' | 'copa' | 'supercopa'
  hasData: boolean
  hasError: boolean
  standingCount: number
}

export function canShowAds(state: MonetizationState) {
  return state.enabled
    && state.configured
    && state.view === 'liga'
    && state.hasData
    && !state.hasError
    && state.standingCount >= 10
}
