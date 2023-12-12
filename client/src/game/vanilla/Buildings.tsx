import { ReactNode } from "react"
import { Entity, Resource } from "common/src/Tile"
import fire1 from '../../img/vanilla/entities/fire1a.svg'
import fire2 from '../../img/vanilla/entities/fire2a.svg'
import fire3 from '../../img/vanilla/entities/fire3a.svg'
import fire4 from '../../img/vanilla/entities/fire4a.svg'
import fire5 from '../../img/vanilla/entities/fire5a.svg'
import fire6 from '../../img/vanilla/entities/fire6a.svg'
import barracks from '../../img/vanilla/entities/barracks.svg'
import capitol from '../../img/vanilla/entities/capitol.svg'
import tower from '../../img/vanilla/entities/tower.svg'
import woodwall from '../../img/vanilla/entities/wood-wall.svg'
import stonewall from '../../img/vanilla/entities/stone-wall.svg'
import mine from '../../img/vanilla/entities/mine.svg'
import mineoff from '../../img/vanilla/entities/mine-off.svg'
import { EntityTile } from "../../ConfigSpec"
import { StatReq } from "common/src/Player"

export const buildingInfo: {[k: string]: { repairReq: StatReq, maxHealth: number, destroyXpReward: number, buildReq?: StatReq, xpReq?: number }} = {
  'v:capitol': { repairReq: { 'v:action': 3, 'v:gold': 230, 'v:army': 2 }, maxHealth: 3, destroyXpReward: 15 },
  'v:mine': { repairReq: { 'v:action': 2, 'v:gold': 35, 'v:army': 3 }, maxHealth: 2, destroyXpReward: 10, buildReq: { 'v:action': 6, 'v:gold': 125 } },
  'v:barracks': { repairReq: { 'v:action': 2, 'v:gold': 50, 'v:army': 3 }, maxHealth: 2, destroyXpReward: 10, buildReq: { 'v:action': 6, 'v:gold': 100 } },
  'v:tower': { repairReq: { 'v:action': 2, 'v:gold': 50, 'v:army': 1 }, maxHealth: 2, destroyXpReward: 5, buildReq: { 'v:action': 4, 'v:gold': 90, 'v:army': 1 }, xpReq: 25 },
  'v:woodwall': { repairReq: { 'v:action': 1, 'v:gold': 30, 'v:army': 1 }, maxHealth: 4, destroyXpReward: 8, buildReq: { 'v:action': 4, 'v:gold': 115, 'v:army': 3 }, xpReq: 50 },
  'v:stonewall': { repairReq: { 'v:action': 1, 'v:gold': 30, 'v:army': 1 }, maxHealth: 7, destroyXpReward: 15, buildReq: { 'v:action': 7, 'v:gold': 180, 'v:army': 5 }, xpReq: 135 }
}

const getFireImg = (healthScaled: number): string => {
  if (healthScaled >= 0.8) return fire1
  if (healthScaled >= 0.7) return fire2
  if (healthScaled >= 0.5) return fire3
  if (healthScaled >= 0.4) return fire4
  if (healthScaled >= 0.2) return fire5
  return fire6
}

const VanillaBuilding = (src: string, maxHealth: number) => (selected: boolean = false, health?: Entity['health'], state?: Entity['state'], resource?: Resource): ReactNode => {
  const healthScaled = health !== undefined ? (health / maxHealth) : 1
  return (
    <>
      <img src={src} alt='' className='tileimg'/>
      {healthScaled !== 1 && <img src={getFireImg(healthScaled)} alt='' className='tileimg' />}
      {selected && health !== undefined &&
        (
          <div className='absolute w-6 h-1.5 border-2 border-black bg-red-500 mt-5.5 pointer-events-none'>
            <div className='h-full bg-green-500' style={{ width: `${healthScaled * 100}%` }}></div>
          </div>
        )
      }
    </>
  )
}

export const MineBuilding: EntityTile = (selected: boolean = false, health?: Entity['health'], state?: Entity['state'], resource?: Resource): ReactNode => {
  return VanillaBuilding(resource?.id === 'v:gold' ? mine : mineoff, 2)(selected, health, state, resource)
}

export const CapitolBuilding: EntityTile = VanillaBuilding(capitol, 3)
export const BarracksBuilding: EntityTile = VanillaBuilding(barracks, 2)
export const TowerBuilding: EntityTile = VanillaBuilding(tower, 2)
export const WoodWall: EntityTile = VanillaBuilding(woodwall, 4)
export const StoneWall: EntityTile = VanillaBuilding(stonewall, 7)

export default VanillaBuilding
