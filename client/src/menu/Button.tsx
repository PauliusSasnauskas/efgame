import clsx from 'clsx'
import { MouseEvent, MouseEventHandler, ReactNode } from 'react'
import useSound from 'use-sound';

export function Button ({ children, onClick, icon, className, sound = 'sound/menu-click.wav' }: { children?: ReactNode, onClick?: MouseEventHandler<HTMLDivElement>, icon?: string, className?: string, sound?: string | null }): JSX.Element {
  const [playHover] = useSound('sound/menu-hover2.wav') as any;
  let [playClick] = useSound(sound || '') as any;

  if (sound === null) playClick = null

  const onClickFull = (e: MouseEvent<any>) => {
    playClick?.()
    onClick?.(e)
  }
  
  return (
    <div className={clsx('m-item m-button w-56 cursor-pointer hover:text-gray-300', icon !== undefined && 'justify-start', className)} onClick={onClickFull} onMouseEnter={playHover}>
      {icon !== undefined && <img src={icon} alt='' className='w-6.5 h-6.5 -mt-1' />}
      {children}
    </div>
  )
}
