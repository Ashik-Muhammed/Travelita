const admin = require('firebase-admin');
const db = admin.firestore(); // Firebase Firestore instance

// Get featured packages
exports.getFeaturedPackages = async (req, res) => {
  try {
    const type = req.params.type;
    const query = db.collection('tourPackages')
      .where('featured', '==', true)
      .where('status', '==', 'approved')
      .where('available', '==', true);

    let orderBy = 'ratings';
    if (type === 'budget') {
      orderBy = 'price';
    }

    const snapshot = await query.orderBy(orderBy, 'desc').limit(6).get();
    const packages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(packages);
  } catch (error) {
    console.error('Error fetching featured packages:', error);
    res.status(500).json({
      message: 'Error fetching featured packages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new tour package
exports.createPackage = async (req, res) => {
  try {
    console.log('Creating package with user:', req.user);
    const vendorId = req.user.id; // From auth middleware

    // Map uploaded images if any
    let images = [];
    if (req.files) {
      images = req.files.map(file => file.filename); // Assuming you are storing file names
    }

    // Parse included and itinerary if they are JSON strings
    let included = [];
    let itinerary = [];
    
    if (req.body.included) {
      try {
        included = JSON.parse(req.body.included);
      } catch (e) {
        console.error('Error parsing included:', e);
      }
    }
    
    if (req.body.itinerary) {
      try {
        itinerary = JSON.parse(req.body.itinerary);
      } catch (e) {
        console.error('Error parsing itinerary:', e);
      }
    }

    // Set expiry date if provided
    let expiryDate = null;
    if (req.body.expiryDays) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(req.body.expiryDays));
    }

    // Process boolean fields
    const available = req.body.available === 'true' || req.body.available === true;
    const featured = req.body.featured === 'true' || req.body.featured === true;

    // Create new package with correct field names
    const newPackageRef = db.collection('tourPackages').doc(); // Auto-generate a new document ID
    const newPackage = {
      title: req.body.title,
      description: req.body.description,
      destination: req.body.destination,
      duration: req.body.duration,
      price: req.body.price,
      vendorId: vendorId, // Using vendorId field instead of vendor
      included: included,
      itinerary: itinerary, 
      images: images,
      available: available,
      featured: featured,
      status: req.user.role === 'admin' ? 'approved' : 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Add creation timestamp
    };

    console.log('Saving package:', newPackage);
    await newPackageRef.set(newPackage);
    
    res.status(201).json({
      message: 'Package created successfully',
      package: { id: newPackageRef.id, ...newPackage }
    });
  } catch (err) {
    console.error('Create package error:', err);
    res.status(500).json({ 
      message: 'Failed to create package', 
      error: process.env.NODE_ENV === 'development' ? err.message : err.message
    });
  }
};

// Get all tour packages (with filters and pagination)
exports.getPackages = async (req, res) => {
  try {
    const { 
      destination, 
      minPrice, 
      maxPrice, 
      search,
      sortBy,
      sortOrder,
      limit = 10,
      page = 1
    } = req.query;

    // Build filter object
    let filter = { 
      available: true, 
      status: 'approved',
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: new Date() } }
      ]
    };

    if (destination) {
      filter.destination = { $regex: new RegExp(destination, 'i') };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
        { destination: { $regex: new RegExp(search, 'i') } }
      ];
    }

    // Build sort object
    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default: newest first
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute query with pagination
    const packageQuery = db.collection('tourPackages')
      .where('available', '==', true)
      .where('status', '==', 'approved')
      .limit(Number(limit))
      .offset(skip);

    const packageDocs = await packageQuery.get();
    const packages = packageDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get total count for pagination
    const totalQuery = db.collection('tourPackages')
      .where('available', '==', true)
      .where('status', '==', 'approved');
    const totalSnapshot = await totalQuery.get();
    const total = totalSnapshot.size;

    res.json({
      packages,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Get packages error:', err);
    res.status(500).json({ 
      message: 'Failed to fetch packages', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

// Get packages by destination
exports.getPackagesByDestination = async (req, res) => {
  try {
    const destination = req.params.destination;
    
    if (!destination) {
      return res.status(400).json({ message: 'Destination is required' });
    }

    const packagesSnapshot = await db.collection('tourPackages')
      .where('destination', '==', destination)
      .where('available', '==', true)
      .where('status', '==', 'approved')
      .get();

    const packages = packagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(packages);
  } catch (err) {
    console.error('Get packages by destination error:', err);
    res.status(500).json({ 
      message: 'Failed to fetch packages', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get a single package by ID
exports.getPackageById = async (req, res) => {
  try {
    const packageId = req.params.id;
    console.log(`Fetching package with ID: ${packageId}`);

    const packageDoc = await db.collection('tourPackages').doc(packageId).get();
    if (!packageDoc.exists) {
      console.log('Package not found');
      return res.status(404).json({ message: 'Package not found' });
    }
    
    console.log('Package found:', packageDoc.data().title);
    
    // Increment views count
    const packageData = packageDoc.data();
    packageData.views = (packageData.views || 0) + 1;
    await db.collection('tourPackages').doc(packageId).update({ views: packageData.views });

    res.json({ id: packageDoc.id, ...packageData });
  } catch (err) {
    console.error('Get package by ID error:', err);
    res.status(500).json({ 
      message: 'Failed to fetch package', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update package (only vendor or admin)
exports.updatePackage = async (req, res) => {
  try {
    const packageId = req.params.id;
    
    const packageDoc = await db.collection('tourPackages').doc(packageId).get();
    if (!packageDoc.exists) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const rawPackage = packageDoc.data();
    let vendorId = rawPackage.vendorId;

    if (vendorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to update this package' });
    }

    const updates = {};
    if (req.body.status) {
      updates.status = req.body.status;
    }

    // Handle other fields update (e.g., title, description, etc.)
    const updatableFields = ['title', 'description', 'destination', 'price', 'duration', 'available', 'featured'];
    updatableFields.forEach(field => {
      if (req.body[field]) {
        updates[field] = req.body[field];
      }
    });

    if (req.body.included) {
      try {
        updates.included = JSON.parse(req.body.included);
      } catch (e) {
        console.error('Error parsing included:', e);
      }
    }

    if (req.body.itinerary) {
      try {
        updates.itinerary = JSON.parse(req.body.itinerary);
      } catch (e) {
        console.error('Error parsing itinerary:', e);
      }
    }

    if (req.files && req.files.length > 0) {
      updates.images = req.files.map(file => file.filename);
    }

    if (Object.keys(updates).length > 0) {
      await db.collection('tourPackages').doc(packageId).update(updates);
    }

    res.json({ message: 'Package updated successfully', package: { id: packageId, ...updates } });
  } catch (err) {
    console.error('Update package error:', err);
    res.status(500).json({ 
      message: 'Failed to update package', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Delete package (only vendor or admin)
exports.deletePackage = async (req, res) => {
  try {
    const packageId = req.params.id;
    
    const packageDoc = await db.collection('tourPackages').doc(packageId).get();
    if (!packageDoc.exists) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const rawPackage = packageDoc.data();
    let vendorId = rawPackage.vendorId;

    if (vendorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this package' });
    }

    await db.collection('tourPackages').doc(packageId).delete();

    res.json({ message: 'Package deleted successfully' });
  } catch (err) {
    console.error('Delete package error:', err);
    res.status(500).json({ 
      message: 'Failed to delete package', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};
