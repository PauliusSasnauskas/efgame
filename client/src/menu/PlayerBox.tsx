import clsx from 'clsx'
import { PlayerDTO } from 'common/src/Player'
import eliminated from '../img/menus/player/eliminated.svg'
import turn from '../img/menus/player/turn.svg'
import selectedImg from '../img/menus/player/selected.svg'
import teamneutral from '../img/menus/player/neutral.svg'
import teambt from '../img/menus/player/teambt.svg'
import teamgs from '../img/menus/player/teamgs.svg'
import teamoc from '../img/menus/player/teamoc.svg'
import teamrr from '../img/menus/player/teamrr.svg'
import { MouseEventHandler } from 'react'

export const getTeamIcon: { [k: string]: string } = {
  'Blue Triangle': teambt,
  'Green Star': teamgs,
  'Orange Circle': teamoc,
  'Red Rectangle': teamrr,
}

export function PlayerBox ({ player, className, myTurn, onClick, selected = false }: { player: PlayerDTO, className?: string, myTurn: boolean, onClick?: MouseEventHandler<HTMLDivElement>, selected?: boolean }): JSX.Element {
  if (player.team === 'spectator') {
    return (
      <div onClick={onClick} className={clsx('m-item m-darkbox pb-0.25 justify-start pl-10 relative cursor-pointer', className, 'text-gray-500')}>
        {player.name}
      </div>
    )
  }

  return (
    <div onClick={onClick} className={clsx('m-item m-playerbox pb-0.25 justify-start pl-10 relative cursor-pointer', className, player.eliminated && 'text-gray-500')}>
      <span className='absolute left-4 top-3 w-3 h-3' style={{ backgroundColor: `rgb(${player.color})` }}>
        {player.eliminated && <img src={eliminated} alt='' />}
      </span>
      {player.name}
      {myTurn && <img src={turn} className='absolute h-6 -left-0.5 top-1.5' alt=''/>}
      <img src={player.team !== undefined ? getTeamIcon[player.team] ?? teamneutral : teamneutral} className='absolute h-5 right-2.5 top-2' alt=''/>
      {selected && <img src={selectedImg} className='absolute h-5 right-0 top-2' alt='' />}
    </div>
  )
}
