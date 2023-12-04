import { createContext, FunctionComponent, useState } from 'react'
import './index.css'
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

export const MenuContext = createContext<{ setGameScreen: Function, settings: { color: string, name: string }, setSettings: Function }>({ setGameScreen: () => {}, settings: { color: '127,127,127', name: 'player' }, setSettings: () => {} })

function App (): JSX.Element {
  const [gameScreen, setGameScreen] = useState(GameScreen.TITLE)
  const [settings, setSettings] = useState<any>({ color: '127,127,127', name: 'player' })

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
