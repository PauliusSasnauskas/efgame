import { PlayerDTO, Stat } from "common/src/Player"
import { GameState } from "common/src/SocketSpec"
import config from "./Config"
import { groupBy } from "common/src/util/array"
import { ServerAction, ServerEntity, ServerPlayer, ServerTile } from "./ConfigSpec"
import { Tile } from "common/src/Tile"

function log(...params: any[]) {
  console.log('[game]', ...params)
}

export default class Game {
  state: GameState = GameState.LOBBY
  players: {[k: string]: ServerPlayer} = {}
  mapSize: number = 20
  mapName: string = 'RMG'
  map: ServerTile[][] = []
  teams: string[] = ['Blue Triangle', 'Green Star', 'Orange Circle', 'Red Rectangle']

  turnQueue: string[] = []
  turnNumber: number = 1
  turn: string = ''

  private addMessageCallbacks: Array<(message: string) => void> = []

  private isValidTile (x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.mapSize || y >= this.mapSize) return false
    return true
  }

  private getTile (x: number, y: number): ServerTile {
    return this.map[y][x]
  }

  addMessageListener(callback: (message: string) => void) {
    this.addMessageCallbacks.push(callback)
  }

  private sendMessage(message: string) {
    log(message)
    this.addMessageCallbacks.forEach((callback) => callback(message))
  }

  addPlayer (name: string, color: string) {
    if (name in this.players) return
    this.players[name] = new ServerPlayer(
      name,
      color,
      this.state === GameState.PLAYING ? 'spectator' : undefined
    )
  }

  getPlayer(name: string) {
    return this.players[name]
  }

  removePlayer (name: string): ServerPlayer {
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

  setPlayerTeam (player: ServerPlayer, team: string): void {
    if (this.state !== GameState.LOBBY) return
    if (team === 'neutral'){
      player.team = undefined
    }else{
      player.team = team
    }
  }

  listPlayers (): PlayerDTO[] {
    return Object.values(this.players).map((player) => player.serialize())
  }

  getMapForPlayer (playerName: string): Tile[] {
    const player = this.players[playerName]
    if (player === undefined) return []

    return config.getMapForPlayer(this.map, this.mapSize, player, this.state)
  }

  getStatsForPlayer (playerName: string): {[k: string]: Stat} {
    if (!this.players[playerName].eliminated) {
      return this.players[playerName].serializeStats()
    } else {
      return {}
    }
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
    if (this.turn !== playerName) return

    this.turnNumber += 1
    let nextTurnQueueIndex = this.turnQueue.indexOf(playerName) + 1
    if (nextTurnQueueIndex >= this.turnQueue.length) nextTurnQueueIndex %= this.turnQueue.length
    this.turn = this.turnQueue[nextTurnQueueIndex]

    const player = this.players[playerName]
    const players = Object.values(this.players)

    const turnChangeEvents: Array<[number, ServerTile, NonNullable<ServerEntity['onTurnChange']>]> = []
    for (let i = 0; i < this.mapSize; i++) {
      for (let j = 0; j < this.mapSize; j++) {
        const tile = this.map[i][j]
        if (tile.entity !== undefined && tile.entity.onTurnChange !== undefined){
          turnChangeEvents.push([tile.entity.turnBuilt, tile, tile.entity.onTurnChange])
        }
      }
    }
    turnChangeEvents.sort((a, b) => a[0] - b[0])
    turnChangeEvents.forEach(([_, tile, turnChangeEvent]) => {
      turnChangeEvent({player, tile, map: this.map, mapSize: this.mapSize, players, turnNumber: this.turnNumber, sendMessage: this.sendMessage.bind(this)})
    })

    config.processEndTurnForPlayer(player, this.map, this.mapSize, players)
    
    const winner = config.checkWinner(this.map, this.mapSize, players, this.teams)
    if (winner !== undefined && typeof winner === 'object') {
      this.sendMessage(`${winner.name} won the game by eliminating all players!`)
      this.state = GameState.POSTGAME
    }else if(winner !== undefined && typeof winner === 'string') {
      this.sendMessage(`Team ${winner} won the game by eliminating all teams!`)
      this.state = GameState.POSTGAME
    }
  }

  private doesMeetReq (action: ServerAction, tile: ServerTile, player: ServerPlayer, players: ServerPlayer[]) {
    if (action.statsCost === undefined) return true

    let req = action.statsCost
    if (typeof req === 'function') {
      req = req({ tile, player, map: this.map, mapSize: this.mapSize, players, turnNumber: this.turnNumber, sendMessage: this.sendMessage.bind(this) })
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

  private subtractReq (action: ServerAction, tile: ServerTile, player: ServerPlayer, players: ServerPlayer[]) {
    if (action.statsCost === undefined) return

    let req = action.statsCost
    if (typeof req === 'function') {
      req = req({ tile, player, map: this.map, mapSize: this.mapSize, players, turnNumber: this.turnNumber, sendMessage: this.sendMessage.bind(this) })
    }

    for (const [statName, reqStat] of Object.entries(action.statsCost)) {
      const playerStat = (player.stats!)[statName]
      if (typeof playerStat.val === 'number'){
        playerStat.deduct(reqStat)
      }
    }
  }

  playerAction (playerName: string, actionName: string, x: number, y: number) {
    if (this.state !== GameState.PLAYING) return
    if (this.turn !== playerName) return

    const action = config.actions[actionName]
    if (action === undefined) return

    if (!this.isValidTile(x, y)) return
    const tile = this.getTile(x, y)

    const player = this.players[playerName]
    if (player.stats === undefined) return

    const players = Object.values(this.players)

    const meetsReq = this.doesMeetReq(action, tile, player, players)
    if (!meetsReq) return
    if (!action.canInvoke({ tile, player, map: this.map, mapSize: this.mapSize, players, turnNumber: this.turnNumber, sendMessage: this.sendMessage.bind(this) })) return
    action.invoke({ tile, player, map: this.map, mapSize: this.mapSize, players, turnNumber: this.turnNumber, sendMessage: this.sendMessage.bind(this) })
    this.subtractReq(action, tile, player, players)
  }
}
