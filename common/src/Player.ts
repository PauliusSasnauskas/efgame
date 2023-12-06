export class Player {
  name: string
  color: string
  eliminated?: boolean
  team?: 'spectator' | string
  controlledBy?: string
  stats?: {[k: string]: Stat}

  constructor (name: string, color: string, team?: string) {
    this.name = name
    this.color = color
    this.team = team
  }

  serialize(): PlayerDTO {
    return {
      name: this.name,
      color: this.color,
      eliminated: this.eliminated,
      team: this.team,
      controlledBy: this.controlledBy
    }
  }
}

export interface PlayerDTO {
  name: string
  color: string
  eliminated?: boolean
  team?: string
  controlledBy?: string
}

export interface Stat { 
  val: number | string,
  max?: number
}