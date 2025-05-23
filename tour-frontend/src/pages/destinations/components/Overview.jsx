import React from 'react';
import PropTypes from 'prop-types';
import StarRating from '../../../components/StarRating';
import PopularTours from '../../../components/PopularTours';
import { FaPlane, FaTrain, FaRoad, FaCalendarAlt } from 'react-icons/fa';
import '../../../styles/DestinationComponents.css';

const Overview = ({ destination }) => {
  return (
    <div className="destination-section">
      <div className="overview-content fade-in">
        <div className="overview-text">
          <h2>Welcome to {destination.name}</h2>
          <p className="destination-description">{destination.overview.description}</p>
          
          <div className="overview-highlights">
            <h4>Why Visit {destination.name}?</h4>
            <ul>
              {destination.overview.highlights.map((highlight, index) => (
                <li key={index}>
                  <i className="fas fa-check-circle"></i>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="rating-badge" style={{ marginTop: '1.5rem' }}>
            <StarRating rating={destination.overview.rating} size="lg" />
            <span className="review-count" style={{ marginLeft: '0.5rem' }}>
              {destination.overview.reviewCount.toLocaleString()}+ Reviews
            </span>
          </div>
        </div>
        
        {destination.heroImage && (
          <div className="overview-image" style={{ flex: 1, minWidth: '300px' }}>
            <img 
              src={destination.heroImage} 
              alt={destination.name} 
              style={{
                width: '100%',
                borderRadius: '10px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
              }} 
            />
          </div>
        )}
      </div>

      <hr className="section-divider" />
      
      {destination.popularExperiences && (
        <div className="popular-experiences">
          <h2>Popular Experiences</h2>
          <PopularTours tours={destination.popularExperiences} />
        </div>
      )}

      <div className="best-time-to-visit">
        <h2>Best Time to Visit</h2>
        <div className="best-time-content">
          <div className="best-time-details">
            <div className="best-time-period">
              <FaCalendarAlt className="icon" />
              <span>{destination.overview.bestTime || 'Throughout the year'}</span>
            </div>
            <p>{destination.bestTimeToVisit?.description || 'The weather is pleasant during this time, making it ideal for sightseeing and outdoor activities.'}</p>
            <div className="weather-info">
              <div className="weather-item">
                <i className="fas fa-thermometer-half"></i>
                <span>Temperature: {destination.overview.weather || 'Pleasant'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="how-to-reach">
        <h2>How to Reach {destination.name}</h2>
        <div className="transport-options">
          <div className="transport-card">
            <h3><FaPlane /> By Air</h3>
            <p>{destination.howToReach?.byAir || 'The nearest airport is well-connected to major cities across India.'}</p>
          </div>
          <div className="transport-card">
            <h3><FaTrain /> By Train</h3>
            <p>{destination.howToReach?.byTrain || 'The nearest railway station has good connectivity with major Indian cities.'}</p>
          </div>
          <div className="transport-card">
            <h3><FaRoad /> By Road</h3>
            <p>{destination.howToReach?.byRoad || 'Well-connected by road with regular bus services from nearby cities.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

Overview.propTypes = {
  destination: PropTypes.shape({
    name: PropTypes.string.isRequired,
    overview: PropTypes.shape({
      description: PropTypes.string.isRequired,
      highlights: PropTypes.arrayOf(PropTypes.string).isRequired,
      bestTime: PropTypes.string.isRequired,
      idealDuration: PropTypes.string.isRequired,
      weather: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      reviewCount: PropTypes.number.isRequired
    }).isRequired,
    heroImage: PropTypes.string.isRequired,
    popularExperiences: PropTypes.array,
    bestTimeToVisit: PropTypes.shape({
      description: PropTypes.string
    }),
    howToReach: PropTypes.shape({
      byAir: PropTypes.string,
      byTrain: PropTypes.string,
      byRoad: PropTypes.string
    })
  }).isRequired
};

export default Overview;
