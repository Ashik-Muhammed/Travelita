import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { destinations } from './destinationsData';
import PopularTours from '../../components/PopularTours';
import '../../styles/DestinationDetail.css';

const DestinationDetail = () => {
  const { slug } = useParams();
  const destination = destinations.find(dest => dest.slug === slug);

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
          <h1>{destination.name}, {destination.country}</h1>
          <p className="hero-description">{destination.tagline}</p>
          <div className="destination-meta">
            <span><i className="fas fa-map-marker-alt"></i> {destination.region}</span>
            <span><i className="far fa-calendar-alt"></i> Best time: {destination.bestTime}</span>
            <span><i className="fas fa-sun"></i> {destination.weather}°C</span>
          </div>
        </div>
        <div className="hero-image">
          <img src={destination.heroImage} alt={destination.name} />
        </div>
      </div>

      {/* Overview Section */}
      <section className="overview-section">
        <div className="container">
          <div className="section-header">
            <h2>About {destination.name}</h2>
            <p>{destination.overview}</p>
          </div>
          
          <div className="highlights">
            <h3>Why Visit {destination.name}?</h3>
            <div className="highlight-cards">
              {destination.highlights.map((highlight, index) => (
                <div key={index} className="highlight-card">
                  <div className="highlight-icon">
                    <i className={highlight.icon}></i>
                  </div>
                  <h4>{highlight.title}</h4>
                  <p>{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tours */}
      <PopularTours destination={destination.name} />

      {/* Travel Tips */}
      <section className="travel-tips">
        <div className="container">
          <h2>Travel Tips</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <i className="fas fa-utensils"></i>
              <h4>Local Cuisine</h4>
              <p>{destination.tips.cuisine}</p>
            </div>
            <div className="tip-card">
              <i className="fas fa-subway"></i>
              <h4>Getting Around</h4>
              <p>{destination.tips.transportation}</p>
            </div>
            <div className="tip-card">
              <i className="fas fa-money-bill-wave"></i>
              <h4>Budget Tips</h4>
              <p>{destination.tips.budget}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Explore {destination.name}?</h2>
          <p>Book your dream vacation today and create unforgettable memories.</p>
          <Link to="/contact" className="btn btn-primary btn-lg">
            Plan Your Trip
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DestinationDetail;
