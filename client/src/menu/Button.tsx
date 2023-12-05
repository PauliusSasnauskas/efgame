import clsx from 'clsx'
import { MouseEvent, MouseEventHandler, ReactNode, useContext } from 'react'
import { MenuContext } from '../App'

const hoverAudio = new Audio('sound/menu-hover.wav')

export function Button ({ children, onClick, icon, className, sound = 'sound/menu-click.wav', disabled = false }: { children?: ReactNode, onClick?: MouseEventHandler<HTMLDivElement>, icon?: string, className?: string, sound?: string | null, disabled?: boolean }): JSX.Element {
  const gameContext = useContext(MenuContext)
  hoverAudio.volume = gameContext.settings.soundVolume / 100
  
  let clickSound = new Audio()
  if (sound != null) clickSound.src = sound

  const onClickFull = (e: MouseEvent<any>) => {
    if (disabled) return
    clickSound.play()
    onClick?.(e)
  }
  
  return (
    <div className={clsx('m-item m-button w-56 hover:text-gray-300 pl-2', icon !== undefined && 'justify-start', disabled ? 'text-gray-300 m-button-hover cursor-default' : 'cursor-pointer', className)} onClick={onClickFull} onMouseEnter={() => !disabled && hoverAudio.play()}>
      {icon !== undefined && <img src={icon} alt='' className='w-6.5 h-6.5 -mt-1' />}
      {children}
    </div>
  )
}
