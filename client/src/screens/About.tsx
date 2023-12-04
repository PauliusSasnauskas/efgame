import { useContext } from 'react'
import { MenuContext, GameScreen } from '../App'
import { Button } from '../menu/Button'
import { Bar } from '../menu/Bar'

export function About (): JSX.Element {
  const gameContext = useContext(MenuContext)

  return (
    <div className='bg8 w-full p-16 pt-60'>
      <Bar>About</Bar>

      <p>
        This is a turn-based multiplater strategy game written in TypeScript. Initial development started in the summer of 2018.
        ...
        <br/>
        <br/>
        Music and sound effects by Ricardas N.
      </p>

      <Button onClick={() => gameContext.setGameScreen(GameScreen.TITLE)}>{'<'} Back</Button>
    </div>
  )
}
