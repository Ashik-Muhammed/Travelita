import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, rtdb } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import '../styles/VendorDashboard.new.css';

// Dashboard components
import VendorPackages from '../components/vendor/VendorPackages';
import VendorBookings from '../components/vendor/VendorBookings';
import VendorProfile from '../components/vendor/VendorProfile';
import PackageForm from '../components/vendor/PackageForm';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('packages');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    
    // Use Firebase Authentication to check if user is logged in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // No user is signed in, redirect to login
        console.log('No user signed in, redirecting to login');
        navigate('/vendor/login');
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if the user is a vendor by fetching vendor data from Realtime Database
        console.log('Checking if user is a vendor:', user.uid);
        const vendorRef = ref(rtdb, `vendors/${user.uid}`);
        const vendorSnapshot = await get(vendorRef);
        
        if (!vendorSnapshot.exists()) {
          // User exists but is not a vendor
          console.log('User is not a vendor, redirecting to login');
          setError('This account is not registered as a vendor. Please use the customer login.');
          await signOut(auth);
          navigate('/vendor/login');
          return;
        }
        
        // User is a vendor, get vendor data
        const vendorData = vendorSnapshot.val();
        
        // Get vendor's earnings from the earnings node
        const earningsRef = ref(rtdb, `earnings/${user.uid}`);
        const earningsSnapshot = await get(earningsRef);
        const earningsData = earningsSnapshot.exists() ? earningsSnapshot.val() : { total: 0 };
        
        // Combine vendor data with earnings
        const updatedVendorInfo = {
          ...vendorData,
          earnings: typeof earningsData === 'number' ? earningsData : (earningsData.total || 0)
        };
        
        console.log('Vendor data loaded:', updatedVendorInfo);
        setVendorInfo(updatedVendorInfo);
        
        // Store vendor info in localStorage for convenience
        localStorage.setItem('vendorInfo', JSON.stringify(updatedVendorInfo));
      } catch (err) {
        console.error('Error fetching vendor profile:', err);
        setError('Failed to load vendor profile. Please try logging in again.');
      } finally {
        setIsLoading(false);
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Sign out from Firebase Authentication
      await signOut(auth);
      // Clear any local storage items
      localStorage.removeItem('vendorInfo');
      console.log('Vendor logged out successfully');
      // Redirect to login page
      navigate('/vendor/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to log out. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  // Calculate stats for the dashboard
  const stats = [
    { 
      title: 'Earnings', 
      value: `₹${Math.floor(vendorInfo?.earnings || 0).toLocaleString('en-IN')}`, 
      icon: 'rupee',
      color: 'warning',
      description: 'Total revenue from bookings'
    }
  ];

  return (
    <div className="vendor-dashboard-container">
      {/* Sidebar */}
      <aside className="vendor-sidebar">
        <div className="sidebar-header">
          <h2>Travelita</h2>
          
          <p>Vendor Portal</p>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'packages' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('packages');
                setShowAddPackage(false);
              }}
            >
              <span></span> Tour Packages
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('bookings');
                setShowAddPackage(false);
              }}
            >
              <span></span> Bookings
            </a>
          </div>
          <div className="nav-item">
            <a 
              href="#" 
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('profile');
                setShowAddPackage(false);
              }}
            >
              <span></span> Profile
            </a>
          </div>
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-block btn-outline" onClick={handleLogout}>
            <span></span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="vendor-main-content">
        {/* Dashboard Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-content">
            <div className="welcome-section">
              <h1>Welcome back, {vendorInfo?.name || 'Vendor'}! 👋</h1>
              <p>Here's what's happening with your tour business today</p>
            </div>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="quick-stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ background: `var(--${stat.color}-100)`, color: `var(--${stat.color}-600)` }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="content-body">
          {activeTab === 'packages' && !showAddPackage && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">My Tour Packages</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddPackage(true)}
                >
                  + Add New Package
                </button>
              </div>
              <div className="card-body">
                <VendorPackages />
              </div>
            </div>
          )}

          {activeTab === 'packages' && showAddPackage && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Add New Package</h2>
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowAddPackage(false)}
                >
                  ← Back to Packages
                </button>
              </div>
              <div className="card-body">
                <PackageForm onSuccess={() => setShowAddPackage(false)} />
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="card">
              <div className="card-body">
                <VendorBookings />
              </div>
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-body">
                <VendorProfile vendorInfo={vendorInfo} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard; 