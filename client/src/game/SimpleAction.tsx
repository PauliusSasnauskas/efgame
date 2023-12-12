import clsx from "clsx"
import { Button } from "../menu/Button"
import { MouseEventHandler, ReactNode } from "react"

const SimpleAction = ({img, name, onClick, onMouseEnter, onMouseLeave, className, disabled, hoverElement}: {img: string, name: string, onClick: MouseEventHandler<HTMLDivElement>, onMouseEnter?: MouseEventHandler<HTMLDivElement>, onMouseLeave?: MouseEventHandler<HTMLDivElement>, className?: string, disabled?: boolean, hoverElement?: ReactNode | JSX.Element}): JSX.Element => {
  return (
    <Button icon={img} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} sound={null} className={clsx('pl-2', className)} disabled={disabled} hoverElement={hoverElement}>{name}</Button>
  )
}

export default SimpleAction
