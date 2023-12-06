import { Player, PlayerDTO } from "common/src/Player"
import { GameState } from "common/src/SocketSpec"

export default class Game {
  state: GameState
  players: {[k: number]: Player} = {}

  constructor () {
    this.state = GameState.LOBBY
  }

  addPlayer (id: number, name: string, color: string) {
    this.players[id] = new Player(
      id,
      name,
      color,
      this.state === GameState.PLAYING ? 'spectator' : undefined
    )
  }

  getPlayer(id: number) {
    return this.players[id]
  }

  removePlayer (id: number): Player {
    const player = this.players[id]
    delete this.players[id]
    return player
  }

  listPlayers (): PlayerDTO[] {
    return Object.values(this.players).map((player) => player.serialize())
  }
}