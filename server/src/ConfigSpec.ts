import { Player, Stat } from "common/src/Player"
import { Entity, Owner, Resource, Tile } from "common/src/Tile"

export default interface ConfigSpec {
  name: string,
  version: string
  actions: { [k: string]: ServerAction }
  entities: { [k: string]: null | (new () => ServerEntity) }
  resources: { [k: string]: null | (new () => ServerResource) }
  stats: { [k: string]: (new () => ServerStat) }
  mapNames: { [k: string]: (size: number, players: Player[]) => ServerTile[][] }
  getMapForPlayer: (map: ServerTile[][], mapSize: number, player: Player) => Tile[]
}

export type StatReq = { [k: string]: number | string }

export interface ServerAction {
  canInvoke: (data: {tile: ServerTile, player: Player, map: ServerTile[][], mapSize: number, players: Player[]}) => boolean
  statsCost?: StatReq | ((data: {tile: ServerTile, player: Player, map: ServerTile[][], mapSize: number, players: Player[]}) => StatReq)
  invoke: (data: {tile: ServerTile, player: Player, map: ServerTile[][], mapSize: number, players: Player[]}) => void
}

export interface ServerEntity extends Entity {
  id: string
  health?: number
  state?: { [k: string]: string | number }
  onTurnChange?: (lastTurnPlayer: Player, tileOwner: Owner | undefined, tileResource: Resource | undefined, map: ServerTile[], mapSize: number, players: Player[]) => void
  onDestroy?: (destroyer: Player, tileOwner: Owner | undefined, tileResource: Resource | undefined, map: ServerTile[], mapSize: number, players: Player[]) => void
}

export interface ServerResource extends Resource {
  id: string
  state?: { [k: string]: string | number }
}

export interface ServerStat extends Stat {
  val: string | number
  max?: number | undefined
  hiddenMax?: number | undefined
}

export interface ServerTile extends Tile {
  entity?: ServerEntity
  resource?: ServerResource
}
