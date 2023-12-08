import { Player } from "common/src/Player";
import { ConfigAction, StatReq } from "../ConfigSpec";
import { Tile } from "common/src/Tile";
import { Barracks, Mine, Tower, WoodWall, StoneWall, Capitol } from "./Building";
import ServerStat from "../ServerStat";

function isAttackable (tile: Tile, player: Player) {
  if (tile.owner === undefined && tile.entity === undefined){
    return true
  }
  if (tile.entity !== undefined && ['v:tree1', 'v:tree2', 'v:tree3', 'v:bush1', 'v:rock1', 'v:mountain1'].includes(tile.entity.id)){
    return false
  }
  if (tile.owner?.name !== player.name && (player.team === undefined || tile.owner?.team !== player.team)){
    return true
  }

  return false
}

function getTile (map: Tile[][], mapSize: number, x: number, y: number): Tile | undefined {
  if (x < 0 || y < 0 || x > mapSize || y > mapSize) return undefined
  return map[y][x]
}

function isConnected (tile: Tile, player: Player, map: Tile[][], mapSize: number) {
  const x = tile.x
  const y = tile.y

  const near = [getTile(map, mapSize, x, y-1), getTile(map, mapSize, x-1, y), getTile(map, mapSize, x, y+1), getTile(map, mapSize, x+1, y)]
  const far = [getTile(map, mapSize, x-1, y-1), getTile(map, mapSize, x-1, y+1), getTile(map, mapSize, x+1, y-1), getTile(map, mapSize, x+1, y+1)]

  const ownNear = near.map((tile) => tile?.owner?.name === player.name)
  const isOneNear = ownNear.reduce((prev, cur) => prev || cur, false)
  if (!isOneNear) return false

  const capitolNear = near.map((tile) => tile?.owner?.name === player.name && tile?.entity?.id === 'v:capitol')
  const isCapitolNear = capitolNear.reduce((prev, cur) => prev || cur, false)
  if (isCapitolNear) return true
  
  const ownAround = [...near, ...far].map((tile) => tile?.owner?.name === player.name)
  const isAtLeastTwoConnected = ownAround.reduce((accum, cur) => accum += cur ? 1 : 0, 0) >= 2
  if (isAtLeastTwoConnected) return true

  return false
}

function isOwned (tile: Tile, player: Player): boolean {
  return tile.owner?.name === player.name
}

function isOwnedBuilding (tile: Tile, player: Player): boolean {
  return isOwned(tile, player) && tile.entity !== undefined
}

function isOwnedNoBuilding (tile: Tile, player: Player): boolean {
  return isOwned(tile, player) && tile.entity === undefined
}

function hasStat (statName: string, player: Player, amount: number): boolean {
  const playerStats = player.stats!
  return (typeof playerStats[statName].val === 'number' && playerStats[statName].val as number >= amount)
}

function deductStat (statName: string, player: Player, amount: number): void {
  const playerStats = player.stats!
  const stat = playerStats[statName]
  if (typeof stat.val !== 'number') return
  stat.val -= amount
}

function countTilesWhere (map: Tile[][], mapSize: number, where: (t: Tile) => boolean): number {
  let count = 0
  for (let i = 0; i < mapSize; i++){
    for (let j = 0; j < mapSize; j++){
      count += where(map[j][i]) ? 1 : 0
    }
  }
  return count
}

export const AttackAction: ConfigAction = {
  canInvoke: ({ tile, player, map, mapSize }) => {
    if (!isAttackable(tile, player)) return false
    if (!isConnected(tile, player, map, mapSize)) return false
    return true
  },
  statsCost: { "v:action": 2, "v:army": 1 },
  invoke: ({ tile, player }) => {
    if (tile.entity === undefined || tile.entity.health === 1) {
      tile.entity = undefined
      tile.owner = { name: player.name, isPlayer: true, team: player.team }
      return
    }
    if (tile.entity !== undefined && tile.entity.health !== undefined && tile.entity.health > 1) {
      tile.entity.health -= 1
      return
    }
  }
}

export const LeaveAction: ConfigAction = {
  canInvoke: ({ tile, player }) => {
    return (tile.owner?.name === player.name && tile.entity === undefined)
  },
  statsCost: { "v:action": 1 },
  invoke: ({ tile }) => {
    tile.owner = undefined
  }
}

export const TransferAction: ConfigAction = {
  canInvoke: ({tile, player}) => {
    const isOwn = tile.owner?.name === player.name
    if (isOwn) return false
    const isTeammate = player.team !== undefined && tile.owner?.team === player.team
    if (!isTeammate) return false
    return true
  },
  statsCost: { "v:action": 1, "v:gold": 50 },
  invoke: ({ tile, players }) => {
    const receiverName = tile.owner?.name
    const receiver = players.find((player) => player.name === receiverName)
    if (receiver?.stats !== undefined && typeof receiver.stats?.['v:gold'].val !== 'number') {
      receiver.stats['v:gold'].val += 50
    }
  }
}

export const DemolishAction: ConfigAction = {
  canInvoke: ({ tile, player }) => {
    return isOwnedBuilding(tile, player)
  },
  statsCost: { 'v:action': 1, 'v:army': 1 },
  invoke: ({ tile }) => {
    tile.entity = undefined
  }
}

const repairReqForBuilding: { [k: string]: StatReq } = {
  'v:capitol': { 'v:action': 3, 'v:gold': 230, 'v:army': 2 },
  'v:mine': { 'v:action': 2, 'v:gold': 35, 'v:army': 3 },
  'v:barracks': { 'v:action': 2, 'v:gold': 50, 'v:army': 3 },
  'v:tower': { 'v:action': 2, 'v:gold': 50, 'v:army': 1 },
  'v:woodwall': { 'v:action': 1, 'v:gold': 30, 'v:army': 1 },
  'v:stonewall': { 'v:action': 1, 'v:gold': 30, 'v:army': 1 }
}

const maxHealthForBuilding: { [k: string]: number } = {
  'v:capitol': 3,
  'v:mine': 2,
  'v:barracks': 2,
  'v:tower': 2,
  'v:woodwall': 4,
  'v:stonewall': 7
}

export const RepairAction: ConfigAction = {
  canInvoke: ({ tile, player }) => {
    if (!isOwnedBuilding(tile, player)) return false

    const building = tile.entity!
    const repairReq = repairReqForBuilding[building.id]
    const hasStats = Object.entries(repairReq).map(([statName, statReq]) => hasStat(statName, player, statReq as number))
    const hasStatsAll = hasStats.reduce((prev, cur) => prev && cur, true)
    if (!hasStatsAll) return false
    
    if (building.health! < maxHealthForBuilding[building.id]) return true

    return false
  },
  invoke: ({ tile, player }) => {
    const building = tile.entity!
    
    building.health! += 1

    const repairReq = repairReqForBuilding[building.id]
    Object.entries(repairReq).forEach(([statName, statReq]) => deductStat(statName, player, statReq as number))
  }
}

export const BuildCapitolAction: ConfigAction = {
  canInvoke: ({ tile, player, map, mapSize }) => {
    const capitols = countTilesWhere(map, mapSize, (tile) => isOwned(tile, player) && tile.entity?.id === 'v:capitol')
    const reqGold = 475 + capitols * 25
    const reqXp = 125 + capitols * 25
    return isOwnedNoBuilding(tile, player) && hasStat('v:xp', player, reqXp) && hasStat('v:gold', player, reqGold)
  },
  statsCost: { 'v:action': 8, 'v:army': 6 },
  invoke: ({ tile, player, map, mapSize }) => {
    const capitols = countTilesWhere(map, mapSize, (tile) => isOwned(tile, player) && tile.entity?.id === 'v:capitol')
    const reqGold = 475 + capitols * 25

    deductStat('v:gold', player, reqGold)

    tile.entity = new Capitol()
  }
}

export const BuildMineAction: ConfigAction = {
  canInvoke: ({ tile, player }) => isOwnedNoBuilding(tile, player),
  statsCost: { 'v:action': 6, 'v:gold': 125 },
  invoke: ({ tile }) => {
    tile.entity = new Mine()
  }
}

export const BuildBarracksAction: ConfigAction = {
  canInvoke: ({ tile, player }) => isOwnedNoBuilding(tile, player),
  statsCost: { 'v:action': 6, 'v:gold': 100 },
  invoke: ({ tile, player, map, mapSize }) => {
    const barracksHealthy = countTilesWhere(map, mapSize, (tile) => isOwned(tile, player) && tile.entity?.id === 'v:barracks' && tile.entity.health === 2)
    const barracksDamaged = countTilesWhere(map, mapSize, (tile) => isOwned(tile, player) && tile.entity?.id === 'v:barracks' && tile.entity.health === 1)

    const playerStats = player.stats!
    if (typeof playerStats['v:army'].val !== 'number') return
    playerStats['v:army'].val += 20 + 2 * barracksHealthy + barracksDamaged

    tile.entity = new Barracks()
  }
}

export const BuildTowerAction: ConfigAction = {
  canInvoke: ({ tile, player }) => isOwnedNoBuilding(tile, player) && hasStat('v:xp', player, 25),
  statsCost: { 'v:action': 4, 'v:gold': 90, 'v:army': 1 },
  invoke: ({ tile }) => {
    tile.entity = new Tower()
  }
}

export const BuildWoodWallAction: ConfigAction = {
  canInvoke: ({ tile, player }) => isOwnedNoBuilding(tile, player) && hasStat('v:xp', player, 50),
  statsCost: { 'v:action': 4, 'v:gold': 115, 'v:army': 3 },
  invoke: ({ tile }) => {
    tile.entity = new WoodWall()
  }
}

export const BuildStoneWallAction: ConfigAction = {
  canInvoke: ({ tile, player }) => isOwnedNoBuilding(tile, player) && hasStat('v:xp', player, 135),
  statsCost: { 'v:action': 7, 'v:gold': 180, 'v:army': 5 },
  invoke: ({ tile }) => {
    tile.entity = new StoneWall()
  }
}
