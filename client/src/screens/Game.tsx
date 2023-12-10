import { useContext, useEffect, useState } from 'react'
import { MenuContext, GameScreen } from '../App'
import { Button } from '../menu/Button'
import { Bar } from '../menu/Bar'
import { Panel } from '../menu/Panel'
import { ChatPanel } from '../menu/ChatPanel'
import { Map } from '../game/Map'
import { PlayerBox } from '../menu/PlayerBox'
import config from '../Config'
import SimpleAction from '../game/SimpleAction'
import leaveActionIcon from '../img/end-turn.svg'
import { Socket, io } from 'socket.io-client'
import { ClientEvents, GameInfoLobby, GameInfoPlaying, Message, ServerEvents, ServerGreeting } from 'common/src/SocketSpec'
import { GameState } from '../game/GameState'
import { Tile } from 'common/src/Tile'
import { Player, Stat } from 'common/src/Player'
import StatBox from '../game/StatBox'

const reconnectionAttempts = 5

const dcReasons: {[k: string]: string} = {
  "io server disconnect": "Server removed connection",
  "io client disconnect": "Client disconnected",
  "ping timeout": "Timed out",
  "transport close": "Lost connection",
  "transport error": "Error in network transport",
}

const eliminatedColor = '127,127,127'

export function Game ({ ip }: { ip: string }): JSX.Element {
  const gameContext = useContext(MenuContext)

  const [socket, setSocket] = useState<Socket<ServerEvents, ClientEvents> | undefined>(undefined)
  const [menuVisible, setMenuVisible] = useState(false)
  const [chatActive, setChatActive] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, select] = useState<[number, number]>([0, 0])

  const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>()
  const [serverInfo, setServerInfo] = useState<ServerGreeting | undefined>()
  const [gameInfo, setGameInfo] = useState<GameInfoLobby | GameInfoPlaying | undefined>()
  const [map, setMap] = useState<Tile[] | undefined>()
  const [stats, setStats] = useState<{[k: string]: Stat} | undefined>()

  const trySelect = (newx: number, newy: number) => {
    if (gameInfo === undefined) return
    if (newx < 0 || newx >= gameInfo.mapSize || newy < 0 || newy >= gameInfo.mapSize) return
    select([newx, newy])
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      switch (e.code) {
        case 'Escape':
          if (chatActive) {
            setChatActive(false)
            return
          }
          setMenuVisible((oldval) => !oldval)
          return
        case 'Enter':
          setChatActive((oldval) => !oldval)
          return
        case 'ArrowUp':
          trySelect(selected[0], selected[1]-1)
          return
        case 'ArrowRight':
          trySelect(selected[0]+1, selected[1])
          return
        case 'ArrowDown':
          trySelect(selected[0], selected[1]+1)
          return
        case 'ArrowLeft':
          trySelect(selected[0]-1, selected[1])
          return
        case 'Space':
          endTurn()
          return
      }
      Object.entries(config.actions).forEach(([action, actionSpec]) => {
        if (typeof actionSpec?.key === 'string' && e.code === actionSpec.key) {
          invokeAction(action, selected)
          return
        }
        if (typeof actionSpec?.key === 'object' && actionSpec.key.includes(e.code)) invokeAction(action, selected)
      })
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatActive, selected])

  useEffect(() => {
    const s: Socket<ServerEvents, ClientEvents> = io(ip, { reconnectionAttempts, transports: ['websocket'] })
    setMessages((m) => [...m, { text: `Connecting to ${ip}...`, private: true }])

    const handleError = (err: Error) => gameContext.setConnectError(`${err.message}. Caused by: ${err.cause ?? 'unknown'}`)
    const handleReconnectAttempt = (attempt: number) => setMessages((m) => [...m, { text: `Reconnecting... (attempt ${attempt} out of ${reconnectionAttempts})...`, private: true }])
    const handleReconnectFailed = () => {
      gameContext.setConnectError('Connection failed.')
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
      const player = { name: gameContext.settings.name, color: gameContext.settings.color } as Player
      setCurrentPlayer(player)
      s.emit("welcome", player)
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
    s.on('gameInfo', setGameInfo)
    s.on('mapInfo', setMap)
    s.on('statsInfo', (stats) => setStats(stats))

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

  const sendChat = (message: string) => {
    socket?.emit('chat', message)
  }

  const quitGame = () => {
    gameContext.setConnectError('')
    gameContext.setGameScreen(GameScreen.FINDGAME)
  }

  const startGame = () => {
    socket?.emit('startGame')
  }

  const endTurn = () => {
    socket?.emit('endTurn')
  }

  const invokeAction = (action: string, tile: [number, number]) => {
    socket?.emit('action', { action, x: tile[0], y: tile[1] })
  }

  function EndTurnButton({ disabled }: { disabled?: boolean }): JSX.Element {
    return <SimpleAction img={leaveActionIcon} name='End Turn' onClick={endTurn} disabled={disabled} />
  }

  function getTile(x: number, y: number): Tile | undefined {
    return map?.find((tile: Tile) => tile.x === x && tile.y === y)
  }

  return (
    <div className='s-game bg1 w-full'>
      {menuVisible && (
        <div className='absolute top-0 left-0 right-0 bottom-0 flexc bg-black bg-opacity-50 z-10'>
          <Panel className='p-4 absolute z-10'>
            <Button onClick={() => setMenuVisible(false)}>Resume Game</Button>
            <br />
            <Button onClick={quitGame}>Quit Game</Button>
          </Panel>
        </div>
      )}
      {serverInfo !== undefined && gameInfo !== undefined ? (
        <>
          <div>
            <Bar>Players</Bar>
            {gameInfo.players.map((player) => (
              <PlayerBox player={player} myTurn={gameInfo.gameState === GameState.PLAYING ? player.name === gameInfo.turn : false} key={player.name} selected={map !== undefined ? getTile(selected[0], selected[1])?.owner?.name === player.name : false} />
            ))}
          </div>
          <div className='flex flex-col'>
            {gameInfo !== undefined && gameInfo.gameState === GameState.LOBBY ? (
              <>
                <Bar>Lobby</Bar>
                <div className='p-2'>
                  {serverInfo.name} <span className='text-grey-lighter'>(v{serverInfo.version})</span>
                  <div className='grid grid-cols-2 gap-4 text-center mt-4 mb-24'>
                    <div>
                      <Bar>Gamemode</Bar>
                      {serverInfo.gamemode} <span className='text-grey-lighter'>({serverInfo.gamemodeVersion})</span>
                    </div>
                    <div>
                      <Bar>Map</Bar>
                      {gameInfo.mapName}
                    </div>
                    <div>
                      <Bar>Teams</Bar>
                      {gameInfo.numTeams === 0 ? 'None' : gameInfo.numTeams}
                    </div>
                    <div>
                      <Bar>Map Size</Bar>
                      {gameInfo.mapSize}
                    </div>
                  </div>
                  <Button onClick={startGame}>Start Game</Button>
                </div>
              </>
            ) : (
              <>
                <Bar className='flex justify-between'>
                  <span>{gameInfo.turn}'s turn</span>
                  <span>{selected[0]+1}x{selected[1]+1}</span>
                </Bar>
                <style>
                  {'.m-map {'}
                    {gameInfo.players.map((player) => `--p-${player.name}-bg: rgb(${player.eliminated ? eliminatedColor : player.color},0.5); --p-${player.name}: rgb(${player.eliminated ? eliminatedColor : player.color},1);`)}
                  {'}'}
                  {gameInfo.players.map((player) => `.m-map .p-${player.name} {--owner-bg: var(--p-${player.name}-bg); --owner: var(--p-${player.name});}`)}
                </style>
                <Map tiles={map} mapSize={gameInfo.mapSize} select={trySelect as any} selected={selected} />
              </>
            )}
          </div>
          <div className='row-span-2'>
            {gameInfo.gameState === GameState.LOBBY && (
              <>
                {/* TODO: join team buttons */}
              </>
            )}
            {gameInfo.gameState === GameState.PLAYING && map !== undefined && (
              <>
                <Bar>Turn: {gameInfo.turnNumber}</Bar>
                {stats !== undefined && Object.entries(stats).map(([statName, stat]) => (
                  <StatBox src={config.stats[statName].img} stat={stat} key={statName} />
                ))}
                {Object.entries(config.actions).map(([actionName, action]) => {
                  if (action === null){
                    return <EndTurnButton key={actionName} disabled={gameInfo.turn !== currentPlayer?.name} />
                  }
                  if (typeof action.button === 'function'){
                    const ActionElement = action.button
                    return <ActionElement onClick={() => { invokeAction(actionName, selected) }} disabled={gameInfo.turn !== currentPlayer?.name || (!action.allowOnTile?.(getTile(selected[0], selected[1]), currentPlayer) ?? false)} key={actionName} />
                  }
                  return <SimpleAction img={action.button.img} name={action.button.name} onClick={() => { invokeAction(actionName, selected) }} disabled={gameInfo.turn !== currentPlayer?.name || (!action.allowOnTile?.(getTile(selected[0], selected[1]), currentPlayer) ?? false)} key={actionName} />
                })}
                {!('endturn' in config.actions) && <EndTurnButton disabled={gameInfo.turn !== currentPlayer?.name} />}
              </>
            )}
          </div>
        </>
      ) : (
        <div className='col-span-3 flex gap-4 flex-col items-center pt-44'>
          <span>Connecting to {ip}...</span>
          <Button onClick={quitGame}>X Cancel</Button>
        </div>
      )}
      <ChatPanel active={chatActive} messages={messages} sendMessage={sendChat} className='col-span-2 row-start-2 h-64' />
    </div>
  )
}
