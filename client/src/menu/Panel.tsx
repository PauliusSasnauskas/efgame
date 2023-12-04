import clsx from 'clsx'
import { ReactNode } from 'react'

export function Panel ({ children, className }: { children: ReactNode, className?: string }): JSX.Element {
  return (
    <div className={clsx('m-panel', className)}>
      {children}
    </div>
  )
}
