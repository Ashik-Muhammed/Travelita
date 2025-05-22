require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://ashik-muhammed.github.io'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - [BOOKING-SERVER] ${req.method} ${req.url}`);
  next();
});

// Create a schema for tour bookings
const tourBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    default: 'confirmed'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  customerName: String,
  customerEmail: String,
  price: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the model
const TourBooking = mongoose.model('TourBooking', tourBookingSchema, 'tour_bookings');

// Test route
app.get('/', (req, res) => {
  res.send('Booking Server API is running!');
});

// Booking routes
app.post('/api/bookings', async (req, res) => {
  try {
    console.log('--- [BOOKING-SERVER] POST request received ---');
    console.log('--- [BOOKING-SERVER] Request body:', req.body);
    
    const { userId, packageId } = req.body;
    if (!userId || !packageId) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: 'Both userId and packageId are required'
      });
    }

    const newBooking = new TourBooking({
      userId,
      packageId,
      status: req.body.status || 'confirmed',
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      price: req.body.price
    });

    console.log('--- [BOOKING-SERVER] Saving booking ---');
    const savedBooking = await newBooking.save();
    console.log('--- [BOOKING-SERVER] Booking saved successfully ---');
    
    return res.status(201).json({
      message: 'Booking created successfully!',
      booking: savedBooking
    });
  } catch (err) {
    console.error('--- [BOOKING-SERVER] Error:', err);
    return res.status(500).json({
      message: 'Failed to create booking',
      details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    console.log('--- [BOOKING-SERVER] GET all bookings request received ---');
    const bookings = await TourBooking.find({});
    return res.json(bookings);
  } catch (err) {
    console.error('--- [BOOKING-SERVER] Error fetching bookings:', err);
    return res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    console.log(`--- [BOOKING-SERVER] GET bookings for user ${req.params.userId} ---`);
    const bookings = await TourBooking.find({ userId: req.params.userId });
    return res.json(bookings);
  } catch (err) {
    console.error('--- [BOOKING-SERVER] Error fetching user bookings:', err);
    return res.status(500).json({ message: 'Error fetching user bookings' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('--- [BOOKING-SERVER] ERROR:', err);
  res.status(500).json({ 
    message: 'Booking server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

const PORT = 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tour-packages';

// Connect to MongoDB
const connectWithRetry = async () => {
  try {
    console.log('[BOOKING-SERVER] Attempting to connect to MongoDB...');
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('[BOOKING-SERVER] Connected to MongoDB successfully');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`[BOOKING-SERVER] Server started on port ${PORT}`);
    });

  } catch (err) {
    console.error('[BOOKING-SERVER] MongoDB connection error:', err);
    console.log('[BOOKING-SERVER] Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Start server
connectWithRetry(); 