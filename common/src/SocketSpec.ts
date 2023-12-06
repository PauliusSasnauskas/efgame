import { PlayerDTO, Stat } from "./Player"
import { Tile } from "./Tile"

export interface ServerEvents {
  welcome: (message: ServerGreeting) => void
  chat: (message: Message) => void
  gameInfo: (info: GameInfoLobby | GameInfoPlaying) => void
  mapInfo: (map: Tile[]) => void
  statsInfo: (stats: {[k: string]: Stat}) => void
}

export interface ClientEvents {
  welcome: (data: { name: string, color: string }) => void
  chat: (message: string) => void
  chatPrivate: (message: string, to: number) => void
  startGame: () => void
}

export interface Message {
  text: string
  from?: string
  fromColor?: string
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
  numTeams: number
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
