import { Player, PlayerDTO } from "common/src/Player"
import { GameState } from "common/src/SocketSpec"
import { Tile } from "common/src/Tile"

export default class Game {
  state: GameState = GameState.LOBBY
  players: {[k: string]: Player} = {}
  mapSize: number = 20
  mapName: string = 'RMG'
  map: Tile[] = []
  teams: string[] = []

  turnNumber: number = 1
  turn: string = ''

  addPlayer (name: string, color: string) {
    this.players[name] = new Player(
      name,
      color,
      this.state === GameState.PLAYING ? 'spectator' : undefined
    )
  }

  getPlayer(name: string) {
    return this.players[name]
  }

  removePlayer (name: string): Player {
    const player = this.players[name]
    delete this.players[name]
    return player
  }

  listPlayers (): PlayerDTO[] {
    return Object.values(this.players).map((player) => player.serialize())
  }

  getMapForPlayer (player: number): Tile[] {
    // TODO: calculate user seeable map
    return []
  }

  start () {
    if (this.state !== GameState.LOBBY) return

    // Generate map
    // Make player stats
    // Set turn stuff

    this.state = GameState.PLAYING
  }
}