import React, { useState, useEffect } from 'react';
import { db, ref, get } from '../../config/firebase';
import './AdminBookings.css';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Get all bookings
        const bookingsData = await db.get('bookings') || {};
        
        // Get all users to avoid multiple database calls
        const usersData = await db.get('users') || {};
        
        // Process bookings and attach user data
        const bookingsList = Object.entries(bookingsData).map(([id, booking]) => {
          const user = usersData[booking.userId];
          return {
            id,
            ...booking,
            user: user || null
          };
        });
        
        // Sort by date (newest first)
        const sortedBookings = bookingsList.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setBookings(sortedBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await db.update(`bookings/${bookingId}`, { status: newStatus });
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus } 
          : booking
      ));
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status');
    }
  };

  // Filter bookings based on search term and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.bookingId && booking.bookingId.toLowerCase().includes(searchTerm)) ||
      (booking.packageName && booking.packageName.toLowerCase().includes(searchTerm)) ||
      (booking.user && booking.user.email && booking.user.email.toLowerCase().includes(searchTerm)) ||
      (booking.user && booking.user.displayName && booking.user.displayName.toLowerCase().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="admin-bookings">Loading bookings...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-bookings">
      <div className="admin-header">
        <h2>Manage Bookings</h2>
        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <i className="fas fa-search"></i>
          </div>
          <div className="status-filter">
            <select value={statusFilter} onChange={handleStatusFilter}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bookings-summary">
        <div className="summary-card total">
          <h3>Total Bookings</h3>
          <div className="value">{bookings.length}</div>
        </div>
        <div className="summary-card pending">
          <h3>Pending</h3>
          <div className="value">
            {bookings.filter(b => b.status === 'pending').length}
          </div>
        </div>
        <div className="summary-card confirmed">
          <h3>Confirmed</h3>
          <div className="value">
            {bookings.filter(b => b.status === 'confirmed').length}
          </div>
        </div>
        <div className="summary-card revenue">
          <h3>Total Revenue</h3>
          <div className="value">
            {formatCurrency(bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0))}
          </div>
        </div>
      </div>
      
      {filteredBookings.length === 0 ? (
        <div className="no-results">No bookings found</div>
      ) : (
        <>
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Package</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Guests</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.map(booking => (
                  <tr key={booking.id}>
                    <td className="booking-id">#{booking.id.substring(0, 8)}</td>
                    <td className="package">
                      <div className="package-name">{booking.packageName || 'N/A'}</div>
                      <div className="package-dates">
                        {booking.travelDate || 'Date not specified'}
                      </div>
                    </td>
                    <td className="customer">
                      <div className="customer-name">
                        {booking.user?.displayName || 'Guest User'}
                      </div>
                      <div className="customer-email">
                        {booking.user?.email || booking.email || 'No email'}
                      </div>
                    </td>
                    <td className="date">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="guests">
                      {booking.adults + (booking.children || 0)} {booking.adults + (booking.children || 0) === 1 ? 'Person' : 'People'}
                    </td>
                    <td className="amount">
                      {formatCurrency(booking.totalPrice || 0)}
                    </td>
                    <td className="status">
                      <span className={`status-badge ${booking.status || 'pending'}`}>
                        {booking.status || 'Pending'}
                      </span>
                    </td>
                    <td className="actions">
                      <div className="status-actions">
                        <select 
                          value={booking.status || 'pending'}
                          onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                          className={`status-select ${booking.status || 'pending'}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <button 
                        className="view-btn"
                        onClick={() => {/* Implement view details */}}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => paginate(1)} 
                disabled={currentPage === 1}
                className="page-nav"
              >
                &laquo;
              </button>
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="page-nav"
              >
                &lsaquo;
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show 5 page numbers at a time
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="page-nav"
              >
                &rsaquo;
              </button>
              <button 
                onClick={() => paginate(totalPages)} 
                disabled={currentPage === totalPages}
                className="page-nav"
              >
                &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminBookings;
