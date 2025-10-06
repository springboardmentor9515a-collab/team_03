const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();

// Connect to database
connectDB();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    authentication: 'JWT + bcrypt secured'
  });
});

// bcrypt test endpoint
app.get('/api/test-bcrypt', async (req, res) => {
  try {
    const password = 'testpassword123';
    const hash = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare(password, hash);
    
    res.json({
      bcryptTest: 'Successful',
      correctPasswordMatch: isMatch,
      message: 'bcrypt is working correctly!'
    });
  } catch (error) {
    res.status(500).json({ error: 'bcrypt test failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Authentication server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
  (async () => {
    console.log(`Authentication server running on port ${PORT}`);
    // Await mongoose connection to be ready
    await mongoose.connection.asPromise();
    const dbState = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    console.log(`Database: ${dbState}`);
  })();
});
