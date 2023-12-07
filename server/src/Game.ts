import { Player, PlayerDTO, Stat } from "common/src/Player"
import { GameState } from "common/src/SocketSpec"
import { Tile } from "common/src/Tile"
import config from "./Config"
import { groupBy } from "common/src/util/array"

export default class Game {
  state: GameState = GameState.LOBBY
  players: {[k: string]: Player} = {}
  mapSize: number = 20
  mapName: string = 'RMG'
  map: Tile[] = []
  teams: string[] = []

  turnQueue: string[] = []
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
      // TODO: Remove from turn queue
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

  private generateMap() {
    this.map = config.mapNames[this.mapName](this.mapSize, Object.values(this.players))
  }

  private setStats() {
    Object.values(this.players).forEach((player) => {
      player.stats = {}
      Object.entries(config.stats).forEach(([statName, Stat]) => {
        player.stats![statName] = new Stat()
      })
    })
  }

  private setTurnQueue() {
    this.turnQueue = []
    
    const teams = groupBy(Object.values(this.players), (player) => player.team ?? '')
    let teamsSortedByNumPlayers = Object.values(teams).sort((a, b) => a.length - b.length)
    
    while (teamsSortedByNumPlayers.length > 0) {
      for (let i = 0, n = teamsSortedByNumPlayers.length; i < n; i++){
        const team = teamsSortedByNumPlayers[i]
        const player = team.shift()
        if (player === undefined) {
          teamsSortedByNumPlayers.splice(i, 1)
          i--
          n--
          continue
        }
        this.turnQueue.push(player?.name)
      }
    }

    this.turnNumber = 0
    this.turn = this.turnQueue[0]
  }

  start () {
    if (this.state !== GameState.LOBBY) return
    console.log('[game] (1/3) Generating map...')
    this.generateMap()

    console.log('[game] (2/3) Setting stats...')
    this.setStats()
    
    console.log('[game] (3/3) Setting up turn queue...')
    this.setTurnQueue()

    console.log('[game] Started.')
    this.state = GameState.PLAYING
  }

  playerEndTurn (playerName: string) {
    if (this.state !== GameState.PLAYING) return

    // TODO: end turn
  }

  playerAction (playerName: string, actionName: string, x: number, y: number) {
    if (this.state !== GameState.PLAYING) return

    // TODO: end turn
  }
}