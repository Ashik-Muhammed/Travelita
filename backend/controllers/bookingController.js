const mongoose = require('mongoose');
const Booking = require('../models/booking');
const TourPackage = require('../models/TourPackage');

exports.createBooking = async (req, res) => {
  console.log('--- [CONTROLLER] createBooking function reached ---');
  try {
    // Verify MongoDB connection first
    if (mongoose.connection.readyState !== 1) {
      console.error('--- [CONTROLLER] MongoDB connection error: Not connected ---');
      return res.status(500).json({
        message: 'Database connection error',
        details: 'Please try again later'
      });
    }

    console.log('--- [CONTROLLER] MongoDB connection status: Connected ---');
    console.log('--- [CONTROLLER] Booking request details:', {
      headers: {
        ...req.headers,
        authorization: req.headers.authorization ? 'Bearer [HIDDEN]' : undefined
      },
      body: req.body,
      user: req.user, // This is set by authMiddleware
    });

    // Validate user authentication
    if (!req.user || !req.user.userId) {
      console.error('--- [CONTROLLER] Authentication error: No user ID in request. req.user:', req.user);
      return res.status(401).json({ 
        message: 'User not authenticated',
        details: 'Please log in to make a booking'
      });
    }

    const userId = req.user.userId; // Changed from req.user.id to req.user.userId
    console.log(`--- [CONTROLLER] User ID from token: ${userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`--- [CONTROLLER] Invalid User ID format: ${userId}`);
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    // The frontend sends `tourPackage` in the body
    const tourPackageId = req.body.tourPackage; 
    console.log(`--- [CONTROLLER] Package ID from request: ${tourPackageId}`);

    if (!tourPackageId) {
      console.error('--- [CONTROLLER] Validation error: No tour package ID in request body');
      return res.status(400).json({ 
        message: 'Tour package ID is required',
        details: 'Please provide a valid tour package ID'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tourPackageId)) {
      console.error(`--- [CONTROLLER] Validation error: Invalid Tour Package ID format: ${tourPackageId}`);
      return res.status(400).json({ message: 'Invalid Tour Package ID format' });
    }

    console.log(`--- [CONTROLLER] Attempting to find package with ID: ${tourPackageId}`);
    // Find the tour package
    let tourPackage;
    try {
      tourPackage = await TourPackage.findById(tourPackageId);
      console.log(`--- [CONTROLLER] Package found:`, tourPackage ? 'Yes' : 'No');
    } catch (err) {
      console.error(`--- [CONTROLLER] Error finding package: ${err.message}`);
      return res.status(500).json({ 
        message: 'Error finding tour package',
        details: err.message
      });
    }

    if (!tourPackage) {
      console.error(`--- [CONTROLLER] Validation error: Tour package not found for ID: ${tourPackageId}`);
      return res.status(404).json({ message: 'Tour package not found' });
    }

    // Check if package is available and approved
    if (!tourPackage.available) {
      console.error(`--- [CONTROLLER] Validation error: Tour package ${tourPackageId} is not available.`);
      return res.status(400).json({ message: 'This tour package is currently not available for booking.' });
    }
    if (tourPackage.status !== 'approved') {
        console.error(`--- [CONTROLLER] Validation error: Tour package ${tourPackageId} is not approved for booking (status: ${tourPackage.status}).`);
        return res.status(400).json({ message: 'This tour package is not yet approved for booking.' });
    }
    
    // Create new booking
    console.log(`--- [CONTROLLER] Creating new booking with user: ${userId}, package: ${tourPackageId}`);
    try {
      const newBooking = new Booking({
        user: userId,
        package: tourPackageId, // In Booking model, the field is 'package'
        status: 'confirmed',
      });

      console.log(`--- [CONTROLLER] Saving booking to database:`, newBooking);
      await newBooking.save();
      console.log('--- [CONTROLLER] New booking saved successfully ---');

      // Increment bookings count on the tour package
      console.log(`--- [CONTROLLER] Updating package bookings count ---`);
      tourPackage.bookings = (tourPackage.bookings || 0) + 1;
      await tourPackage.save();
      console.log(`--- [CONTROLLER] Tour package ${tourPackageId} bookings count updated ---`);

      return res.status(201).json({
        message: 'Booking created successfully!',
        booking: newBooking
      });
    } catch (saveErr) {
      console.error(`--- [CONTROLLER] Error saving booking:`, {
        error: saveErr.message,
        code: saveErr.code,
        name: saveErr.name
      });
      
      // Check for duplicate key error (code 11000)
      if (saveErr.code === 11000) {
        return res.status(400).json({ 
          message: 'Duplicate booking',
          details: 'You have already booked this package'
        });
      }
      
      // Check for validation errors
      if (saveErr.name === 'ValidationError') {
        const validationErrors = Object.values(saveErr.errors).map(e => e.message);
        return res.status(400).json({ 
          message: 'Validation error',
          details: validationErrors.join(', ')
        });
      }
      
      throw saveErr; // Re-throw to be caught by the outer catch block
    }
  } catch (err) {
    console.error('--- [CONTROLLER] Unexpected error in createBooking !!!:', {
      error: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      requestBody: req.body,
      userId: req.user?.userId,
      tourPackageId: req.body?.tourPackage 
    });
    
    return res.status(500).json({ 
      message: 'Failed to process booking request due to server error',
      details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
  }
};

// We can add getUserBookings later if needed
// exports.getUserBookings = async (req, res) => { ... }; 