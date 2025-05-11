// app/signaling/roomManager.js
export class RoomManager {
  constructor() {
    this.rooms = {}; // roomID -> array of socket IDs
    this.socketToRoom = {}; // socketID -> roomID
  }

  joinRoom(socketId, roomId) {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = [];
    }
    
    this.rooms[roomId].push(socketId);
    this.socketToRoom[socketId] = roomId;
    
    return this.getUsersInRoom(roomId, socketId);
  }
  
  getUsersInRoom(roomId, exceptSocketId = null) {
    const room = this.rooms[roomId] || [];
    if (exceptSocketId) {
      return room.filter(id => id !== exceptSocketId);
    }
    return [...room];
  }
  
  leaveRoom(socketId) {
    const roomId = this.socketToRoom[socketId];
    if (!roomId) return null;
    
    let room = this.rooms[roomId];
    if (room) {
      room = room.filter(id => id !== socketId);
      this.rooms[roomId] = room.length > 0 ? room : null;
      
      if (!room.length) {
        delete this.rooms[roomId];
      }
    }
    
    delete this.socketToRoom[socketId];
    return { roomId, remainingUsers: room || [] };
  }
  
  getRoomBySocketId(socketId) {
    const roomId = this.socketToRoom[socketId];
    return roomId ? this.rooms[roomId] : null;
  }
}