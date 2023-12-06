import clsx from 'clsx'
import { ReactNode } from 'react'

export function Box ({ children, className, reff }: { children: ReactNode, className?: string, reff?: any }): JSX.Element {
  return (
    <div className={clsx('m-box', className)} ref={reff}>
      {children}
    </div>
  )
}
