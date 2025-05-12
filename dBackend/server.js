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
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    transports: ['websocket', 'polling']
  },
  allowEIO3: true
});

// Middleware - CORS must be first!
app.use(cors({
  origin: true, // This will reflect the request origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"]
}));

app.use(express.json());
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



