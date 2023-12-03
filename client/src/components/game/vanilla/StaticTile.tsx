import { ReactNode } from "react"

const StaticTile = (src: string) => (): ReactNode => {
  return (
    <img src={src} alt='' className='tileimg'/>
  )
}

export default StaticTile