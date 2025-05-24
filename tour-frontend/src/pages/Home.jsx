import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import './HomePage.css';


// Placeholder for an actual icon component or SVG
const IconPin = () => <span className="icon-style">📍</span>;
const IconClock = () => <span className="icon-style">🕒</span>;
const IconStar = () => <span className="icon-style">⭐</span>; // Example for ratings
const IconShield = () => <span className="icon-style">🛡️</span>; // Example for Why Choose Us
const IconPrice = () => <span className="icon-style">💲</span>; // Example for Why Choose Us
const IconSupport = () => <span className="icon-style">🎧</span>; // Example for Why Choose Us

function Home() {
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [popularPackages, setPopularPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getFeaturedPackages } = useData();
  
  // Refs for scroll animations
  const featuredSectionRef = useRef(null);
  const destinationsSectionRef = useRef(null);
  const whyChooseSectionRef = useRef(null);

  // Array of different travel images for packages
  const travelImages = [
    '1501785888041-af3ef285b470', // Beach
    '1476514525535-07fb3b4ae5f1', // Train tracks
    '1470071459604-3b5ec3a7fe05', // Mountains
    '1475924156734-496f6cac6ec1', // Forest
    '1499678329025-4b2e7e3a9d8f', // Desert
    '1501785888041-af3ef285b470', // Cityscape
    '1501785888041-af3ef285b470'  // Waterfall
  ];

  // Function to get a unique image URL for each package
  const getImageUrl = (imageUrl, index = 0) => {
    if (imageUrl) return imageUrl;
    const imageId = travelImages[index % travelImages.length];
    return `https://images.unsplash.com/photo-${imageId}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80`;
  };

  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };
    
    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    // Observe sections
    const sections = [featuredSectionRef.current, destinationsSectionRef.current, whyChooseSectionRef.current];
    sections.forEach(section => {
      if (section) observer.observe(section);
    });
    
    return () => {
      sections.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, [featuredPackages, destinations]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get featured packages (limit to 6)
        const packages = await getFeaturedPackages('top-rated', 6);
        setFeaturedPackages(packages);
        
        // Get popular packages (different from featured)
        const popular = await getFeaturedPackages('popular', 3);
        setPopularPackages(popular);
        
        // Extract unique destinations from all packages
        const allPackages = [...packages, ...popular];
        const uniqueDestinations = [...new Set(allPackages.map(pkg => pkg.destination))];
        setDestinations(uniqueDestinations.slice(0, 4));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };
    fetchData();
  }, [getFeaturedPackages]);

  if (loading) {
    // Uses spinner from App.jsx / index.css
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--header-height))' }}>
            <div className="spinner"></div>
        </div>
    );
  }

  return (
    <div className="home-page">

      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1>Discover <span style={{ color: 'var(--primary-color)' }}>Amazing</span> Places</h1>
          <p className="hero-subtitle" style={{ color: 'white', textAlign: 'center' }}>
            Explore curated tour packages for unforgettable experiences. Find your next adventure with us!
          </p>
          <div className="hero-buttons">
            <Link to="/packages/top" className="btn btn-primary">Explore Top Packages</Link>
            <Link to="/destinations" className="btn btn-secondary">View Destinations</Link>
          </div>
        </div>
      </section>

      {/* Featured Packages Section */}
      <section className="page-section" ref={featuredSectionRef}>
        <div className="container">
          <div style={{textAlign: 'center'}}>
            <h2 className="page-section-title">Featured Tour Packages</h2>
          </div>
          {error ? (
            <div className="error-message card" style={{textAlign: 'center', maxWidth: '500px', margin: '2rem auto'}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'red', marginBottom: '1rem'}}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p style={{color: 'red', marginBottom: '1rem'}}>{error}</p>
              <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
            </div>
          ) : (
            <div className="featured-packages-grid">
              {featuredPackages.map((pkg, index) => (
                <div key={pkg.id} className="card package-card">
                  <div className="image-container">
                    <img 
                      src={getImageUrl(pkg.imageUrl, index)}
                      alt={pkg.title || 'Travel destination'}
                      className="package-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        // Fallback to first image in case of error
                        e.target.src = `https://images.unsplash.com/photo-${travelImages[0]}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80`;
                      }}
                    />
                  </div>
                  <div className="package-card-content">
                    <h3 className="package-card-title">{pkg.title}</h3>
                    <p className="package-card-destination"><IconPin /> {pkg.destination}</p>
                    <p className="package-card-duration"><IconClock /> {pkg.duration}</p>
                    <div className="package-card-rating">
                      <IconStar /><IconStar /><IconStar /><IconStar /><IconStar />
                      <span className="rating-text">5.0</span>
                    </div>
                    <p className="package-card-price">₹{pkg.price.toLocaleString()}</p>
                    <Link to={`/packages/${pkg.id}`} className="btn btn-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/packages/top" className="btn btn-secondary">View All Packages</Link>
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="page-section bg-light-gray" ref={destinationsSectionRef}>
        <div className="container">
          <div style={{textAlign: 'center'}}>
            <h2 className="page-section-title">Popular Destinations</h2>
          </div>
          <div className="popular-destinations-grid">
            {destinations.map((destination, index) => {
              // Array of different Unsplash image IDs for destinations
              const destinationImages = [
                '1501785888041-af3ef285b470', // Beach
                '1476514525535-07fb3b4ae5f1', // Train tracks
                '1470071459604-3b5ec3a7fe05', // Mountains
                '1475924156734-496f6cac6ec1', // Forest
                '1499678329025-4b2e7e3a9d8f', // Desert
                '1501785888041-af3ef285b470', // Cityscape
                '1501785888041-af3ef285b470'  // Waterfall
              ];
              
              // Get image based on index, fallback to first image
              const imageId = destinationImages[index % destinationImages.length];
              const imageUrl = `https://images.unsplash.com/photo-${imageId}?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80`;
              
              return (
                <Link key={destination} to={`/packages/destination/${destination}`} className="destination-card">
                  <img 
                    src={imageUrl}
                    alt={destination}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80';
                    }}
                  />
                  <div className="destination-card-overlay">
                    <h3>{destination}</h3>
                    <span>Explore</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/destinations" className="btn btn-secondary">View All Destinations</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="page-section" ref={whyChooseSectionRef}>
        <div className="container">
          <div style={{textAlign: 'center'}}>
            <h2 className="page-section-title">Why Choose Us</h2>
          </div>
          <div className="why-choose-us-grid">
            <div className="card why-choose-us-item">
              <IconStar />
              <h3>Curated Packages</h3>
              <p>Handpicked destinations and experiences for the best travel adventures. Our experts select only the finest options for your journey.</p>
            </div>
            <div className="card why-choose-us-item">
              <IconPrice />
              <h3>Best Prices</h3>
              <p>Competitive prices and special offers for memorable trips. We ensure you get the most value for your travel budget.</p>
            </div>
            <div className="card why-choose-us-item">
              <IconSupport />
              <h3>24/7 Support</h3>
              <p>Our dedicated support team is available round the clock to assist you with any questions or concerns during your journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready for Your Next Adventure?</h2>
          <p>
            Browse our wide selection of tour packages or contact us to plan your dream vacation today!
          </p>
          <div className="cta-buttons">
            <Link to="/packages/top" className="btn btn-secondary btn-large">Explore All Tours</Link>
            <Link to="/contact" className="btn btn-outline-light btn-large">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
