import { Player, Stat, StatReq } from "common/src/Player"
import { GameState } from "common/src/SocketSpec"
import { Entity, Owner, Resource, Tile } from "common/src/Tile"

export default interface ConfigSpec {
  name: string,
  version: string
  actions: { [k: string]: ServerAction }
  entities: { [k: string]: null | (new (turn: number) => ServerEntity) }
  resources: { [k: string]: null | (new () => ServerResource) }
  stats: { [k: string]: (new () => ServerStat) }
  mapNames: { [k: string]: (size: number, players: ServerPlayer[]) => ServerTile[][] }
  getMapForPlayer: (map: ServerTile[][], mapSize: number, player: ServerPlayer, gameState: GameState) => Tile[]
  processEndTurnForPlayer: (player: ServerPlayer, map: ServerTile[][], mapSize: number, players: ServerPlayer[]) => void
  checkWinner: (map: ServerTile[][], mapSize: number, players: ServerPlayer[]) => Player | undefined
}

export interface ServerAction {
  canInvoke: (data: ServerTileEventArgs) => boolean
  statsCost?: StatReq | ((data: ServerTileEventArgs) => StatReq)
  invoke: (data: ServerTileEventArgs) => void
}

export interface ServerEntity extends Entity {
  readonly id: string
  readonly turnBuilt: number
  health?: number
  state?: { [k: string]: string | number }
  onTurnChange?: (data: ServerTileEventArgs) => void
  onDestroy?: (data: ServerTileEventArgs) => void
}

export interface ServerTileEventArgs {
  tile: ServerTile
  player: ServerPlayer
  map: ServerTile[][]
  mapSize: number
  players: ServerPlayer[]
  turnNumber: number
  sendMessage: (message: string) => void
}

export interface ServerResource extends Resource {
  id: string
  state?: { [k: string]: string | number }
}

export class ServerPlayer extends Player {
  stats?: { [k: string]: ServerStat }
}

export class ServerStat implements Stat {
  val: string | number = 0
  max?: number
  hiddenMax?: number

  set(val: string | number) {
    this.val = val
  }

  add(val: number) {
    if (typeof this.val !== 'number' || typeof val !== "number") throw new Error('Cannot add stat which is not a number.')
    this.val += val
    if (this.max !== undefined && this.val > this.max) this.val = this.max
    if (this.hiddenMax !== undefined && this.val > this.hiddenMax) this.val = this.hiddenMax
  }

  deduct(val: number) {
    if (typeof this.val !== 'number' || typeof val !== "number") throw new Error('Cannot deduct stat which is not a number.')
    this.val -= val
    if (this.val < 0) throw new Error('Stat below 0')
  }
}

export class ServerTile implements Tile {
  readonly x: number
  readonly y: number

  owner?: Owner
  entity?: ServerEntity
  resource?: ServerResource

  constructor (x: number, y: number) {
    this.x = x
    this.y = y
  }

  serialize (): Tile {
    return { x: this.x, y: this.y, owner: this.owner, entity: this.entity === undefined ? undefined : { id: this.entity.id, turnBuilt: this.entity.turnBuilt, health: this.entity.health, state: this.entity.state }, resource: this.resource === undefined ? undefined : { id: this.resource.id, state: this.resource.state } }
  }
}
