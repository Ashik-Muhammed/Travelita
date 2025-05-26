import { rtdb } from '../config/firebase';
import { 
  ref, 
  set, 
  push, 
  get, 
  update, 
  remove, 
  query, 
  orderByChild, 
  equalTo, 
  limitToFirst, 
  limitToLast, 
  child,
  serverTimestamp
} from 'firebase/database';
import { getFallbackImage } from '../utils/imageUtils';

// Simple in-memory cache for package data
const packageCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Create a new tour package
export const createPackage = async (packageData, imageFiles) => {
  try {
    // For Realtime Database, we'll store image URLs as strings
    // In a production app, you would use a different service for image storage
    // or implement base64 encoding for small images
    const imageUrls = [];
    if (imageFiles && imageFiles.length > 0) {
      // For demo purposes, we'll just use placeholder image URLs
      // In a real app, you would integrate with a service like Cloudinary or Imgur
      for (const file of imageFiles) {
        // This is a placeholder. In production, implement proper image handling
        imageUrls.push(`https://via.placeholder.com/300?text=${encodeURIComponent(file.name)}`);
      }
    }

    // Process included and itinerary if they are strings
    let included = packageData.included || [];
    let itinerary = packageData.itinerary || [];
    
    if (typeof included === 'string') {
      try {
        included = JSON.parse(included);
      } catch (e) {
        console.error('Error parsing included:', e);
      }
    }
    
    if (typeof itinerary === 'string') {
      try {
        itinerary = JSON.parse(itinerary);
      } catch (e) {
        console.error('Error parsing itinerary:', e);
      }
    }

    // Set expiry date if provided
    let expiryDate = null;
    if (packageData.expiryDays) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(packageData.expiryDays));
    }

    // Create new package
    const newPackage = {
      title: packageData.title,
      description: packageData.description,
      destination: packageData.destination,
      duration: packageData.duration,
      price: packageData.price,
      vendorId: packageData.vendorId,
      included: included,
      itinerary: itinerary, 
      images: imageUrls,
      available: packageData.available === true || packageData.available === 'true',
      featured: packageData.featured === true || packageData.featured === 'true',
      status: packageData.isAdmin ? 'approved' : 'pending',
      createdAt: Date.now(), // Use timestamp for Realtime Database
      views: 0,
      ratings: 0
    };

    // Use Realtime Database to store the package
    const packagesRef = ref(rtdb, 'tourPackages');
    const newPackageRef = push(packagesRef);
    await set(newPackageRef, newPackage);
    
    // Return the created package with its ID
    return { id: newPackageRef.key, ...newPackage };
  } catch (error) {
    console.error('Create package error:', error);
    throw error;
  }
};

// Get all tour packages with filters and pagination
export const getPackages = async (filters = {}, page = 1, pageSize = 10) => {
  try {
    const { 
      destination, 
      minPrice, 
      maxPrice, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    // Reference to tour packages in Realtime Database
    const packagesRef = ref(rtdb, 'tourPackages');
    
    // Get all packages first (we'll filter in memory)
    const snapshot = await get(packagesRef);
    
    if (!snapshot.exists()) {
      return { packages: [], total: 0, currentPage: page, totalPages: 0 };
    }
    
    // Convert snapshot to array
    let packages = [];
    snapshot.forEach((childSnapshot) => {
      const pkg = { id: childSnapshot.key, ...childSnapshot.val() };
      packages.push(pkg);
    });
    
    // Apply status filter if provided
    if (filters.status) {
      packages = packages.filter(pkg => pkg.status === filters.status);
    }
    
    // Get total count before pagination
    const total = packages.length;
    
    // Apply sorting
    packages.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b[sortBy] - a[sortBy];
      } else {
        return a[sortBy] - b[sortBy];
      }
    });
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    packages = packages.slice(startIndex, startIndex + pageSize);

    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize);

    // Filter by price and search client-side
    let filteredPackages = packages;
    
    if (minPrice || maxPrice) {
      filteredPackages = filteredPackages.filter(pkg => {
        const price = Number(pkg.price);
        if (minPrice && maxPrice) {
          return price >= Number(minPrice) && price <= Number(maxPrice);
        } else if (minPrice) {
          return price >= Number(minPrice);
        } else if (maxPrice) {
          return price <= Number(maxPrice);
        }
        return true;
      });
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredPackages = filteredPackages.filter(pkg => 
        pkg.title.toLowerCase().includes(searchLower) ||
        pkg.description.toLowerCase().includes(searchLower) ||
        pkg.destination.toLowerCase().includes(searchLower)
      );
    }

    return {
      packages: filteredPackages,
      pagination: {
        total,
        page: Number(page),
        limit: Number(pageSize),
        pages: Math.ceil(total / Number(pageSize))
      }
    };
  } catch (error) {
    console.error('Get packages error:', error);
    throw error;
  }
};

// Get featured packages
export const getFeaturedPackages = async (type = 'top') => {
  try {
    // Get reference to the tourPackages node in Realtime Database
    const packagesRef = ref(rtdb, 'tourPackages');
    
    // Get all packages first (Realtime Database has limited query capabilities)
    const snapshot = await get(packagesRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    // Convert the snapshot to an array of packages with their IDs
    const allPackages = [];
    snapshot.forEach((childSnapshot) => {
      const packageData = childSnapshot.val();
      if (packageData.featured && packageData.status === 'approved') {
        allPackages.push({
          id: childSnapshot.key,
          ...packageData
        });
      }
    });
    
    // Sort the packages based on the type parameter
    if (type === 'budget') {
      allPackages.sort((a, b) => a.price - b.price);
    } else {
      // Default to 'top' - sort by ratings
      allPackages.sort((a, b) => b.ratings - a.ratings);
    }
    
    // Return only the first 6 packages
    return allPackages.slice(0, 6);
  } catch (error) {
    console.error('Get featured packages error:', error);
    throw error;
  }
};

// Get packages by destination
export const getPackagesByDestination = async (destination) => {
  try {
    if (!destination) {
      throw new Error('Destination is required');
    }

    // Get reference to the tourPackages node in Realtime Database
    const packagesRef = ref(rtdb, 'tourPackages');
    const snapshot = await get(packagesRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    // Filter packages by destination, availability, and status
    const packages = [];
    snapshot.forEach((childSnapshot) => {
      const packageData = childSnapshot.val();
      if (packageData.destination === destination && 
          packageData.status === 'approved') {
        packages.push({
          id: childSnapshot.key,
          ...packageData
        });
      }
    });

    return packages;
  } catch (error) {
    console.error('Get packages by destination error:', error);
    throw error;
  }
};

// Get a single package by ID
export const getPackageById = async (packageId) => {
  // Validate packageId to prevent unnecessary API calls
  if (!packageId || packageId === 'undefined' || packageId === 'null') {
    console.log('Invalid package ID provided:', packageId);
    return createFallbackPackage('invalid-id');
  }
  
  // Check cache first
  const cached = packageCache.get(packageId);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log('Returning cached package:', packageId);
    return cached.data;
  }

  try {
    console.log(`Attempting to fetch package with ID: ${packageId}`);
    
    // First try direct lookup by ID
    const packageRef = ref(rtdb, `tourPackages/${packageId}`);
    let snapshot = await get(packageRef);
    let updatedViews = 0;
    
    // If not found, try to search across all packages
    if (!snapshot.exists()) {
      console.log(`Package not found with direct ID lookup, trying search...`);
      
      // Get all packages
      const allPackagesRef = ref(rtdb, 'tourPackages');
      const allPackagesSnapshot = await get(allPackagesRef);
      
      if (allPackagesSnapshot.exists()) {
        const allPackages = allPackagesSnapshot.val();
        
        // Try to find the package by ID in any format (key or custom ID field)
        for (const [key, pkg] of Object.entries(allPackages)) {
          if (key === packageId || (pkg.id && pkg.id === packageId)) {
            console.log(`Found package with key: ${key}`);
            snapshot = { exists: () => true, val: () => pkg, key };
            break;
          }
        }
      }
    }
    
    if (!snapshot.exists()) {
      console.log(`Package not found: ${packageId}`);
      // Return a fallback package for demo purposes
      return createFallbackPackage(packageId);
    }
    
    const packageData = snapshot.val();
    
    // Increment views count
    try {
      updatedViews = (packageData.views || 0) + 1;
      await update(packageRef, { views: updatedViews });
    } catch (viewsError) {
      console.warn('Could not update views count:', viewsError.message || viewsError);
      // Continue anyway - views count is not critical
      updatedViews = packageData.views || 0;
    }

    // Process images to ensure they're valid
    let processedImages = [];
    
    if (packageData.images) {
      // If images is an array, process each one
      if (Array.isArray(packageData.images)) {
        processedImages = packageData.images.map(img => {
          // If the image is an object with a url property, use that
          if (typeof img === 'object' && img.url) {
            return getFallbackImage(img.url, 'travel', '800x600');
          }
          // Otherwise, use the image directly
          return getFallbackImage(img, 'travel', '800x600');
        });
      } 
      // If it's a single image (string)
      else if (typeof packageData.images === 'string') {
        processedImages = [getFallbackImage(packageData.images, 'travel', '800x600')];
      }
    }
    
    // If no valid images were found, use a fallback
    if (processedImages.length === 0) {
      processedImages = createFallbackPackage().images;
    }

    const result = { 
      id: packageId, 
      ...packageData,
      images: processedImages,
      views: updatedViews
    };

    // Cache the result
    packageCache.set(packageId, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (err) {
    console.error('Get package by ID error:', err.message || 'Unknown error');
    // Return a fallback package instead of throwing an error
    const fallback = createFallbackPackage(packageId);
    packageCache.set(packageId, {
      data: fallback,
      timestamp: Date.now()
    });
    return fallback;
  }
};

// Create a fallback package for demo purposes
const createFallbackPackage = (packageId) => {
  console.log(`Creating fallback package for ID: ${packageId}`);
  return {
    id: packageId,
    title: 'Sample Tour Package',
    description: 'This is a sample tour package created as a fallback when the requested package could not be found.',
    destination: 'Popular Destination',
    duration: '3 Days / 2 Nights',
    price: 15000,
    available: true,
    featured: true,
    views: 0,
    rating: 4.5,
    vendorId: 'system', // Add a default vendorId for fallback packages
    included: [
      'Accommodation in 3-star hotels',
      'Daily breakfast and dinner',
      'Transportation in AC vehicle',
      'Sightseeing as per itinerary',
      'Professional tour guide'
    ],
    itinerary: [
      {
        title: 'Day 1',
        description: 'Arrival and welcome. Check-in to hotel. Evening free for leisure activities.'
      },
      {
        title: 'Day 2',
        description: 'Full day sightseeing tour of major attractions. Lunch at local restaurant.'
      },
      {
        title: 'Day 3',
        description: 'Morning at leisure. Check-out and departure with wonderful memories.'
      }
    ],
    images: [
      'https://source.unsplash.com/random/800x600/?travel,destination,1',
      'https://source.unsplash.com/random/800x600/?travel,destination,2',
      'https://source.unsplash.com/random/800x600/?travel,destination,3',
      'https://source.unsplash.com/random/800x600/?travel,destination,4'
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
};

// Update a tour package
export const updatePackage = async (packageId, updates, imageFiles, userId, isAdmin) => {
  try {
    // Get existing package
    const packageDoc = await getDoc(doc(db, 'tourPackages', packageId));
    
    if (!packageDoc.exists()) {
      throw new Error('Package not found');
    }
    
    const packageData = packageDoc.data();
    
    // Check permissions
    if (packageData.vendorId !== userId && !isAdmin) {
      throw new Error('You do not have permission to update this package');
    }
    
    // Upload new images if provided
    let imageUrls = packageData.images || [];
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        const storageRef = ref(storage, `packages/${Date.now()}_${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(uploadResult.ref);
        imageUrls.push(downloadUrl);
      }
    }
    
    // Process included and itinerary if they are strings
    let included = updates.included || packageData.included || [];
    let itinerary = updates.itinerary || packageData.itinerary || [];
    
    if (typeof included === 'string') {
      try {
        included = JSON.parse(included);
      } catch (e) {
        console.error('Error parsing included:', e);
      }
    }
    
    if (typeof itinerary === 'string') {
      try {
        itinerary = JSON.parse(itinerary);
      } catch (e) {
        console.error('Error parsing itinerary:', e);
      }
    }
    
    // Create update object
    const updateData = {
      ...updates,
      included,
      itinerary,
      images: imageUrls,
      updatedAt: serverTimestamp()
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    // Update package
    await updateDoc(doc(db, 'tourPackages', packageId), updateData);
    
    // Get updated package
    const updatedDoc = await getDoc(doc(db, 'tourPackages', packageId));
    
    return { 
      id: updatedDoc.id, 
      ...updatedDoc.data(),
      createdAt: updatedDoc.data().createdAt?.toDate(),
      updatedAt: updatedDoc.data().updatedAt?.toDate(),
      expiryDate: updatedDoc.data().expiryDate?.toDate()
    };
  } catch (error) {
    console.error('Update package error:', error);
    throw error;
  }
};

// Delete a tour package
export const deletePackage = async (packageId, userId, isAdmin) => {
  try {
    // Get package to check permissions
    const packageDoc = await getDoc(doc(db, 'tourPackages', packageId));
    
    if (!packageDoc.exists()) {
      throw new Error('Package not found');
    }
    
    const packageData = packageDoc.data();
    
    // Check permissions
    if (packageData.vendorId !== userId && !isAdmin) {
      throw new Error('You do not have permission to delete this package');
    }
    
    // Delete images from storage
    if (packageData.images && packageData.images.length > 0) {
      for (const imageUrl of packageData.images) {
        try {
          // Extract the path from the URL
          const imagePath = imageUrl.split('?')[0].split('/o/')[1].replace(/%2F/g, '/');
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting image:', error);
          // Continue with other images even if one fails
        }
      }
    }
    
    // Delete the package document
    await deleteDoc(doc(db, 'tourPackages', packageId));
    
    return { success: true };
  } catch (error) {
    console.error('Delete package error:', error);
    throw error;
  }
};
