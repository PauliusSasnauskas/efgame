import { DisconnectReason, Server } from 'socket.io';

const io = new Server({ cors: { origin: '*' } });
io.listen(3001)

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

io.on('connection', (socket) => {
  socket.on('disconnect', (reason) => {
    console.log(`[disconnect] ${socket.id} ${dcReasons[reason]}. ${socket.handshake.address}`)
  })

  console.log(`[connect] ${socket.id} ${socket.handshake.address}`);
  socket.emitWithAck("welcome", "welcome indeed")

  socket.on('chat', (message) => {
    console.log(`<${socket.handshake.address}> ${message}`)
    io.emit('chat', { from: socket.id, text: message })
  })

});
