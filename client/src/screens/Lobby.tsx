import { useContext } from 'react'
import { GameContext, GameScreen } from '../App'
import { Button } from '../components/Button'
import { Bar } from '../components/Bar'

export function Lobby (): JSX.Element {
  const gameContext = useContext(GameContext)

  return (
    <div className='bg1 w-full p-16'>
      <Bar>Lobby</Bar>
      TODO: networking...
      <Button onClick={() => gameContext.setGameScreen(GameScreen.GAME)}>Start Game!</Button>
      <Button onClick={() => gameContext.setGameScreen(GameScreen.TITLE)}>{'<'} Back</Button>
    </div>
  )
}
