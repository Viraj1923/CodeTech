const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const mongoose   = require('mongoose');
const cors       = require('cors');
const Message    = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

// ── Connect MongoDB ──────────────────────────────────────
mongoose.connect('mongodb://localhost:27017/chatapp')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// ── REST endpoint: fetch room history ───────────────────
app.get('/api/messages/:room', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .sort({ time: 1 })
      .limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ── Socket.IO ────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room + send history from MongoDB
  socket.on('join_room', async ({ room, user }) => {
    socket.join(room);
    socket.to(room).emit('user_joined', { user, room });

    // Fetch last 50 messages and send ONLY to this socket
    try {
      const history = await Message.find({ room })
        .sort({ time: 1 })
        .limit(50);
      socket.emit('chat_history', history);
    } catch (err) {
      console.error('History fetch error:', err);
    }
  });

  // Save to MongoDB, then broadcast
  socket.on('send_message', async ({ room, message, sender }) => {
    try {
      const saved = await Message.create({ sender, message, room });

      io.to(room).emit('receive_message', {
        _id:     saved._id,
        sender:  saved.sender,
        message: saved.message,
        room:    saved.room,
        time:    saved.time
      });
    } catch (err) {
      socket.emit('error', { message: 'Message failed to save' });
    }
  });

  // Typing indicators
  socket.on('typing',      ({ room, user }) => socket.to(room).emit('typing', { user }));
  socket.on('stop_typing', ({ room })       => socket.to(room).emit('stop_typing'));

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => console.log('Server running on http://localhost:5000'));