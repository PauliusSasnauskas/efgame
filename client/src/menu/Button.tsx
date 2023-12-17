import clsx from 'clsx'
import { MouseEvent, MouseEventHandler, ReactNode, useContext, useState } from 'react'
import { MenuContext } from '../App'

const hoverAudio = new Audio('sound/menu-hover.wav')

export function Button ({ children, onClick, onMouseEnter, onMouseLeave, icon, className, iconClass, sound = 'sound/menu-click.wav', disabled = false, hoverElement }: { children?: ReactNode, onClick?: MouseEventHandler<HTMLDivElement>, onMouseEnter?: MouseEventHandler<HTMLDivElement>, onMouseLeave?: MouseEventHandler<HTMLDivElement>, icon?: string, className?: string, iconClass?: string, sound?: string | null, disabled?: boolean, hoverElement?: ReactNode | JSX.Element }): JSX.Element {
  const gameContext = useContext(MenuContext)
  hoverAudio.volume = gameContext.settings.soundVolume / 100

  let clickSound = new Audio()
  clickSound.volume = gameContext.settings.soundVolume / 100
  if (sound != null) clickSound.src = sound

  const [showHover, setShowHover] = useState(false)

  const onClickFull = (e: MouseEvent<any>) => {
    if (disabled) return
    clickSound.play()
    onClick?.(e)
  }

  const onMouseOverFull = (e: MouseEvent<any>) => {
    setShowHover(true)
    onMouseEnter?.(e)

    if (disabled) return

    hoverAudio.play()
  }

  const onMouseLeaveFull = (e: MouseEvent<any>) => {
    setShowHover(false)
    onMouseLeave?.(e)
  }
  
  return (
    <div className={clsx('m-item m-button w-56 hover:text-gray-300 pl-2 relative', icon !== undefined && 'justify-start', disabled ? 'text-gray-300 m-button-hover cursor-default' : 'cursor-pointer', className)} onClick={onClickFull} onMouseEnter={onMouseOverFull} onMouseLeave={onMouseLeaveFull}>
      {icon !== undefined && <img src={icon} alt='' className={clsx(iconClass !== undefined ? iconClass : 'w-6.5 h-6.5 -mt-1')} />}
      {children}
      {showHover && hoverElement !== undefined && <div className='flex items-center justify-center gap-2 absolute text-white left-0 -translate-x-full -top-1 pointer-events-none'>{hoverElement}</div>}
    </div>
  )
}
