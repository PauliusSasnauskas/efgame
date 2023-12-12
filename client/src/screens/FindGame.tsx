import { useContext, useState } from 'react'
import { MenuContext, GameScreen } from '../App'
import { Button } from '../menu/Button'
import { Bar } from '../menu/Bar'
import connectIcon from '../img/menus/connect.svg'

export function FindGame (): JSX.Element {
  const gameContext = useContext(MenuContext)

  const [ip, updateIp] = useState('')

  const setIp = (newIp: string) => {
    gameContext.setConnectError('')
    updateIp(newIp)
  }

  return (
    <div className='bg1 w-full p-16 flex flex-col'>
      <Bar className='mb-8'>Find a Game</Bar>
      <div className='flex flex-col items-center gap-6'>
        <div>
          <div className='bg-[url("./img/menus/slider-base.svg")] h-10.5 w-56 px-3 py-2.5'>
            <input type='text' className='bg-transparent border-none outline-none' value={ip} onChange={(e) => { setIp(e.target.value); gameContext.setConnectError('') }} placeholder='0.0.0.0' />
          </div>
          <Button icon={connectIcon} onClick={() => gameContext.connect(ip)}>Connect</Button>
        </div>
        {gameContext.settings.lastIp !== '' && <Button onClick={() => gameContext.connect(gameContext.settings.lastIp)}>{gameContext.settings.lastIp}</Button>}
        <p className='text-red-500'>{gameContext.connectError}</p>
      </div>
      <div className='flex-grow'></div>
      <Button onClick={() => gameContext.setGameScreen(GameScreen.TITLE)}>{'<'} Back</Button>
    </div>
  )
}
