import clsx from "clsx"
import { Button } from "../menu/Button"

const SimpleAction = ({img, name, onClick, className, disabled}: {img: string, name: string, onClick: () => void, className?: string, disabled?: boolean}): JSX.Element => {
  return (
    <Button icon={img} onClick={onClick} sound={null} className={clsx('pl-2', className)} disabled={disabled}>{name}</Button>
  )
}

export default SimpleAction
