import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
// Import database functions from our Firebase config
import { db, ref, query, orderByChild, equalTo, onValue, getDb } from '../config/firebase';
// Simple date formatting function
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Simple toast notification function
const showToast = (message, type = 'error') => {
  // Using browser's alert as a fallback
  window.alert(`${type.toUpperCase()}: ${message}`);
};
import '../styles/Bookings.css';

export const Bookings = ({ vendorView = false }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const { getUserBookings, getVendorBookings } = useData();
  const navigate = useNavigate();

  // Get the initialized database instance
  const rtdb = getDb();
  if (!rtdb) {
    console.error('Database not initialized');
    return null;
  }

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError('');
        
        let bookingsData = [];
        
        if (vendorView) {
          // For vendors, get all bookings for their packages
          bookingsData = await getVendorBookings(currentUser.uid);
        } else {
          // For regular users, get their own bookings
          bookingsData = await getUserBookings(currentUser.uid);
        }
        
        // Sort bookings by date (newest first)
        bookingsData.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
        
        setBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        const errorMessage = err.message || 'Failed to load bookings. Please try again later.';
        setError(errorMessage);
        showToast(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
    
    // Set up real-time listener for booking updates
    try {
      const bookingsRef = ref(rtdb, 'bookings');
      
      // Create query based on view type
      let queryRef;
      if (vendorView) {
        queryRef = query(
          bookingsRef,
          orderByChild('vendorId'),
          equalTo(currentUser.uid)
        );
      } else {
        queryRef = query(
          bookingsRef,
          orderByChild('userId'),
          equalTo(currentUser.uid)
        );
      }
    
    // Set up the real-time listener
      const onData = (snapshot) => {
        if (snapshot.exists()) {
          const updatedBookings = [];
          snapshot.forEach((childSnapshot) => {
            updatedBookings.push({
              id: childSnapshot.key,
              ...childSnapshot.val()
            });
          });
          setBookings(updatedBookings);
        } else {
          setBookings([]);
        }
      };
      
      const onError = (error) => {
        console.error('Error setting up real-time listener:', error);
        setError('Failed to load bookings. Please try again.');
        showToast('Failed to load bookings. Please try again.');
      };
      
      // Set up the listener
      const unsubscribe = onValue(queryRef, onData, onError);
      
      // Clean up the listener when component unmounts
      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up database listener:', error);
      setError('Failed to initialize database connection.');
      showToast('Failed to initialize database connection.');
    }
  }, [currentUser, navigate, vendorView, getUserBookings, getVendorBookings]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading {vendorView ? 'vendor' : 'your'} bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  // formatDate function is already defined at the top of the file

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{vendorView ? 'Vendor Bookings' : 'My Bookings'}</h2>
        {vendorView && (
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh
          </button>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-5">
          <div className="empty-state">
            <i className="fas fa-calendar-alt fa-4x mb-3 text-muted"></i>
            <h3>No Bookings Found</h3>
            <p className="text-muted">
              {vendorView 
                ? 'You have no bookings for your packages yet.'
                : 'You have not made any bookings yet.'}
            </p>
            {!vendorView && (
              <button 
                className="btn btn-primary mt-3"
                onClick={() => navigate('/packages')}
              >
                Browse Packages
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Booking ID</th>
                {vendorView && <th>Booked By</th>}
                <th>Package</th>
                <th>Date</th>
                <th>Guests</th>
                <th>Total Price</th>
                <th>Status</th>
                {vendorView && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id.substring(0, 8)}...</td>
                  {vendorView && (
                    <td>
                      {booking.userName || 'N/A'}
                      <br />
                      <small className="text-muted">{booking.userEmail || ''}</small>
                    </td>
                  )}
                  <td>
                    <div className="d-flex align-items-center">
                      {booking.packageImage && (
                        <img 
                          src={booking.packageImage} 
                          alt={booking.packageName} 
                          className="me-2"
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      )}
                      <div>
                        <div className="fw-semibold">{booking.packageName || 'N/A'}</div>
                        <small className="text-muted">
                          {formatDate(booking.travelDate)}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(booking.createdAt)}</td>
                  <td>{booking.guests || 1}</td>
                  <td>₹{booking.totalPrice?.toLocaleString() || '0'}</td>
                  <td>
                    <span className={`badge ${booking.status === 'confirmed' ? 'bg-success' : 'bg-warning'}`}>
                      {booking.status || 'pending'}
                    </span>
                  </td>
                  {vendorView && (
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                      >
                        View
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Bookings;
