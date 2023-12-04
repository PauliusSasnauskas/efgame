import clsx from "clsx"
import { Button } from "../menu/Button"

const SimpleAction = ({img, name, onClick, className}: {img: string, name: string, onClick: () => void, className?: string}): JSX.Element => {
  return (
    <Button icon={img} onClick={onClick} sound={null} className={clsx('pl-2', className)}>{name}</Button>
  )
}

export default SimpleAction
