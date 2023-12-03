import { ReactNode } from "react"
import action from '../../../img/vanilla/stats/action.svg'

const VanillaStat = (str: string) => (): ReactNode => {
  return (
    <>
      <div>{str}</div>
    </>
  )
}

export const ActionStat = VanillaStat(action)