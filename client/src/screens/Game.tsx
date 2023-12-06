import { useContext, useEffect, useState } from 'react'
import { MenuContext, GameScreen } from '../App'
import { Button } from '../menu/Button'
import { Bar } from '../menu/Bar'
import { Panel } from '../menu/Panel'
import { ChatPanel } from '../menu/ChatPanel'
import { Map } from '../game/Map'
import { Tile } from 'common/src/Tile'
import { PlayerBox } from '../menu/PlayerBox'
import config from '../Config'
import SimpleAction from '../game/SimpleAction'
import leaveActionIcon from '../img/end-turn.svg'
import { generateMockMap } from '../game/MockDataGenerator'
import { Socket, io } from 'socket.io-client'
import { ClientEvents, GameInfo, GameState, Message, ServerEvents, ServerGreeting } from 'common/src/SocketSpec'

const mockSize = 20
const mockTiles: Tile[] = generateMockMap(mockSize)

const reconnectionAttempts = 5

const dcReasons: {[k: string]: string} = {
  "io server disconnect": "Server removed connection",
  "io client disconnect": "Client disconnected",
  "ping timeout": "Timed out",
  "transport close": "Lost connection",
  "transport error": "Error in network transport",
}

export function Game ({ ip }: { ip: string }): JSX.Element {
  const gameContext = useContext(MenuContext)
  
  const [socket, setSocket] = useState<Socket<ServerEvents, ClientEvents> | undefined>(undefined)
  const [menuVisible, setMenuVisible] = useState(false)
  const [chatActive, setChatActive] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, select] = useState<[number, number]>([0, 0])

  const [serverInfo, setServerInfo] = useState<ServerGreeting | undefined>()
  const [gameInfo, setGameInfo] = useState<GameInfo | undefined>()
  
  const game = { size: mockSize, tiles: mockTiles, turn: 'paul', turnNumber: 7 }
  
  const trySelect = (newx: number, newy: number) => {
    if (newx < 0 || newx >= game.size || newy < 0 || newy >= game.size) return
    select([newx, newy])
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      switch (e.code) {
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

  useEffect(() => {
    const s: Socket<ServerEvents, ClientEvents> = io(ip, { reconnectionAttempts })
    setMessages((m) => [...m, { text: `Connecting to ${ip}...`, private: true }])

    const handleError = (err: Error) => gameContext.setConnectError(`${err.message}. Caused by: ${err.cause ?? 'unknown'}`)
    const handleReconnectAttempt = (attempt: number) => setMessages((m) => [...m, { text: `Reconnecting... (attempt ${attempt+1} out of ${reconnectionAttempts})...`, private: true }])
    const handleReconnectFailed = () => {
      gameContext.setConnectError('Reconnection failed.')
      gameContext.setGameScreen(GameScreen.FINDGAME)
    }
    const handleReconnect = (attempt: number) => setMessages((m) => [...m, { text: `Reconnected after ${attempt} attempts.`, private: true }])
    const handleClose = (reason: string) => {
      if (reason === Object.keys(dcReasons)[0] || reason === Object.keys(dcReasons)[1]){
        gameContext.setConnectError(`Connection closed. ${dcReasons[reason]}`)
        gameContext.setGameScreen(GameScreen.FINDGAME)
        return
      }
      setMessages((m) => [...m, { text: `Connection closed. ${dcReasons[reason]}`, private: true }])
    }

    const onConnect = () => { 
      setMessages((m) => [...m, { text: `Connected to ${ip}.`, private: true }])
      setSocket(s)
      s.emit("welcome", { name: gameContext.settings.name, color: gameContext.settings.color })
    }

    // s.on('connect_error', handleError)
    s.io.on('error', handleError)
    s.io.on('reconnect_attempt', handleReconnectAttempt)
    s.io.on('reconnect_failed', handleReconnectFailed)
    s.io.on('reconnect', handleReconnect)
    s.io.on('close', handleClose)
    s.on('connect', onConnect)
    s.on('welcome', (message) => {
      setServerInfo(message)
      setMessages((m) => [...m, { text: message.motd }])
    })
    s.on('chat', (message) => setMessages((m) => [...m, message]))
    // s.on('gameInfo', (info) => setGameInfo(info))

    return () => {
      s.io.removeListener('error', handleError)
      s.io.removeListener('reconnect_attempt', handleReconnectAttempt)
      s.io.removeListener('reconnect_failed', handleReconnectFailed)
      s.io.removeListener('close', handleClose)
      s.io.removeListener('reconnect', handleReconnect)
      s.removeAllListeners()
      s.disconnect()
      setMessages([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = (message: string) => {
    socket?.emit('chat', message)
  }

  const quitGame = () => {
    gameContext.setConnectError('')
    gameContext.setGameScreen(GameScreen.TITLE)
  }

  return (
    <div className='s-game bg1 w-full'>
      {menuVisible && (
        <div className='absolute top-0 left-0 right-0 bottom-0 flexc bg-black bg-opacity-50 z-10'>
          <Panel className='p-4 absolute z-10'>
            <Button onClick={() => setMenuVisible(false)}>Resume Game</Button>
            <br />
            <Button onClick={quitGame}>Quit to Title Screen</Button>
          </Panel>
        </div>
      )}
      <div>
        <Bar>Players</Bar>
        {gameInfo?.players.map((player) => (
          <PlayerBox player={player} myTurn={player.name === game.turn} key={player.name} selected={game.tiles[selected[1]*game.size + selected[0]].owner?.name === player.name} />
        ))}
      </div>
      <div className='flex flex-col'>
        {gameInfo?.gameState === GameState.LOBBY ? (
          <>
            <Bar></Bar>
          </>
        ) : (
          <>
            <Bar className='flex justify-between'>
              <span>{game.turn}'s turn</span>
              <span>{selected[0]+1}x{selected[1]+1}</span>
            </Bar>
            <style>
              {'.m-map {'}
                {gameInfo?.players.map((player) => `--p-${player.name}-bg: rgb(${player.color},0.5); --p-${player.name}: rgb(${player.color},1);`)}
              {'}'}
              {gameInfo?.players.map((player) => `.m-map .p-${player.name} {--owner-bg: var(--p-${player.name}-bg); --owner: var(--p-${player.name});}`)}
            </style>
            <Map tiles={game.tiles} select={trySelect as any} selected={selected} />
          </>
        )}
      </div>
      <div className='row-span-2'>
        <Bar>Turn: {game.turnNumber}</Bar>
        {/* {stats !== undefined && Object.entries(stats).map(([statName, stat]) => (
          <StatBox src={config.stats[statName].img} stat={stat} key={statName} />
        ))} */}
        <div className='h-1'></div>
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
      <ChatPanel active={chatActive} messages={messages} sendMessage={sendMessage} className='col-span-2 h-64' />
    </div>
  )
}
