import { ChangeEvent, useContext } from "react"
import { MenuContext } from "../App"

const slideAudio = new Audio('sound/menu-slider.wav')
slideAudio.loop = true

export default function Slider({ value, setValue }: { value: number, setValue: (val: number) => void }): JSX.Element {
  const gameContext = useContext(MenuContext)
  slideAudio.volume = gameContext.settings.soundVolume / 100

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(Number.parseInt(e.target.value))
  }

  return (<div className='w-64 h-12 flex items-center p-3 bg-[url("./img/menus/slider-base.svg")] m-slider'>
    <input type='range' min={0} max={100} step={4} value={value} onChange={onChange} onMouseDown={() => slideAudio.play()} onMouseUp={() => slideAudio.pause()} className='w-full outline-none appearance-none border-b-grey-darkest border-2 border-transparent border-t-grey-dark h-0.5 cursor-pointer border-r-none border-l-none slider-thumb:cursor-pointer slider-thumb:appearance-none slider-thumb:w-5 slider-thumb:h-7 slider-thumb:bg-[url("./img/menus/slider.svg")]' />
  </div>)
}