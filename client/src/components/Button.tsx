import clsx from 'clsx'
import { MouseEvent, MouseEventHandler, ReactNode } from 'react'
import useSound from 'use-sound';

export function Button ({ children, onClick, icon }: { children: ReactNode, onClick: MouseEventHandler<HTMLDivElement>, icon?: string }): JSX.Element {
  const [playHover] = useSound('sound/menu-hover2.wav') as any;
  const [playClick] = useSound('sound/menu-click.wav') as any;

  const onClickFull = (e: MouseEvent<any>) => {
    playClick()
    onClick(e)
  }
  
  return (
    <div className={clsx('m-item m-button w-56 cursor-pointer', icon !== undefined && 'justify-start')} onClick={onClickFull} onMouseEnter={playHover}>
      {icon !== undefined && <img src={icon} alt='' className='w-6.5 h-6.5 -mt-0.5' />}
      {children}
    </div>
  )
}
