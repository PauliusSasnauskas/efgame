import clsx from 'clsx'
import { Stat } from 'common/src/Player'

function hasReq(curVal: string | number, reqVal: string | number): boolean {
  if (typeof curVal === 'number' && typeof reqVal === 'number' && curVal >= reqVal) return true
  if (typeof curVal === 'string' && typeof reqVal === 'string' && curVal === reqVal) return true
  return false
}

const StatBox = ({ src, stat, showReq, gain }: { src: string, stat: Stat, showReq?: string | number, gain?: number }): JSX.Element => {
  return (
    <>
      <div className='m-item m-button-hover pb-0.25 justify-start px-2 mt-0 relative'>
        <img src={src} className='w-6 h-6' alt='' />
        {typeof stat.val === 'number' ? Math.floor(stat.val) : stat.val}
        {stat.max != null ? ` / ${stat.max}` : null}
        {gain != null && gain !== 0 && showReq == null && (
          <span className={clsx('grow text-right', gain > 0 ? 'text-green-400' : 'text-red-400')}>
            {gain > 0 ? `+${Math.floor(gain)}` : Math.floor(gain)}
          </span>
        )}
        {showReq != null && <span className={clsx('flex-grow text-right', hasReq(stat.val, showReq) ? 'text-green-700' : 'text-red-700')}>{showReq}</span>}
      </div>
    </>
  )
}

export default StatBox
