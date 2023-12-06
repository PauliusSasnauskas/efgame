import clsx from 'clsx'
import { ReactNode } from 'react'

export function Bar ({ children, className }: { children?: ReactNode, className?: string }): JSX.Element {
  return (
    <div className={clsx('m-item m-bar min-w-56', className)}>
      {children}
    </div>
  )
}
