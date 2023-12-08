import { Tile } from "common/src/Tile"
import { ServerStat, ServerTile } from "../ConfigSpec"
import { Player } from "common/src/Player"
import { GameState } from "common/src/SocketSpec"
import { getTilesWhere, isTileSurrounded } from "../util"

function seeDiamond (seeMap: boolean[][], mapSize: number, x: number, y: number, dist: number, manhattan: boolean = true) {
  for (let i = -dist; i <= dist; i++){
    for (let j = -dist; j <= dist; j++){
      if (manhattan && Math.abs(i) + Math.abs(j) > dist) continue
      if (!manhattan && Math.pow(i, 2) + Math.pow(j, 2) > dist) continue
      if (y + i < 0 || x + j < 0 || y + i >= mapSize || x + j >= mapSize) continue
      seeMap[y+i][x+j] = true
    }
  }
}

export function getMapForPlayer (map: ServerTile[][], mapSize: number, player: Player, gameState: GameState): Tile[] {
  if (player.team === 'spectator' || player.eliminated || gameState === GameState.POSTGAME) {
    return map.flat()
  }

  const seeMap: boolean[][] = Array.from({ length: mapSize }, () => Array.from({ length: mapSize }, () => false))

  for (let i = 0; i < mapSize; i++) {
    for (let j = 0; j < mapSize; j++) {
      const tile = map[i][j]
      if (tile.owner?.name === player.name) {
        const hasFullTower = tile.entity?.id === 'v:tower' && tile.entity?.health === 2
        seeDiamond(seeMap, mapSize, j, i, hasFullTower ? 30 : 2, hasFullTower ? false : true)
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

export function processEndTurnForPlayer (player: Player, map: ServerTile[][], mapSize: number, players: Player[]) {
  const playerStats = player.stats!
  ;(playerStats['v:gold'].val as number) += 2
  
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
  ;(actionStat.val as number) += 7 + Math.floor(ownedInner / 50) + Math.floor(ownedOuter / 100)
  actionStat.max! = 12 + Math.floor((playerStats['v:xp'].val as number) / 8)
  if (actionStat.max! > actionStat.hiddenMax!) actionStat.max = actionStat.hiddenMax
}

export function checkWinner (map: ServerTile[][], mapSize: number, players: Player[]): Player | undefined {
  const capitols = getTilesWhere(map, mapSize, (tile) => tile.entity?.id === 'v:capitol')
  const playersWithCapitols = new Set(capitols.map((capitolTile) => capitolTile.owner?.name))
  playersWithCapitols.delete(undefined)
  if (playersWithCapitols.size === 1) {
    return players.find((player) => player.name === [...playersWithCapitols.values()][0])
  }
  return undefined
}
