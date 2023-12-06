import { PlayerDTO } from './Player'

export interface ServerEvents {
  welcome: (message: ServerGreeting) => void
  chat: (message: Message) => void
}

export interface ClientEvents {
  welcome: (data: { name: string, color: string }) => void
  chat: (message: string) => void
  // chatPrivate: (message: string, to: number) => void
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

export interface GameInfo {
  gameState: GameState
  players: PlayerDTO[]
}

export enum GameState {
  LOBBY = 0,
  PLAYING = 1,
  POSTGAME = 2
}
