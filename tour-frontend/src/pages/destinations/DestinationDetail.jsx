import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { destinations } from './destinationsData';
import PopularTours from '../../components/PopularTours';
import '../../styles/DestinationDetail.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaSun, FaUtensils, FaSubway, FaMoneyBillWave, FaArrowRight, FaStar, FaRegClock, FaUsers, FaTag } from 'react-icons/fa';

const DestinationDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    guests: 1,
    packageId: null
  });

  const destination = destinations.find(dest => dest.slug === slug);

  useEffect(() => {
    // Check if destination is in favorites
    const favorites = JSON.parse(localStorage.getItem('favoriteDestinations') || '[]');
    setIsFavorite(favorites.includes(destination?.id));
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, [destination]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteDestinations') || '[]');
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favorites.filter(id => id !== destination.id);
    } else {
      updatedFavorites = [...favorites, destination.id];
    }
    
    localStorage.setItem('favoriteDestinations', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleBookNow = (packageId) => {
    setBookingData(prev => ({
      ...prev,
      packageId,
      startDate: '',
      endDate: '',
      guests: 1
    }));
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the booking data to your backend
    console.log('Booking submitted:', { ...bookingData, destination: destination.name });
    // Show success message and redirect
    alert('Booking successful! Redirecting to your bookings...');
    navigate('/bookings');
  };

  if (!destination) {
    return (
      <div className="container py-5 text-center">
        <h2>Destination not found</h2>
        <Link to="/destinations" className="btn btn-primary mt-3">
          Back to Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="destination-detail">
      {/* Hero Section */}
      <div className="destination-hero">
        <div className="hero-content">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/destinations">Destinations</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{destination.name}</li>
            </ol>
          </nav>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1>{destination.name}, {destination.country}</h1>
              <div className="rating-badge">
                <FaStar className="star-icon" />
                <span>{destination.rating || '4.8'}</span>
                <span className="reviews">({destination.reviews || '128'} reviews)</span>
              </div>
            </div>
            <button 
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={toggleFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FaStar className="favorite-icon" />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
          </div>
          <p className="hero-description">{destination.tagline}</p>
          <div className="destination-meta">
            <span><FaMapMarkerAlt className="me-2" /> {destination.region}</span>
            <span><FaCalendarAlt className="me-2" /> Best time: {destination.bestTime || 'Year-round'}</span>
            <span><FaSun className="me-2" /> {destination.weather || '25-32'}°C</span>
          </div>
          <div className="hero-cta">
            <button 
              className="btn btn-primary btn-book"
              onClick={() => handleBookNow(destination.featuredPackage?.id || null)}
            >
              Book Now <FaArrowRight className="ms-2" />
            </button>
            <button className="btn btn-outline">
              View Gallery
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img 
            src={destination.heroImage || `https://source.unsplash.com/featured/1200x800?${encodeURIComponent(destination.name)},travel`} 
            alt={destination.name} 
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = `https://source.unsplash.com/featured/1200x800?${encodeURIComponent(destination.name)},travel`;
            }}
          />
          <div className="image-overlay"></div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="detail-tabs">
        <div className="container">
          <nav>
            <ul>
              <li className={activeTab === 'overview' ? 'active' : ''}>
                <button onClick={() => setActiveTab('overview')}>Overview</button>
              </li>
              <li className={activeTab === 'packages' ? 'active' : ''}>
                <button onClick={() => setActiveTab('packages')}>Packages</button>
              </li>
              <li className={activeTab === 'gallery' ? 'active' : ''}>
                <button onClick={() => setActiveTab('gallery')}>Gallery</button>
              </li>
              <li className={activeTab === 'reviews' ? 'active' : ''}>
                <button onClick={() => setActiveTab('reviews')}>Reviews</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <section className="overview-section">
            <div className="container">
              <div className="section-header">
                <h2>About {destination.name}</h2>
                <p>{destination.overview || 'Discover the beauty and culture of this amazing destination.'}</p>
              </div>
              
              <div className="highlights">
                <h3>Why Visit {destination.name}?</h3>
                <div className="highlight-cards">
                  {destination.highlights?.map((highlight, index) => (
                    <div key={index} className="highlight-card">
                      <div className="highlight-icon">
                        {highlight.icon === 'fa-utensils' && <FaUtensils />}
                        {highlight.icon === 'fa-mountain' && <FaMountain />}
                        {highlight.icon === 'fa-umbrella-beach' && <FaUmbrellaBeach />}
                        {highlight.icon === 'fa-landmark' && <FaLandmark />}
                      </div>
                      <h4>{highlight.title}</h4>
                      <p>{highlight.description}</p>
                    </div>
                  )) || (
                    <p>No highlights available for this destination.</p>
                  )}
                </div>
              </div>

              <div className="itinerary-section">
                <h3>Sample Itinerary</h3>
                <div className="itinerary-steps">
                  {destination.itinerary?.map((day, index) => (
                    <div key={index} className="itinerary-step">
                      <div className="step-number">Day {index + 1}</div>
                      <div className="step-content">
                        <h4>{day.title}</h4>
                        <p>{day.description}</p>
                      </div>
                    </div>
                  )) || (
                    <p>No itinerary available for this destination.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'packages' && (
          <section className="packages-section">
            <div className="container">
              <h2>Available Packages</h2>
              <div className="package-cards">
                {destination.packages?.map((pkg) => (
                  <div key={pkg.id} className="package-card">
                    <div className="package-image">
                      <img src={pkg.image} alt={pkg.name} />
                      {pkg.isPopular && <span className="popular-badge">Popular</span>}
                      {pkg.discount && <span className="discount-badge">-{pkg.discount}%</span>}
                    </div>
                    <div className="package-content">
                      <div className="package-header">
                        <h3>{pkg.name}</h3>
                        <div className="package-price">
                          {pkg.originalPrice && (
                            <span className="original-price">${pkg.originalPrice}</span>
                          )}
                          <span className="current-price">${pkg.price}</span>
                          <span className="per-person">/person</span>
                        </div>
                      </div>
                      <div className="package-meta">
                        <span><FaRegClock /> {pkg.duration} days</span>
                        <span><FaUsers /> {pkg.groupSize || 'Small Group'}</span>
                        {pkg.category && <span className="category"><FaTag /> {pkg.category}</span>}
                      </div>
                      <p className="package-description">
                        {pkg.description || 'Experience the best of this destination with our carefully curated package.'}
                      </p>
                      <div className="package-footer">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleBookNow(pkg.id)}
                        >
                          Book Now
                        </button>
                        <Link to={`/packages/${pkg.id}`} className="btn btn-outline">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="no-packages">
                    <p>No packages available for this destination yet.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/packages')}>
                      Browse All Packages
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Add other tab contents for gallery and reviews */}
      </div>

      {/* Travel Tips & Popular Tours */}
      <section className="travel-tips">
        <div className="container">
          <div className="section-header">
            <h2>Travel Tips & Information</h2>
            <p>Essential information to help you plan your perfect trip to {destination.name}</p>
          </div>
          
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">
                <FaUtensils />
              </div>
              <h4>Local Cuisine</h4>
              <p>{destination.tips?.cuisine || `Indulge in the local flavors of ${destination.name}. Don't miss trying the traditional dishes that this region is famous for.`}</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">
                <FaSubway />
              </div>
              <h4>Getting Around</h4>
              <p>{destination.tips?.transportation || `Getting around ${destination.name} is easy with various transportation options including public transit, taxis, and bike rentals.`}</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">
                <FaMoneyBillWave />
              </div>
              <h4>Budget Tips</h4>
              <p>{destination.tips?.budget || `Plan your budget wisely. ${destination.name} offers options for every budget, from luxury resorts to affordable hostels.`}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tours */}
      <PopularTours destination={destination.name} onBookNow={handleBookNow} />

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Explore {destination.name}?</h2>
            <p>Book your dream vacation today and create unforgettable memories.</p>
            <div className="cta-buttons">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => handleBookNow(destination.featuredPackage?.id || null)}
              >
                Book Now <FaArrowRight className="ms-2" />
              </button>
              <Link to="/contact" className="btn btn-outline-light">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="booking-modal">
          <div className="modal-overlay" onClick={() => setShowBookingModal(false)}></div>
          <div className="modal-content">
            <button 
              className="close-modal" 
              onClick={() => setShowBookingModal(false)}
              aria-label="Close modal"
            >
              &times;
            </button>
            <h3>Book Your Trip</h3>
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label htmlFor="startDate">Check-in Date</label>
                <input 
                  type="date" 
                  id="startDate" 
                  value={bookingData.startDate}
                  onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">Check-out Date</label>
                <input 
                  type="date" 
                  id="endDate" 
                  value={bookingData.endDate}
                  onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="guests">Number of Guests</label>
                <select 
                  id="guests" 
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value)})}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Total Price</label>
                <div className="price-display">
                  ${bookingData.packageId ? 
                    (destination.packages?.find(p => p.id === bookingData.packageId)?.price * bookingData.guests || 0) : 
                    (destination.startingPrice * bookingData.guests || 0)}
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationDetail;
