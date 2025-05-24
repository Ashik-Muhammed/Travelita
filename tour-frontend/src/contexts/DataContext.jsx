import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db, getDb } from '../config/firebase';
import { getDatabase, ref, query, orderByChild, equalTo, get, set, update, serverTimestamp, push } from 'firebase/database';
import * as tourPackageService from '../services/tourPackageService';

const DataContext = createContext();

// Define the hook separately for better Fast Refresh support
const useData = () => useContext(DataContext);

export { useData };

export const DataProvider = ({ children }) => {
  const { currentUser, isAdmin } = useAuth() || { currentUser: null, isAdmin: false };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tour Package functions
  const createPackage = async (packageData, imageFiles) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      
      const result = await tourPackageService.createPackage(
        { ...packageData, vendorId: currentUser.id, isAdmin },
        imageFiles
      );
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getPackages = async (filters, page, pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tourPackageService.getPackages(filters, page, pageSize);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getFeaturedPackages = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tourPackageService.getFeaturedPackages(type);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getPackagesByDestination = async (destination) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tourPackageService.getPackagesByDestination(destination);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getPackageById = useCallback(async (packageId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tourPackageService.getPackageById(packageId);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []); // Empty dependency array as we don't use any external values

  const updatePackage = async (packageId, updates, imageFiles) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      
      const result = await tourPackageService.updatePackage(
        packageId,
        updates,
        imageFiles,
        currentUser.id,
        isAdmin
      );
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const deletePackage = async (packageId) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      
      const result = await tourPackageService.deletePackage(
        packageId,
        currentUser.id,
        isAdmin
      );
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Booking functions
  const createBooking = async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      
      const database = getDatabase();
      if (!database) throw new Error('Database not initialized');
      
      // Ensure we have the correct user ID format
      const userId = currentUser.uid || currentUser.id || 'anonymous';
      
      // Create a new booking object with required fields
      const newBooking = {
        ...bookingData,
        userId: userId,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add the booking to the database
      const bookingsRef = ref(database, 'bookings');
      const newBookingRef = push(bookingsRef);
      await set(newBookingRef, newBooking);
      
      // Get the ID of the newly created booking
      const bookingId = newBookingRef.key;
      
      setLoading(false);
      return { id: bookingId, ...newBooking };
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getUserBookings = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      
      const database = getDatabase();
      if (!database) throw new Error('Database not initialized');
      
      const bookingsRef = ref(database, 'bookings');
      const userBookingsQuery = query(
        bookingsRef,
        orderByChild('userId'),
        equalTo(userId || currentUser.uid)
      );
      
      const snapshot = await get(userBookingsQuery);
      const bookings = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          bookings.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      
      // Sort by creation date (newest first)
      bookings.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      
      setLoading(false);
      return bookings;
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };
  
  const getVendorBookings = async (vendorId) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      
      const database = getDatabase();
      if (!database) throw new Error('Database not initialized');
      
      const bookingsRef = ref(database, 'bookings');
      const vendorBookingsQuery = query(
        bookingsRef,
        orderByChild('vendorId'),
        equalTo(vendorId || currentUser.uid)
      );
      
      const snapshot = await get(vendorBookingsQuery);
      const bookings = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          bookings.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      
      // Sort by creation date (newest first)
      bookings.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      
      setLoading(false);
      return bookings;
    } catch (err) {
      console.error('Error fetching vendor bookings:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getBookingById = async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      
      const database = getDatabase();
      if (!database) throw new Error('Database not initialized');
      
      const bookingRef = ref(database, `bookings/${bookingId}`);
      const snapshot = await get(bookingRef);
      
      if (!snapshot.exists()) {
        throw new Error('Booking not found');
      }
      
      const booking = snapshot.val();
      
      // Check if the user has permission to view this booking
      const isOwner = booking.userId === currentUser.uid || booking.userId === currentUser.id;
      const isVendor = booking.vendorId === currentUser.uid || booking.vendorId === currentUser.id;
      
      if (!isOwner && !isVendor && !isAdmin) {
        throw new Error('You do not have permission to view this booking');
      }
      
      setLoading(false);
      return { id: snapshot.key, ...booking };
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      if (!isAdmin) throw new Error('You must be an admin');
      
      const database = getDatabase();
      if (!database) throw new Error('Database not initialized');
      
      const bookingRef = ref(database, `bookings/${bookingId}`);
      const snapshot = await get(bookingRef);
      
      if (!snapshot.exists()) {
        throw new Error('Booking not found');
      }
      
      await update(bookingRef, {
        status: status,
        updatedAt: serverTimestamp()
      });
      
      setLoading(false);
      return { id: bookingId, ...snapshot.val(), status };
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const updatePaymentStatus = async (bookingId, paymentStatus, paymentDetails = {}) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      
      const database = getDatabase();
      if (!database) throw new Error('Database not initialized');
      
      const bookingRef = ref(database, `bookings/${bookingId}`);
      const snapshot = await get(bookingRef);
      
      if (!snapshot.exists()) {
        throw new Error('Booking not found');
      }
      
      const booking = snapshot.val();
      
      // Check if the user has permission to update this booking
      const isOwner = booking.userId === currentUser.uid || booking.userId === currentUser.id;
      const isVendor = booking.vendorId === currentUser.uid || booking.vendorId === currentUser.id;
      
      if (!isOwner && !isVendor && !isAdmin) {
        throw new Error('You do not have permission to update this booking');
      }
      
      const updates = {
        paymentStatus: paymentStatus,
        updatedAt: serverTimestamp()
      };
      
      // Add payment details if provided
      if (paymentDetails) {
        updates.paymentDetails = {
          ...(booking.paymentDetails || {}),
          ...paymentDetails,
          updatedAt: serverTimestamp()
        };
      }
      
      await update(bookingRef, updates);
      
      setLoading(false);
      return { id: bookingId, ...booking, ...updates };
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const cancelBooking = async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      
      const database = getDatabase();
      if (!database) throw new Error('Database not initialized');
      
      const bookingRef = ref(database, `bookings/${bookingId}`);
      const snapshot = await get(bookingRef);
      
      if (!snapshot.exists()) {
        throw new Error('Booking not found');
      }
      
      const booking = snapshot.val();
      
      // Check if the user has permission to cancel this booking
      const isOwner = booking.userId === currentUser.uid || booking.userId === currentUser.id;
      const isVendor = booking.vendorId === currentUser.uid || booking.vendorId === currentUser.id;
      
      if (!isOwner && !isVendor && !isAdmin) {
        throw new Error('You do not have permission to cancel this booking');
      }
      
      // Update the booking status to cancelled
      await update(bookingRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setLoading(false);
      return { 
        id: bookingId, 
        ...booking, 
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getAllBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      if (!isAdmin) throw new Error('You must be an admin');
      
      const result = await bookingService.getAllBookings(isAdmin);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const value = {
    // State
    loading,
    error,
    
    // Tour Package functions
    createPackage,
    getPackages,
    getFeaturedPackages,
    getPackagesByDestination,
    getPackageById,
    updatePackage,
    deletePackage,
    
    // Booking functions
    createBooking,
    getUserBookings,
    getVendorBookings,
    getBookingById,
    updateBookingStatus,
    updatePaymentStatus,
    cancelBooking,
    getAllBookings
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
