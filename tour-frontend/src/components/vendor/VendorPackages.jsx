import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, rtdb } from '../../config/firebase';
import { ref, get, remove, update, query, orderByChild, equalTo } from 'firebase/database';
import { 
  FiAlertCircle, 
  FiPackage, 
  FiEdit2, 
  FiX, 
  FiTrash2, 
  FiMapPin, 
  FiUser, 
  FiCalendar 
} from 'react-icons/fi';
import './VendorPackages.css';

const VendorPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, packageId: null });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
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
      
      console.log('Fetching packages for vendor:', user.uid);
      
      // Query packages by vendorId from Realtime Database
      const packagesRef = ref(rtdb, 'tourPackages');
      const packagesQuery = query(packagesRef, orderByChild('vendorId'), equalTo(user.uid));
      const snapshot = await get(packagesQuery);
      
      if (!snapshot.exists()) {
        console.log('No packages found for this vendor');
        setPackages([]);
        setLoading(false);
        return;
      }
      
      // Convert snapshot to array
      const packagesArray = [];
      snapshot.forEach((childSnapshot) => {
        packagesArray.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      console.log('Packages loaded:', packagesArray);
      setPackages(packagesArray);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Failed to fetch packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePackageStatus = async (packageId, currentStatus) => {
    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) return;
      
      console.log('Toggling package status:', packageId, 'from', currentStatus, 'to', !currentStatus);
      
      // Update package status in Realtime Database
      const packageRef = ref(rtdb, `tourPackages/${packageId}`);
      await update(packageRef, { available: !currentStatus });
      
      // Update the package in state
      setPackages(packages.map(pkg => 
        pkg.id === packageId ? { ...pkg, available: !currentStatus } : pkg
      ));
      
      console.log('Package status updated successfully');
    } catch (err) {
      console.error('Error updating package status:', err);
      alert('Failed to update package status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.packageId) return;
    
    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) return;
      
      console.log('Deleting package:', deleteModal.packageId);
      
      // Delete package from Realtime Database
      const packageRef = ref(rtdb, `tourPackages/${deleteModal.packageId}`);
      await remove(packageRef);
      
      console.log('Package deleted successfully');
      
      // Remove the package from state
      setPackages(packages.filter(pkg => pkg.id !== deleteModal.packageId));
      setDeleteModal({ show: false, packageId: null });
    } catch (err) {
      console.error('Error deleting package:', err);
      alert('Failed to delete package');
    }
  };

  if (loading) {
    return <div className="packages-loading">
      <div className="loading-spinner"></div>
      <p>Loading packages...</p>
    </div>;
  }

  if (error) {
    return <div className="packages-error">
      <FiAlertCircle className="error-icon" />
      <p>{error}</p>
    </div>;
  }

  if (packages.length === 0) {
    return (
      <div className="no-packages">
        <FiPackage className="empty-icon" />
        <p>You haven't added any tour packages yet.</p>
        <Link to="/vendor/add-package" className="add-package-button">
          Add Your First Package
        </Link>
      </div>
    );
  }

  return (
    <div className="vendor-packages">
      <div className="packages-header">
        <h2>Your Tour Packages</h2>
        <p>Manage your tour packages and view their performance</p>
      </div>
      
      <div className="packages-grid">
        {packages.map(pkg => (
          <div key={pkg.id} className="package-card">
            <div className="package-image">
              <img 
                src={pkg.images && pkg.images.length > 0 
                  ? pkg.images[0]
                  : 'https://source.unsplash.com/random/600x400/?travel,' + Math.random()
                } 
                alt={pkg.title} 
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://source.unsplash.com/random/600x400/?vacation';
                }}
              />
              <span className={`package-status ${pkg.available ? 'active' : 'inactive'}`}>
                {pkg.available ? 'Active' : 'Inactive'}
              </span>
              
              <div className="package-rating">
                <span className="stars">★★★★★</span>
                <span className="rating-number">4.8</span>
              </div>
            </div>
            
            <div className="package-content">
              <h3>{pkg.title}</h3>
              <p className="package-destination">
                <FiMapPin /> {pkg.destination} • {pkg.duration}
              </p>
              <p className="package-price">
                ₹{pkg.price ? pkg.price.toLocaleString('en-IN') : '0'} <span className="per-person">/ person</span>
              </p>
              
              <div className="package-features">
                <span><FiUser /> {pkg.maxGroupSize || '12'} People</span>
                <span><FiCalendar /> {pkg.duration || '7 Days'}</span>
              </div>
              
              <div className="package-actions">
                <button 
                  className={`status-toggle ${pkg.available ? 'deactivate' : 'activate'}`}
                  onClick={() => togglePackageStatus(pkg.id, pkg.available)}
                >
                  {pkg.available ? 'Deactivate' : 'Activate'}
                </button>
                
                <Link to={`/packages/${pkg.id}`} className="view-button">
                  <FiPackage /> View
                </Link>
                
                <Link to={`/vendor/edit-package/${pkg.id}`} className="edit-button">
                  <FiEdit2 /> Edit
                </Link>
                
                <button 
                  className="delete-button"
                  onClick={() => setDeleteModal({ show: true, packageId: pkg.id })}
                >
                  <FiX /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="delete-modal">
          <div className="modal-content">
            <div className="modal-icon">
              <FiAlertCircle />
            </div>
            <h3>Delete Package</h3>
            <p>Are you sure you want to delete this package? This action cannot be undone and all package data will be permanently removed.</p>
            
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setDeleteModal({ show: false, packageId: null })}
              >
                <FiX /> Cancel
              </button>
              
              <button 
                className="confirm-button"
                onClick={handleDeleteConfirm}
              >
                <FiTrash2 /> Delete Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPackages; 