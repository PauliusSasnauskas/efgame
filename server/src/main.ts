import { DisconnectReason, Server } from 'socket.io';
import Game from './Game';
import { ClientEvents, ServerEvents } from 'common/src/SocketSpec'
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

const socketIdToPlayerId: {[k: string]: number} = {}
let nextPlayerId = 0

function sendGameInfo(io: Server<ClientEvents, ServerEvents>, game: Game) {
  io.emit('gameInfo', { gameState: game.state, players: game.listPlayers() })
}

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id} ${socket.handshake.address}`);
  socket.emit("welcome", { name: 'efgame server', version: '2.0.0', gamemode: config.name, gamemodeVersion: config.version, motd: 'Welcome to the server!' })


  socket.on('disconnect', (reason) => {
    console.log(`[disconnect] ${socket.id} ${dcReasons[reason]}. ${socket.handshake.address}`)
    const player = game.removePlayer(socketIdToPlayerId[socket.id])
    io.emit('chat', { text: `${player?.name} disconnected.` })
    delete socketIdToPlayerId[socket.id]
    sendGameInfo(io, game)
  })

  socket.on('welcome', ({ name, color }) => {
    if (socket.id in socketIdToPlayerId) {
      console.log('Socket ID taken?')
      return
    }
    const playerId = nextPlayerId
    nextPlayerId += 1

    socketIdToPlayerId[socket.id] = playerId
    game.addPlayer(playerId, name, color)
    io.emit('chat', { text: `${name} connected.` })
    sendGameInfo(io, game)
  })

  socket.on('chat', (message) => {
    console.log(`<${socket.handshake.address}> ${message}`)
    const player = game.getPlayer(socketIdToPlayerId[socket.id])
    io.emit('chat', { from: player?.name ?? 'unknown', fromColor: player?.color, text: message })
  })
});
