export interface Player {
  name: string
  color: string
  eliminated?: boolean
  team?: 'spectator' | string
  controllable: boolean
  stats?: {[k: string]: { val: number, max: number }}
}
