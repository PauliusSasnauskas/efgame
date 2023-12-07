import { ReactNode } from "react"
import { Entity, Resource } from "common/src/Tile"

export default interface ConfigSpec {
  name: string,
  version: string
  actions: {[k: string]: null | { key: string | string[], impl: Function | ConfigSimpleAction } }
  entities: {[k: string]: EntityTile | ConfigStaticEntity}
  resources: {[k: string]: ResourceTile | ConfigStaticEntity }
  stats: {[k: string]: ConfigStat}
}

export interface ConfigSimpleAction {
  img: string
  name: string
  req: {[k: string]: number | string}
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
