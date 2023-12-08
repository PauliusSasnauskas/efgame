import { Player, Stat } from "common/src/Player"
import { Entity, Owner, Resource, Tile } from "common/src/Tile"

export default interface ConfigSpec {
  name: string,
  version: string
  actions: { [k: string]: ConfigAction }
  entities: { [k: string]: null | typeof ConfigEntity }
  resources: { [k: string]: null | typeof ConfigResource } // TODO
  stats: { [k: string]: typeof ServerStat }
  mapNames: { [k: string]: (size: number, players: Player[]) => Tile[][] }
}

export type StatReq = { [k: string]: number | string }

export interface ConfigAction {
  canInvoke: (data: {tile: Tile, player: Player, map: Tile[][], mapSize: number, players: Player[]}) => boolean
  statsCost?: StatReq | ((data: {tile: Tile, player: Player, map: Tile[][], mapSize: number, players: Player[]}) => StatReq)
  invoke: (data: {tile: Tile, player: Player, map: Tile[][], mapSize: number, players: Player[]}) => void
}

export class ConfigEntity implements Entity {
  id: string
  health?: number
  state?: { [k: string]: string | number }
  onTurnChange?: (lastTurnPlayer: Player, tileOwner: Owner | undefined, tileResource: Resource | undefined, map: Tile[], mapSize: number, players: Player[]) => void
  onDestroy?: (destroyer: Player, tileOwner: Owner | undefined, tileResource: Resource | undefined, map: Tile[], mapSize: number, players: Player[]) => void
}

export class ConfigResource {
  // TODO: fix
}

export /* abstract */ class ServerStat implements Stat {
  val: string | number = 0
  max?: number | undefined
  hiddenMax?: number | undefined
}
