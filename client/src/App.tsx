import { createContext, FunctionComponent, useState } from 'react'
import './style.css'
import { About } from './screens/About'
import { Game } from './screens/Game'
import { FindGame } from './screens/FindGame'
import { Settings } from './screens/Settings'
import { Title } from './screens/Title'

import { io } from 'socket.io-client'

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
  [GameScreen.GAME]: Game
}

export interface SettingsSpec {
  color: string
  name: string
  musicVolume: number
  soundVolume: number
  lastIp: string
}

export const MenuContext = createContext<{
  setGameScreen: Function,
  settings: SettingsSpec,
  setSettings: Function,
  tryConnect: Function
}>({ setGameScreen: () => {}, settings: { color: '', name: '', musicVolume: 0, soundVolume: 0, lastIp: '' }, setSettings: () => {}, tryConnect: () => {} })

function App (): JSX.Element {
  const [gameScreen, setGameScreen] = useState(GameScreen.TITLE)

  const [settings, updateSettings] = useState<SettingsSpec>({
    color: localStorage.getItem('settings.color') || '127,127,127',
    name: localStorage.getItem('settings.name') || 'player',
    musicVolume: Number.parseInt(localStorage.getItem('settings.musicVolume') || '80'),
    soundVolume: Number.parseInt(localStorage.getItem('settings.soundVolume') || '80'),
    lastIp: localStorage.getItem('settings.lastIp') || ''
  })

  const setSettings = (newSettings: SettingsSpec) => {
    updateSettings(newSettings)
    localStorage.setItem('settings.color', newSettings.color)
    localStorage.setItem('settings.name', newSettings.name)
    localStorage.setItem('settings.musicVolume', newSettings.musicVolume.toString())
    localStorage.setItem('settings.soundVolume', newSettings.soundVolume.toString())
  }

  const tryConnect = (ip: string) => {
    const socket = io(ip)
    socket.on('welcome', (args) => {
      setGameScreen(GameScreen.GAME)
      console.log('socket:', args)
    })
  }

  const ScreenElement = screens[gameScreen]

  return (
    <div className='app mt-8 mx-auto text-white bg-gray-500 flex items-stretch justify-items-stretch overflow-hidden w-240 min-h-180 font-nokiafc22 border-box-all cursor-default relative'>
      <MenuContext.Provider value={{ setGameScreen, settings, setSettings, tryConnect }}>
        <ScreenElement />
      </MenuContext.Provider>
    </div>
  )
}

export default App
