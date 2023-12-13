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

function sendGameInfo(io: Server<ClientEvents, ServerEvents>, game: Game) {
  if (game.state === GameState.LOBBY) {
    io.emit('metaInfo', { gameState: game.state, players: game.listPlayers(), mapSize: game.mapSize, mapName: game.mapName, teams: game.teams })
  } else {
    io.emit('metaInfo', { gameState: game.state, players: game.listPlayers(), mapSize: game.mapSize, teams: game.teams, turnNumber: game.turnNumber, turn: game.turn })
    io.fetchSockets().then((sockets) => {
      sockets.forEach((socket) => {
        socket.emit('gameInfo', { map: game.getMapForPlayer(socketIdToPlayerName[socket.id]), stats: game.getStatsForPlayer(socketIdToPlayerName[socket.id])})
      })
    })
  }
}

game.addMessageListener((message) => {
  io.emit('chat', { text: message })
})

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id} ${socket.handshake.address}`);
  socket.emit("welcome", { name: 'efgame server', version: '2.0.0', gamemode: config.name, gamemodeVersion: config.version, motd: 'Welcome to the server!' })

  socket.on('disconnect', (reason) => {
    console.log(`[disconnect] ${socket.id} ${dcReasons[reason]}. ${socket.handshake.address}`)
    const player = game.removePlayer(socketIdToPlayerName[socket.id])
    io.emit('chat', { text: `${player?.name} disconnected.` })
    delete socketIdToPlayerName[socket.id]
    sendGameInfo(io, game)
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

    socketIdToPlayerName[socket.id] = name
    game.addPlayer(name, color)
    io.emit('chat', { text: `${name} connected.` })
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

  socket.on('startGame', () => {
    game.start()
    sendGameInfo(io, game)
  })

  socket.on('endTurn', () => {
    game.playerEndTurn(socketIdToPlayerName[socket.id])
    sendGameInfo(io, game)
  })

  socket.on('action', ({ action, x, y }) => {
    game.playerAction(socketIdToPlayerName[socket.id], action, x, y)
    sendGameInfo(io, game)
  })
});
