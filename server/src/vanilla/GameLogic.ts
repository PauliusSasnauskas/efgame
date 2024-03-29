import { Tile } from "common/src/Tile"
import { ServerPlayer, ServerStat, ServerTile } from "../ConfigSpec"
import { GameState } from "common/src/SocketSpec"
import { getTilesWhere, isTileSurrounded } from "../util"

function seeDiamond (seeMap: boolean[][], mapSize: number, x: number, y: number, dist: number) {
  for (let i = -dist; i <= dist; i++){
    for (let j = -dist; j <= dist; j++){
      if (Math.pow(i, 2) + Math.pow(j, 2) > dist) continue
      if (y + i < 0 || x + j < 0 || y + i >= mapSize || x + j >= mapSize) continue
      seeMap[y+i][x+j] = true
    }
  }
}

function isTerritoryFriendly (player: ServerPlayer, tile: ServerTile): boolean {
  if (tile.owner?.name === player.name) return true
  if (player.team !== undefined && tile.owner?.team === player.team) return true
  return false
}

export function getMapForPlayer (map: ServerTile[][], mapSize: number, player: ServerPlayer, gameState: GameState): Tile[] {
  if (player.team === 'spectator' || player.eliminated || gameState === GameState.POSTGAME) {
    return map.flat()
  }

  const seeMap: boolean[][] = Array.from({ length: mapSize }, () => Array.from({ length: mapSize }, () => false))

  for (let i = 0; i < mapSize; i++) {
    for (let j = 0; j < mapSize; j++) {
      const tile = map[i][j]
      if (isTerritoryFriendly(player, tile)){
        const hasFullTower = tile.entity?.id === 'v:tower' && tile.entity?.health === 2
        seeDiamond(seeMap, mapSize, j, i, hasFullTower ? 30 : 4)
      }
    }
  }

  const tiles: Tile[] = []
  for (let i = 0; i < mapSize; i++) {
    for (let j = 0; j < mapSize; j++) {
      if (seeMap[i][j]) tiles.push(map[i][j].serialize())
    }
  }
  return tiles
}

export function processEndTurnForPlayer (player: ServerPlayer, map: ServerTile[][], mapSize: number, players: ServerPlayer[]) {
  const playerStats = player.stats!
  playerStats['v:gold'].add(2)
  
  let [ownedInner, ownedOuter] = [0, 0]
  
  for (let i = 0; i < mapSize; i++) {
    for (let j = 0; j < mapSize; j++) {
      if (map[i][j].owner?.name === player.name){
        const isInner = isTileSurrounded(map, mapSize, j, i, player.name)
        if (isInner) ownedInner += 1
        else ownedOuter += 1
      }
    }
  }
  
  const actionStat: ServerStat = playerStats['v:action']
  actionStat.max! = 12 + Math.floor((playerStats['v:xp'].val as number) / 8)
  if (actionStat.max! > actionStat.hiddenMax!) actionStat.max = actionStat.hiddenMax
  actionStat.add(7 + Math.floor(ownedInner / 50) + Math.floor(ownedOuter / 100))
}

export function checkWinnerTeams (players: ServerPlayer[], capitols: Tile[], playersWithCapitols: Set<string | undefined>): ServerPlayer | string | undefined {
  const teamsWithCapitols = new Set(capitols.map((capitolTile) => capitolTile.owner?.team))
  if (teamsWithCapitols.size !== 1) return undefined
  const winningTeam = teamsWithCapitols.values().next().value
  if (winningTeam === undefined) {
    if (playersWithCapitols.size === 1) return players.find((player) => player.name === playersWithCapitols.values().next().value)
    return undefined
  }
  return winningTeam
}

export function checkWinner (map: ServerTile[][], mapSize: number, players: ServerPlayer[], teams: string[]): ServerPlayer | string | undefined {
  const capitols = getTilesWhere(map, mapSize, (tile) => tile.entity?.id === 'v:capitol')
  const playersWithCapitols = new Set(capitols.map((capitolTile) => capitolTile.owner?.name))
  playersWithCapitols.delete(undefined)
  
  if (teams.length > 0) return checkWinnerTeams(players, capitols, playersWithCapitols)
  if (playersWithCapitols.size === 1) return players.find((player) => player.name === playersWithCapitols.values().next().value)
  return undefined
}
