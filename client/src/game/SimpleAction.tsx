import clsx from "clsx"
import { Button } from "../menu/Button"
import { ReactNode } from "react"

const SimpleAction = ({img, name, onClick, className, disabled, hoverElement}: {img: string, name: string, onClick: () => void, className?: string, disabled?: boolean, hoverElement?: ReactNode | JSX.Element}): JSX.Element => {
  return (
    <Button icon={img} onClick={onClick} sound={null} className={clsx('pl-2', className)} disabled={disabled} hoverElement={hoverElement}>{name}</Button>
  )
}

export default SimpleAction
