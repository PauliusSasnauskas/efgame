import { MouseEventHandler, useContext, useEffect, useState } from 'react'
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
import { Player, Stat, StatReq } from 'common/src/Player'
import StatBox from '../game/StatBox'
import KeyIcon from '../menu/KeyIcon'
import { ConfigAction } from '../ConfigSpec'

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

  const [socket, setSocket] = useState<Socket<ServerEvents, ClientEvents> | undefined>()
  const [menuVisible, setMenuVisible] = useState(false)
  const [chatActive, setChatActive] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageRecipient, setMessageRecipient] = useState<{ name: string, color: string } | undefined>(undefined)
  const [gameKey, setGameKey] = useState('')

  const [selected, select] = useState<[number, number]>([0, 0])
  const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>()
  const [serverInfo, setServerInfo] = useState<ServerGreeting | undefined>()
  const [metaInfo, setMetaInfo] = useState<GameInfoLobby | GameInfoPlaying | undefined>()
  const [gameInfo, setGameInfo] = useState<{stats: {[k: string]: Stat}, map: Tile[]} | undefined>()
  const [statReq, setStatReq] = useState<StatReq | undefined>()

  const trySelect = (newx: number, newy: number) => {
    if (metaInfo === undefined) return
    if (newx < 0 || newx >= metaInfo.mapSize || newy < 0 || newy >= metaInfo.mapSize) return
    select([newx, newy])
    setStatReq(undefined)
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      if (chatActive){
        if (['Escape', 'Enter'].includes(e.code)) setChatActive(false)
        return
      }
      switch (e.code) {
        case 'Escape':
          setMenuVisible((oldval) => !oldval)
          return
        case 'Enter':
          setMessageRecipient(undefined)
          setChatActive(true)
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
        if (actionSpec === 'endturn') return
        if (typeof actionSpec.key === 'string' && e.code === actionSpec.key) {
          invokeAction(action, selected)
          return
        }
        if (typeof actionSpec.key === 'object' && actionSpec.key.includes(e.code)) invokeAction(action, selected)
      })
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatActive, selected])

  useEffect(() => {
    const s: Socket<ServerEvents, ClientEvents> = io(ip, { reconnectionAttempts, rejectUnauthorized: false })
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
      setGameKey(Math.random().toString(36).substring(2,  5))
      setMessages((m) => [...m, { text: `Connected to ${ip}.`, private: true }])
      saveIpToLastIps(ip)
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
    s.on('metaInfo', setMetaInfo)
    s.on('gameInfo', setGameInfo)

    return () => {
      s.io.removeListener('error', handleError)
      s.io.removeListener('reconnect_attempt', handleReconnectAttempt)
      s.io.removeListener('reconnect_failed', handleReconnectFailed)
      s.io.removeListener('close', handleClose)
      s.io.removeListener('reconnect', handleReconnect)
      s.removeAllListeners()
      s.disconnect()
      setMessages([])
      setServerInfo(undefined)
      setMetaInfo(undefined)
      setGameInfo(undefined)
      setStatReq(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendChat = (message: string, recipient?: string) => {
    setMessageRecipient(undefined)
    if (recipient === currentPlayer?.name) return
    socket?.emit('chat', message, recipient)
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
    setStatReq(undefined)
  }

  const invokeAction = (action: string, tile: [number, number]) => {
    setStatReq(undefined)
    socket?.emit('action', { action, x: tile[0], y: tile[1] })
  }

  function EndTurnButton({ disabled }: { disabled?: boolean }): JSX.Element {
    return <SimpleAction img={leaveActionIcon} name='End Turn' onClick={endTurn} disabled={disabled} hoverElement={<KeyIcon name={'Space'} />} />
  }

  const getTile = (x: number, y: number): Tile | undefined => {
    return gameInfo?.map.find((tile: Tile) => tile.x === x && tile.y === y)
  }

  const getSelectedTile = (): Tile | undefined => getTile(selected[0], selected[1])

  const clearStatReq = () => setStatReq(undefined)
  const getFunctionSetStatReq = (statReq: ConfigAction['req']): MouseEventHandler<any> => () => {
    if (statReq === undefined || gameInfo === undefined || metaInfo === undefined || currentPlayer === undefined) return
    if (typeof statReq === 'function') {
      setStatReq(statReq(getSelectedTile(), gameInfo.map, currentPlayer))
    }else{
      setStatReq(statReq)
    }
  }

  const saveIpToLastIps = (ip: string) => {
    const oldLastIps = gameContext.settings.lastIps
    if (oldLastIps.includes(ip)) {
      gameContext.setSettings({ ...gameContext.settings, lastIps: [ip, ...oldLastIps.filter((lastIp) => lastIp !== ip)] })
      return
    }
    if (oldLastIps.length >= 5) oldLastIps.pop()
    gameContext.setSettings({ ...gameContext.settings, lastIps: [ip, ...oldLastIps] })
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
      {serverInfo !== undefined && metaInfo !== undefined ? (
        <>
          <div>
            <Bar>Players</Bar>
            {metaInfo.players.map((player) => (
              <PlayerBox player={player} myTurn={metaInfo.gameState === GameState.PLAYING ? player.name === metaInfo.turn : false} key={player.name} selected={gameInfo !== undefined ? getSelectedTile()?.owner?.name === player.name : false} onClick={() => { setMessageRecipient({ name: player.name, color: player.color }); setChatActive(true) }} />
            ))}
          </div>
          <div className='flex flex-col'>
            {metaInfo !== undefined && metaInfo.gameState === GameState.LOBBY && (
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
                      {metaInfo.mapName}
                    </div>
                    <div>
                      <Bar>Teams</Bar>
                      {metaInfo.numTeams === 0 ? 'None' : metaInfo.numTeams}
                    </div>
                    <div>
                      <Bar>Map Size</Bar>
                      {metaInfo.mapSize}
                    </div>
                  </div>
                  <Button onClick={startGame}>Start Game</Button>
                </div>
              </>
            )}
            {gameInfo !== undefined && (metaInfo.gameState === GameState.PLAYING || metaInfo.gameState === GameState.POSTGAME) && (
              <>
                <Bar className='flex justify-between'>
                  <span>{metaInfo.gameState === GameState.POSTGAME ? 'Game finished!' : `${metaInfo.turn}'s turn`}</span>
                  <span>{selected[0]+1}x{selected[1]+1}</span>
                </Bar>
                <style>
                  {'.m-map {'}
                    {metaInfo.players.map((player) => `--p-${player.name}-bg: rgb(${player.eliminated ? eliminatedColor : player.color},0.5); --p-${player.name}: rgb(${player.eliminated ? eliminatedColor : player.color},1);`)}
                  {'}'}
                  {metaInfo.players.map((player) => `.m-map .p-${player.name} {--owner-bg: var(--p-${player.name}-bg); --owner: var(--p-${player.name});}`)}
                </style>
                <Map tiles={gameInfo.map} mapSize={metaInfo.mapSize} select={trySelect as any} selected={selected} player={currentPlayer} gameKey={gameKey} />
              </>
            )}
          </div>
          <div className='row-span-2'>
            {metaInfo.gameState === GameState.LOBBY && (
              <>
                {/* TODO: join team buttons */}
              </>
            )}
            {metaInfo.gameState === GameState.PLAYING && gameInfo !== undefined && (
              <>
                <Bar>Turn: {metaInfo.turnNumber}</Bar>
                {Object.entries(gameInfo.stats).map(([statName, stat]) => (
                  <StatBox src={config.stats[statName].img} stat={stat} key={statName} showReq={statReq?.[statName]} />
                ))}
                {!('endturn' in config.actions) && <EndTurnButton disabled={metaInfo.turn !== currentPlayer?.name} />}
                {Object.entries(config.actions).map(([actionName, action]) => {
                  if (action === 'endturn') return <EndTurnButton key={actionName} disabled={metaInfo.turn !== currentPlayer?.name} />
                  if (typeof action.button === 'function'){
                    const ActionElement = action.button
                    return <ActionElement onClick={() => { invokeAction(actionName, selected) }} onMouseEnter={getFunctionSetStatReq(action.req)} onMouseLeave={clearStatReq} disabled={metaInfo.turn !== currentPlayer?.name || (!action.allowOnTile?.(getSelectedTile(), gameInfo.map, currentPlayer) ?? false)} key={actionName} hoverElement={<KeyIcon name={action.key} />} />
                  }
                  return <SimpleAction img={action.button.img} name={action.button.name} onClick={() => { invokeAction(actionName, selected) }} onMouseEnter={getFunctionSetStatReq(action.req)} onMouseLeave={clearStatReq} disabled={metaInfo.turn !== currentPlayer?.name || (!action.allowOnTile?.(getSelectedTile(), gameInfo.map, currentPlayer) ?? false)} key={actionName} hoverElement={<KeyIcon name={action.key} />} />
                })}
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
      <ChatPanel active={chatActive} messages={messages} sendMessage={sendChat} recipient={messageRecipient?.name} recipientColor={messageRecipient?.color} className='col-span-2 row-start-2 h-64' />
    </div>
  )
}
