import { ReactNode } from "react"
import { Entity, Resource } from "../Tile"
import fire1 from '../../../img/vanilla/entities/fire1a.svg'
import fire2 from '../../../img/vanilla/entities/fire2a.svg'
import fire3 from '../../../img/vanilla/entities/fire3a.svg'
import fire4 from '../../../img/vanilla/entities/fire4a.svg'
import fire5 from '../../../img/vanilla/entities/fire5a.svg'
import fire6 from '../../../img/vanilla/entities/fire6a.svg'
import barracks from '../../../img/vanilla/entities/barracks.svg'
import capitol from '../../../img/vanilla/entities/capitol.svg'
import tower from '../../../img/vanilla/entities/tower.svg'
import woodwall from '../../../img/vanilla/entities/wood-wall.svg'
import stonewall from '../../../img/vanilla/entities/stone-wall.svg'
import mine from '../../../img/vanilla/entities/mine.svg'
import mineoff from '../../../img/vanilla/entities/mine-off.svg'
import { EntityTile } from "../ConfigSpec"

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
          <div className='healthbar'>
            <div className='health' style={{ width: `${healthScaled * 100}%` }}></div>
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