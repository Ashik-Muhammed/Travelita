import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rtdb } from '../config/firebase';
import { ref, get } from 'firebase/database';
import './PopularDestinations.css';

const PopularDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const packagesRef = ref(rtdb, 'tourPackages');
        const snapshot = await get(packagesRef);
        
        if (!snapshot.exists()) {
          setDestinations([]);
          setLoading(false);
          return;
        }
        
        const packages = [];
        snapshot.forEach((childSnapshot) => {
          packages.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        
        // Group packages by destination and get the most popular ones
        const destinationMap = packages.reduce((acc, pkg) => {
          if (!acc[pkg.destination]) {
            acc[pkg.destination] = {
              name: pkg.destination,
              packages: [],
              image: pkg.imageUrl || null
            };
          }
          acc[pkg.destination].packages.push(pkg);
          return acc;
        }, {});

        // Convert to array and sort by number of packages
        const destinationList = Object.values(destinationMap)
          .sort((a, b) => b.packages.length - a.packages.length)
          .slice(0, 8); // Get top 8 destinations

        setDestinations(destinationList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching destinations:', err);
        setError('Failed to fetch destinations. Please try again later.');
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="popular-destinations-page">
      <div className="page-header">
        <div className="container">
          <h1>Popular Destinations</h1>
          <p>Discover amazing places and find your perfect vacation package</p>
        </div>
      </div>

      <div className="container">
        <div className="destinations-grid">
          {destinations.map((destination) => (
            <div key={destination.name} className="destination-card">
              <div className="destination-image">
                <img
                  src={destination.image || `https://source.unsplash.com/featured/600x400?${destination.name},travel`}
                  alt={destination.name}
                />
                <div className="destination-overlay">
                  <h3>{destination.name}</h3>
                  <p>{destination.packages.length} Packages Available</p>
                </div>
              </div>
              <div className="destination-content">
                <h4>Featured Packages</h4>
                <ul className="featured-packages">
                  {destination.packages.slice(0, 3).map((pkg) => (
                    <li key={pkg.id}>
                      <Link to={`/packages/${pkg.id}`}>
                        {pkg.title} - ₹{pkg.price.toLocaleString()}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link 
                  to={`/packages/destination/${destination.name}`}
                  className="btn btn-primary"
                >
                  View All Packages
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularDestinations; 