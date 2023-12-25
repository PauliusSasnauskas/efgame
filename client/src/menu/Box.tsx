import clsx from 'clsx'
import { CSSProperties, ReactNode } from 'react'

export function Box ({ children, className, style, reff }: { children: ReactNode, className?: string, style?: CSSProperties, reff?: any }): JSX.Element {
  return (
    <div className={clsx('m-box', className)} style={style} ref={reff}>
      {children}
    </div>
  )
}
