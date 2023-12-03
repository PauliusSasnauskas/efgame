import { useContext, useEffect, useState } from 'react'
import { MenuContext, GameScreen } from '../App'
import { Button } from '../components/Button'
import { Bar } from '../components/Bar'
import { Panel } from '../components/Panel'
import { ChatPanel } from '../components/ChatPanel'
import { Map } from '../components/game/Map'
import { Tile } from '../components/game/Tile'

const mockSize = 4
const mockTiles: Tile[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0, entity: { id: 'v:tree1' } },
  { x: 3, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1, entity: { id: 'v:tree2' } },
  { x: 2, y: 1 },
  { x: 3, y: 1, resource: { id: 'v:gold' } },
  { x: 0, y: 2 },
  { x: 1, y: 2, resource: { id: 'v:gold' } },
  { x: 2, y: 2, entity: { id: 'v:mine', health: 2 } },
  { x: 3, y: 2, entity: { id: 'v:tower', health: 1 } },
  { x: 0, y: 3 },
  { x: 1, y: 3 },
  { x: 2, y: 3 },
  { x: 3, y: 3, entity: { id: 'v:mountain1' } }
]

const mockUsers = [
  
]

export function Game (): JSX.Element {
  const gameContext = useContext(MenuContext)

  const gameState = { size: mockSize, tiles: mockTiles, users: mockUsers }
  
  const [menuVisible, setMenuVisible] = useState(false)
  const [chatActive, setChatActive] = useState(false)
  const [selected, select] = useState<[number, number]>([0, 0])

  
  const trySelect = (newx: number, newy: number) => {
    if (newx < 0 || newx >= gameState.size || newy < 0 || newy >= gameState.size) return
    select([newx, newy])
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      switch (e.key) {
        case 'Escape':
          if (chatActive) {
            setChatActive(false)
            break
          }
          setMenuVisible((oldval) => !oldval)
          break
        case 'Enter':
          setChatActive((oldval) => !oldval)
          break
        case 'ArrowUp':
          trySelect(selected[0], selected[1]-1)
          break
        case 'ArrowRight':
          trySelect(selected[0]+1, selected[1])
          break
        case 'ArrowDown':
          trySelect(selected[0], selected[1]+1)
          break
        case 'ArrowLeft':
          trySelect(selected[0]-1, selected[1])
          break
        default:
          // console.log(e.key)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [chatActive, selected])

  return (
    <div className='s-game bg1 w-full'>
      {menuVisible && (
        <div className='absolute top-0 left-0 right-0 bottom-0 flexc bg-black bg-opacity-50'>
          <Panel className='p-4 absolute z-10'>
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
      <div className='flex flex-col gap-2'>
        <Bar className='flex justify-between'>
          <span>Whose turn</span>
          <span>{selected[0]+1}x{selected[1]+1}</span>
        </Bar>
        <Map tiles={gameState.tiles} select={trySelect as any} selected={selected} />
      </div>
      <div className='row-span-2'>
        <Bar>Turn: number</Bar>
        stats panel
        <br />
        actions panel
      </div>
      <ChatPanel active={chatActive} className='col-span-2' />
    </div>
  )
}
