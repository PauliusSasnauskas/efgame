import clsx from 'clsx'
import { Player } from '../game/Player'
import eliminated from '../img/menus/player/eliminated.svg'
import turn from '../img/menus/player/turn.svg'
import teamneutral from '../img/menus/player/neutral.svg'
import teambt from '../img/menus/player/teambt.svg'
import teamgc from '../img/menus/player/teamgc.svg'
import teamoc from '../img/menus/player/teamoc.svg'
import teamrr from '../img/menus/player/teamrr.svg'

const getTeamIcon: { [k: string]: string } = {
  'bluetriangle': teambt,
  'greencross': teamgc,
  'orangecircle': teamoc,
  'redrectangle': teamrr,
}

export function PlayerBox ({ player, className, myTurn }: { player: Player, className?: string, myTurn: boolean }): JSX.Element {
  if (player.team === 'spectator') {
    return (
      <div className={clsx('m-item m-darkbox pb-0.25 justify-start pl-10 relative', className, 'text-gray-500')}>
        {player.name}
      </div>
    )
  }

  return (
    <div className={clsx('m-item m-playerbox pb-0.25 justify-start pl-10 relative', className, player.eliminated && 'text-gray-500')}>
      <span className='absolute left-4 top-3 w-3 h-3' style={{ backgroundColor: `rgb(${player.color})` }}>
        {player.eliminated && <img src={eliminated} alt='' />}
      </span>
      {player.name}
      {myTurn && <img src={turn} className='absolute h-6 -left-0.5 top-1.5'/>}
      <img src={player.team !== undefined ? getTeamIcon[player.team] : teamneutral} className='absolute h-5 right-2.5 top-2'/>
    </div>
  )
}
