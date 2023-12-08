import { Player, Stat } from "common/src/Player"
import { GameState } from "common/src/SocketSpec"
import { Entity, Owner, Resource, Tile } from "common/src/Tile"

export default interface ConfigSpec {
  name: string,
  version: string
  actions: { [k: string]: ServerAction }
  entities: { [k: string]: null | (new (turn: number) => ServerEntity) }
  resources: { [k: string]: null | (new () => ServerResource) }
  stats: { [k: string]: (new () => ServerStat) }
  mapNames: { [k: string]: (size: number, players: Player[]) => ServerTile[][] }
  getMapForPlayer: (map: ServerTile[][], mapSize: number, player: Player, gameState: GameState) => Tile[]
  processEndTurnForPlayer: (player: Player, map: ServerTile[][], mapSize: number, players: Player[]) => void
  checkWinner: (map: ServerTile[][], mapSize: number, players: Player[]) => Player | undefined
}

export type StatReq = { [k: string]: number | string }

export interface ServerAction {
  canInvoke: (data: ActionData) => boolean
  statsCost?: StatReq | ((data: ActionData) => StatReq)
  invoke: (data: ActionData) => void
}

interface ActionData {
  tile: ServerTile
  player: Player
  map: ServerTile[][]
  mapSize: number
  players: Player[]
  turnNumber: number
  sendMessage: (message: string) => void
}

export interface ServerEntity extends Entity {
  readonly id: string
  readonly turnBuilt: number
  health?: number
  state?: { [k: string]: string | number }
  onTurnChange?: (lastTurnPlayer: Player, tile: ServerTile, map: ServerTile[][], mapSize: number, players: Player[]) => void
  onDestroy?: (destroyer: Player, tile: ServerTile, map: ServerTile[][], mapSize: number, players: Player[]) => void
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
