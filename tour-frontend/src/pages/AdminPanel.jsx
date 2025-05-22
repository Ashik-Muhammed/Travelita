import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { rtdb } from '../config/firebase';
import { ref, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { populateSampleData } from '../services/sampleData';
import { getFallbackImage } from '../utils/imageUtils';
import './AdminPanel.css';

function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalPackages: 0,
    totalBookings: 0,
    pendingApprovals: 0,
    recentPackages: [],
    recentBookings: [],
    packagesByDestination: {},
    bookingsByMonth: {}
  });
  const [pendingPackages, setPendingPackages] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [sampleDataMessage, setSampleDataMessage] = useState('');
  const [isSampleDataLoading, setIsSampleDataLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || user.role !== 'admin') {
          setError('Admin authentication required');
          setLoading(false);
          navigate('/login');
          return;
        }

        // Fetch data from Firebase Realtime Database
        try {
          // Get users data
          const usersRef = ref(rtdb, 'users');
          const usersSnapshot = await get(usersRef);
          const usersData = usersSnapshot.exists() ? 
            Object.entries(usersSnapshot.val()).map(([id, data]) => ({
              id,
              ...data
            })) : [];
          
          const regularUsers = usersData.filter(user => user.role === 'user');
          const vendors = usersData.filter(user => user.role === 'vendor');
          
          setAllUsers(regularUsers);
          setAllVendors(vendors);
          
          // Get packages data
          const packagesRef = ref(rtdb, 'tourPackages');
          const packagesSnapshot = await get(packagesRef);
          const packagesData = packagesSnapshot.exists() ? 
            Object.entries(packagesSnapshot.val()).map(([id, data]) => ({
              id,
              ...data,
              // Ensure createdAt exists for sorting
              createdAt: data.createdAt || Date.now()
            })) : [];
          
          setAllPackages(packagesData);
          
          // Get pending packages
          const pendingPackagesData = packagesData.filter(pkg => pkg.status === 'pending' || !pkg.status);
          setPendingPackages(pendingPackagesData);
          
          // Get bookings data
          const bookingsRef = ref(rtdb, 'bookings');
          const bookingsSnapshot = await get(bookingsRef);
          const bookingsData = bookingsSnapshot.exists() ? 
            Object.entries(bookingsSnapshot.val()).map(([id, data]) => ({
              id,
              ...data,
              // Ensure createdAt exists for sorting
              createdAt: data.createdAt || Date.now()
            })) : [];
          
          // Get recent packages (last 5)
          const recentPackages = [...packagesData]
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 5);
          
          // Get recent bookings (last 5)
          const recentBookings = [...bookingsData]
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 5);
          
          // Analyze packages by destination
          const packagesByDestination = packagesData.reduce((acc, pkg) => {
            const destination = pkg.destination || 'Other';
            if (!acc[destination]) {
              acc[destination] = 0;
            }
            acc[destination]++;
            return acc;
          }, {});
          
          // Analyze bookings by month
          const bookingsByMonth = bookingsData.reduce((acc, booking) => {
            let date;
            try {
              date = new Date(booking.createdAt);
              if (isNaN(date.getTime())) {
                date = new Date(); // Use current date as fallback
              }
            } catch (e) {
              date = new Date(); // Use current date as fallback
            }
            
            const month = date.toLocaleString('default', { month: 'short' });
            if (!acc[month]) {
              acc[month] = 0;
            }
            acc[month]++;
            return acc;
          }, {});
          
          setStats({
            totalUsers: regularUsers.length,
            totalVendors: vendors.length,
            totalPackages: packagesData.length,
            totalBookings: bookingsData.length,
            pendingApprovals: pendingPackagesData.length,
            recentPackages,
            recentBookings,
            packagesByDestination,
            bookingsByMonth
          });
        } catch (statsErr) {
          console.error('Error fetching admin stats:', statsErr);
          // Use default stats if there's an error
          setStats({
            totalUsers: 0,
            totalVendors: 0,
            totalPackages: 0,
            totalBookings: 0,
            pendingApprovals: 0,
            recentPackages: [],
            recentBookings: [],
            packagesByDestination: {},
            bookingsByMonth: {}
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to fetch admin data. Please try again.');
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  // Handle package approval
  const handleApprovePackage = async (packageId) => {
    try {
      setActionLoading(true);
      const packageRef = ref(rtdb, `tourPackages/${packageId}`);
      await update(packageRef, { status: 'approved' });
      
      // Update the local state
      setPendingPackages(prev => prev.filter(pkg => pkg.id !== packageId));
      setAllPackages(prev => prev.map(pkg => 
        pkg.id === packageId ? { ...pkg, status: 'approved' } : pkg
      ));
      
      setActionLoading(false);
    } catch (err) {
      console.error('Error approving package:', err);
      setActionLoading(false);
    }
  };

  // Handle package rejection
  const handleRejectPackage = async (packageId) => {
    try {
      setActionLoading(true);
      const packageRef = ref(rtdb, `tourPackages/${packageId}`);
      await update(packageRef, { status: 'rejected' });
      
      // Update the local state
      setPendingPackages(prev => prev.filter(pkg => pkg.id !== packageId));
      setAllPackages(prev => prev.map(pkg => 
        pkg.id === packageId ? { ...pkg, status: 'rejected' } : pkg
      ));
      
      setActionLoading(false);
    } catch (err) {
      console.error('Error rejecting package:', err);
      setActionLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Filter packages based on search term and status
  const filteredPackages = allPackages.filter(pkg => {
    const matchesSearch = pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         pkg.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') {
      return matchesSearch;
    }
    
    return matchesSearch && pkg.status === filterStatus;
  });

  const handleAddSampleData = async () => {
    try {
      setIsSampleDataLoading(true);
      setSampleDataMessage('');
      
      const result = await populateSampleData();
      
      setSampleDataMessage(result.message);
      setIsSampleDataLoading(false);
      
      // If sample data was added successfully, refresh the admin data
      if (result.success) {
        // Reload the page to refresh data instead of calling fetchAdminData
        window.location.reload();
      }
    } catch (err) {
      console.error('Error adding sample data:', err);
      setSampleDataMessage(`Error adding sample data: ${err.message}`);
      setIsSampleDataLoading(false);
    }
  };

  const handleApproval = async (packageId, action) => {
    try {
      setActionLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));

      console.log(`Attempting to ${action} package ${packageId}`);
      
      // Get the package reference in Firebase
      const packageRef = ref(rtdb, `tourPackages/${packageId}`);
      const packageSnapshot = await get(packageRef);
      
      if (!packageSnapshot.exists()) {
        throw new Error('Package not found');
      }
      
      const packageData = packageSnapshot.val();
      
      // Update the package status based on the action
      if (action === 'approve') {
        await update(packageRef, {
          status: 'approved',
          approvedAt: Date.now(),
          approvedBy: user.id
        });
      } else if (action === 'reject') {
        await update(packageRef, {
          status: 'rejected',
          rejectedAt: Date.now(),
          rejectedBy: user.id
        });
      }

      console.log(`Package ${action} successful`);

      // Update pending packages list
      setPendingPackages(pendingPackages.filter(pkg => pkg.id !== packageId));
      
      // Update stats
      setStats({
        ...stats,
        pendingApprovals: stats.pendingApprovals - 1,
        totalPackages: action === 'approve' ? stats.totalPackages + 1 : stats.totalPackages
      });
      
      // Show success message
      const message = document.createElement('div');
      message.className = 'success-toast';
      message.textContent = `Package ${action === 'approve' ? 'approved' : 'rejected'} successfully`;
      document.body.appendChild(message);
      setTimeout(() => {
        message.remove();
      }, 3000);
      
      setActionLoading(false);
    } catch (err) {
      console.error('Error during package approval/rejection:', err);
      
      // Get more detailed error information
      let errorMessage = `Failed to ${action} package. Please try again.`;
      
      // Show error message to the user
      const message = document.createElement('div');
      message.className = 'error-toast';
      message.textContent = errorMessage;
      document.body.appendChild(message);
      setTimeout(() => {
        message.remove();
      }, 5000); // Show error for longer time
      
      setActionLoading(false);
    }
  };

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
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage your tour package platform and monitor system performance
          </p>
          
          {/* Admin Navigation Tabs */}
          <div className="admin-tabs">
            <button 
              className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`} 
              onClick={() => handleTabChange('dashboard')}
            >
              <span className="tab-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </span>
              Dashboard
            </button>
            
            <button 
              className={`admin-tab ${activeTab === 'packages' ? 'active' : ''}`} 
              onClick={() => handleTabChange('packages')}
            >
              <span className="tab-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </span>
              Packages
              {pendingPackages.length > 0 && (
                <span className="notification-badge">{pendingPackages.length}</span>
              )}
            </button>
            
            <button 
              className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`} 
              onClick={() => handleTabChange('bookings')}
            >
              <span className="tab-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </span>
              Bookings
            </button>
            
            <button 
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} 
              onClick={() => handleTabChange('users')}
            >
              <span className="tab-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </span>
              Users
            </button>
            
            <Link to="/admin/bookings" className="admin-tab">
              <span className="tab-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </span>
              Bookings Management
            </Link>
          </div>
        </div>

        {/* Conditional Content Based on Active Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              {/* Total Users */}
              <div className="stats-card users-card">
                <div className="card-content">
                  <div className="card-inner">
                    <div className="card-icon blue">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div className="card-details">
                      <h3 className="card-title">Total Users</h3>
                      <div className="card-stat-row">
                        <div className="card-stat-value">{stats.totalUsers}</div>
                        <button onClick={() => handleTabChange('users')} className="card-link">
                          View all
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Vendors */}
              <div className="stats-card vendors-card">
                <div className="card-content">
                  <div className="card-inner">
                    <div className="card-icon indigo">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div className="card-details">
                      <h3 className="card-title">Vendors</h3>
                      <div className="card-stat-row">
                        <div className="card-stat-value">{stats.totalVendors}</div>
                        <button onClick={() => handleTabChange('users')} className="card-link">
                          View all
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Packages */}
              <div className="stats-card packages-card">
                <div className="card-content">
                  <div className="card-inner">
                    <div className="card-icon green">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                      </svg>
                    </div>
                    <div className="card-details">
                      <h3 className="card-title">Packages</h3>
                      <div className="card-stat-row">
                        <div className="card-stat-value">{stats.totalPackages}</div>
                        <button onClick={() => handleTabChange('packages')} className="card-link">
                          View all
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

          {/* Total Bookings */}
          <div className="stats-card bookings-card">
            <div className="card-content">
              <div className="card-inner">
                <div className="card-icon yellow">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                </div>
                <div className="card-details">
                  <h3 className="card-title">Bookings</h3>
                  <div className="card-stat-row">
                    <div className="card-stat-value">{stats.totalBookings}</div>
                    <Link to="/admin/bookings" className="card-link">
                      View all
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
        </div>
        </>)}



        {/* Pending Approvals */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="section-title">Pending Package Approvals</h2>
            <span className="badge badge-pending">
              {stats.pendingApprovals}
            </span>
          </div>
          
          {pendingPackages.length === 0 ? (
            <div className="section-box empty-message">
              <p className="empty-text">No packages pending approval at this time.</p>
            </div>
          ) : (
            <div className="section-box">
              <ul className="package-list">
                {pendingPackages.map((pkg, index) => (
                  <li key={pkg.id || pkg._id || `pending-package-${index}`} className="package-card">
                    <div className="package-row">
                      <div className="package-content">
                        <div className="package-image">
                          <img
                            src={pkg.images && pkg.images.length > 0 ? 
                              (pkg.images[0].startsWith('http') ? pkg.images[0] : 'https://source.unsplash.com/random/300x200/?travel') : 
                              'https://source.unsplash.com/random/300x200/?travel'}
                            alt={pkg.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://source.unsplash.com/random/300x200/?travel';
                            }}
                          />
                        </div>
                        <div className="package-details">
                          <h3 className="package-title">{pkg.title}</h3>
                          <div className="package-info">
                            <span className="package-meta">Vendor: {pkg.vendor?.name || 'Unknown'}</span>
                            <span className="package-divider">•</span>
                            <span className="package-meta">Price: ₹{pkg.price}</span>
                            <span className="package-divider">•</span>
                            <span className="package-meta">{pkg.duration}</span>
                            <span className="package-divider">•</span>
                            <span className="package-meta">Destination: {pkg.destination}</span>
                          </div>
                          <p className="package-description">{pkg.description}</p>
                        </div>
                      </div>
                      <div className="action-buttons">
                        <Link
                          to={`/packages/${pkg.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-button view"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </Link>
                        <button
                          onClick={() => handleApproval(pkg.id, 'approve')}
                          disabled={actionLoading}
                          className="action-button approve"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(pkg.id, 'reject')}
                          disabled={actionLoading}
                          className="action-button reject"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="section-title">Recent Packages</h2>
          </div>
          <div className="section-box">
            {stats.recentPackages && stats.recentPackages.length > 0 ? (
              <ul className="package-list">
                {stats.recentPackages.map((pkg, index) => (
                  <li key={pkg.id || pkg._id || `recent-package-${index}`} className="package-card">
                    <div className="package-content">
                      <div className="package-image">
                        <img
                          src={pkg.images && pkg.images.length > 0 ? 
                            (pkg.images[0].startsWith('http') ? pkg.images[0] : 'https://source.unsplash.com/random/300x200/?travel') : 
                            'https://source.unsplash.com/random/300x200/?travel'}
                          alt={pkg.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://source.unsplash.com/random/300x200/?travel';
                          }}
                        />
                      </div>
                      <div className="package-details">
                        <Link to={`/packages/${pkg._id}`} className="package-title-link">
                          {pkg.title}
                        </Link>
                        <div className="package-info">
                          <span className="package-meta">Status: 
                            <span className={`badge ${
                              pkg.status === 'approved' ? 'badge-approved' : 
                              pkg.status === 'pending' ? 'badge-pending' : 
                              'badge-rejected'
                            }`}>{pkg.status}</span>
                          </span>
                          <span className="package-divider">•</span>
                          <span className="package-meta">Added: {new Date(pkg.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-message">
                <p className="empty-text">No recent packages available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons to manage sections */}
        <div className="nav-grid">
          <Link to="/admin/users" className="nav-card">
            <div className="nav-card-content">
              <div className="nav-icon purple">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="nav-details">
                <h3 className="nav-title">Manage Users</h3>
                <p className="nav-desc">
                  View and manage user accounts and permissions
                </p>
              </div>
            </div>
          </Link>
          
          <Link to="/admin/packages" className="nav-card">
            <div className="nav-card-content">
              <div className="nav-icon blue">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="nav-details">
                <h3 className="nav-title">Manage Packages</h3>
                <p className="nav-desc">
                  View, edit, and delete tour packages
                </p>
              </div>
            </div>
          </Link>
          
          <Link to="/admin/bookings" className="nav-card">
            <div className="nav-card-content">
              <div className="nav-icon green">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="nav-details">
                <h3 className="nav-title">Manage Bookings</h3>
                <p className="nav-desc">
                  View and manage all customer bookings
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel; 