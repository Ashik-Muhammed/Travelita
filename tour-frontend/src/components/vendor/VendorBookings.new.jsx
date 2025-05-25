import React, { useState, useEffect } from 'react';
import { auth, rtdb } from '../../config/firebase';
import { ref, get } from 'firebase/database';
import { confirmBooking, completeBooking, cancelBooking } from '../../services/bookingService';
import { format } from 'date-fns';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaTag, 
  FaCheck, 
  FaTimes, 
  FaClock,
  FaSyncAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import './VendorBookings.css';

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'confirmed':
        return { text: 'Confirmed', className: 'confirmed' };
      case 'completed':
        return { text: 'Completed', className: 'completed' };
      case 'cancelled':
        return { text: 'Cancelled', className: 'cancelled' };
      case 'pending':
      default:
        return { text: 'Pending', className: 'pending' };
    }
  };

  const config = getStatusConfig();
  return <span className={`status-badge ${config.className}`}>{config.text}</span>;
};

// Booking card component
const BookingCard = ({ booking, packageName, onConfirm, onComplete, onCancel }) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const status = booking.status || 'pending';
  const isPending = status === 'pending';
  const isConfirmed = status === 'confirmed';
  const isCompleted = status === 'completed';
  const isCancelled = status === 'cancelled';

  return (
    <div className="booking-card">
      <div className="booking-card-header">
        <h3>{packageName || 'Tour Package'}</h3>
        <StatusBadge status={status} />
      </div>
      
      <div className="booking-card-body">
        <div className="booking-details">
          <div className="booking-detail">
            <FaCalendarAlt className="icon" />
            <div className="booking-detail-content">
              <h4>Travel Date</h4>
              <p>{formatDate(booking.travelDate)}</p>
            </div>
          </div>
          
          <div className="booking-detail">
            <FaUser className="icon" />
            <div className="booking-detail-content">
              <h4>Travelers</h4>
              <p>{booking.travelers || 1} {booking.travelers === 1 ? 'Person' : 'People'}</p>
            </div>
          </div>
          
          <div className="booking-detail">
            <FaUsers className="icon" />
            <div className="booking-detail-content">
              <h4>Customer</h4>
              <p>{booking.customerName || booking.userName || 'Guest User'}</p>
            </div>
          </div>
          
          {booking.pickupLocation && (
            <div className="booking-detail">
              <FaMapMarkerAlt className="icon" />
              <div className="booking-detail-content">
                <h4>Pickup Location</h4>
                <p>{booking.pickupLocation}</p>
              </div>
            </div>
          )}
          
          {booking.totalPrice && (
            <div className="booking-detail">
              <FaTag className="icon" />
              <div className="booking-detail-content">
                <h4>Total Amount</h4>
                <p>₹{Number(booking.totalPrice).toLocaleString()}</p>
              </div>
            </div>
          )}
          
          {booking.notes && (
            <div className="booking-note">
              <FaExclamationTriangle className="icon" />
              <p>{booking.notes}</p>
            </div>
          )}
        </div>
        
        <div className="booking-actions">
          {isPending && (
            <>
              <button 
                className="action-button confirm-button"
                onClick={() => onConfirm(booking.id)}
              >
                <FaCheck /> Confirm
              </button>
              <button 
                className="action-button cancel-button"
                onClick={() => onCancel(booking.id)}
              >
                <FaTimes /> Cancel
              </button>
            </>
          )}
          
          {isConfirmed && (
            <>
              <button 
                className="action-button complete-button"
                onClick={() => onComplete(booking.id)}
              >
                <FaCheck /> Mark as Completed
              </button>
              <button 
                className="action-button cancel-button"
                onClick={() => onCancel(booking.id)}
              >
                <FaTimes /> Cancel
              </button>
            </>
          )}
          
          {(isCompleted || isCancelled) && (
            <div className="status-message">
              <FaClock /> {isCompleted ? 'Completed' : 'Cancelled'} on {formatDate(booking.updatedAt || new Date().toISOString())}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VendorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [packageNames, setPackageNames] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Fetch bookings from Firebase
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = auth.currentUser;
      if (!user) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      console.log('Fetching bookings for vendor:', user.uid);
      
      // Get all bookings
      const bookingsRef = ref(rtdb, 'bookings');
      const snapshot = await get(bookingsRef);
      
      if (!snapshot.exists()) {
        console.log('No bookings found');
        setBookings([]);
        setLoading(false);
        return;
      }
      
      // Filter bookings for this vendor
      const receivedBookings = [];
      snapshot.forEach((childSnapshot) => {
        const booking = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
        
        if (booking.vendorId === user.uid) {
          receivedBookings.push(booking);
        }
      });
      
      console.log('Bookings loaded:', receivedBookings);
      setBookings(receivedBookings);
      
      // Fetch package details for display
      const packageIds = [...new Set(receivedBookings.map(b => b.packageId))];
      await fetchPackageDetails(packageIds);
      
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch package details for display
  const fetchPackageDetails = async (packageIds) => {
    try {
      const names = {};
      
      for (const id of packageIds) {
        const packageRef = ref(rtdb, `tourPackages/${id}`);
        const snapshot = await get(packageRef);
        
        if (snapshot.exists()) {
          names[id] = snapshot.val().title;
        } else {
          names[id] = 'Unknown Package';
        }
      }
      
      setPackageNames(names);
    } catch (err) {
      console.error('Error fetching package details:', err);
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to confirm this booking?')) {
      return;
    }
    
    try {
      setRefreshing(true);
      await confirmBooking(bookingId, auth.currentUser.uid);
      await fetchBookings();
    } catch (err) {
      console.error('Error confirming booking:', err);
      setError('Failed to confirm booking. Please try again.');
    }
  };

  // Handle marking booking as completed
  const handleCompleteBooking = async (bookingId) => {
    if (!window.confirm('Mark this booking as completed?')) {
      return;
    }
    
    try {
      setRefreshing(true);
      await completeBooking(bookingId, auth.currentUser.uid);
      await fetchBookings();
    } catch (err) {
      console.error('Error completing booking:', err);
      setError('Failed to complete booking. Please try again.');
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      setRefreshing(true);
      await cancelBooking(bookingId, auth.currentUser.uid);
      await fetchBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  // Refresh bookings
  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // Initial data load
  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings based on selected filter
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => (booking.status || 'pending') === filter);

  // Get count of bookings by status
  const getBookingCount = (status) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => (b.status || 'pending') === status).length;
  };

  return (
    <div className="vendor-bookings">
      <div className="bookings-header">
        <h2>Manage Bookings</h2>
        <p>View and manage all your tour package bookings in one place</p>
        
        <div className="header-actions">
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FaSyncAlt className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={handleRefresh} className="retry-button">
            Retry
          </button>
        </div>
      )}
      
      <div className="booking-filters">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            className={`filter-button ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="count">{getBookingCount(status)}</span>
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <p>No {filter === 'all' ? '' : filter + ' '}bookings found</p>
          {filter !== 'all' && (
            <button 
              className="view-all-button" 
              onClick={() => setFilter('all')}
            >
              View all bookings
            </button>
          )}
        </div>
      ) : (
        <div className="bookings-grid">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              packageName={packageNames[booking.packageId]}
              onConfirm={handleConfirmBooking}
              onComplete={handleCompleteBooking}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorBookings;
