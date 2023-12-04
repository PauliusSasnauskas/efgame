import { useContext } from 'react'
import useSound from 'use-sound';
import { MenuContext, GameScreen } from '../App'
import { Button } from '../menu/Button'
import banner from '../img/menus/banner.svg'
import findIcon from '../img/menus/find.svg'
import mapEditorIcon from '../img/menus/map-editor.svg'
import settingsIcon from '../img/menus/settings.svg'
import aboutIcon from '../img/menus/about.svg'
import exitIcon from '../img/menus/exit.svg'
import noteGlyph from '../img/menus/note.svg'

export function Title (): JSX.Element {
  const gameContext = useContext(MenuContext)

  const changeScreen = (screen: GameScreen) => () => {
    gameContext.setGameScreen(screen)
  }

  const [playBgm] = useSound('sound/bgm01.wav') as any;

  return (
    <div className='bg6 w-full pt-36 pl-16 flex flex-col gap'>
      <img src={banner} alt='banner' className='w-60 -translate-x-1' />
      <Button onClick={changeScreen(GameScreen.LOBBY)} icon={findIcon}>Join Game</Button>
      <Button onClick={() => console.log('Not Implemented!')} icon={mapEditorIcon}>Map Editor</Button>
      <Button onClick={changeScreen(GameScreen.SETTINGS)} icon={settingsIcon}>Settings</Button>
      <Button onClick={changeScreen(GameScreen.ABOUT)} icon={aboutIcon}>About</Button>
      <Button onClick={() => document.location.assign('https://github.com/PauliusSasnauskas/efgame/')} icon={exitIcon}>Exit</Button>
      <br/>
      <p className='ml-1'>
        <img src={noteGlyph} alt='' className='w-[10px] inline mr-4 align-baseline cursor-pointer' onClick={playBgm}/>
        v2.0.0a1
      </p>
    </div>
  )
}
