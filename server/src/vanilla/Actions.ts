import { Player } from "common/src/Player"
import { ServerAction, ServerActionResult, ServerPlayer, ServerTile } from "../ConfigSpec"
import { Barracks, Mine, Tower, WoodWall, StoneWall, Capitol } from "./Building"
import { countTilesWhere, hasStat, isOwned, isOwnedEntity, isOwnedNoEntity, isTileSurrounded } from "../util"
import { buildingInfo } from "common/src/vanilla/Building"

const success: ServerActionResult = { success: true }
const noStatsResult: ServerActionResult = { success: false, message: 'You do not meet the requirements' }
const notOwnedOrEntityResult: ServerActionResult = { success: false, message: 'You do not own the tile or there is a building on it' }

function isAttackable (tile: ServerTile, player: Player): ServerActionResult {
  if (tile.owner === undefined && tile.entity === undefined) return success
  if (tile.entity !== undefined && ['v:tree1', 'v:tree2', 'v:tree3', 'v:bush1', 'v:rock1', 'v:mountain1'].includes(tile.entity.id))
    return { success: false, message: 'Blocked by object' }
  if (tile.owner?.name === player.name) return { success: false, message: 'Cannot attack yourself' }
  if (tile.owner?.team !== undefined && tile.owner.team === player.team) return { success: false, message: 'Cannot attack teammate' } // TODO: check if can attack eliminated teammate
  return success
}

function getTile (map: ServerTile[][], mapSize: number, x: number, y: number): ServerTile | undefined {
  if (x < 0 || y < 0 || x >= mapSize || y >= mapSize) return undefined
  return map[y][x]
}

function isConnected (tile: ServerTile, player: ServerPlayer, map: ServerTile[][], mapSize: number) {
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

function findPlayer (playerName: string, players: ServerPlayer[]): ServerPlayer | undefined {
  return players.find((player) => player.name === playerName)
}

function deductStat (statName: string, player: ServerPlayer, amount: number): void {
  if (player.eliminated) return
  (player.stats!)[statName].deduct(amount)
}

function addStat (statName: string, player: ServerPlayer, amount: number): void {
  (player.stats!)[statName].add(amount)
}

function isNeutralTile (tile: ServerTile, player: ServerPlayer, players: ServerPlayer[]): boolean {
  if (tile.owner === undefined) return true
  const tilePlayer = findPlayer(tile.owner.name, players)
  if (tilePlayer === undefined) return true
  if (tilePlayer.eliminated) return true
  return false
}

function hasOnlyOneCapitol (map: ServerTile[][], mapSize: number, playerName: string): boolean {
  const numOwnedCapitols = countTilesWhere(map, mapSize, (tile) => tile.owner?.name === playerName && tile.entity?.id === 'v:capitol')

  return numOwnedCapitols === 1
}

function tryTileSurroundCapture (x: number, y: number, player: ServerPlayer, map: ServerTile[][], mapSize: number, players: ServerPlayer[]) {
  if (x < 0 || y < 0 || x >= mapSize || y >= mapSize) return
  if (!isTileSurrounded(map, mapSize, x, y, player.name)) return
  const tile = map[y][x]
  if (tile.entity !== undefined) return
  if (tile.owner?.name === player.name) return
  if (player.team !== undefined && tile.owner?.team === player.team) return

  if (tile.owner !== undefined) {
    const defender = findPlayer(tile.owner.name, players)
    if (defender !== undefined) deductStat('v:territory', defender, 1)
  }
  
  tile.owner = { name: player.name, isPlayer: true, team: player.team }

  const tileIsNeutral = isNeutralTile(tile, player, players)
  addStat('v:xp', player, tileIsNeutral ? 0.375 : 1.5)
  addStat('v:territory', player, 1)
}

function tryClaimSurrounded (x: number, y: number, player: ServerPlayer, map: ServerTile[][], mapSize: number, players: ServerPlayer[]) {
  tryTileSurroundCapture(x-1, y, player, map, mapSize, players)
  tryTileSurroundCapture(x+1, y, player, map, mapSize, players)
  tryTileSurroundCapture(x, y-1, player, map, mapSize, players)
  tryTileSurroundCapture(x, y+1, player, map, mapSize, players)
}

export const AttackAction: ServerAction = {
  canInvoke: ({ tile, player, map, mapSize }) => {
    const attackable = isAttackable(tile, player)
    if (!attackable.success) return attackable
    if (!isConnected(tile, player, map, mapSize)) return { success: false, message: 'Tile must be connected with a Capitol or at least two tiles' }
    return success
  },
  statsCost: { "v:action": 2, "v:army": 1 },
  invoke: ({ tile, player, map, mapSize, players, sendMessage }) => {
    const tileIsNeutral = isNeutralTile(tile, player, players)

    if (tile.entity !== undefined && tile.entity.health !== undefined && tile.entity.health > 1) {
      tile.entity.health -= 1
      return
    }
    if (tile.entity !== undefined && tile.entity.health === 1) {
      addStat('v:xp', player, buildingInfo[tile.entity.id].destroyXpReward * (tileIsNeutral ? 0.25 : 1))
      if (tile.entity.id === 'v:capitol') {
        const defendingPlayer = findPlayer(tile.owner!.name, players)
        if (defendingPlayer !== undefined && hasOnlyOneCapitol(map, mapSize, defendingPlayer.name)){
          defendingPlayer.eliminated = true
          addStat('v:xp', player, 20)
          sendMessage(`${defendingPlayer.name} has been eliminated by ${player.name}!`)
        }
      }
    }else{
      addStat('v:xp', player, tileIsNeutral ? 0.25 : 1)
    }
    if (tile.owner !== undefined) {
      const defendingPlayer = findPlayer(tile.owner!.name, players)!
      deductStat('v:territory', defendingPlayer, 1)
    }
    tile.entity = undefined
    tile.owner = { name: player.name, isPlayer: true, team: player.team }
    tryClaimSurrounded(tile.x, tile.y, player, map, mapSize, players)
    addStat('v:territory', player, 1)
  }
}

export const LeaveAction: ServerAction = {
  canInvoke: ({ tile, player }) => {
    if (tile.owner?.name !== player.name) return { success: false, message: 'Cannot leave territory which is not yours' }
    if (tile.entity !== undefined) return { success: false, message: 'Cannot leave territory which has a building on it' }
    return success
  },
  statsCost: { "v:action": 1 },
  invoke: ({ tile, player }) => {
    deductStat('v:territory', player, 1)
    tile.owner = undefined
  }
}

export const TransferAction: ServerAction = {
  canInvoke: ({tile, player}) => {
    if (tile.owner?.name === undefined) return { success: false, message: 'Cannot transfer to unoccupied tile' }
    const isOwn = tile.owner?.name === player.name
    if (isOwn) return { success: false, message: 'Cannot transfer to yourself' }
    const isTeammate = player.team !== undefined && tile.owner?.team === player.team
    if (!isTeammate) return { success: false, message: 'Cannot transfer to enemy' }
    return success
  },
  statsCost: { "v:action": 1, "v:gold": 50 },
  invoke: ({ tile, players }) => {
    const receiver = findPlayer(tile.owner!.name, players)
    if (receiver?.stats !== undefined) {
      receiver.stats['v:gold'].add(50)
    }
  }
}

export const DemolishAction: ServerAction = {
  canInvoke: ({ tile, player, map, mapSize }) => {
    if (!isOwnedEntity(tile, player)) return { success: false, message: 'Cannot demolish building that is not yours' }
    const numOwnedCapitols = countTilesWhere(map, mapSize, (t) => isOwned(t, player) && t.entity?.id === 'v:capitol')
    if (numOwnedCapitols === 1) return { success: false, message: 'Cannot demolish your only Capitol' }
    return success
  },
  statsCost: { 'v:action': 1, 'v:army': 1 },
  invoke: ({ tile }) => {
    tile.entity = undefined
  }
}

export const RepairAction: ServerAction = {
  canInvoke: ({ tile, player }) => {
    if (!isOwnedEntity(tile, player)) return { success: false, message: 'Cannot repair tile that is not yours' }

    const building = tile.entity!
    const repairReq = buildingInfo[building.id].repairReq
    const hasStats = Object.entries(repairReq).map(([statName, statReq]) => hasStat(statName, player, statReq as number))
    const hasStatsAll = hasStats.reduce((prev, cur) => prev && cur, true)
    if (!hasStatsAll) return noStatsResult
    if (building.health! >= buildingInfo[building.id].maxHealth) return { success: false, message: 'Building is already repaired' }
    return success
  },
  invoke: ({ tile, player }) => {
    const building = tile.entity!

    building.health! += 1

    const repairReq = buildingInfo[building.id].repairReq
    Object.entries(repairReq).forEach(([statName, statReq]) => deductStat(statName, player, statReq as number))
  }
}

export const BuildCapitolAction: ServerAction = {
  canInvoke: ({ tile, player, map, mapSize }) => {
    if (!isOwnedNoEntity(tile, player)) return notOwnedOrEntityResult
    const capitols = countTilesWhere(map, mapSize, (tile) => isOwned(tile, player) && tile.entity?.id === 'v:capitol')
    const reqGold = 475 + capitols * 25
    const reqXp = 125 + capitols * 25
    if (!hasStat('v:xp', player, reqXp)) return noStatsResult
    if (!hasStat('v:gold', player, reqGold)) return noStatsResult
    return success
  },
  statsCost: { 'v:action': 8, 'v:army': 6 },
  invoke: ({ tile, player, map, mapSize, turnNumber }) => {
    const capitols = countTilesWhere(map, mapSize, (tile) => isOwned(tile, player) && tile.entity?.id === 'v:capitol')
    const reqGold = 475 + capitols * 25

    deductStat('v:gold', player, reqGold)
    addStat('v:xp', player, 0.5)

    tile.entity = new Capitol(turnNumber)
  }
}

export const BuildMineAction: ServerAction = {
  canInvoke: ({ tile, player }) => isOwnedNoEntity(tile, player) ? success : notOwnedOrEntityResult,
  statsCost: buildingInfo['v:mine'].buildReq,
  invoke: ({ tile, player, turnNumber }) => {
    addStat('v:xp', player, 0.5)
    tile.entity = new Mine(turnNumber)
  }
}

export const BuildBarracksAction: ServerAction = {
  canInvoke: ({ tile, player }) => isOwnedNoEntity(tile, player) ? success : notOwnedOrEntityResult,
  statsCost: buildingInfo['v:barracks'].buildReq,
  invoke: ({ tile, player, map, mapSize, turnNumber }) => {
    const barracksHealthy = countTilesWhere(map, mapSize, (tile) => isOwned(tile, player) && tile.entity?.id === 'v:barracks' && tile.entity.health === 2)
    const barracksDamaged = countTilesWhere(map, mapSize, (tile) => isOwned(tile, player) && tile.entity?.id === 'v:barracks' && tile.entity.health === 1)

    addStat('v:army', player, 20 + 2 * barracksHealthy + barracksDamaged)
    addStat('v:xp', player, 0.5)
    tile.entity = new Barracks(turnNumber)
  }
}

export const BuildTowerAction: ServerAction = {
  canInvoke: ({ tile, player }) => {
    if (!isOwnedNoEntity(tile, player)) return notOwnedOrEntityResult
    if (!hasStat('v:xp', player, buildingInfo['v:tower'].xpReq!)) return noStatsResult
    return success
  },
  statsCost: buildingInfo['v:tower'].buildReq,
  invoke: ({ tile, player, turnNumber }) => {
    addStat('v:xp', player, 0.5)
    tile.entity = new Tower(turnNumber)
  }
}

export const BuildWoodWallAction: ServerAction = {
  canInvoke: ({ tile, player }) => {
    if (!isOwnedNoEntity(tile, player)) return notOwnedOrEntityResult
    if (!hasStat('v:xp', player, buildingInfo['v:woodwall'].xpReq!)) return noStatsResult
    return success
  },
  statsCost: buildingInfo['v:woodwall'].buildReq,
  invoke: ({ tile, player, turnNumber }) => {
    addStat('v:xp', player, 0.5)
    tile.entity = new WoodWall(turnNumber)
  }
}

export const BuildStoneWallAction: ServerAction = {
  canInvoke: ({ tile, player }) => {
    if (!isOwnedNoEntity(tile, player)) return notOwnedOrEntityResult
    if (!hasStat('v:xp', player, buildingInfo['v:stonewall'].xpReq!)) return noStatsResult
    return success
  },
  statsCost: buildingInfo['v:stonewall'].buildReq,
  invoke: ({ tile, player, turnNumber }) => {
    addStat('v:xp', player, 0.5)
    tile.entity = new StoneWall(turnNumber)
  }
}
