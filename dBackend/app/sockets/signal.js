// app/signaling/signaling-structured.js
import { RoomManager } from './roomManager.js';

export function setupSignaling(io) {
  const roomManager = new RoomManager();
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Setup event handlers
    setupRoomHandlers(socket, io, roomManager);
    setupWebRTCHandlers(socket, io);
    setupDisconnectHandler(socket, io, roomManager);
  });
}

function setupRoomHandlers(socket, io, roomManager) {
  socket.on('join-room', (roomId) => {
    console.log(`User ${socket.id} joining room: ${roomId}`);
    
    const usersInRoom = roomManager.joinRoom(socket.id, roomId);
    
    // Let the user know about other users in the room
    socket.emit('all-users', usersInRoom);
  });
}

function setupWebRTCHandlers(socket, io) {
  // Handle WebRTC offer - supports both single target and array of targets
  socket.on('offer', (payload) => {
    const { target, sdp } = payload;
    
    // Broadcast to multiple targets if target is an array
    if (Array.isArray(target)) {
      target.forEach(targetId => {
        io.to(targetId).emit('offer', {
          sdp: sdp,
          caller: socket.id
        });
      });
    } else {
      // Single target case
      io.to(target).emit('offer', {
        sdp: sdp,
        caller: socket.id
      });
    }
  });

  // Handle WebRTC answer - supports both single target and array of targets
  socket.on('answer', (payload) => {
    const { target, sdp } = payload;
    
    // Broadcast to multiple targets if target is an array
    if (Array.isArray(target)) {
      target.forEach(targetId => {
        io.to(targetId).emit('answer', {
          sdp: sdp,
          answerer: socket.id
        });
      });
    } else {
      // Single target case
      io.to(target).emit('answer', {
        sdp: sdp,
        answerer: socket.id
      });
    }
  });

  // Handle ICE candidates - supports both single target and array of targets
  socket.on('ice-candidate', (payload) => {
    const { target, candidate } = payload;
    
    // Broadcast to multiple targets if target is an array
    if (Array.isArray(target)) {
      target.forEach(targetId => {
        io.to(targetId).emit('ice-candidate', {
          candidate: candidate,
          sender: socket.id
        });
      });
    } else {
      // Single target case
      io.to(target).emit('ice-candidate', {
        candidate: candidate,
        sender: socket.id
      });
    }
  });
}

function setupDisconnectHandler(socket, io, roomManager) {
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    const result = roomManager.leaveRoom(socket.id);
    if (result) {
      const { roomId, remainingUsers } = result;
      
      // Notify others that user left
      remainingUsers.forEach(userId => {
        io.to(userId).emit('user-disconnected', socket.id);
      });
    }
  });
}