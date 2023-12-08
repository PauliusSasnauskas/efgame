import { Player } from "common/src/Player"
import { ServerTile } from "./ConfigSpec"

export function getRandomInt(max: number): number {
  max = Math.floor(max)
  return Math.floor(Math.random() * max) // The maximum is exclusive
}

export function getTilesWhere (map: ServerTile[][], mapSize: number, where: (t: ServerTile) => boolean): ServerTile[] {
  const tiles: ServerTile[] = []
  for (let i = 0; i < mapSize; i++){
    for (let j = 0; j < mapSize; j++){
      if (where(map[i][j])) tiles.push(map[i][j])
    }
  }
  return tiles
}

export function countTilesWhere (map: ServerTile[][], mapSize: number, where: (t: ServerTile) => boolean): number {
  let count = 0
  for (let i = 0; i < mapSize; i++){
    for (let j = 0; j < mapSize; j++){
      count += where(map[i][j]) ? 1 : 0
    }
  }
  return count
}

export function isOwned (tile: ServerTile, player: Player): boolean {
  return tile.owner?.name === player.name
}

export function isOwnedEntity (tile: ServerTile, player: Player): boolean {
  return isOwned(tile, player) && tile.entity !== undefined
}

export function isOwnedNoEntity (tile: ServerTile, player: Player): boolean {
  return isOwned(tile, player) && tile.entity === undefined
}

export function hasStat (statName: string, player: Player, amount: number): boolean {
  const playerStats = player.stats!
  if (typeof playerStats[statName].val === 'number' && playerStats[statName].val as number >= amount) return true
  if (typeof playerStats[statName].val === 'string' && playerStats[statName].val === amount) return true
  return false
}
