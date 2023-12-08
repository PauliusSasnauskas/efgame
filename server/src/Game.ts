import { Player, PlayerDTO, Stat } from "common/src/Player"
import { GameState } from "common/src/SocketSpec"
import { Tile } from "common/src/Tile"
import config from "./Config"
import { groupBy } from "common/src/util/array"
import { ConfigAction } from "./ConfigSpec"

function log(...params: any[]) {
  console.log('[game]', ...params)
}

export default class Game {
  state: GameState = GameState.LOBBY
  players: {[k: string]: Player} = {}
  mapSize: number = 20
  mapName: string = 'RMG'
  map: Tile[][] = []
  teams: string[] = []

  turnQueue: string[] = []
  turnNumber: number = 1
  turn: string = ''

  private isValidTile (x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.mapSize || y >= this.mapSize) return false
    return true
  }

  private getTile (x: number, y: number): Tile {
    return this.map[y][x]
  }

  addPlayer (name: string, color: string) {
    if (name in this.players) return
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
      if (player.team !== 'spectator') {
        player.eliminated = true
        this.turnQueue.splice(this.turnQueue.indexOf(player.name), 1)
      }
    } else {
      delete this.players[name]
    }
    return player
  }

  listPlayers (): PlayerDTO[] {
    return Object.values(this.players).map((player) => player.serialize())
  }

  getMapForPlayer (playerName: string): Tile[][] {
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
    log('(1/3) Generating map...')
    this.generateMap()

    log('(2/3) Setting stats...')
    this.setStats()
    
    log('(3/3) Setting up turn queue...')
    this.setTurnQueue()

    log('Started.')
    this.state = GameState.PLAYING
  }

  playerEndTurn (playerName: string) {
    if (this.state !== GameState.PLAYING) return

    // TODO: end turn
  }

  private doesMeetReq (action: ConfigAction, tile: Tile, player: Player, players: Player[]) {
    if (action.statsCost === undefined) return true
    
    let req = action.statsCost
    if (typeof req === 'function') {
      req = req({ tile, player, map: this.map, mapSize: this.mapSize, players })
    }

    for (const [statName, reqStat] of Object.entries(action.statsCost)) {
      const playerStat = (player.stats!)[statName]
      if (playerStat === undefined) return false
      if (typeof playerStat.val === 'string' && playerStat.val !== reqStat) {
        return false // Question: is string equality a good rule?
      } else if (typeof playerStat.val === 'number' && playerStat.val < reqStat){
        return false
      }
    }

    return true 
  }

  private subtractReq (action: ConfigAction, tile: Tile, player: Player, players: Player[]) {
    if (action.statsCost === undefined) return

    let req = action.statsCost
    if (typeof req === 'function') {
      req = req({ tile, player, map: this.map, mapSize: this.mapSize, players })
    }

    for (const [statName, reqStat] of Object.entries(action.statsCost)) {
      const playerStat = (player.stats!)[statName]
      if (typeof playerStat.val === 'number'){
        playerStat.val -= reqStat
      }
    }
  }

  playerAction (playerName: string, actionName: string, x: number, y: number) {
    if (this.state !== GameState.PLAYING) return
    if (this.turn !== playerName) return

    const action = config.actions[actionName]

    if (action === undefined) return
    if (!this.isValidTile(x, y)) return

    const player = this.players[playerName]
    if (player.stats === undefined) return
    
    const players = Object.values(this.players)
    const tile = this.getTile(x, y)

    const meetsReq = this.doesMeetReq(action, tile, player, players)
    
    if (!meetsReq) return
    if (!action.canInvoke({ tile, player, map: this.map, mapSize: this.mapSize, players })) return
    action.invoke({ tile, player, map: this.map, mapSize: this.mapSize, players })
    this.subtractReq(action, tile, player, players)
  }
}
