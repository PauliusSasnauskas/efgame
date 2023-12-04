import clsx from 'clsx'
import { ReactNode } from 'react'

export function Box ({ children, className }: { children: ReactNode, className?: string }): JSX.Element {
  return (
    <div className={clsx('m-box', className)}>
      {children}
    </div>
  )
}
