import { Server } from 'socket.io';

let ioInstance = null;

export function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', (socket) => {
    // Join room
    socket.on('join-room', ({ roomId, user }) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', { userId: socket.id, user });
    });

    // Relay WebRTC offer/answer/candidates
    socket.on('signal', ({ roomId, signal, userId }) => {
      socket.to(roomId).emit('signal', { signal, userId: socket.id });
    });

    // Leave room
    socket.on('leave-room', ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { userId: socket.id });
    });

    socket.on('disconnecting', () => {
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) {
          socket.to(roomId).emit('user-left', { userId: socket.id });
        }
      }
    });
  });

  return ioInstance;
}

export function getIO() {
  if (!ioInstance) throw new Error('Socket.io not initialized!');
  return ioInstance;
}
