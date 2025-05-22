import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, rtdb } from '../../config/firebase';
import { ref, get, remove, update, query, orderByChild, equalTo } from 'firebase/database';

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
    return <div className="packages-loading">Loading packages...</div>;
  }

  if (error) {
    return <div className="packages-error">{error}</div>;
  }

  if (packages.length === 0) {
    return (
      <div className="no-packages">
        <p>You haven't added any tour packages yet.</p>
      </div>
    );
  }

  return (
    <div className="vendor-packages">
      <div className="packages-grid">
        {packages.map(pkg => (
          <div key={pkg.id} className="package-card">
            <div className="package-image">
              <img 
                src={pkg.images && pkg.images.length > 0 
                  ? pkg.images[0] // Direct image URL from Firebase
                  : 'https://via.placeholder.com/300x200?text=No+Image'
                } 
                alt={pkg.title} 
              />
              <span className={`package-status ${pkg.available ? 'active' : 'inactive'}`}>
                {pkg.available ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="package-content">
              <h3>{pkg.title}</h3>
              <p className="package-destination">{pkg.destination} • {pkg.duration}</p>
              <p className="package-price">₹{pkg.price.toLocaleString()}</p>
              
              <div className="package-actions">
                <button 
                  className={`status-toggle ${pkg.available ? 'deactivate' : 'activate'}`}
                  onClick={() => togglePackageStatus(pkg.id, pkg.available)}
                >
                  {pkg.available ? 'Deactivate' : 'Activate'}
                </button>
                
                <Link to={`/packages/${pkg.id}`} className="view-button">
                  View
                </Link>
                
                <Link to={`/vendor/edit-package/${pkg.id}`} className="edit-button">
                  Edit
                </Link>
                
                <button 
                  className="delete-button"
                  onClick={() => setDeleteModal({ show: true, packageId: pkg.id })}
                >
                  Delete
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
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this package? This action cannot be undone.</p>
            
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setDeleteModal({ show: false, packageId: null })}
              >
                Cancel
              </button>
              
              <button 
                className="confirm-button"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPackages; 