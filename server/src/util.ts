import { Player } from "common/src/Player"
import { Tile } from "common/src/Tile"

export function getRandomInt(max: number): number {
  max = Math.floor(max)
  return Math.floor(Math.random() * max) // The maximum is exclusive
}

export function getTilesWhere (map: Tile[][], mapSize: number, where: (t: Tile) => boolean): Tile[] {
  const tiles: Tile[] = []
  for (let i = 0; i < mapSize; i++){
    for (let j = 0; j < mapSize; j++){
      if (where(map[i][j])) tiles.push(map[i][j])
    }
  }
  return tiles
}

export function countTilesWhere (map: Tile[][], mapSize: number, where: (t: Tile) => boolean): number {
  let count = 0
  for (let i = 0; i < mapSize; i++){
    for (let j = 0; j < mapSize; j++){
      count += where(map[i][j]) ? 1 : 0
    }
  }
  return count
}

export function isOwned (tile: Tile, player: Player): boolean {
  return tile.owner?.name === player.name
}

export function isOwnedEntity (tile: Tile, player: Player): boolean {
  return isOwned(tile, player) && tile.entity !== undefined
}

export function isOwnedNoEntity (tile: Tile, player: Player): boolean {
  return isOwned(tile, player) && tile.entity === undefined
}

export function hasStat (statName: string, player: Player, amount: number): boolean {
  const playerStats = player.stats!
  if (typeof playerStats[statName].val === 'number' && playerStats[statName].val as number >= amount) return true
  if (typeof playerStats[statName].val === 'string' && playerStats[statName].val === amount) return true
  return false
}

export function isTileSurrounded(map: Tile[][], mapSize: number, x: number, y: number, playerName: string): boolean {
  let [dir1, dir2, dir3, dir4] = [false, false, false, false]
  if (y > 0         && map[y-1][x].owner?.name === playerName) dir1 = true
  if (x < mapSize-1 && map[y][x+1].owner?.name === playerName) dir2 = true
  if (y < mapSize-1 && map[y+1][x].owner?.name === playerName) dir3 = true
  if (x > 0         && map[y][x-1].owner?.name === playerName) dir4 = true
  return dir1 && dir2 && dir3 && dir4
}
