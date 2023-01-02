import { useContext } from 'react'
import { GameContext, GameScreen } from '../App'
import { Button } from '../components/Button'
import banner from '../img/menus/banner.svg'
import findIcon from '../img/menus/find.svg'
import mapEditorIcon from '../img/menus/map-editor.svg'
import settingsIcon from '../img/menus/settings.svg'
import aboutIcon from '../img/menus/about.svg'
import exitIcon from '../img/menus/exit.svg'

export function Title (): JSX.Element {
  const gameContext = useContext(GameContext)

  const changeScreen = (screen: GameScreen) => () => {
    gameContext.setGameScreen(screen)
  }

  return (
    <div className='bg6 w-full pt-40 p-16 flex flex-col gap-1'>
      <img src={banner} alt='banner' className='w-60 -translate-x-1' />
      <Button onClick={changeScreen(GameScreen.LOBBY)} icon={findIcon}>Join Game</Button>
      <Button onClick={() => console.log('Not Implemented!')} icon={mapEditorIcon}>Map Editor</Button>
      <Button onClick={changeScreen(GameScreen.SETTINGS)} icon={settingsIcon}>Settings</Button>
      <Button onClick={changeScreen(GameScreen.ABOUT)} icon={aboutIcon}>About</Button>
      <Button onClick={() => document.location.assign('https://github.com/PauliusSasnauskas/efgame/')} icon={exitIcon}>Exit</Button>

      v2.0.0a1
    </div>
  )
}
