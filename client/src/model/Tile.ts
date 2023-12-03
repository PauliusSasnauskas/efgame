import { Entity } from "./Entity"
import { Owner } from "./Owner"
import { Resource } from "./Resource"

export interface Tile {
  readonly x: number
  readonly y: number

  entity?: Entity
  owner?: Owner
  resource?: Resource
}