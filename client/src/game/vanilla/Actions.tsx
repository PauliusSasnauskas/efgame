import { ReactNode } from "react"
import clsx from "clsx"
import { Button } from "../../menu/Button"
import attack from '../../img/vanilla/actions/attack.svg'
import repair from '../../img/vanilla/actions/repair.svg'
import capitol from '../../img/vanilla/entities/capitol.svg'
import mine from '../../img/vanilla/entities/mine.svg'
import barracks from '../../img/vanilla/entities/barracks.svg'
import tower from '../../img/vanilla/entities/tower.svg'
import woodWall from '../../img/vanilla/entities/wood-wall.svg'
import stoneWall from '../../img/vanilla/entities/stone-wall.svg'

const VanillaAction = (src: string, actionName: string, className?: string) => ({onClick}: {onClick: () => void}): ReactNode => {
  return (
    <Button icon={src} onClick={onClick} sound={null} className={clsx('pl-2', className)}>{actionName}</Button>
  )
}


export const AttackAction = VanillaAction(attack, "Attack", 'mb-4')
export const RepairAction = VanillaAction(repair, "Repair", 'mb-4')

export const BuildCapitolAction = VanillaAction(capitol, "Build Capitol", 'pl-1.5')
export const BuildMineAction = VanillaAction(mine, "Build Mine", 'pl-1.5')
export const BuildBarracksAction = VanillaAction(barracks, "Build Barracks", 'pl-1.5')
export const BuildTowerAction = VanillaAction(tower, "Build Tower", 'pl-1.5')
export const BuildWoodWallAction = VanillaAction(woodWall, "Build Wooden Wall", 'pl-1.5')
export const BuildStoneWallAction = VanillaAction(stoneWall, "Build Stone Wall", 'pl-1.5 mb-4')