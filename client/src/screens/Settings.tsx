import clsx from 'clsx'
import { MouseEventHandler, useContext } from 'react'
import { MenuContext, GameScreen } from '../App'
import { Button } from '../menu/Button'
import { Bar } from '../menu/Bar'
import Slider from '../menu/Slider'

const userColors = ['255,255,255', '255,110,0', '255,0,0', '187,0,0', '187,255,0', '0,255,0', '0,192,0', '0,255,141', '0,255,255', '0,148,255', '0,38,255', '0,18,127', '255,250,0', '255,0,151', '255,0,255', '187,0,255']

export function Settings (): JSX.Element {
  const gameContext = useContext(MenuContext)

  return (
    <div className='bg7 w-full flex flex-col items-start px-16 pt-40 gap-2'>
      <div className='flex gap-8 items-start mb-8'>
        <div className='flex flex-col items-center'>
          <Bar className='w-full'>Player Name</Bar>
          <div className='m-playerbox h-9.5 w-56 p-1.5 pl-9.5 relative'>
            <div className='absolute top-[12px] left-[16px] w-3 h-3' style={{ backgroundColor: `rgb(${gameContext.settings.color})` }} />
            <input type='text' maxLength={12} className='bg-transparent border-none outline-none' value={gameContext.settings.name} onChange={(e) => gameContext.setSettings({ ...gameContext.settings, name: e.target.value })} />
          </div>

          <Bar className='relative w-full mb-0'>Player Color</Bar>
          <div className='m-colorsbg grid grid-cols-4 gap-1 p-7 justify-items-center items-center -mt-0.5 mx-1.5'>
            {userColors.map((color) => <ColorButton color={color} key={color} onClick={(color) => gameContext.setSettings({ ...gameContext.settings, color })} />)}
          </div>
        </div>

        <div className='w-64'>
          <Bar>Music Volume</Bar>
          <Slider value={gameContext.settings.musicVolume} setValue={(musicVolume) => gameContext.setSettings({ ...gameContext.settings, musicVolume })} muted />

          <Bar>Sound Volume</Bar>
          <Slider value={gameContext.settings.soundVolume} setValue={(soundVolume) => gameContext.setSettings({ ...gameContext.settings, soundVolume })} />
        </div>
      </div>

      <Button onClick={() => gameContext.setGameScreen(GameScreen.TITLE)}>{'<'} Back</Button>
    </div>
  )
}


const hoverAudio = new Audio('sound/menu-hover.wav')
const clickAudio = new Audio('sound/menu-click.wav')

function ColorButton ({ color, onClick }: { color: string, onClick: (color: string) => void }): JSX.Element {
  const gameContext = useContext(MenuContext)
  hoverAudio.volume = gameContext.settings.soundVolume / 100

  const onClickFull = (color: string) => {
    clickAudio.play()
    onClick(color)
  }

  const onHover = () => {
    hoverAudio.play()
  }
  
  return <ColorBox color={color} onClick={() => onClickFull(color)} onMouseOver={onHover} />
}

function ColorBox ({ color, onClick, onMouseOver }: { color: string, onClick?: MouseEventHandler, onMouseOver?: MouseEventHandler }): JSX.Element {
  return (
    <div
      className={clsx('m-colorbox w-8 h-8 p-0.5 border-8 bg-clip-padding', onClick !== undefined && 'cursor-pointer')}
      style={{ backgroundColor: `rgb(${color})` }}
      onClick={onClick}
      onMouseOver={onMouseOver}
    />
  )
}
