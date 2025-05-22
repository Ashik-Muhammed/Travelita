import { rtdb } from '../config/firebase';
import { 
  ref,
  push,
  set,
  get,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  serverTimestamp
} from 'firebase/database';

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    // Log the incoming booking data for debugging
    console.log('Creating booking with data:', JSON.stringify(bookingData, null, 2));
    
    // Ensure all required fields are present and handle optional fields
    const newBooking = {
      userId: bookingData.userId || 'anonymous',
      userName: bookingData.userName || 'Guest User',
      userEmail: bookingData.userEmail || 'guest@example.com',
      vendorId: bookingData.vendorId || 'system',  // Provide a default value for vendorId
      packageId: bookingData.packageId || 'unknown',
      packageTitle: bookingData.packageTitle || 'Tour Package',
      destination: bookingData.destination || 'Unknown',
      // Handle date fields - use current date if not provided
      bookingDate: bookingData.bookingDate || new Date().toISOString(),
      // For start/end dates, use the booking date + duration if available
      startDate: bookingData.startDate || new Date().toISOString(),
      endDate: bookingData.endDate || new Date().toISOString(),
      guests: Number(bookingData.guests) || 1,
      totalPrice: Number(bookingData.totalPrice) || Number(bookingData.price) || 0,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Double-check that no undefined values exist in the booking object
    Object.keys(newBooking).forEach(key => {
      if (newBooking[key] === undefined) {
        console.warn(`Found undefined value for ${key}, setting default value`);
        // Set appropriate defaults based on field type
        if (typeof newBooking[key] === 'number') newBooking[key] = 0;
        else if (typeof newBooking[key] === 'boolean') newBooking[key] = false;
        else newBooking[key] = '';
      }
    });

    const bookingsRef = ref(rtdb, 'bookings');
    const newBookingRef = push(bookingsRef);
    await set(newBookingRef, newBooking);
    return { id: newBookingRef.key, ...newBooking };
  } catch (error) {
    console.error('Create booking error:', error);
    throw error;
  }
};

// Get bookings by user ID
export const getUserBookings = async (userId) => {
  try {
    const bookingsRef = ref(rtdb, 'bookings');
    const snapshot = await get(bookingsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const bookings = [];
    snapshot.forEach((childSnapshot) => {
      const booking = childSnapshot.val();
      if (booking.userId === userId) {
        bookings.push({
          id: childSnapshot.key,
          ...booking
        });
      }
    });
    
    // Sort by createdAt in descending order
    bookings.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    return bookings;
  } catch (error) {
    console.error('Get user bookings error:', error);
    throw error;
  }
};

// Get booking by ID
export const getBookingById = async (bookingId, userId, isAdmin) => {
  try {
    const bookingRef = ref(rtdb, `bookings/${bookingId}`);
    const snapshot = await get(bookingRef);
    
    if (!snapshot.exists()) {
      throw new Error('Booking not found');
    }
    
    const bookingData = snapshot.val();
    
    // Check permissions - only the booking owner or admin can view
    if (bookingData.userId !== userId && !isAdmin) {
      throw new Error('You do not have permission to view this booking');
    }
    
    return { 
      id: bookingId, 
      ...bookingData
    };
  } catch (error) {
    console.error('Get booking error:', error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status, userId, isAdmin) => {
  try {
    // Get booking to check permissions
    const bookingRef = ref(rtdb, `bookings/${bookingId}`);
    const snapshot = await get(bookingRef);
    
    if (!snapshot.exists()) {
      throw new Error('Booking not found');
    }
    
    const bookingData = snapshot.val();
    
    // Check permissions - only admin can update status
    if (!isAdmin) {
      throw new Error('You do not have permission to update this booking');
    }
    
    // Update booking status
    await update(bookingRef, { 
      status,
      updatedAt: new Date().toISOString() 
    });
    
    // Get updated booking
    const updatedSnapshot = await get(bookingRef);
    
    return { 
      id: bookingId, 
      ...updatedSnapshot.val()
    };
  } catch (error) {
    console.error('Update booking status error:', error);
    throw error;
  }
};

// Update payment status
export const updatePaymentStatus = async (bookingId, paymentStatus, paymentDetails, userId, isAdmin) => {
  try {
    // Get booking to check permissions
    const bookingRef = ref(rtdb, `bookings/${bookingId}`);
    const snapshot = await get(bookingRef);
    
    if (!snapshot.exists()) {
      throw new Error('Booking not found');
    }
    
    const bookingData = snapshot.val();
    
    // Check permissions - only the booking owner or admin can update payment
    if (bookingData.userId !== userId && !isAdmin) {
      throw new Error('You do not have permission to update this booking');
    }
    
    // Update payment status
    await update(bookingRef, { 
      paymentStatus,
      paymentDetails,
      updatedAt: new Date().toISOString() 
    });
    
    // Get updated booking
    const updatedSnapshot = await get(bookingRef);
    
    return { 
      id: bookingId, 
      ...updatedSnapshot.val()
    };
  } catch (error) {
    console.error('Update payment status error:', error);
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId, userId, isAdmin) => {
  try {
    // Get booking to check permissions
    const bookingRef = ref(rtdb, `bookings/${bookingId}`);
    const snapshot = await get(bookingRef);
    
    if (!snapshot.exists()) {
      throw new Error('Booking not found');
    }
    
    const bookingData = snapshot.val();
    
    // Check permissions - only the booking owner or admin can cancel
    if (bookingData.userId !== userId && !isAdmin) {
      throw new Error('You do not have permission to cancel this booking');
    }
    
    // Update booking status to cancelled
    await update(bookingRef, { 
      status: 'cancelled',
      updatedAt: new Date().toISOString() 
    });
    
    return { success: true };
  } catch (error) {
    console.error('Cancel booking error:', error);
    throw error;
  }
};

// Get all bookings (admin only)
export const getAllBookings = async (isAdmin) => {
  try {
    if (!isAdmin) {
      throw new Error('Unauthorized access');
    }
    
    const bookingsRef = ref(rtdb, 'bookings');
    const snapshot = await get(bookingsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const bookings = [];
    snapshot.forEach((childSnapshot) => {
      bookings.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    
    // Sort by createdAt in descending order
    bookings.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    return bookings;
  } catch (error) {
    console.error('Get all bookings error:', error);
    throw error;
  }
};
