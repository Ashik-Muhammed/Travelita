import React, { useState, useEffect } from 'react';
import { db, isInitialized, initFirebase } from '../../config/firebase';
import { 
  FaUsers, 
  FaUserCheck, 
  FaClipboardList,
  FaBoxOpen, 
  FaCalendarAlt, 
  FaCheckCircle,
  FaClipboardCheck,
  FaArrowDown,
  FaTimesCircle, 
  FaTrash
} from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import './AdminDashboard.css';

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return { text: 'Confirmed', className: 'status-confirmed' };
      case 'completed':
        return { text: 'Completed', className: 'status-completed' };
      case 'cancelled':
        return { text: 'Cancelled', className: 'status-cancelled' };
      case 'pending':
      default:
        return { text: 'Pending', className: 'status-pending' };
    }
  };

  const config = getStatusConfig();
  return <span className={`status-badge ${config.className}`}>{config.text}</span>;
};

const AdminDashboard = () => {
  // State management
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMounted, setIsMounted] = useState(true);
  
  // Stats state
  const [stats, setStats] = useState({
    loading: true,
    error: null,
    totalUsers: 0,
    activeUsers: 0,
    totalBookings: 0,
    totalPackages: 0,
    recentBookings: [],
    revenue: 0,
    revenueChange: 0
  });

  // Helper functions
  const getStatusButtonClass = (status) => {
    switch(status) {
      case 'pending': return 'btn-warning';
      case 'confirmed': return 'btn-primary';
      case 'completed': return 'btn-success';
      case 'cancelled': return 'btn-error';
      default: return 'btn-outline';
    }
  };

  // Data fetching and updates
  const fetchDashboardData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch data from Firebase
      const [usersData, bookingsData, packagesData] = await Promise.all([
        db.get('users') || {},
        db.get('bookings') || {},
        db.get('packages') || {}
      ]);

      const recentBookings = Object.entries(bookingsData)
        .sort(([,a], [,b]) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 5)
        .map(([id, booking]) => ({
          id,
          user: booking.userName || 'Unknown User',
          package: booking.packageName || 'Unknown Package',
          date: booking.createdAt || Date.now(),
          amount: booking.totalPrice || 0,
          status: booking.status || 'pending',
          ...booking
        }));

      if (isMounted) {
        setStats({
          loading: false,
          error: null,
          totalUsers: Object.keys(usersData).length,
          activeUsers: Object.keys(usersData).length, // Simplified for demo
          totalBookings: Object.keys(bookingsData).length,
          totalPackages: Object.keys(packagesData).length,
          recentBookings,
          revenue: recentBookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
          revenueChange: 12.5 // Placeholder
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (isMounted) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load data'
        }));
      }
    }
  };

  // Initialize Firebase and fetch data
  const initializeApp = async () => {
    try {
      if (!isInitialized()) await initFirebase();
      if (!isInitialized()) throw new Error('Failed to initialize Firebase');
      await fetchDashboardData();
    } catch (error) {
      console.error('Initialization error:', error);
      if (isMounted) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to initialize. Please refresh.'
        }));
      }
    }
  };

  // Handle booking status update
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await db.update(`bookings/${bookingId}`, { status: newStatus });
      setStats(prev => ({
        ...prev,
        recentBookings: prev.recentBookings.map(b => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      }));
      setSelectedBooking(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  // Handle booking deletion
  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await db.delete(`bookings/${bookingId}`);
      setStats(prev => ({
        ...prev,
        recentBookings: prev.recentBookings.filter(b => b.id !== bookingId)
      }));
      setSelectedBooking(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Component lifecycle
  useEffect(() => {
    initializeApp();
    return () => setIsMounted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading state
  if (stats.loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Error state
  if (stats.error) {
    return (
      <div className="admin-dashboard">
        <div className="error">
          <p>{stats.error}</p>
          <button onClick={initializeApp}>Retry</button>
        </div>
      </div>
    );
  }

  // Chart data
  const chartData = {
    labels: stats.recentBookings.map(b => new Date(b.date).toLocaleDateString()),
    datasets: [{
      label: 'Revenue',
      data: stats.recentBookings.map(b => b.amount || 0),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)'
    }]
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <button className="btn btn-primary">
            <FaBoxOpen /> New Package
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-details">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
        </div>
        {/* Add other stat cards similarly */}
      </div>

      {/* Bookings Section */}
      <div className="bookings-section">
        <div className="section-header">
          <h2>Recent Bookings</h2>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="bookings-grid">
          {stats.recentBookings
            .filter(b => statusFilter === 'all' || b.status === statusFilter)
            .map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="user-avatar">
                    {booking.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="booking-info">
                    <h4>{booking.user}</h4>
                    <p className="booking-date">
                      <FaCalendarAlt /> {new Date(booking.date).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                
                <div className="booking-details">
                  <p><strong>Package:</strong> {booking.package}</p>
                  <p><strong>Amount:</strong> ${booking.amount?.toFixed(2)}</p>
                </div>

                <div className="booking-actions">
                  {booking.status === 'pending' && (
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                    >
                      <FaCheckCircle /> Confirm
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                    >
                      <FaClipboardCheck /> Complete
                    </button>
                  )}
                  {booking.status !== 'cancelled' && (
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                    >
                      <FaTimesCircle /> Cancel
                    </button>
                  )}
                  <button 
                    className="btn btn-sm btn-error"
                    onClick={() => deleteBooking(booking.id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
