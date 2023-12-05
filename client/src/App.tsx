import { createContext, FunctionComponent, useState } from 'react'
import './style.css'
import { About } from './screens/About'
import { Game } from './screens/Game'
import { Lobby } from './screens/Lobby'
import { Settings } from './screens/Settings'
import { Title } from './screens/Title'

export enum GameScreen {
  TITLE = 'title',
  SETTINGS = 'settings',
  ABOUT = 'about',
  LOBBY = 'lobby',
  GAME = 'game'
}

const screens: { [k: string | GameScreen]: FunctionComponent } = {
  [GameScreen.TITLE]: Title,
  [GameScreen.SETTINGS]: Settings,
  [GameScreen.ABOUT]: About,
  [GameScreen.LOBBY]: Lobby,
  [GameScreen.GAME]: Game
}

export interface SettingsSpec {
  color: string
  name: string
  musicVolume: number
  soundVolume: number
}

export const MenuContext = createContext<{ setGameScreen: Function, settings: SettingsSpec, setSettings: Function }>({ setGameScreen: () => {}, settings: { color: '127,127,127', name: 'player', musicVolume: 80, soundVolume: 0.8 }, setSettings: () => {} })

function App (): JSX.Element {
  const [gameScreen, setGameScreen] = useState(GameScreen.TITLE)
  const [settings, setSettings] = useState<any>({ color: '127,127,127', name: 'player', musicVolume: 0.8, soundVolume: 0.8 })

  const ScreenElement = screens[gameScreen]

  return (
    <div className='app mt-8 mx-auto text-white bg-gray-500 flex items-stretch justify-items-stretch overflow-hidden w-240 min-h-180 font-nokiafc22 border-box-all cursor-default relative'>
      <MenuContext.Provider value={{ setGameScreen, settings, setSettings }}>
        <ScreenElement />
      </MenuContext.Provider>
    </div>
  )
}

export default App
