import React from 'react';
import PropTypes from 'prop-types';
import '../styles/StarRating.css';

const StarRating = ({ rating = 0, max = 5, size = 'md', showText = true, className = '' }) => {
  // Ensure rating is a valid number and within bounds
  const numericRating = Number(rating) || 0;
  const normalizedRating = Math.min(Math.max(0, numericRating), max);
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating % 1 >= 0.5;
  const emptyStars = Math.max(0, max - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className={`star-rating ${size} ${className}`}>
      <div className="stars">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="fas fa-star"></i>
        ))}
        
        {/* Half star */}
        {hasHalfStar && <i className="fas fa-star-half-alt"></i>}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="far fa-star"></i>
        ))}
      </div>
      
      {/* Rating text */}
      {showText && (
        <span className="rating-text">
          {normalizedRating.toFixed(1)} <span className="text-muted">({max})</span>
        </span>
      )}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  max: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showText: PropTypes.bool,
  className: PropTypes.string,
};

export default StarRating;
