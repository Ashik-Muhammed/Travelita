import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/DestinationCard.css';

const DestinationCard = ({ destination }) => {
  return (
    <div className="destination-card">
      <div className="destination-image">
        <img src={destination.image} alt={destination.name} />
        <div className="destination-price">From ${destination.startingPrice}</div>
      </div>
      <div className="destination-content">
        <h3>{destination.name}</h3>
        <p className="destination-location">
          <i className="fas fa-map-marker-alt"></i> {destination.country}
        </p>
        <p className="destination-description">{destination.description}</p>
        <div className="destination-meta">
          <span className="destination-days">
            <i className="far fa-calendar-alt"></i> {destination.duration} days
          </span>
          <span className="destination-rating">
            <i className="fas fa-star"></i> {destination.rating}
          </span>
        </div>
        <Link to={`/destinations/${destination.slug}`} className="btn btn-primary">
          View Packages
        </Link>
      </div>
    </div>
  );
};

export default DestinationCard;
