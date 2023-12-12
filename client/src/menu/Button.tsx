import clsx from 'clsx'
import { MouseEvent, MouseEventHandler, ReactNode, useContext, useEffect, useState } from 'react'
import { MenuContext } from '../App'

const hoverAudio = new Audio('sound/menu-hover.wav')

export function Button ({ children, onClick, onMouseEnter, onMouseLeave, icon, className, sound = 'sound/menu-click.wav', disabled = false, hoverElement }: { children?: ReactNode, onClick?: MouseEventHandler<HTMLDivElement>, onMouseEnter?: MouseEventHandler<HTMLDivElement>, onMouseLeave?: MouseEventHandler<HTMLDivElement>, icon?: string, className?: string, sound?: string | null, disabled?: boolean, hoverElement?: ReactNode | JSX.Element }): JSX.Element {
  const gameContext = useContext(MenuContext)
  hoverAudio.volume = gameContext.settings.soundVolume / 100

  let clickSound = new Audio()
  if (sound != null) clickSound.src = sound

  const [showHoverTimeout, setShowHoverTimeout] = useState<number | NodeJS.Timeout | undefined>(undefined)
  const [showHover, setShowHover] = useState(false)

  const onClickFull = (e: MouseEvent<any>) => {
    if (disabled) return
    clickSound.play()
    onClick?.(e)
  }

  const onMouseOverFull = (e: MouseEvent<any>) => {
    if (showHoverTimeout !== undefined) {
      clearTimeout(showHoverTimeout)
    }
    const timeout = setTimeout(() => setShowHover(true), 1000)
    setShowHoverTimeout(timeout)

    if (disabled) return

    hoverAudio.play()
    onMouseEnter?.(e)
  }

  const onMouseLeaveFull = (e: MouseEvent<any>) => {
    setShowHover(false)
    clearTimeout(showHoverTimeout)
    if (disabled) return
    onMouseLeave?.(e)
  }

  useEffect(() => () => clearTimeout(showHoverTimeout))
  
  return (
    <div className={clsx('m-item m-button w-56 hover:text-gray-300 pl-2 relative', icon !== undefined && 'justify-start', disabled ? 'text-gray-300 m-button-hover cursor-default' : 'cursor-pointer', className)} onClick={onClickFull} onMouseEnter={onMouseOverFull} onMouseLeave={onMouseLeaveFull}>
      {icon !== undefined && <img src={icon} alt='' className='w-6.5 h-6.5 -mt-1' />}
      {children}
      {showHover && hoverElement !== undefined && <div className='flex items-center justify-center gap-2 absolute text-white left-0 -translate-x-full -top-1 pointer-events-none'>{hoverElement}</div>}
    </div>
  )
}
