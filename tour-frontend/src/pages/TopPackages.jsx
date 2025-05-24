import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import './PackageListPage.css'; // Re-use styles from AllPackages
// import '../index.css'; // index.css is globally imported in main.jsx or App.jsx

// Placeholder Icons (if needed, copy from AllPackages or Home)
const IconPin = () => <span className="icon-style">📍</span>;
const IconClock = () => <span className="icon-style">🕒</span>;

function TopPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getFeaturedPackages } = useData();

  useEffect(() => {
    const fetchTopPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use the Firebase service to get top-rated packages
        const topPackages = await getFeaturedPackages('top');
        setPackages(topPackages);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch top packages:", err);
        setError('Could not load top packages. Please try again later.');
        setLoading(false);
      }
    };

    fetchTopPackages();
  }, [getFeaturedPackages]);

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
          <h1>Top Rated Tour Packages</h1>
          <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', opacity: '0.9' }}>
            Discover our most popular and highly rated tour packages.
          </p>
        </div>
      </div>
      
      <div className="container">
        {packages.length === 0 && !loading && (
          <div className="package-list-no-results">
            <p>No top-rated packages available at the moment.</p>
            {/* Add an icon here if desired, similar to Home.jsx error or other no-results messages */}
          </div>
        )}

        {packages.length > 0 && (
          <div className="package-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className="card package-card">
                {/* Add a "Top Rated" badge or similar visual cue if desired */}
                {/* Example badge: 
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--secondary-color)', color: 'white', padding: '5px 10px', borderRadius: 'var(--border-radius)', fontSize: '0.9rem' }}>
                  Top Rated
                </div> 
                */}
                <img 
                  src={pkg.images && pkg.images.length > 0 
                    ? pkg.images[0] 
                    : 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} 
                  alt={pkg.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="package-card-content">
                  <h3 className="package-card-title">{pkg.title}</h3>
                  <p className="package-card-destination"><IconPin /> {pkg.destination}</p>
                  <p className="package-card-duration"><IconClock /> {pkg.duration}</p>
                  <p className="package-card-price">₹{pkg.price.toLocaleString()}</p>
                  {/* Optional: Add rating display if available, e.g., stars */}
                  {/* 
                  <div className="package-card-rating" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="icon-style" style={{ color: i < (pkg.rating || 0) ? 'var(--secondary-color)' : '#ccc' }}>⭐</span>
                    ))}
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}>({pkg.reviewsCount || 0} reviews)</span>
                  </div>
                  */}
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

export default TopPackages; 