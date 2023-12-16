import { MouseEventHandler, ReactNode } from "react"
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
import { Player, StatReq } from "common/src/Player"
import { buildingInfo } from "./Buildings"
import { getRandomInt } from "../../util/number"

const VanillaAction = (src: string, actionName: string, className?: string) => ({ onClick, onMouseEnter, onMouseLeave, disabled, hoverElement }: { onClick: MouseEventHandler<any>, onMouseEnter?: MouseEventHandler<any>, onMouseLeave?: MouseEventHandler<any>, disabled?: boolean, hoverElement?: ReactNode | JSX.Element }): ReactNode => {
  return (
    <Button icon={src} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} sound={null} className={clsx('pl-2', className)} disabled={disabled} hoverElement={hoverElement}>{actionName}</Button>
  )
}

const tileOwned = (tile: Tile | undefined, map: Tile[], currentPlayer: Player): boolean => tile?.owner?.name === currentPlayer.name
const tileOwnedEmpty = (tile: Tile | undefined, map: Tile[], currentPlayer: Player): boolean => tileOwned(tile, map, currentPlayer) && tile?.entity === undefined
const tileOwnedNotEmpty = (tile: Tile | undefined, map: Tile[], currentPlayer: Player): boolean => tileOwned(tile, map, currentPlayer) && tile?.entity !== undefined
const tileNotOwned = (tile: Tile | undefined, map: Tile[], currentPlayer: Player): boolean => tile?.owner?.name !== currentPlayer.name
const tileFromTeammate = (tile: Tile | undefined, map: Tile[], currentPlayer: Player): boolean => tile?.owner !== undefined && tile.owner.team === currentPlayer.team && tile.owner.name !== currentPlayer.name

export function countTilesWhere (map: Tile[], where: (t: Tile) => boolean): number {
  let count = 0
  for (let i = 0; i < map.length; i++){
      count += where(map[i]) ? 1 : 0
  }
  return count
}

const getRepairReq = (tile: Tile, map: Tile[], player: Player): StatReq | undefined => {
  if (tile.owner?.name !== player.name) return undefined
  if (tile.entity === undefined) return undefined
  return buildingInfo[tile.entity.id].repairReq
}

const getBuildCapitolReq = (tile: Tile, map: Tile[], player: Player): StatReq | undefined => {
  const capitols = countTilesWhere(map, (tile) => tileOwned(tile, map, player) && tile.entity?.id === 'v:capitol')
  return { 'v:action': 8, 'v:army': 6, 'v:gold': 475 + capitols * 25, 'v:xp': 125 + capitols * 25 }
}

const getAttackAudio = (tile: Tile): string => {
  if (tile.entity === undefined) return `sound/attack1.wav`
  if (tile.entity.health! > 1) return `sound/hit${getRandomInt(3)+1}.wav`
  if (tile.entity.id === 'v:capitol') return 'sound/destroy-big.wav'
  return `sound/destroy${getRandomInt(3)+1}.wav`
}

const getRepairAudio = (tile: Tile): string | undefined => {
  return 'sound/repair1.wav' // TODO: more repair sounds
}

const getDemolishAudio = (tile: Tile): string => {
  if (tile.entity?.id === 'v:capitol') return 'sound/destroyBig.wav'
  return `sound/destroy${getRandomInt(3)+1}.wav`
}

const getBuildMineAudio = (tile: Tile): string => {
  if (tile.resource?.id === 'v:gold') return 'sound/build2.wav'
  return 'sound/build1.wav'
}

export const AttackAction = { key: 'KeyA', button: VanillaAction(attack, "Attack", 'mb-4'), req: { 'v:action': 2, 'v:army': 1 }, allowOnTile: tileNotOwned, audio: getAttackAudio } as ConfigAction
export const RepairAction = { key: 'KeyR', button: VanillaAction(repair, "Repair", 'mb-4'), req: getRepairReq, allowOnTile: tileOwned, audio: getRepairAudio } as ConfigAction
export const TransferAction = { key: 'KeyT', button: { img: transfer, name: 'Transfer 50 Gold' }, req: { 'v:action': 1, 'v:gold': 50 }, allowOnTile: tileFromTeammate, audio: 'sound/transfer.wav' } as ConfigAction
export const LeaveAction = { key: 'KeyL', button: { img: leave, name: "Leave Territory" }, req: { 'v:action': 1 }, allowOnTile: tileOwnedEmpty, audio: 'sound/leave.wav' } as ConfigAction
export const DemolishAction = { key: 'KeyD', button: { img: demolish, name: 'Demolish' }, req: { 'v:action': 1, 'v:army': 1 }, allowOnTile: tileOwnedNotEmpty, audio: getDemolishAudio } as ConfigAction

export const BuildCapitolAction = { key: ['Numpad1', 'Digit1'], button: VanillaAction(capitol, "Build Capitol", 'pl-1.5'), req: getBuildCapitolReq, allowOnTile: tileOwnedEmpty, audio: 'sound/build3.wav' } as ConfigAction
export const BuildMineAction = { key: ['Numpad2', 'Digit2'], button: VanillaAction(mine, "Build Mine", 'pl-1.5'), req: buildingInfo['v:mine'].buildReq, allowOnTile: tileOwnedEmpty, audio: getBuildMineAudio } as ConfigAction
export const BuildBarracksAction = { key: ['Numpad3', 'Digit3'], button: VanillaAction(barracks, "Build Barracks", 'pl-1.5'), req: buildingInfo['v:barracks'].buildReq, allowOnTile: tileOwnedEmpty, audio: 'sound/build1.wav' } as ConfigAction
export const BuildTowerAction = { key: ['Numpad4', 'Digit4'], button: VanillaAction(tower, "Build Tower", 'pl-1.5'), req: buildingInfo['v:tower'].buildReq, allowOnTile: tileOwnedEmpty, audio: 'sound/build1.wav' } as ConfigAction
export const BuildWoodWallAction = { key: ['Numpad5', 'Digit5'], button: VanillaAction(woodWall, "Build Wooden Wall", 'pl-1.5'), req: buildingInfo['v:woodwall'].buildReq, allowOnTile: tileOwnedEmpty, audio: 'sound/build1.wav' } as ConfigAction
export const BuildStoneWallAction = { key: ['Numpad6', 'Digit6'], button: VanillaAction(stoneWall, "Build Stone Wall", 'pl-1.5 mb-4'), req: buildingInfo['v:stonewall'].buildReq, allowOnTile: tileOwnedEmpty, audio: 'sound/build1.wav' } as ConfigAction
