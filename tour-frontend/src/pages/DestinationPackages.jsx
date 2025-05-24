import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { rtdb } from '../config/firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import './DestinationPackages.css';

function DestinationPackages() {
  const { destination } = useParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [destinationImage, setDestinationImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackagesByDestination = async () => {
      if (!destination) return;
      try {
        setLoading(true);
        
        // Create a query to filter packages by destination
        const packagesRef = ref(rtdb, 'tourPackages');
        const packagesSnapshot = await get(packagesRef);
        
        if (!packagesSnapshot.exists()) {
          setPackages([]);
          setLoading(false);
          return;
        }
        
        const allPackages = [];
        packagesSnapshot.forEach((childSnapshot) => {
          const packageData = childSnapshot.val();
          if (packageData.destination && packageData.destination.toLowerCase() === destination.toLowerCase()) {
            allPackages.push({
              id: childSnapshot.key,
              ...packageData
            });
          }
        });
        
        // Sort packages by price (low to high)
        allPackages.sort((a, b) => a.price - b.price);
        
        // Set a destination image from the first package or use a default
        if (allPackages.length > 0 && allPackages[0].imageUrl) {
          setDestinationImage(allPackages[0].imageUrl);
        }
        
        setPackages(allPackages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError(`Failed to fetch packages for ${destination}`);
        setLoading(false);
      }
    };

    fetchPackagesByDestination();
  }, [destination]);

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading packages for {destination}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="destination-page">
      <div className="destination-hero">
        <img
          src={destinationImage || `https://source.unsplash.com/featured/1200x400?${destination},travel`}
          alt={destination}
        />
        <div className="destination-hero-overlay">
          <div className="destination-hero-content">
            <h1>Explore {destination}</h1>
            <p>Discover amazing tour packages for your perfect vacation in one of our most popular destinations</p>
          </div>
        </div>
      </div>
      
      <div className="container">

        {packages.length === 0 ? (
          <div className="no-packages">
            <p>No packages available for {destination} at the moment.</p>
            <Link to="/" className="back-home-button">
              Back to Home
            </Link>
          </div>
        ) : (
          <div>
            <div className="destination-section-header">
              <h2 className="destination-section-title">
                Tour Packages in {destination}
              </h2>
              <button onClick={handleBackClick} className="back-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
            
            <div className="destination-packages-grid">
              {packages.map((pkg) => (
                <div key={pkg.id} className="package-card">
                  <div className="package-image-container">
                    <img
                      className="package-image"
                      src={pkg.imageUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                      alt={pkg.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                  <div className="package-content">
                    <h3 className="package-title">{pkg.title}</h3>
                    <p className="package-description">{pkg.description}</p>
                    <div className="package-meta">
                      <div className="package-price">
                        ₹{pkg.price.toLocaleString()}
                      </div>
                      <div className="package-duration">
                        {pkg.duration}
                      </div>
                    </div>
                    <Link
                      to={`/packages/${pkg.id}`}
                      className="package-button"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DestinationPackages;