export interface Tile {
  readonly x: number
  readonly y: number

  owner?: Owner // can be occupied by a player
  entity?: Entity // can host up to a single entity
  resource?: Resource // can have a special resource
}

export interface Owner {
  readonly isPlayer: boolean // TODO: do I need this?
  readonly name: string
  readonly team?: string
}

export interface Entity {
  readonly id: string
  health?: number // can have a numeric health value
  state?: { [k: string]: string | number } // can have a key-value state
}

export interface Resource {
  readonly id: string
  state?: { [k: string]: string | number } // can have a key-value state
}
