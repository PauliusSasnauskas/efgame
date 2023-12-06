import { Entity, Resource } from "common/src/Tile"

// TODO: fix all this

export default interface ConfigSpec {
  name: string,
  version: string
  actions: {[k: string]: Function | null | ConfigSimpleAction }
  entities: {[k: string]: ConfigStaticEntity}
  resources: {[k: string]: ConfigStaticEntity }
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
