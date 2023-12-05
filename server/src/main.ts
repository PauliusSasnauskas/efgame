import { Server } from 'socket.io';

const io = new Server({ cors: { origin: '*' } });
io.listen(3001)

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit("welcome", "welcome indeed")
});
