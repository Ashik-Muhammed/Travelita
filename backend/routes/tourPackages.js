const express = require('express');
const router = express.Router();
const tourPackageController = require('../controllers/tourPackageController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const TourPackage = require('../models/TourPackage');

// Debug middleware to log request details
router.use((req, res, next) => {
  console.log('Tour Packages API - Request details:', {
    path: req.path,
    method: req.method,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? 'Bearer [HIDDEN]' : 'No Authorization header'
    },
    body: req.method === 'POST' || req.method === 'PUT' ? 'Request body present' : 'No request body'
  });
  next();
});

// Public routes
// Get all packages (with optional filtering and pagination)
router.get('/', tourPackageController.getPackages);

// Get featured packages (top-rated or budget-friendly)
router.get('/featured/:type', tourPackageController.getFeaturedPackages);

// Get packages by destination
router.get('/destination/:destination', tourPackageController.getPackagesByDestination);

// Get single package by ID
router.get('/:id', tourPackageController.getPackageById);

// Protected routes (require authentication)
// Create package with auth, role, and file upload
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['vendor', 'admin']),
  upload.array('images', 5),
  tourPackageController.createPackage
);

// Update package
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['vendor', 'admin']),
  upload.array('images', 5), // Support updating images
  tourPackageController.updatePackage
);

// Toggle package availability status
router.put(
  '/:id/toggle-status',
  authMiddleware,
  roleMiddleware(['vendor', 'admin']),
  tourPackageController.togglePackageStatus
);

// Delete package
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['vendor', 'admin']),
  tourPackageController.deletePackage
);

// Separate upload route for images
router.post(
  '/upload',
  authMiddleware,
  roleMiddleware(['vendor', 'admin']),
  upload.array('images', 5),
  (req, res) => {
    try {
      const imagePaths = req.files.map(file => file.filename);
      res.json({ 
        message: 'Images uploaded successfully',
        images: imagePaths 
      });
    } catch (err) {
      console.error('Image upload error:', err);
      res.status(500).json({ 
        message: 'Failed to upload images',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

module.exports = router;
