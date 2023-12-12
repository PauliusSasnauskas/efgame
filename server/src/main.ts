import { DisconnectReason, Server } from 'socket.io';
import Game from './Game';
import { ClientEvents, GameState, ServerEvents } from 'common/src/SocketSpec'
import config from './Config'

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

const port = 3001

const game = new Game();

const io = new Server<ClientEvents, ServerEvents>({ cors: { origin: '*' } });
io.listen(port)
console.log(`Started server on port ${port}`)

const socketIdToPlayerName: {[k: string]: string} = {}

function sendGameInfo(io: Server<ClientEvents, ServerEvents>, game: Game) {
  if (game.state === GameState.LOBBY) {
    io.emit('metaInfo', { gameState: game.state, players: game.listPlayers(), mapSize: game.mapSize, mapName: game.mapName, numTeams: game.teams.length })
  } else {
    io.emit('metaInfo', { gameState: game.state, players: game.listPlayers(), mapSize: game.mapSize, numTeams: game.teams.length, turnNumber: game.turnNumber, turn: game.turn })
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

  socket.on('chat', (message) => {
    console.log(`<${socket.handshake.address}> ${message}`)
    const player = game.getPlayer(socketIdToPlayerName[socket.id])
    io.emit('chat', { from: player?.name ?? 'unknown', fromColor: player?.color, text: message })
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
