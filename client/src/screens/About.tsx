import { useContext } from 'react'
import { GameContext, GameScreen } from '../App'
import { Button } from '../components/Button'
import { Bar } from '../components/Bar'

export function About (): JSX.Element {
  const gameContext = useContext(GameContext)

  return (
    <div className='bg8 w-full p-16 pt-60'>
      <Bar>About</Bar>

      <p>
        This is a turn-based multiplater strategy game written in typescript. Initial development started in the summer of 2018.
        ...
      </p>

      <Button onClick={() => gameContext.setGameScreen(GameScreen.TITLE)}>{'<'} Back</Button>
    </div>
  )
}
