require('dotenv').config();
console.log('--- SERVER STARTUP: dotenv configured. ---');
console.log('--- SERVER STARTUP: JWT_SECRET from env:', process.env.JWT_SECRET ? 'SET' : 'NOT SET - Using fallback if any');
console.log('--- SERVER STARTUP: FIREBASE_CREDENTIALS from env:', process.env.FIREBASE_CREDENTIALS ? 'SET' : 'NOT SET - Using fallback if any');

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();

const db = require('./config/firebase'); // Import Firestore from config file

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

app.use((req, res, next) => {
  console.log(`--- EXPRESS VERY FIRST LOG: RAW REQUEST RECEIVED: ${req.method} ${req.originalUrl} from ${req.ip} ---`);
  console.log('--- EXPRESS VERY FIRST LOG: RAW REQUEST HEADERS:', JSON.stringify(req.headers, null, 2));
  next();
});

app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://ashik-muhammed.github.io',
    'https://ashik-muhammed.github.io/Travelita',
    'https://ashik-muhammed.github.io/travelita',
    'https://ashik-muhammed.github.io/Travelita/',
    'https://ashik-muhammed.github.io/travelita/'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    console.log('Unrecognized origin:', origin);
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

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Tour Package API is running!');
});

const seedRoutes = require('./routes/seed');
const authRoutes = require('./routes/auth');
const tourPackageRoutes = require('./routes/tourPackages');
const bookingRoutes = require('./routes/bookings');
const testRoutes = require('./routes/test');
const dashboardRoutes = require('./routes/dashboard');
const vendorRoutes = require('./routes/vendor');
const adminRoutes = require('./routes/admin');

app.use('/api/seed', seedRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/packages', tourPackageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/test', testRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);

app.post('/api/direct-bookings', async (req, res) => {
  try {
    console.log('--- [DIRECT-BOOKING] POST request received ---');
    console.log('--- [DIRECT-BOOKING] Request body:', req.body);
    
    const { userId, packageId } = req.body;
    if (!userId || !packageId) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: 'Both userId and packageId are required'
      });
    }

    const newBookingRef = db.collection('bookings').doc();

    await newBookingRef.set({
      userId,
      packageId,
      status: req.body.status || 'confirmed',
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      price: req.body.price
    });

    console.log('--- [DIRECT-BOOKING] Booking saved successfully ---');
    
    return res.status(201).json({
      message: 'Booking created successfully!',
      booking: { id: newBookingRef.id, ...req.body }
    });
  } catch (err) {
    console.error('--- [DIRECT-BOOKING] Error:', err);
    return res.status(500).json({
      message: 'Failed to create booking',
      details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
  }
});

app.get('/api/direct-bookings', async (req, res) => {
  try {
    console.log('--- [DIRECT-BOOKING] GET request received ---');
    const bookingsSnapshot = await db.collection('bookings').get();
    const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(bookings);
  } catch (err) {
    console.error('--- [DIRECT-BOOKING] Error fetching bookings:', err);
    return res.status(500).json({ message: 'Error fetching bookings' });
  }
});

app.get('/api/direct-bookings/user/:userId', async (req, res) => {
  try {
    const bookingsSnapshot = await db.collection('bookings').where('userId', '==', req.params.userId).get();
    const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(bookings);
  } catch (err) {
    console.error('--- [DIRECT-BOOKING] Error fetching user bookings:', err);
    return res.status(500).json({ message: 'Error fetching user bookings' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Travelita backend is running'
  });
});

app.use((err, req, res, next) => {
  console.error('--- EXPRESS GLOBAL ERROR HANDLER REACHED ---');
  console.error('--- ERROR NAME:', err.name);
  console.error('--- ERROR MESSAGE:', err.message);
  console.error('--- ERROR STACK:', err.stack);
  console.error('--- ERROR CODE (if any):', err.code);
  console.error('--- ERROR OBJECT:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  res.status(500).json({ message: 'Express Server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Express Server started on port ${PORT}`);
});
