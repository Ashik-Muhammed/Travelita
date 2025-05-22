import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import * as tourPackageService from '../services/tourPackageService';
import * as bookingService from '../services/bookingService';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

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

  const getPackageById = async (packageId) => {
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
  };

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
      
      // Ensure we have the correct user ID format
      const userId = currentUser.uid || currentUser.id || 'anonymous';
      
      const result = await bookingService.createBooking({
        ...bookingData,
        userId: userId
      });
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getUserBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      
      const result = await bookingService.getUserBookings(currentUser.id);
      setLoading(false);
      return result;
    } catch (err) {
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
      
      const result = await bookingService.getBookingById(
        bookingId,
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

  const updateBookingStatus = async (bookingId, status) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      if (!isAdmin) throw new Error('You must be an admin');
      
      const result = await bookingService.updateBookingStatus(
        bookingId,
        status,
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

  const updatePaymentStatus = async (bookingId, paymentStatus, paymentDetails) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      
      const result = await bookingService.updatePaymentStatus(
        bookingId,
        paymentStatus,
        paymentDetails,
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

  const cancelBooking = async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      
      const result = await bookingService.cancelBooking(
        bookingId,
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
