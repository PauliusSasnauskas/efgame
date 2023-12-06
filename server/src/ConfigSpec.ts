import { Player } from "common/src/Player"
import { Tile } from "common/src/Tile"
import ServerStat from "./ServerStat"

export default interface ConfigSpec {
  name: string,
  version: string
  actions: { [k: string]: ConfigAction } // TODO
  entities: { [k: string]: {} | ConfigEntity } // TODO
  resources: { [k: string]: {} | ConfigResource } // TODO
  stats: { [k: string]: typeof ServerStat }
  mapNames: { [k: string]: (size: number, players: Player[]) => Tile[] }
}

export interface ConfigAction {
  req: { [k: string]: number | string }
}

export interface ConfigEntity {
  // TODO: fix
}

export interface ConfigResource {
  // TODO: fix
}

export interface ConfigStat {
  // TODO: fix
}
