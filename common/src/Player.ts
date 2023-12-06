export interface Player {
  id: number
  name: string
  color: string
  eliminated?: boolean
  team?: 'spectator' | string
  controllable?: boolean
  stats?: {[k: string]: Stat}
}

export interface Stat { 
  val: number | string,
  max?: number
}