import { ReactNode } from "react"
import { Entity, Resource } from "./Tile"

export default interface ConfigSpec {
  actions: {[k: string]: Function | null | ConfigSimpleAction }
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
