export class Player {
  id: number
  name: string
  color: string
  eliminated?: boolean
  team?: 'spectator' | string
  controllable?: boolean
  stats?: {[k: string]: Stat}

  constructor (id: number, name: string, color: string, team?: string) {
    this.id = id
    this.name = name
    this.color = color
    this.team = team
  }

  serialize(): PlayerDTO {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      eliminated: this.eliminated,
      team: this.team
    }
  }
}

export interface PlayerDTO {
  id: number
  name: string
  color: string
  eliminated?: boolean
  team?: string
}

export interface Stat { 
  val: number | string,
  max?: number
}