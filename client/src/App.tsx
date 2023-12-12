import { createContext, FunctionComponent, useState } from 'react'
import './style.css'
import { About } from './screens/About'
import { Game } from './screens/Game'
import { FindGame } from './screens/FindGame'
import { Settings } from './screens/Settings'
import { Title } from './screens/Title'

import { Socket } from 'socket.io-client'

export enum GameScreen {
  TITLE = 'title',
  SETTINGS = 'settings',
  ABOUT = 'about',
  FINDGAME = 'findgame',
  GAME = 'game'
}

const screens: { [k: string | GameScreen]: FunctionComponent } = {
  [GameScreen.TITLE]: Title,
  [GameScreen.SETTINGS]: Settings,
  [GameScreen.ABOUT]: About,
  [GameScreen.FINDGAME]: FindGame,
}

export interface SettingsSpec {
  color: string
  name: string
  musicVolume: number
  soundVolume: number
  lastIps: string[]
}

export const MenuContext = createContext<{
  setGameScreen: Function,
  settings: SettingsSpec,
  setSettings: Function,
  connect: Function,
  cancelConnect: Function,
  setConnectError: Function,
  connectError: string,
  socket?: Socket
}>({ setGameScreen: () => {}, settings: { color: '', name: '', musicVolume: 0, soundVolume: 0, lastIps: [] }, setSettings: () => {}, connect: () => {}, cancelConnect: () => {}, connectError: '', setConnectError: () => {} })

function App (): JSX.Element {
  const [gameScreen, setGameScreen] = useState(GameScreen.TITLE)
  const [ip, setIp] = useState('')
  const [connectError, setConnectError] = useState('')
  const [settings, updateSettings] = useState<SettingsSpec>({
    color: localStorage.getItem('settings.color') ?? '127,127,127',
    name: localStorage.getItem('settings.name') ?? 'player',
    musicVolume: Number.parseInt(localStorage.getItem('settings.musicVolume') ?? '80'),
    soundVolume: Number.parseInt(localStorage.getItem('settings.soundVolume') ?? '80'),
    lastIps: localStorage.getItem('settings.lastIps')?.split(',') ?? []
  })

  const setSettings = (newSettings: SettingsSpec) => {
    updateSettings(newSettings)
    localStorage.setItem('settings.color', newSettings.color)
    localStorage.setItem('settings.name', newSettings.name)
    localStorage.setItem('settings.musicVolume', newSettings.musicVolume.toString())
    localStorage.setItem('settings.soundVolume', newSettings.soundVolume.toString())
    localStorage.setItem('settings.lastIps', newSettings.lastIps.join(','))
  }

  const connect = (ip: string) => {
    setIp(ip)
    setGameScreen(GameScreen.GAME)
  }

  const cancelConnect = () => {
    setConnectError('Connection cancelled.')
    setGameScreen(GameScreen.FINDGAME)
  }

  const ScreenElement = screens[gameScreen]

  return (
    <div className='app mt-8 mx-auto text-white bg-gray-500 flex items-stretch justify-items-stretch overflow-hidden w-240 min-h-180 font-nokiafc22 border-box-all cursor-default relative'>
      <MenuContext.Provider value={{ setGameScreen, settings, setSettings, connect, cancelConnect, connectError, setConnectError }}>
        {gameScreen === GameScreen.GAME
          ? <Game ip={ip} />
          : <ScreenElement />
        }
      </MenuContext.Provider>
    </div>
  )
}

export default App
