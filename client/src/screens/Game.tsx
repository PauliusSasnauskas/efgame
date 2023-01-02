import { useContext, useEffect, useState } from 'react'
import { GameContext, GameScreen } from '../App'
import { Button } from '../components/Button'
import { Bar } from '../components/Bar'
import { Box } from '../components/Box'
import { Panel } from '../components/Panel'

export function Game (): JSX.Element {
  const gameContext = useContext(GameContext)

  const [menuVisible, setMenuVisible] = useState(false)

  const handleKey = (e: KeyboardEvent): void => {
    console.log(e.key)
    if (e.key === 'Escape') {
      setMenuVisible((oldval) => !oldval)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className='s-game bg1 w-full p-4 gap-2'>
      {menuVisible && (
        <div className='absolute top-0 left-0 right-0 bottom-0 flexc bg-black bg-opacity-50'>
          <Panel className='p-4'>
            <Button onClick={() => setMenuVisible(false)}>Resume Game</Button>
            <br />
            <Button onClick={() => gameContext.setGameScreen(GameScreen.TITLE)}>Quit to Title Screen</Button>
          </Panel>
        </div>
      )}
      <div>
        <Bar>Players</Bar>
        Player panel
      </div>
      <div>
        <Bar>Who's turn</Bar>
        game box
      </div>
      <div className='row-span-2'>
        <Bar>Turn: number</Bar>
        stats panel
        <br />
        actions panel
      </div>
      <Box className='col-span-2'>
        Log panel
      </Box>
    </div>
  )
}
