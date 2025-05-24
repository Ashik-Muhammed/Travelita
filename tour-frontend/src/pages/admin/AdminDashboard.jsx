import React, { useState, useEffect } from 'react';
import { db, isInitialized, initFirebase } from '../../config/firebase';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBookings: 0,
    totalPackages: 0,
    recentBookings: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const initializeAndFetchData = async () => {
      try {
        // Ensure Firebase is initialized
        if (!isInitialized()) {
          console.log('Initializing Firebase...');
          await initFirebase();
        }

        if (!isInitialized()) {
          console.error('Failed to initialize Firebase');
          throw new Error('Failed to initialize Firebase');
        }

        await fetchDashboardData();
      } catch (error) {
        console.error('Initialization error:', error);
        if (isMounted) {
          setStats(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to initialize database. Please refresh the page.'
          }));
        }
      }
    };

    const fetchDashboardData = async () => {
      try {
        console.log('Fetching dashboard data...');
        
        // Fetch users
        const usersSnapshot = await db.get('users');
        const usersData = usersSnapshot || {};
        const usersCount = Object.keys(usersData).length;

        // Fetch bookings
        const bookingsSnapshot = await db.get('bookings');
        const bookingsData = bookingsSnapshot || {};
        const bookingsCount = Object.keys(bookingsData).length;
        
        // Get recent bookings (last 5)
        const recentBookings = Object.entries(bookingsData)
          .slice(-5)
          .map(([id, booking]) => ({
            id,
            ...booking,
            date: new Date(booking.createdAt).toLocaleDateString()
          }))
          .reverse();

        // Fetch packages
        const packagesSnapshot = await db.get('packages');
        const packagesData = packagesSnapshot || {};
        const packagesCount = Object.keys(packagesData).length;

        // Calculate active users (last 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const activeUsers = Object.values(usersData).filter(
          user => user.lastLogin && user.lastLogin > thirtyDaysAgo
        ).length;

        if (isMounted) {
          setStats({
            totalUsers: usersCount,
            activeUsers,
            totalBookings: bookingsCount,
            totalPackages: packagesCount,
            recentBookings,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (isMounted) {
          setStats(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Failed to load dashboard data. Please try again later.'
          }));
        }
      }
    };

    initializeAndFetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (stats.loading) {
    return (
      <div className="admin-dashboard">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">{stats.error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-icon">👥</div>
        </div>
        
        <div className="stat-card">
          <h3>Active Users</h3>
          <div className="stat-value">{stats.activeUsers}</div>
          <div className="stat-icon">🟢</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <div className="stat-value">{stats.totalBookings}</div>
          <div className="stat-icon">📅</div>
        </div>
        
        <div className="stat-card">
          <h3>Tour Packages</h3>
          <div className="stat-value">{stats.totalPackages}</div>
          <div className="stat-icon">✈️</div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h3>Recent Bookings</h3>
        {stats.recentBookings.length > 0 ? (
          <div className="bookings-table">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Package</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.id.substring(0, 8)}...</td>
                    <td>{booking.packageName || 'N/A'}</td>
                    <td>{booking.userName || 'Guest'}</td>
                    <td>{booking.date}</td>
                    <td>
                      <span className={`status-badge ${booking.status || 'pending'}`}>
                        {booking.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No recent bookings found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
