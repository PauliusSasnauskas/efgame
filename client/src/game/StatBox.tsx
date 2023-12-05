import { Stat } from './Player'

const StatBox = ({src, stat}: {src: string, stat: Stat}): JSX.Element => {
  return (
    <>
      <div className='m-item m-button-hover pb-0.25 justify-start pl-2 my-0 relative'>
        <img src={src} className='w-6 h-6' alt='' />
        {stat.val}
        {stat.max !== undefined ? ` / ${stat.max}` : null}
      </div>
    </>
  )
}

export default StatBox
