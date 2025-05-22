import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rtdb } from '../config/firebase';
import { ref, get, update, remove } from 'firebase/database';
import './AdminPanel.css'; // Reuse admin panel styling

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || user.role !== 'admin') {
        setError('Admin authentication required');
        setLoading(false);
        return;
      }

      // Reference to bookings in Firebase
      const bookingsRef = ref(rtdb, 'bookings');
      const snapshot = await get(bookingsRef);
      
      if (!snapshot.exists()) {
        setBookings([]);
        setLoading(false);
        return;
      }
      
      const bookingsData = [];
      snapshot.forEach((childSnapshot) => {
        const booking = childSnapshot.val();
        bookingsData.push({
          id: childSnapshot.key,
          ...booking
        });
      });

      // Sort by booking date (newest first)
      bookingsData.sort((a, b) => {
        return new Date(b.bookingDate) - new Date(a.bookingDate);
      });

      setBookings(bookingsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings. Please try again.');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setActionLoading(true);
      
      // Reference to the specific booking in Firebase
      const bookingRef = ref(rtdb, `bookings/${bookingId}`);
      
      // Update the booking status
      await update(bookingRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));
      
      setSuccessMessage(`Booking status updated to ${newStatus}`);
      setActionLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status. Please try again.');
      setActionLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (bookingId, newPaymentStatus) => {
    try {
      setActionLoading(true);
      
      // Reference to the specific booking in Firebase
      const bookingRef = ref(rtdb, `bookings/${bookingId}`);
      
      // Update the payment status
      await update(bookingRef, {
        paymentStatus: newPaymentStatus,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, paymentStatus: newPaymentStatus }
          : booking
      ));
      
      setSuccessMessage(`Payment status updated to ${newPaymentStatus}`);
      setActionLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError('Failed to update payment status. Please try again.');
      setActionLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      
      // Reference to the specific booking in Firebase
      const bookingRef = ref(rtdb, `bookings/${bookingId}`);
      
      // Delete the booking
      await remove(bookingRef);

      // Update local state
      setBookings(bookings.filter(booking => booking.id !== bookingId));
      
      setSuccessMessage('Booking deleted successfully');
      setActionLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError('Failed to delete booking. Please try again.');
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    // Filter by status
    const statusMatch = filter === 'all' ? true : 
                       filter === booking.status || filter === booking.paymentStatus;
    
    // Filter by search term (check package title, user name, or destination)
    const searchMatch = searchTerm === '' ? true :
      (booking.packageTitle && booking.packageTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.userName && booking.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.destination && booking.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.userEmail && booking.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return statusMatch && searchMatch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2 className="error-title">Error</h2>
          <p className="error-text">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="error-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Booking Management</h1>
          <p className="admin-subtitle">
            View and manage all bookings in the system
          </p>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <div className="admin-section">
          <div className="filter-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by package, user, or destination"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-box">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending Bookings</option>
                <option value="confirmed">Confirmed Bookings</option>
                <option value="completed">Completed Bookings</option>
                <option value="cancelled">Cancelled Bookings</option>
                <option value="paid">Paid Bookings</option>
                <option value="pending">Pending Payment</option>
              </select>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <p>No bookings found matching your criteria.</p>
            </div>
          ) : (
            <div className="bookings-table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Package</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id || `booking-${Math.random()}`}>
                      <td>{booking.id ? booking.id.substring(0, 8) : 'N/A'}</td>
                      <td>
                        <div className="package-info">
                          <span className="package-title">{booking.packageTitle || 'Unknown Package'}</span>
                          <span className="package-destination">{booking.destination || 'Unknown'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="user-info">
                          <span className="user-name">{booking.userName || 'Unknown User'}</span>
                          <span className="user-email">{booking.userEmail || 'No email'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="date-info">
                          <span className="booking-date">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                          <span className="travel-dates">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td>₹{Number(booking.totalPrice).toLocaleString()}</td>
                      <td>
                        <div className="status-cell">
                          <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                          <select
                            value={booking.status}
                            onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                            disabled={actionLoading}
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className="payment-cell">
                          <span className={`payment-badge ${booking.paymentStatus}`}>{booking.paymentStatus}</span>
                          <select
                            value={booking.paymentStatus}
                            onChange={(e) => handleUpdatePaymentStatus(booking.id, e.target.value)}
                            disabled={actionLoading}
                            className="payment-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="refunded">Refunded</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/packages/${booking.packageId}`}
                            className="view-button"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Package
                          </Link>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            disabled={actionLoading}
                            className="delete-button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-footer">
          <Link to="/admin" className="back-button">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminBookings;
