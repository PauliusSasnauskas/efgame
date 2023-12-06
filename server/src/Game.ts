import { Player } from "common/src/Player"

export enum GameState {
  LOBBY = 0,
  PLAYING = 1,
  POSTGAME = 2
}

export default class Game {
  state: GameState
  players: Player[] = []

  constructor () {
    this.state = GameState.LOBBY
  }

  addPlayer (id: number, name: string, color: string) {
    this.players.push({
      id,
      name,
      color,
      team: this.state === GameState.PLAYING ? 'spectator' : undefined
    })
  }

  getPlayer(id: number) {
    return this.players.find((player) => player.id === id)
  }
}