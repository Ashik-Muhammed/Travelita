import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rtdb } from '../config/firebase';
import { ref, get } from 'firebase/database';
import './PackageListPage.css'; // Styles for the list page

const IconPin = () => <span className="icon-style">📍</span>;
const IconClock = () => <span className="icon-style">🕒</span>;


function AllPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get packages from Firebase Realtime Database
        const packagesRef = ref(rtdb, 'packages');
        const packagesSnapshot = await get(packagesRef);
        
        if (packagesSnapshot.exists()) {
          // Convert the object of packages to an array
          const packagesData = Object.entries(packagesSnapshot.val()).map(([id, data]) => ({
            id,
            ...data
          }));
          setPackages(packagesData);
        } else {
          setPackages([]);
        }
      } catch (err) {
        console.error("Failed to fetch packages:", err);
        setError('Could not load packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []); // Add filter states to dependency array if they affect the fetch

  if (loading) {
    return <div className="package-list-loading"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="package-list-error container">Error: {error}</div>;
  }

  return (
    <div className="package-list-page">
      <div className="page-title-bar">
        <div className="container">
          <h1>All Tour Packages</h1>
          {/* You can add a subtitle here if desired */}
        </div>
      </div>
      
      <div className="container">
        {/* Optional Filters Bar - uncomment and style if implementing */}
        {/*
        <div className="filters-bar">
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input type="text" id="search" name="search" className="input" placeholder="e.g., Paris, Adventure" />
          </div>
          <div className="filter-group">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" name="sort" className="input">
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="duration_asc">Duration: Shortest</option>
              <option value="duration_desc">Duration: Longest</option>
            </select>
          </div>
          <button className="btn btn-secondary">Apply Filters</button>
        </div>
        */}

        {packages.length === 0 && !loading && (
          <div className="package-list-no-results">
            <p>No packages found.</p> {/* Simpler message */}
          </div>
        )}

        {packages.length > 0 && (
          <div className="package-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className="card package-card">
                <img 
                  src={pkg.images && pkg.images.length > 0 
                    ? pkg.images[0] 
                    : 'https://via.placeholder.com/300x200?text=No+Image'} 
                  alt={pkg.title} 
                />
                <div className="package-card-content">
                  <h3 className="package-card-title">{pkg.title}</h3>
                  <p className="package-card-destination"><IconPin /> {pkg.destination}</p>
                  <p className="package-card-duration"><IconClock /> {pkg.duration}</p>
                  <p className="package-card-price">₹{typeof pkg.price === 'number' ? pkg.price.toLocaleString() : pkg.price}</p>
                  <Link to={`/packages/${pkg.id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllPackages;
