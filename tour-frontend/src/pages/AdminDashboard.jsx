import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBookings: 0,
    totalPackages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get users data from Realtime Database
        const usersRef = ref(db, 'users');
        const usersSnapshot = await get(usersRef);
        const usersData = usersSnapshot.val() || {};
        const usersCount = Object.keys(usersData).length;
        
        // Get bookings data from Realtime Database
        const bookingsRef = ref(db, 'bookings');
        const bookingsSnapshot = await get(bookingsRef);
        const bookingsData = bookingsSnapshot.val() || {};
        const bookingsCount = Object.keys(bookingsData).length;
        
        // Get packages data from Realtime Database
        const packagesRef = ref(db, 'packages');
        const packagesSnapshot = await get(packagesRef);
        const packagesData = packagesSnapshot.val() || {};
        const packagesCount = Object.keys(packagesData).length;
        
        // Calculate active users (users active in the last 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const activeUsersCount = Object.values(usersData).filter(user => 
          user.lastActive && user.lastActive > thirtyDaysAgo
        ).length;

        setStats({
          totalUsers: usersCount,
          activeUsers: activeUsersCount || 0,
          totalBookings: bookingsCount,
          totalPackages: packagesCount,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">Loading dashboard...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="error">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <h2>Dashboard Overview</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
            <div className="stat-icon">👥</div>
          </div>
          
          <div className="stat-card">
            <h3>Active Users</h3>
            <p className="stat-number">{stats.activeUsers}</p>
            <div className="stat-icon">🟢</div>
          </div>
          
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p className="stat-number">{stats.totalBookings}</p>
            <div className="stat-icon">📅</div>
          </div>
          
          <div className="stat-card">
            <h3>Tour Packages</h3>
            <p className="stat-number">{stats.totalPackages}</p>
            <div className="stat-icon">✈️</div>
          </div>
        </div>
        
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <p>Admin dashboard is under development. More features coming soon!</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
