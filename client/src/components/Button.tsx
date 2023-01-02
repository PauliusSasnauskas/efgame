import clsx from 'clsx'
import { MouseEventHandler, ReactNode } from 'react'

export function Button ({ children, onClick, icon }: { children: ReactNode, onClick: MouseEventHandler<HTMLDivElement>, icon?: string }): JSX.Element {
  return (
    <div className={clsx('m-item m-button w-56 cursor-pointer', icon !== undefined && 'justify-start')} onClick={onClick}>
      {icon !== undefined && <img src={icon} alt='' className='w-6.5 h-6.5 -mt-0.5' />}
      {children}
    </div>
  )
}
