import { Entity } from "./Entity"
import { Owner } from "./Owner"
import { Resource } from "./Resource"

export interface Tile {
  readonly x: number
  readonly y: number

  owner?: Owner // can be occupied by a player
  entity?: Entity // can host up to a single entity
  resource?: Resource // can have a special resource
}