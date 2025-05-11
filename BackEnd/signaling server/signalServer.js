const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3001",  // allow your React app
        methods: ["GET", "POST"]
      }
});
const cors = require('cors');

app.use(cors());
app.get('/', (req, res) => {
    console.log('Hello there!');
});


io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('message', (message) => {
        console.log('Message received:', message);
    })

    setInterval(() => {
        socket.emit('message', "Welcome to express");
        console.log('Message sent to client');
    }, 5000);
});



server.listen(3000, () => (console.log('server started running on http://localhost:3000')));

