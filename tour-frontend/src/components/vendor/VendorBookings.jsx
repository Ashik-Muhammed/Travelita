import React, { useState, useEffect } from 'react';
import { auth, rtdb } from '../../config/firebase';
import { ref, get, update, query, orderByChild, equalTo, serverTimestamp } from 'firebase/database';
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
  FaEye,
  FaTrash,
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

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      console.log('Fetching bookings for vendor:', user.uid);
      
      // First, get all packages for this vendor
      const packagesRef = query(ref(rtdb, 'tourPackages'), orderByChild('vendorId'), equalTo(user.uid));
      const packagesSnap = await get(packagesRef);
      
      if (!packagesSnap.exists()) {
        console.log('No packages found for this vendor');
        setBookings([]);
        setLoading(false);
        return;
      }
      
      // Get package IDs for this vendor
      const vendorPackageIds = [];
      packagesSnap.forEach((packageSnap) => {
        vendorPackageIds.push(packageSnap.key);
      });
      
      if (vendorPackageIds.length === 0) {
        console.log('No package IDs found for vendor');
        setBookings([]);
        setLoading(false);
        return;
      }
      
      // Now get all bookings for these package IDs
      const bookingsRef = ref(rtdb, 'bookings');
      const snapshot = await get(bookingsRef);
      
      if (!snapshot.exists()) {
        console.log('No bookings found');
        setBookings([]);
        setLoading(false);
        return;
      }
      
      // Filter bookings for this vendor's packages
      const receivedBookings = [];
      snapshot.forEach((childSnapshot) => {
        const booking = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
        
        // Include bookings for any of the vendor's packages
        if (vendorPackageIds.includes(booking.packageId)) {
          receivedBookings.push(booking);
        }
      });
      
      console.log('Bookings loaded:', receivedBookings);
      setBookings(receivedBookings);
      
      // Fetch package details to get titles
      const packageIds = [...new Set(receivedBookings.map(booking => booking.packageId))];
      await fetchPackageDetails(packageIds);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackageDetails = async (packageIds) => {
    try {
      const nameMap = {};
      
      for (const id of packageIds) {
        // Get package details from Realtime Database
        const packageRef = ref(rtdb, `tourPackages/${id}`);
        const snapshot = await get(packageRef);
        
        if (snapshot.exists()) {
          nameMap[id] = snapshot.val().title;
        } else {
          nameMap[id] = 'Unknown Package';
        }
      }
      
      console.log('Package names loaded:', nameMap);
      setPackageNames(nameMap);
    } catch (err) {
      console.error('Error fetching package details:', err);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to confirm this booking? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to confirm bookings');
      }
      
      // First, get the booking to check vendor ownership
      const bookingRef = ref(rtdb, `bookings/${bookingId}`);
      const bookingSnap = await get(bookingRef);
      
      if (!bookingSnap.exists()) {
        throw new Error('Booking not found');
      }
      
      const booking = bookingSnap.val();
      
      // Get the package to verify vendor ownership
      const packageRef = ref(rtdb, `tourPackages/${booking.packageId}`);
      const packageSnap = await get(packageRef);
      
      if (!packageSnap.exists()) {
        throw new Error('Package not found');
      }
      
      const packageData = packageSnap.val();
      
      // Check if the current user is the package vendor
      if (packageData.vendorId !== user.uid) {
        throw new Error('Only the package owner can confirm this booking');
      }
      
      // Update the booking status directly
      await update(bookingRef, {
        status: 'confirmed',
        confirmedAt: serverTimestamp(),
        confirmedBy: 'vendor',
        confirmedById: user.uid,
        updatedAt: serverTimestamp()
      });
      
      // Refresh the bookings list
      await fetchBookings();
      alert('Booking confirmed successfully!');
    } catch (err) {
      console.error('Error confirming booking:', err);
      alert(err.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    if (!window.confirm('Mark this booking as completed? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await completeBooking(bookingId, auth.currentUser.uid);
      // Refresh bookings after completion
      await fetchBookings();
      alert('Booking marked as completed!');
    } catch (err) {
      console.error('Error completing booking:', err);
      alert('Failed to complete booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await cancelBooking(bookingId, auth.currentUser.uid);
      // Refresh bookings after cancellation
      await fetchBookings();
      alert('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get status color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'confirmed';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) return;
      
      console.log('Updating booking status:', bookingId, 'to', newStatus);
      
      // Update booking status in Realtime Database
      const bookingRef = ref(rtdb, `bookings/${bookingId}`);
      await update(bookingRef, { 
        status: newStatus,
        updatedAt: Date.now() 
      });
      
      console.log('Booking status updated successfully');
      
      // Update booking in state
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status');
    }
  };

  // Filter bookings based on the selected filter
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => (booking.status || 'pending') === filter);

  // Format date for display with error handling
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="bookings-loading">
        <div className="spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return <div className="bookings-error">{error}</div>;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="status-badge confirmed">Confirmed</span>;
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  return (
    <div className="vendor-bookings">
      <div className="bookings-header">
        <h2>Manage Bookings</h2>
        <p>View and manage all your tour package bookings in one place</p>
      </div>
      
      {/* Filter Buttons */}
      <div className="booking-filters">
        <button 
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All <span className="count">{bookings.length}</span>
        </button>
        <button 
          className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending <span className="count">
            {bookings.filter(b => (b.status || 'pending') === 'pending').length}
          </span>
        </button>
        <button 
          className={`filter-button ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed <span className="count">
            {bookings.filter(b => b.status === 'confirmed').length}
          </span>
        </button>
        <button 
          className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed <span className="count">
            {bookings.filter(b => b.status === 'completed').length}
          </span>
        </button>
        <button 
          className={`filter-button ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled <span className="count">
            {bookings.filter(b => b.status === 'cancelled').length}
          </span>
        </button>
      </div>
      
      {loading ? (
        <div className="bookings-loading">
          <div className="loading-spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      ) : error ? (
        <div className="bookings-error">
          <p>{error}</p>
          <button className="retry-button" onClick={fetchBookings}>Retry</button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <p>No {filter === 'all' ? '' : filter + ' '}bookings found</p>
          {filter !== 'all' && (
            <button className="view-all-button" onClick={() => setFilter('all')}>
              View all bookings
            </button>
          )}
        </div>
      ) : (
        <div className="bookings-grid">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-card-header">
                <h3>{packageNames[booking.packageId] || 'Package'}</h3>
                <span className={`status-badge ${getStatusColor(booking.status || 'pending')}`}>
                  {booking.status || 'pending'}
                </span>
              </div>
              
              <div className="booking-card-body">
                <div className="booking-details">
                  <div className="booking-detail">
                    <FaCalendarAlt />
                    <div className="booking-detail-content">
                      <h4>Travel Date</h4>
                      <p>{formatDate(booking.travelDate)}</p>
                    </div>
                  </div>
                  
                  <div className="booking-detail">
                    <FaUser />
                    <div className="booking-detail-content">
                      <h4>Travelers</h4>
                      <p>{booking.travelers || 1} {booking.travelers === 1 ? 'Person' : 'People'}</p>
                    </div>
                  </div>
                  
                  <div className="booking-detail">
                    <FaUsers />
                    <div className="booking-detail-content">
                      <h4>Customer</h4>
                      <p>{booking.customerName || 'Guest User'}</p>
                    </div>
                  </div>
                  
                  <div className="booking-detail">
                    <FaMapMarkerAlt />
                    <div className="booking-detail-content">
                      <h4>Location</h4>
                      <p>{booking.pickupLocation || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {booking.totalPrice && (
                    <div className="booking-detail">
                      <FaTag />
                      <div className="booking-detail-content">
                        <h4>Total Amount</h4>
                        <p>₹{booking.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="booking-actions">
                  {booking.status === 'pending' && (
                    <button 
                      onClick={() => handleConfirmBooking(booking.id)}
                      className="btn-confirm"
                      disabled={loading}
                    >
                      {loading ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                  )}
                  <button 
                    onClick={() => updateBookingStatus(
                      booking.id, 
                      booking.status === 'cancelled' ? 'pending' : 'cancelled'
                    )}
                    className={`btn-cancel ${booking.status === 'cancelled' ? 'cancelled' : ''}`}
                    disabled={loading}
                  >
                    {booking.status === 'cancelled' ? 'Cancelled' : 'Cancel Booking'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorBookings; 