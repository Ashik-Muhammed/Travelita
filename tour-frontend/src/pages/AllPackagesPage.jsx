import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import './AllPackagesPage.css';

// Icons
const IconPin = () => <span className="icon-style">📍</span>;
const IconClock = () => <span className="icon-style">🕒</span>;

const AllPackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    destination: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'title',
    sortOrder: 'asc'
  });
  
  const { getPackages } = useData();

  useEffect(() => {
    const fetchAllPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all packages (first 1000 packages)
        const result = await getPackages({}, 1, 1000);
        setPackages(result.packages || []);
      } catch (err) {
        console.error("Failed to fetch packages:", err);
        setError('Could not load packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllPackages();
  }, [getPackages]);

  // Filter and sort packages
  const filterAndSortPackages = () => {
    return packages
      .filter(pkg => {
        // Search filter
        const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pkg.destination.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Price filters
        const price = Number(pkg.price) || 0;
        const minPriceFilter = filters.minPrice ? price >= Number(filters.minPrice) : true;
        const maxPriceFilter = filters.maxPrice ? price <= Number(filters.maxPrice) : true;
        const destinationFilter = filters.destination ? 
          pkg.destination.toLowerCase() === filters.destination.toLowerCase() : true;
        
        return matchesSearch && minPriceFilter && maxPriceFilter && destinationFilter;
      })
      .sort((a, b) => {
        // Sorting
        let valueA, valueB;
        
        switch(filters.sortBy) {
          case 'price':
            valueA = Number(a.price) || 0;
            valueB = Number(b.price) || 0;
            break;
          case 'title':
          case 'destination':
            valueA = String(a[filters.sortBy] || '').toLowerCase();
            valueB = String(b[filters.sortBy] || '').toLowerCase();
            break;
          default:
            valueA = a[filters.sortBy] || 0;
            valueB = b[filters.sortBy] || 0;
        }
        
        if (filters.sortOrder === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
  };

  const filteredPackages = filterAndSortPackages();
  
  // Get unique destinations for filter
  const destinations = [...new Set(packages.map(pkg => pkg.destination))].sort();

  if (loading) {
    return (
      <div className="all-packages-loading">
        <div className="spinner"></div>
        <p>Loading packages...</p>
      </div>
    );
  }

  if (error) {
    return <div className="all-packages-error">{error}</div>;
  }

  return (
    <div className="all-packages-page">
      <div className="page-header">
        <div className="container">
          <h1>All Tour Packages</h1>
          <p>Explore our wide range of travel experiences</p>
        </div>
      </div>

      <div className="container">
        <div className="filters-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label>Destination</label>
              <select 
                value={filters.destination}
                onChange={(e) => setFilters({...filters, destination: e.target.value})}
                className="filter-select"
              >
                <option value="">All Destinations</option>
                {destinations.map((dest, index) => (
                  <option key={index} value={dest}>{dest}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Min Price</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                className="price-input"
                min="0"
              />
            </div>

            <div className="filter-group">
              <label>Max Price</label>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="price-input"
                min={filters.minPrice || "0"}
              />
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select 
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters({...filters, sortBy, sortOrder});
                }}
                className="filter-select"
              >
                <option value="title-asc">Name (A-Z)</option>
                <option value="title-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="destination-asc">Destination (A-Z)</option>
                <option value="destination-desc">Destination (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="packages-grid">
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => (
              <div key={pkg.id} className="package-card">
                <div className="package-image">
                  <img 
                    src={pkg.images && pkg.images.length > 0 
                      ? pkg.images[0] 
                      : 'https://via.placeholder.com/300x200?text=No+Image'} 
                    alt={pkg.title} 
                  />
                  {pkg.featured && <span className="featured-badge">Featured</span>}
                </div>
                <div className="package-details">
                  <h3>{pkg.title}</h3>
                  <p className="destination"><IconPin /> {pkg.destination}</p>
                  <p className="duration"><IconClock /> {pkg.duration}</p>
                  <div className="price-section">
                    <span className="price">₹{typeof pkg.price === 'number' ? pkg.price.toLocaleString() : pkg.price}</span>
                    <span className="per-person">per person</span>
                  </div>
                  <Link to={`/packages/${pkg.id}`} className="view-details-btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <h3>No packages found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllPackagesPage;
