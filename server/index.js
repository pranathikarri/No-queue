const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize SQLite Connection
connectDB();

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_shop', (shopId) => {
    socket.join(shopId);
  });

  socket.on('queue_updated', (shopId) => {
    io.to(shopId).emit('update_status');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API Routes
app.use('/api/queue', require('./routes/queueRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/org', require('./routes/orgRoutes'));

// Basic Routes
app.get('/', (req, res) => {
  res.send('NoQueue API (SQLite version) is running');
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Database: SQLite (local file)`);
});
