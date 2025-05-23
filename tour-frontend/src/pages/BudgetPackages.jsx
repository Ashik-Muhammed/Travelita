import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import './PackageListPage.css'; // Re-use styles from AllPackages

// Placeholder Icons
const IconPin = () => <span className="icon-style">📍</span>;
const IconClock = () => <span className="icon-style">🕒</span>;

function BudgetPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getFeaturedPackages } = useData();

  useEffect(() => {
    const fetchBudgetPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the Firebase service to get budget packages
        const budgetPackages = await getFeaturedPackages('budget');

        setPackages(budgetPackages);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch budget packages:", err);
        setError('Could not load budget packages. Please try again later.');
        setLoading(false);
      }
    };

    fetchBudgetPackages();
  }, [getFeaturedPackages]);

  if (loading) {
    return <div className="package-list-loading"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="package-list-error container">Error: {error}</div>;
  }

  return (
    <div className="package-list-page">
      <div className="page-title-bar" style={{ backgroundColor: 'var(--success-color-dark)' /* Alt color for budget */ }}>
        <div className="container">
          <h1>Budget-Friendly Tours</h1>
          <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', opacity: '0.9' }}>
            Amazing travel experiences that won't break the bank!
          </p>
        </div>
      </div>
      
      <div className="container">
        {packages.length === 0 && !loading && (
          <div className="package-list-no-results">
            <p>No budget-friendly packages available at the moment.</p>
          </div>
        )}

        {packages.length > 0 && (
          <div className="package-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className="card package-card">
                {/* Optional: Add a "Budget Pick" badge */}
                {/* <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--success-color)', color: 'white', padding: '5px 10px', borderRadius: 'var(--border-radius)', fontSize: '0.9rem' }}>
                  Budget Pick
                </div> */}
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
                  <p className="package-card-price">₹{pkg.price.toLocaleString()}</p>
                  {/* Optional: Display original price if discounted, or % off */}
                  {/* {pkg.originalPrice && pkg.originalPrice > pkg.price &&
                    <p className="package-card-original-price" style={{ textDecoration: 'line-through', color: 'var(--text-color-light)', fontSize: '0.9rem' }}>
                      ₹{pkg.originalPrice.toLocaleString()}
                    </p>
                  } */}
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

export default BudgetPackages;
