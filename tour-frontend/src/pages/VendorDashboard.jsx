import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, rtdb } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import '../styles/VendorDashboard.css';

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
        console.log('Vendor data loaded:', vendorData);
        setVendorInfo(vendorData);
        
        // Store vendor info in localStorage for convenience
        localStorage.setItem('vendorInfo', JSON.stringify(vendorData));
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
    return <div className="vendor-dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="vendor-dashboard-error">{error}</div>;
  }

  return (
    <div className="vendor-dashboard-container">
      <div className="vendor-dashboard-header">
        <h1>Vendor Dashboard</h1>
        <div className="vendor-dashboard-welcome">
          Welcome, {vendorInfo?.name || 'Vendor'}!
        </div>
        <div className="dashboard-actions">

          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="vendor-dashboard-content">
        <div className="vendor-dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('packages');
              setShowAddPackage(false);
            }}
          >
            Tour Packages
          </button>
          <button 
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('bookings');
              setShowAddPackage(false);
            }}
          >
            Bookings
          </button>
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('profile');
              setShowAddPackage(false);
            }}
          >
            Profile
          </button>
        </div>

        <div className="vendor-dashboard-view">
          {activeTab === 'packages' && !showAddPackage && (
            <>
              <div className="packages-header">
                <h2>My Tour Packages</h2>
                <button 
                  className="add-package-button"
                  onClick={() => setShowAddPackage(true)}
                >
                  Add New Package
                </button>
              </div>
              <VendorPackages />
            </>
          )}

          {activeTab === 'packages' && showAddPackage && (
            <>
              <div className="packages-header">
                <h2>Add New Package</h2>
                <button 
                  className="back-button"
                  onClick={() => setShowAddPackage(false)}
                >
                  Back to Packages
                </button>
              </div>
              <PackageForm onSuccess={() => setShowAddPackage(false)} />
            </>
          )}

          {activeTab === 'bookings' && <VendorBookings />}
          
          {activeTab === 'profile' && <VendorProfile vendorInfo={vendorInfo} />}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard; 