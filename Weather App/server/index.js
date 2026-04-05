require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api', require('./routes/api'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', message: 'Weather API Server Running' }));

// MongoDB connection + Server start
const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected');
    } else {
      console.warn('⚠️  MONGODB_URI not set — search history disabled');
    }
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed — search history disabled:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`🌤  Weather API server running on http://localhost:${PORT}`);
  });
};

startServer();
