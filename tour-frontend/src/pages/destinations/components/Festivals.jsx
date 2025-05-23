import React from 'react';
import PropTypes from 'prop-types';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const Festivals = ({ festivals }) => {
  if (!festivals || festivals.length === 0) return null;

  return (
    <section className="festivals-section">
      <div className="container">
        <h2 className="section-title">Festivals & Events</h2>
        <div className="festivals-timeline">
          {festivals.map((festival, index) => (
            <div key={index} className="festival-item">
              <div className="festival-month">
                <span>{festival.month}</span>
              </div>
              <div className="festival-content">
                <h3 className="festival-name">{festival.name}</h3>
                <p className="festival-description">{festival.description}</p>
                <div className="festival-meta">
                  {festival.dates && (
                    <span className="festival-dates">
                      <FaCalendarAlt className="meta-icon" />
                      {festival.dates}
                    </span>
                  )}
                  {festival.location && (
                    <span className="festival-location">
                      <FaMapMarkerAlt className="meta-icon" />
                      {festival.location}
                    </span>
                  )}
                </div>
                {festival.highlights && festival.highlights.length > 0 && (
                  <div className="festival-highlights">
                    <h4>Highlights:</h4>
                    <ul>
                      {festival.highlights.map((highlight, i) => (
                        <li key={i}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {festival.tips && (
                  <div className="festival-tips">
                    <h4>Tips:</h4>
                    <p>{festival.tips}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Festivals.propTypes = {
  festivals: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      dates: PropTypes.string,
      location: PropTypes.string,
      highlights: PropTypes.arrayOf(PropTypes.string),
      tips: PropTypes.string,
    })
  ),
};

Festivals.defaultProps = {
  festivals: [
    {
      month: 'Jan',
      name: 'Makar Sankranti',
      description: 'Harvest festival celebrated with kite flying and traditional sweets',
      dates: '14-15 January',
      location: 'Throughout the region',
      highlights: ['Kite flying competitions', 'Traditional sweets', 'Cultural programs'],
      tips: 'Book accommodations well in advance as this is a peak festival season.'
    },
    {
      month: 'Feb',
      name: 'Desert Festival',
      description: 'Vibrant cultural festival with folk music, dance, and camel races',
      dates: '3 days in February',
      location: 'Main city square',
      highlights: ['Camel races', 'Folk performances', 'Local handicrafts'],
      tips: 'Wear comfortable shoes as you\'ll be walking on sand.'
    },
    {
      month: 'Mar',
      name: 'Holi',
      description: 'Festival of colors marking the arrival of spring',
      dates: 'March',
      location: 'Throughout the region',
      highlights: ['Color throwing', 'Music and dance', 'Traditional sweets'],
      tips: 'Wear clothes you don\'t mind getting stained with colors.'
    },
  ],
};

export default Festivals;
