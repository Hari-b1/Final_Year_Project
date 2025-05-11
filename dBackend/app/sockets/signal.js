import { RoomManager } from './roomManager.js';

export function setupSignaling(io) {
  const roomManager = new RoomManager();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
      console.log(`User ${socket.id} joining room: ${roomId}`);
      const users = roomManager.joinRoom(socket.id, roomId);
      socket.join(roomId);
      // Send existing users to the joining socket, excluding self
      const otherUsers = users.filter(id => id !== socket.id);
      console.log(`Sending all-users to ${socket.id}:`, otherUsers);
      socket.emit('all-users', otherUsers);
      // Notify other users of the new user
      console.log(`Notifying room ${roomId} of new user: ${socket.id}`);
      socket.to(roomId).emit('user-joined', socket.id);
    });

    socket.on('offer', (payload) => {
      const { target, sdp, roomId } = payload;
      console.log(`Received offer from ${socket.id} for ${target} in room ${roomId}`);
      if (target === socket.id) {
        console.warn(`Ignoring offer from ${socket.id} to self`);
        return;
      }
      if (!roomManager.isUserInRoom(target, roomId)) {
        console.warn(`Target ${target} not in room ${roomId}`);
        return;
      }
      console.log(`Relaying offer from ${socket.id} to ${target}`);
      io.to(target).emit('offer', { sdp, caller: socket.id });
    });

    socket.on('answer', (payload) => {
      const { target, sdp, roomId } = payload;
      console.log(`Received answer from ${socket.id} for ${target} in room ${roomId}`);
      if (target === socket.id) {
        console.warn(`Ignoring answer from ${socket.id} to self`);
        return;
      }
      if (!roomManager.isUserInRoom(target, roomId)) {
        console.warn(`Target ${target} not in room ${roomId}`);
        return;
      }
      console.log(`Relaying answer from ${socket.id} to ${target}`);
      io.to(target).emit('answer', { sdp, answerer: socket.id });
    });

    socket.on('ice-candidate', (payload) => {
      const { target, candidate, roomId } = payload;
      console.log(`Received ICE candidate from ${socket.id} for ${target} in room ${roomId}`);
      if (target === socket.id) {
        console.warn(`Ignoring ICE candidate from ${socket.id} to self`);
        return;
      }
      if (!roomManager.isUserInRoom(target, roomId)) {
        console.warn(`Target ${target} not in room ${roomId}`);
        return;
      }
      console.log(`Relaying ICE candidate from ${socket.id} to ${target}`);
      io.to(target).emit('ice-candidate', { candidate, sender: socket.id });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      const { roomId, remainingUsers } = roomManager.leaveRoom(socket.id) || {};
      if (roomId && remainingUsers) {
        console.log(`Notifying room ${roomId} of disconnected user: ${socket.id}`);
        remainingUsers.forEach(userId => {
          io.to(userId).emit('user-disconnected', socket.id);
        });
      }
    });
  });
}