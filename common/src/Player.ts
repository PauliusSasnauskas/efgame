export class Player {
  name: string
  color: string
  eliminated: boolean
  team?: 'spectator' | string
  controlledBy?: string
  stats?: {[k: string]: Stat}

  constructor (name: string, color: string, team?: string) {
    this.name = name
    this.color = color
    this.team = team
    this.eliminated = false
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
  serializeStats(): {[k: string]: Stat} {
    const serializedStats: {[k: string]: Stat} = {}

    Object.entries(this.stats ?? {}).forEach(([statName, stat]) => {
      serializedStats[statName] = { val: stat.val, max: stat.max }
    })

    return serializedStats
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