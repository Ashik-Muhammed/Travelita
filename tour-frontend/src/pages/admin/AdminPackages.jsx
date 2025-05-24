import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, ref, get } from '../../config/firebase';
import './AdminPackages.css';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    destination: '',
    duration: '',
    price: '',
    category: '',
    featured: false
  });

  // Fetch packages from Firebase
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const packagesData = await db.get('packages');
        const packagesList = Object.entries(packagesData || {}).map(([id, pkg]) => ({
          id,
          ...pkg
        }));
        setPackages(packagesList);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load packages. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Handle category filter
  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Start editing a package
  const handleEdit = (pkg) => {
    setEditingId(pkg.id);
    setEditForm({
      name: pkg.name || '',
      destination: pkg.destination || '',
      duration: pkg.duration || '',
      price: pkg.price || '',
      category: pkg.category || 'adventure',
      featured: pkg.featured || false
    });
  };

  // Save package edits
  const handleSaveEdit = async (packageId) => {
    try {
      // Use the db.set method to update the package
      await db.set(`packages/${packageId}`, {
        ...editForm,
        id: packageId, // Ensure the ID is preserved
        updatedAt: Date.now()
      });
      
      // Update local state
      setPackages(packages.map(pkg => 
        pkg.id === packageId 
          ? { ...pkg, ...editForm } 
          : pkg
      ));
      
      setEditingId(null);
    } catch (err) {
      console.error('Error updating package:', err);
      setError('Failed to update package: ' + (err.message || 'Please try again.'));
    }
  };

  // Delete a package
  const handleDelete = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        // Use the db.remove method
        await db.remove(`packages/${packageId}`);
        
        // Update local state
        setPackages(packages.filter(pkg => pkg.id !== packageId));
      } catch (err) {
        console.error('Error deleting package:', err);
        setError('Failed to delete package');
      }
    }
  };

  // Toggle package featured status
  const toggleFeatured = async (pkg) => {
    try {
      const newFeaturedStatus = !pkg.featured;
      
      await db.update(`packages/${pkg.id}`, { featured: newFeaturedStatus });
      
      // Update local state
      setPackages(packages.map(item => 
        item.id === pkg.id 
          ? { ...item, featured: newFeaturedStatus } 
          : item
      ));
    } catch (err) {
      console.error('Error updating package status:', err);
      setError('Failed to update package status');
    }
  };

  // Filter packages based on search term and category
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = 
      (pkg.name && pkg.name.toLowerCase().includes(searchTerm)) ||
      (pkg.destination && pkg.destination.toLowerCase().includes(searchTerm)) ||
      (pkg.description && pkg.description.toLowerCase().includes(searchTerm));
    
    const matchesCategory = categoryFilter === 'all' || pkg.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get unique categories for filter
  const categories = ['all', ...new Set(packages.map(pkg => pkg.category).filter(Boolean))];

  if (loading) {
    return <div className="admin-packages">Loading packages...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-packages">
      <div className="admin-header">
        <h2>Manage Tour Packages</h2>
        <Link to="/admin/packages/new" className="add-package-btn">
          <i className="fas fa-plus"></i> Add New Package
        </Link>
      </div>
      
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <i className="fas fa-search"></i>
        </div>
        
        <div className="category-filter">
          <select value={categoryFilter} onChange={handleCategoryFilter}>
            <option value="all">All Categories</option>
            {categories.filter(cat => cat !== 'all').map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="packages-summary">
        <div className="summary-card total">
          <h3>Total Packages</h3>
          <div className="value">{packages.length}</div>
        </div>
        <div className="summary-card featured">
          <h3>Featured</h3>
          <div className="value">
            {packages.filter(pkg => pkg.featured).length}
          </div>
        </div>
        <div className="summary-card adventure">
          <h3>Adventure</h3>
          <div className="value">
            {packages.filter(pkg => pkg.category === 'adventure').length}
          </div>
        </div>
        <div className="summary-card luxury">
          <h3>Luxury</h3>
          <div className="value">
            {packages.filter(pkg => pkg.category === 'luxury').length}
          </div>
        </div>
      </div>
      
      {filteredPackages.length === 0 ? (
        <div className="no-results">
          <i className="fas fa-box-open"></i>
          <p>No packages found</p>
          <Link to="/admin/packages/new" className="add-package-btn">
            <i className="fas fa-plus"></i> Add Your First Package
          </Link>
        </div>
      ) : (
        <div className="packages-grid">
          {filteredPackages.map(pkg => (
            <div key={pkg.id} className={`package-card ${pkg.featured ? 'featured' : ''}`}>
              {pkg.featured && <div className="featured-badge">Featured</div>}
              
              <div className="package-image">
                {pkg.imageUrl ? (
                  <img src={pkg.imageUrl} alt={pkg.name} />
                ) : (
                  <div className="image-placeholder">
                    <i className="fas fa-camera"></i>
                  </div>
                )}
                <div className="package-actions">
                  <button 
                    className={`feature-btn ${pkg.featured ? 'active' : ''}`}
                    onClick={() => toggleFeatured(pkg)}
                    title={pkg.featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    <i className="fas fa-star"></i>
                  </button>
                </div>
              </div>
              
              <div className="package-details">
                {editingId === pkg.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      placeholder="Package name"
                      className="form-input"
                    />
                    <input
                      type="text"
                      name="destination"
                      value={editForm.destination}
                      onChange={handleEditChange}
                      placeholder="Destination"
                      className="form-input"
                    />
                    <div className="form-row">
                      <input
                        type="text"
                        name="duration"
                        value={editForm.duration}
                        onChange={handleEditChange}
                        placeholder="Duration"
                        className="form-input"
                      />
                      <input
                        type="number"
                        name="price"
                        value={editForm.price}
                        onChange={handleEditChange}
                        placeholder="Price"
                        className="form-input"
                      />
                    </div>
                    <select
                      name="category"
                      value={editForm.category}
                      onChange={handleEditChange}
                      className="form-select"
                    >
                      <option value="adventure">Adventure</option>
                      <option value="beach">Beach</option>
                      <option value="cultural">Cultural</option>
                      <option value="luxury">Luxury</option>
                      <option value="wildlife">Wildlife</option>
                      <option value="honeymoon">Honeymoon</option>
                      <option value="family">Family</option>
                    </select>
                    <div className="form-actions">
                      <button 
                        className="save-btn"
                        onClick={() => handleSaveEdit(pkg.id)}
                      >
                        Save
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="package-header">
                      <h3>{pkg.name}</h3>
                      <div className="package-price">
                        {formatCurrency(pkg.price || 0)}
                        <span>per person</span>
                      </div>
                    </div>
                    
                    <div className="package-meta">
                      <span className="destination">
                        <i className="fas fa-map-marker-alt"></i> {pkg.destination}
                      </span>
                      <span className="duration">
                        <i className="far fa-clock"></i> {pkg.duration}
                      </span>
                      <span className={`category ${pkg.category || 'adventure'}`}>
                        {pkg.category || 'Adventure'}
                      </span>
                    </div>
                    
                    <div className="package-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(pkg)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(pkg.id)}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                      <Link 
                        to={`/package/${pkg.id}`} 
                        className="view-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fas fa-eye"></i> View
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
