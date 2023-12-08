import { Tile } from "common/src/Tile"
import { ServerTile } from "../ConfigSpec"
import { Player } from "common/src/Player"

function seeDiamond (seeMap: boolean[][], mapSize: number, y: number, x: number, dist: number, manhattan: boolean = true) {
  for (let i = -dist; i <= dist; i++){
    for (let j = -dist; j <= dist; j++){
      if (manhattan && Math.abs(i) + Math.abs(j) > dist) continue
      if (!manhattan && Math.pow(i, 2) + Math.pow(j, 2) > dist) continue
      if (y + i < 0 || x + j < 0 || y + i >= mapSize || x + j >= mapSize) continue
      seeMap[y+i][x+j] = true
    }
  }
}

export function getMapForPlayer (map: ServerTile[][], mapSize: number, player: Player): Tile[] {
  if (player.team === 'spectator' || player.eliminated) {
    return map.flat()
  }

  const seeMap: boolean[][] = Array.from({ length: mapSize }, () => Array.from({ length: mapSize }, () => false))

  for (let i = 0; i < mapSize; i++) {
    for (let j = 0; j < mapSize; j++) {
      const tile = map[j][i]
      if (tile.owner?.name === player.name) {
        const hasFullTower = tile.entity?.id === 'v:tower' && tile.entity?.health === 2
        seeDiamond(seeMap, mapSize, j, i, hasFullTower ? 30 : 2, hasFullTower ? false : true)
      }
    }
  }

  const tiles: Tile[] = []
  for (let i = 0; i < mapSize; i++) {
    for (let j = 0; j < mapSize; j++) {
      if (seeMap[j][i]) tiles.push({ ...map[j][i] })
    }
  }
  return tiles
}
