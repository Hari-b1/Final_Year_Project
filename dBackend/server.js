
// server.js
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import api from './app/routes/api.js';
import { setupSignaling } from './app/sockets/signal.js';
import videoRoutes from './app/routes/videoRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create HTTP server using Express app
const server = http.createServer(app);

// Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


// Middleware
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// Routes
app.use('/api', api);
app.use('/api/v1', videoRoutes);

// Initialize Socket.io signaling
setupSignaling(io);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



