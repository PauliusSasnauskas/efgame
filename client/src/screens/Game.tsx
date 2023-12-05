import { useContext, useEffect, useState } from 'react'
import { MenuContext, GameScreen } from '../App'
import { Button } from '../menu/Button'
import { Bar } from '../menu/Bar'
import { Panel } from '../menu/Panel'
import { ChatPanel } from '../menu/ChatPanel'
import { Map } from '../game/Map'
import { Tile } from '../game/Tile'
import { Player } from '../game/Player'
import { PlayerBox } from '../menu/PlayerBox'
import config from '../Config'
import StatBox from '../game/StatBox'
import SimpleAction from '../game/SimpleAction'
import leaveActionIcon from '../img/end-turn.svg'
import { generateMockMap, generateMockPlayers } from '../game/MockDataGenerator'

const mockSize = 20
const mockPlayers: Player[] = generateMockPlayers()
const mockTiles: Tile[] = generateMockMap(mockSize, mockPlayers)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <PlayerBox player={player} myTurn={player.name === gameState.turn} key={player.name} selected={gameState.tiles[selected[1]*gameState.size + selected[0]].owner?.name === player.name} />
        ))}
      </div>
      <div className='flex flex-col gap-2'>
        <Bar className='flex justify-between'>
          <span>{gameState.turn}'s turn</span>
          <span>{selected[0]+1}x{selected[1]+1}</span>
        </Bar>
        <style>
          {'.m-map {'}
            {gameState.players.map((player) => `--p-${player.name}-bg: rgb(${player.color},0.5); --p-${player.name}: rgb(${player.color},1);`)}
          {'}'}
          {gameState.players.map((player) => `.m-map .p-${player.name} {--owner-bg: var(--p-${player.name}-bg); --owner: var(--p-${player.name});}`)}
        </style>
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
