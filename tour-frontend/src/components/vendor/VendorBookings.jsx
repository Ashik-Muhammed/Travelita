import React, { useState, useEffect } from 'react';
import { auth, rtdb } from '../../config/firebase';
import { ref, get, update, query, orderByChild, equalTo } from 'firebase/database';
import './VendorBookings.css';

const VendorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [packageNames, setPackageNames] = useState({});

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
      
      // Get vendor bookings from Realtime Database
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
        
        // Only include bookings for this vendor's packages
        if (booking.vendorId === user.uid) {
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

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === filter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  return (
    <div className="vendor-bookings">
      <h2>Manage Bookings</h2>
      <div className="booking-filters">
        <button 
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-button ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed
        </button>
        <button 
          className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button 
          className={`filter-button ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <p>No {filter !== 'all' ? filter : ''} bookings found.</p>
          {bookings.length === 0 && (
            <p>When customers book your packages, they'll appear here.</p>
          )}
        </div>
      ) : (
        <div className="bookings-table">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Package</th>
                <th>Customer</th>
                <th>Booking Date</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.id.substring(0, 8)}</td>
                  <td>{packageNames[booking.packageId] || 'Unknown Package'}</td>
                  <td>{booking.customerName || booking.userName || 'Unknown'}</td>
                  <td>{formatDate(booking.bookingDate || booking.createdAt)}</td>
                  <td>₹{booking.price?.toLocaleString() || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="booking-actions">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            className="confirm-button"
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          >
                            Confirm
                          </button>
                          <button 
                            className="cancel-button"
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <>
                          <button 
                            className="complete-button"
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                          >
                            Mark Complete
                          </button>
                          <button 
                            className="cancel-button"
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {(booking.status === 'completed' || booking.status === 'cancelled') && (
                        <span>No actions available</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VendorBookings; 