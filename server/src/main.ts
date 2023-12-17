import { DisconnectReason, Server } from 'socket.io';
import Game from './Game';
import { ClientEvents, GameState, Message, ServerEvents } from 'common/src/SocketSpec'
import config from './Config'
import { createServer as createServerHttps } from 'https'
import { createServer as createServerHttp } from 'http'
import { readFileSync } from 'fs'

const dcReasons: {[k: DisconnectReason | string]: string} = {
  "io server disconnect": "Server (io) removed connection",
  "server namespace disconnect": "Server (ns) removed connection",
  "io client disconnect": "Client (io) disconnected",
  "client namespace disconnect": "Client (ns) disconnected",
  "ping timeout": "Timed out",
  "transport close": "Connection closed (lost connection)",
  "transport error": "Connection error",
  "parse error": "Server received invalid data",
}

const port = process.env.PORT ?? 3001
const server = process.env.USE_HTTPS === 'true' ? createServerHttps({
  key: readFileSync(process.env.CERT_LOC + '/server.key'),
  cert: readFileSync(process.env.CERT_LOC + '/server.crt')
}) : createServerHttp()
const io = new Server<ClientEvents, ServerEvents>(server, { cors: { origin: '*' } })
server.listen(port)
console.log(`Started server on port ${port}`)

const game = new Game();

const socketIdToPlayerName: {[k: string]: string} = {}
const playerNameReconnectTimeout: {[k: string]: NodeJS.Timeout | number} = {}

function sendGameInfo(io: Server<ClientEvents, ServerEvents>, game: Game) {
  if (game.state === GameState.LOBBY) {
    io.emit('metaInfo', { gameState: game.state, players: game.listPlayers(), mapSize: game.mapSize, mapName: game.mapName, teams: game.teams })
  } else {
    io.emit('metaInfo', { gameState: game.state, players: game.listPlayers(), mapSize: game.mapSize, teams: game.teams, turnNumber: game.turnNumber, turn: game.turn })
    io.fetchSockets().then((sockets) => sockets.forEach((socket) => {
      socket.emit('gameInfo', { map: game.getMapForPlayer(socketIdToPlayerName[socket.id]), stats: game.getStatsForPlayer(socketIdToPlayerName[socket.id])})
    }))
  }
}

game.addMessageListener((message) => {
  io.emit('chat', { text: message })
})

game.addGameStateListener(() => {
  sendGameInfo(io, game)
})

io.on('connection', (socket) => {
  if (socket.recovered) {
    console.log(`[connect-recovered] ${socket.id} ${socket.handshake.address}`);
  } else {
    console.log(`[connect] ${socket.id} ${socket.handshake.address}`);
  }
  socket.emit("welcome", { name: 'efgame server', version: '2.0.0', gamemode: config.name, gamemodeVersion: config.version, motd: 'Welcome to the server!' })

  socket.on('disconnect', (reason) => {
    console.log(`[disconnect] ${socket.id} ${dcReasons[reason]}. ${socket.handshake.address}`)

    if (["io client disconnect", "client namespace disconnect"].includes(reason)){
      const player = game.getPlayer(socketIdToPlayerName[socket.id])
      delete socketIdToPlayerName[socket.id]
  
      console.log(`[disconnect] ${player?.name} lost connection. Waiting 60 seconds to reconnect.`)
      io.emit('chat', { text: `${player?.name} lost connection. Waiting 60 seconds to reconnect.` })
      playerNameReconnectTimeout[player.name] = setTimeout(() => {
        io.emit('chat', { text: `${player?.name} lost connection and was unable to reconnect.` })
        console.log(`[disconnect] ${player?.name} lost connection and was unable to reconnect.`)
        game.removePlayer(socketIdToPlayerName[socket.id])
        sendGameInfo(io, game)
      }, 60000)
    }else{
      game.removePlayer(socketIdToPlayerName[socket.id])
      sendGameInfo(io, game)
    }
  })

  socket.on('welcome', ({ name, color }) => {
    if (socket.id in socketIdToPlayerName) {
      console.log('Socket ID taken?')
      return
    }
    if (Object.values(socketIdToPlayerName).includes(name)) {
      socket.emit('chat', { text: 'Player name already taken' })
      socket.disconnect()
    }
    if (playerNameReconnectTimeout[name] !== undefined){
      clearTimeout(playerNameReconnectTimeout[name])
      io.emit('chat', { text: `${name} has reconnected.` })
    } else {
      io.emit('chat', { text: `${name} connected.` })
      game.addPlayer(name, color)
    }
    socketIdToPlayerName[socket.id] = name
    sendGameInfo(io, game)
  })

  socket.on('setTeam', (team) => {
    if (game.state !== GameState.LOBBY) return
    const player = game.getPlayer(socketIdToPlayerName[socket.id])

    game.setPlayerTeam(player, team)
    sendGameInfo(io, game)
  })

  socket.on('chat', (message, recipient) => {
    const senderPlayer = game.getPlayer(socketIdToPlayerName[socket.id])
    if (recipient == null) {
      console.log(`<${socket.handshake.address}> ${message}`)
      io.emit('chat', { from: senderPlayer?.name ?? 'unknown', fromColor: senderPlayer?.color, text: message })
      return
    }
    const recipientPlayer = game.getPlayer(recipient)
    const recipientSocketId = Object.entries(socketIdToPlayerName).find(([_, playerName]) => playerName === recipientPlayer.name)?.[0]
    const fullMessage: Message = { private: true, from: senderPlayer.name, fromColor: senderPlayer.color, to: recipientPlayer.name, toColor: recipientPlayer.color, text: message }
    io.fetchSockets().then((sockets) => sockets.forEach((s) => {
      if (s.id !== recipientSocketId) return
      s.emit('chat', fullMessage)
    }))
    socket.emit('chat', fullMessage)
  })

  socket.on('startGame', () => game.start())

  socket.on('endTurn', (callback) => {
    const actionResult = game.playerEndTurn(socketIdToPlayerName[socket.id])
    callback(actionResult)
    sendGameInfo(io, game)
  })

  socket.on('action', ({ action, x, y }, callback) => {
    const actionResult = game.playerAction(socketIdToPlayerName[socket.id], action, x, y)
    callback(actionResult)
    sendGameInfo(io, game)
  })
});
