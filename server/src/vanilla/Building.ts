import { Player } from "common/src/Player"
import { ServerEntity, ServerPlayer, ServerTile, ServerTileEventArgs } from "../ConfigSpec"
import { getRandomInt } from "../util"

function isTileOwnerEndingTurn (tile: ServerTile, lastTurnPlayer: ServerPlayer): boolean {
  return (tile.owner?.name === lastTurnPlayer.name)
}

export class Capitol implements ServerEntity {
  id = 'v:capitol'
  health = 3
  readonly turnBuilt: number

  constructor (turn: number) {
    this.turnBuilt = turn
  }

  onTurnChange ({ player: lastTurnPlayer, tile }: ServerTileEventArgs) {
    if (!(isTileOwnerEndingTurn(tile, lastTurnPlayer))) return
    const playerStats = lastTurnPlayer.stats!
    ;(playerStats['v:action'].val as number) += 1
  }
}

export class Mine implements ServerEntity {
  id = 'v:mine'
  health = 2
  readonly turnBuilt: number

  constructor (turn: number) {
    this.turnBuilt = turn
  }

  onTurnChange ({ player: lastTurnPlayer, tile }: ServerTileEventArgs) {
    if (!(isTileOwnerEndingTurn(tile, lastTurnPlayer))) return
    const playerStats = lastTurnPlayer.stats!
    ;(playerStats['v:gold'].val as number) += (tile.resource?.id === 'v:gold' ? 16 : 4) + getRandomInt(5)
  }
}

export class Barracks implements ServerEntity {
  id = 'v:barracks'
  health = 2
  readonly turnBuilt: number

  constructor (turn: number) {
    this.turnBuilt = turn
  }
}

export class Tower implements ServerEntity {
  id = 'v:tower'
  health = 2
  readonly turnBuilt: number

  constructor (turn: number) {
    this.turnBuilt = turn
  }
}

export class WoodWall implements ServerEntity {
  id = 'v:woodwall'
  health = 4
  readonly turnBuilt: number

  constructor (turn: number) {
    this.turnBuilt = turn
  }
}

export class StoneWall implements ServerEntity {
  id = 'v:stonewall'
  health = 7
  readonly turnBuilt: number

  constructor (turn: number) {
    this.turnBuilt = turn
  }
}
