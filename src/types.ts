export interface Team {
  id: string
  name: string
  shortName: string
  logo: string
}

export interface Match {
  id: string
  date: string
  completed: boolean
  status: string
  round: string
  note: string
  home: Team
  away: Team
  homeScore: number | null
  awayScore: number | null
  homeWinner: boolean
  awayWinner: boolean
  homeShootout: number | null
  awayShootout: number | null
}

export interface FootballData {
  metadata: {
    updatedAt: string
    source: string
  }
  league: Match[]
  cup: Match[]
}

export interface StandingRow extends Team {
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  position: number
}

export interface SeasonDefinition {
  id: string
  label: string
  start: string
  end: string
  state: 'finalizada' | 'en-curso'
}
