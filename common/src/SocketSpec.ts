import { PlayerDTO, Stat } from "./Player"
import { Tile } from "./Tile"

export interface ServerEvents {
  welcome: (message: ServerGreeting) => void
  chat: (message: Message) => void
  metaInfo: (info: GameInfoLobby | GameInfoPlaying) => void
  gameInfo: (info: { stats: {[k: string]: Stat}, map: Tile[] }) => void
}

export interface ClientEvents {
  welcome: (data: { name: string, color: string }) => void
  setTeam: (team: string) => void
  chat: (message: string, recipient?: string) => void
  startGame: () => void
  endTurn: (callback: (result: ActionResult) => void) => void
  action: (data: { action: string, x: number, y: number }, callback: (result: ActionResult) => void) => void
}

export interface Message {
  text: string
  from?: string
  fromColor?: string
  to?: string
  toColor?: string
  private?: boolean
}

export interface ServerGreeting {
  name: string
  version: string
  gamemode: string
  gamemodeVersion: string
  motd: string
}

export interface GameInfoBase {
  players: PlayerDTO[]
  teams: string[]
  mapSize: number
}

export interface GameInfoLobby extends GameInfoBase {
  gameState: GameState.LOBBY
  mapName?: string
}

export interface GameInfoPlaying extends GameInfoBase {
  gameState: GameState.PLAYING | GameState.POSTGAME
  turnNumber: number
  turn: string
}

export enum GameState {
  LOBBY = 0,
  PLAYING = 1,
  POSTGAME = 2
}

export type ActionResult = {
  processed: false
} | {
  processed: true
  success: false
  message: string
} | {
  processed: true
  success: true
}
