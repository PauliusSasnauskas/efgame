import { Player, PlayerDTO, Stat } from "common/src/Player"
import { GameState } from "common/src/SocketSpec"
import { Tile } from "common/src/Tile"
import config from "./Config"

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
    if (this.state === GameState.PLAYING){
      player.eliminated = true
    } else {
      delete this.players[name]
    }
    return player
  }

  listPlayers (): PlayerDTO[] {
    return Object.values(this.players).map((player) => player.serialize())
  }

  getMapForPlayer (playerName: string): Tile[] {
    // TODO: calculate user seeable map
    // TODO: if spectator show all
    return this.map
  }

  getStatsForPlayer (playerName: string): {[k: string]: Stat} {
    return this.players[playerName].serializeStats()
  }

  start () {
    if (this.state !== GameState.LOBBY) return
    console.log('[game] Starting...')

    console.log('[game] (1/3) Generating map...')
    this.map = config.mapNames[this.mapName](this.mapSize, Object.values(this.players))

    console.log('[game] (2/3) Setting stats...')
    Object.values(this.players).forEach((player) => {
      player.stats = {}
      Object.entries(config.stats).forEach(([statName, Stat]) => {
        player.stats![statName] = new Stat()
      })
    })
    // Make player stats
    // Set turn stuff

    console.log('[game] Started.')

    this.state = GameState.PLAYING
  }
}