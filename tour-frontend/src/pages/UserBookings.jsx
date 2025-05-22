import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { rtdb } from '../config/firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { getFallbackImage } from '../utils/imageUtils';
import './UserBookings.css';

function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userString = localStorage.getItem('user');
    if (!userString) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userString);
    setUser(userData);

    // Fetch user's bookings
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        // Query bookings by userId
        const bookingsRef = ref(rtdb, 'bookings');
        const userBookingsQuery = query(bookingsRef, orderByChild('userId'), equalTo(userData.id));
        const bookingsSnapshot = await get(userBookingsQuery);
        
        if (bookingsSnapshot.exists()) {
          // Convert the object of bookings to an array with ID included
          const bookingsData = Object.entries(bookingsSnapshot.val()).map(([id, data]) => ({
            id,
            ...data
          }));
          
          // Sort bookings by date (newest first)
          bookingsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setBookings(bookingsData);
        } else {
          setBookings([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to fetch bookings. Please try again.');
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    // Handle different date formats
    let date;
    if (typeof dateString === 'number') {
      // Unix timestamp (milliseconds)
      date = new Date(dateString);
    } else if (typeof dateString === 'string') {
      if (dateString.includes('T')) {
        // ISO string format
        date = new Date(dateString);
      } else if (!isNaN(Date.parse(dateString))) {
        // Other parsable string format
        date = new Date(dateString);
      } else {
        return 'Invalid date';
      }
    } else {
      return 'Invalid date';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="bookings-loading">
        <div className="spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="user-bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <Link to="/packages" className="browse-packages-button">
            Browse Packages
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                <path d="M0 0h24v24H0V0z" fill="none"/>
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
            </div>
            <h2>No Bookings Found</h2>
            <p>You haven't made any bookings yet.</p>
            <Link to="/packages" className="start-booking-button">
              Start Booking Now
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-image">
                  <img 
                    src={getFallbackImage(booking.packageImage, 'travel', '300x200')} 
                    alt={booking.packageName || 'Tour Package'} 
                    className="img-cover"
                    onError={(e) => {
                      e.target.src = getFallbackImage(null, 'travel', '300x200');
                    }}
                  />
                </div>
                <div className="booking-details">
                  <h2 className="booking-title">{booking.packageName}</h2>
                  <div className="booking-meta">
                    <div className="booking-date">
                      <span className="meta-label">Travel Date:</span>
                      <span className="meta-value">{formatDate(booking.date)}</span>
                    </div>
                    <div className="booking-travelers">
                      <span className="meta-label">Travelers:</span>
                      <span className="meta-value">{booking.travelers}</span>
                    </div>
                  </div>
                  <div className="booking-price">
                    <span className="meta-label">Total Amount:</span>
                    <span className="meta-value price">₹{booking.totalPrice}</span>
                  </div>
                  <div className="booking-status-row">
                    <div className="booking-created">
                      <span className="meta-label">Booked on:</span>
                      <span className="meta-value">{formatDate(booking.createdAt)}</span>
                    </div>
                    <div className="booking-status">
                      <span className={`status-badge ${getStatusClass(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="booking-actions">
                  <Link to={`/packages/${booking.packageId}`} className="view-package-button">
                    View Package
                  </Link>
                  {booking.status === 'pending' && (
                    <button className="cancel-booking-button">
                      Cancel Booking
                    </button>
                  )}
                  {booking.paymentStatus === 'pending' && booking.status !== 'cancelled' && (
                    <button className="pay-now-button">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserBookings;
