import { useContext, useEffect, useState } from 'react'
import { MenuContext, GameScreen } from '../App'
import { Button } from '../components/Button'
import { Bar } from '../components/Bar'
import { Panel } from '../components/Panel'
import { ChatPanel } from '../components/ChatPanel'
import { Map } from '../components/game/Map'
import { Tile } from '../components/game/Tile'
import { Player } from '../components/game/Player'
import { PlayerBox } from '../components/PlayerBox'
import config from '../components/game/Config'
import StatBox from '../components/game/StatBox'
import SimpleAction from '../components/game/SimpleAction'
import leaveActionIcon from '../img/end-turn.svg'

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

const mockPlayers: Player[] = [
  { name: 'paul', color: '255,127,0', eliminated: false, team: 'greencross', controllable: true, stats: { 'v:action': { val: 8, max: 12 }, 'v:gold': { val: 174 }, 'v:army': { val: 43 }, 'v:territory': { val: 12 }, 'v:xp': { val: 4 } } },
  { name: 'richard', color: '0,127,255', eliminated: false, controllable: false },
  { name: 'bot2', color: '127,127,127', eliminated: false, controllable: true, stats: {} },
  { name: 'bot3', color: '255,100,100', eliminated: true, team: 'bluetriangle', controllable: false },
  { name: 'bot4', color: '255,100,255', team: 'spectator', controllable: false }
]

export function Game (): JSX.Element {
  const gameContext = useContext(MenuContext)

  
  const [menuVisible, setMenuVisible] = useState(false)
  const [chatActive, setChatActive] = useState(false)
  const [selected, select] = useState<[number, number]>([0, 0])
  
  const gameState = { size: mockSize, tiles: mockTiles, players: mockPlayers, turn: 'paul', turnNumber: 7 }
  let lastPlayerControlled = 'paul'

  const stats = gameState.players.find((player) => player.name === lastPlayerControlled && (!player.eliminated || true) && player.team !== 'spectator')?.stats
  
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
        <div className='absolute top-0 left-0 right-0 bottom-0 flexc bg-black bg-opacity-50 z-10'>
          <Panel className='p-4 absolute z-10'>
            <Button onClick={() => setMenuVisible(false)}>Resume Game</Button>
            <br />
            <Button onClick={() => gameContext.setGameScreen(GameScreen.TITLE)}>Quit to Title Screen</Button>
          </Panel>
        </div>
      )}
      <div>
        <Bar>Players</Bar>
        {gameState.players.map((player) => (
          <PlayerBox player={player} myTurn={player.name === gameState.turn} key={player.name} />
        ))}
      </div>
      <div className='flex flex-col gap-2'>
        <Bar className='flex justify-between'>
          <span>{gameState.turn}'s turn</span>
          <span>{selected[0]+1}x{selected[1]+1}</span>
        </Bar>
        <Map tiles={gameState.tiles} select={trySelect as any} selected={selected} />
      </div>
      <div className='row-span-2'>
        <Bar>Turn: {gameState.turnNumber}</Bar>
        {stats !== undefined && Object.entries(stats).map(([statName, stat]) => (
          <StatBox src={config.stats[statName].img} stat={stat} key={statName} />
        ))}
        <div className='h-3'></div>
        {Object.entries(config.actions).map(([action, actionElement]) => {
          if (actionElement === null){
            return <SimpleAction img={leaveActionIcon} name='End Turn' onClick={() => { console.log('endturn') }} className='mb-4' key={action} />
          }
          if (typeof actionElement === 'function'){
            const ActionElement = actionElement
            return <ActionElement onClick={() => { console.log(action, selected) }} key={action} />
          }
          return <SimpleAction img={actionElement.img} name={actionElement.name} onClick={() => { console.log(action, selected) }} key={action} />
        })}
        {!('endturn' in config.actions) && <SimpleAction img={leaveActionIcon} name='End Turn' onClick={() => { console.log('endturn') }} />} {/* TODO: networking */}
      </div>
      <ChatPanel active={chatActive} className='col-span-2' />
    </div>
  )
}
