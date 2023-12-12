import clsx from 'clsx'
import { ReactNode } from 'react'

export function Box ({ children, className, ref }: { children: ReactNode, className?: string, ref?: any }): JSX.Element {
  return (
    <div className={clsx('m-box', className)} ref={ref}>
      {children}
    </div>
  )
}
