import { ReactNode } from 'react'
import { Stat } from '../Player'
import action from '../../../img/vanilla/stats/action.svg'
import gold from '../../../img/vanilla/stats/gold.svg'
import army from '../../../img/vanilla/stats/army.svg'
import territory from '../../../img/vanilla/stats/territory.svg'
import xp from '../../../img/vanilla/stats/xp.svg'

const VanillaStat = (src: string) => (stat: Stat): ReactNode => {
  return (
    <>
      <div className='m-item m-button-hover pb-0.25 justify-start pl-2 my-0 relative'>
        <img src={src} className='w-6 h-6' />
        {stat.val}
        {stat.max !== undefined ? ` / ${stat.max}` : null}
      </div>
    </>
  )
}

export const ActionStat = VanillaStat(action)
export const GoldStat = VanillaStat(gold)
export const ArmyStat = VanillaStat(army)
export const TerritoryStat = VanillaStat(territory)
export const XpStat = VanillaStat(xp)