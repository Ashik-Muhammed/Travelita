import React from 'react';
import PropTypes from 'prop-types';
import { FaStar, FaMapMarkerAlt, FaClock, FaRupeeSign } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PopularExperiences = ({ experiences, destination }) => {
  if (!experiences || experiences.length === 0) return null;

  return (
    <section className="popular-experiences">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Popular Experiences</h2>
          <p className="section-subtitle">Handpicked experiences for your perfect vacation</p>
        </div>
        
        <div className="experiences-grid">
          {experiences.slice(0, 3).map((exp, index) => (
            <div key={index} className="experience-card">
              <div className="experience-image">
                <img src={exp.image} alt={exp.name} loading="lazy" />
                <div className="experience-rating">
                  <FaStar className="star-icon" />
                  <span>{exp.rating}</span>
                </div>
              </div>
              <div className="experience-details">
                <h3>{exp.name}</h3>
                <div className="experience-meta">
                  <span className="duration">
                    <FaClock /> {exp.duration}
                  </span>
                  <span className="price">
                    <FaRupeeSign /> {exp.price.toLocaleString()}
                  </span>
                </div>
                <div className="experience-highlights">
                  {exp.highlights?.slice(0, 3).map((h, i) => (
                    <span key={i} className="highlight">{h}</span>
                  ))}
                </div>
                <Link 
                  to={`/experiences/${exp.slug || exp.id}`} 
                  className="btn btn-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {experiences.length > 3 && (
          <div className="text-center mt-4">
            <Link to={`/destinations/${destination.slug}/experiences`} className="btn btn-outline">
              View All Experiences
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

PopularExperiences.propTypes = {
  experiences: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string,
      rating: PropTypes.number,
      duration: PropTypes.string,
      price: PropTypes.number,
      highlights: PropTypes.arrayOf(PropTypes.string),
      slug: PropTypes.string,
    })
  ),
  destination: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

PopularExperiences.defaultProps = {
  experiences: [],
};

export default PopularExperiences;
