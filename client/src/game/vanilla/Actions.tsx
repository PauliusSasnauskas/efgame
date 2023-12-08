import { ReactNode } from "react"
import clsx from "clsx"
import { Button } from "../../menu/Button"
import attack from '../../img/vanilla/actions/attack.svg'
import repair from '../../img/vanilla/actions/repair.svg'
import transfer from '../../img/vanilla/actions/transfer.svg'
import demolish from '../../img/vanilla/actions/demolish.svg'
import leave from '../../img/vanilla/actions/leave.svg'
import capitol from '../../img/vanilla/entities/capitol.svg'
import mine from '../../img/vanilla/entities/mine.svg'
import barracks from '../../img/vanilla/entities/barracks.svg'
import tower from '../../img/vanilla/entities/tower.svg'
import woodWall from '../../img/vanilla/entities/wood-wall.svg'
import stoneWall from '../../img/vanilla/entities/stone-wall.svg'
import { ConfigAction } from "../../ConfigSpec"
import { Tile } from "common/src/Tile"
import { Player } from "common/src/Player"

const VanillaAction = (src: string, actionName: string, className?: string) => ({ onClick, disabled }: { onClick: () => void, disabled?: boolean }): ReactNode => {
  return (
    <Button icon={src} onClick={onClick} sound={null} className={clsx('pl-2', className)} disabled={disabled}>{actionName}</Button>
  )
}

const tileOwned = (tile: Tile, currentPlayer: Player): boolean => tile.owner?.name === currentPlayer.name
const tileOwnedEmpty = (tile: Tile, currentPlayer: Player): boolean => tileOwned(tile, currentPlayer) && tile.entity === undefined
const tileOwnedNotEmpty = (tile: Tile, currentPlayer: Player): boolean => tileOwned(tile, currentPlayer) && tile.entity !== undefined
const tileNotOwned = (tile: Tile, currentPlayer: Player): boolean => tile.owner?.name !== currentPlayer.name
const tileFromTeammate = (tile: Tile, currentPlayer: Player): boolean => tile.owner?.team === currentPlayer.team && tile.owner?.name !== currentPlayer.name

export const AttackAction = { key: 'KeyA', button: VanillaAction(attack, "Attack", 'mb-4'), allowOnTile: tileNotOwned } as ConfigAction
export const RepairAction = { key: 'KeyR', button: VanillaAction(repair, "Repair", 'mb-4'), allowOnTile: tileOwned } as ConfigAction
export const TransferAction = { key: 'KeyT', button: { img: transfer, name: 'Transfer 50 Gold' }, req: { 'v:action': 1, 'v:gold': 50 }, allowOnTile: tileFromTeammate } as ConfigAction
export const LeaveAction = { key: 'KeyL', button: { img: leave, name: "Leave" }, req: { 'v:action': 1 }, allowOnTile: tileOwnedEmpty } as ConfigAction
export const DemolishAction = { key: 'KeyD', button: { img: demolish, name: 'Demolish' }, req: { 'v:action': 1, 'v:army': 1 }, allowOnTile: tileOwnedNotEmpty } as ConfigAction

export const BuildCapitolAction = { key: ['Numpad1', 'Digit1'], button: VanillaAction(capitol, "Build Capitol", 'pl-1.5'), allowOnTile: tileOwnedEmpty } as ConfigAction
export const BuildMineAction = { key: ['Numpad2', 'Digit2'], button: VanillaAction(mine, "Build Mine", 'pl-1.5'), allowOnTile: tileOwnedEmpty } as ConfigAction
export const BuildBarracksAction = { key: ['Numpad3', 'Digit3'], button: VanillaAction(barracks, "Build Barracks", 'pl-1.5'), allowOnTile: tileOwnedEmpty } as ConfigAction
export const BuildTowerAction = { key: ['Numpad4', 'Digit4'], button: VanillaAction(tower, "Build Tower", 'pl-1.5'), allowOnTile: tileOwnedEmpty } as ConfigAction
export const BuildWoodWallAction = { key: ['Numpad5', 'Digit5'], button: VanillaAction(woodWall, "Build Wooden Wall", 'pl-1.5'), allowOnTile: tileOwnedEmpty } as ConfigAction
export const BuildStoneWallAction = { key: ['Numpad6', 'Digit6'], button: VanillaAction(stoneWall, "Build Stone Wall", 'pl-1.5 mb-4'), allowOnTile: tileOwnedEmpty } as ConfigAction
