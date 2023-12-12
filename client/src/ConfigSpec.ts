import { ReactNode } from "react"
import { Entity, Resource, Tile } from "common/src/Tile"
import { Player, StatReq } from "common/src/Player"

export default interface ConfigSpec {
  name: string,
  version: string
  actions: { [k: string]: ConfigAction | 'endturn' }
  entities: { [k: string]: EntityTile | ConfigStaticEntity }
  resources: { [k: string]: ResourceTile | ConfigStaticEntity }
  stats: { [k: string]: ConfigStat }
}

export interface ConfigAction {
  key: string | string[] // keyboard shortcut
  button: Function | ConfigSimpleAction // button implementation
  req?: {[k: string]: number | string} | ((tile: Tile | undefined, map: Tile[], player: Player) => StatReq | undefined) // stat requirements to show on stat panel
  showOnTile?: (tile: Tile | undefined, map: Tile[], player: Player) => boolean // should this button be shown on a tile
  allowOnTile?: (tile: Tile | undefined, map: Tile[], player: Player) => boolean // should this button be enabled on a tile
}

export interface ConfigSimpleAction {
  img: string
  name: string
}

export interface ConfigStaticEntity {
  img: string
}

export interface ConfigStat {
  img: string
}

export type ResourceTile = (
  selected: boolean,
  resourceState?: Resource['state']
) => ReactNode

export type EntityTile = (
  selected: boolean,
  health?: number,
  state?: Entity['state'],
  resource?: Resource
) => ReactNode
