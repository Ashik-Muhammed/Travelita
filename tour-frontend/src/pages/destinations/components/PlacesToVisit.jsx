import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import SectionHeader from '../../../components/SectionHeader';
import StarRating from '../../../components/StarRating';

const PlacesToVisit = ({ places }) => {
  if (!places || places.length === 0) {
    return (
      <div className="no-places">
        <p>No places to visit information available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="places-to-visit">
      <SectionHeader 
        title="Must-Visit Places"
        subtitle="Explore the most popular attractions and hidden gems"
      />
      
      <div className="places-grid">
        {places.map((place, index) => (
          <div key={index} className="place-card">
            <div className="place-image">
              <img 
                src={place.image} 
                alt={place.name} 
                loading="lazy"
              />
              <div className="place-overlay">
                <h3>{place.name}</h3>
              </div>
            </div>
            <div className="place-details">
              <p className="place-description">{place.description}</p>
              <div className="place-meta">
                <div className="place-rating">
                  <StarRating rating={place.rating || 4.5} size="sm" />
                  <span className="review-count">({place.reviewCount || '100+'})</span>
                </div>
                <div className="place-tags">
                  {place.tags?.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  )) || (
                    <span className="tag">Attraction</span>
                  )}
                </div>
              </div>
              <Link to={`/attraction/${place.slug || place.name.toLowerCase().replace(/\s+/g, '-')}`} className="btn-explore">
                Explore <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="places-categories">
        <h3>Explore by Category</h3>
        <div className="categories-grid">
          {[
            { name: 'Historical Sites', icon: 'landmark', count: 12 },
            { name: 'Natural Wonders', icon: 'mountain', count: 8 },
            { name: 'Religious Places', icon: 'place-of-worship', count: 15 },
            { name: 'Museums', icon: 'landmark', count: 5 },
            { name: 'Markets', icon: 'shopping-cart', count: 7 },
            { name: 'Parks & Gardens', icon: 'tree', count: 10 },
          ].map((category, index) => (
            <div key={index} className="category-card">
              <div className="category-icon">
                <i className={`fas fa-${category.icon}`}></i>
              </div>
              <h4>{category.name}</h4>
              <p>{category.count} places</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="places-tips">
        <h3>Traveler Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <i className="fas fa-clock"></i>
            <h4>Best Time to Visit</h4>
            <p>Mornings are less crowded at popular attractions. Aim to arrive early to beat the crowds.</p>
          </div>
          <div className="tip-card">
            <i className="fas fa-ticket-alt"></i>
            <h4>Ticket Information</h4>
            <p>Book tickets online in advance to skip the long queues at ticket counters.</p>
          </div>
          <div className="tip-card">
            <i className="fas fa-sun"></i>
            <h4>Weather Consideration</h4>
            <p>Carry sunscreen, hats, and water during summer months as temperatures can get quite high.</p>
          </div>
          <div className="tip-card">
            <i className="fas fa-tshirt"></i>
            <h4>Dress Code</h4>
            <p>Some religious sites may require modest clothing. Carry a scarf or shawl to cover shoulders/knees.</p>
          </div>
        </div>
      </div>
      
      <div className="nearby-destinations">
        <h3>Nearby Destinations</h3>
        <div className="nearby-grid">
          {[
            { name: 'Mountain View', distance: '25 km', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400' },
            { name: 'Lake Paradise', distance: '42 km', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400' },
            { name: 'Ancient Ruins', distance: '18 km', image: 'https://images.unsplash.com/photo-1502602897457-915e8e61e3c4?w=400' },
          ].map((dest, index) => (
            <div key={index} className="nearby-card">
              <img src={dest.image} alt={dest.name} />
              <div className="nearby-info">
                <h4>{dest.name}</h4>
                <p>{dest.distance} away</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

PlacesToVisit.propTypes = {
  places: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      rating: PropTypes.number,
      reviewCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      tags: PropTypes.arrayOf(PropTypes.string),
      slug: PropTypes.string
    })
  )
};

export default PlacesToVisit;
