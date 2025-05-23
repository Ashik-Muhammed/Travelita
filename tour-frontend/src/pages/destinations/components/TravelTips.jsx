import React from 'react';
import PropTypes from 'prop-types';
import { FaLightbulb, FaMoneyBillWave, FaCamera, FaUtensils } from 'react-icons/fa';

const TravelTips = ({ tips }) => {
  if (!tips || Object.keys(tips).length === 0) return null;

  const iconMap = {
    general: <FaLightbulb className="tip-icon" />,
    budget: <FaMoneyBillWave className="tip-icon" />,
    photo: <FaCamera className="tip-icon" />,
    food: <FaUtensils className="tip-icon" />,
  };

  return (
    <section className="travel-tips">
      <div className="container">
        <h2 className="section-title">Traveler Tips</h2>
        <div className="tips-grid">
          {Object.entries(tips).map(([category, tip]) => (
            <div key={category} className="tip-card">
              <div className="tip-header">
                {iconMap[category] || <FaLightbulb className="tip-icon" />}
                <h3 className="tip-title">
                  {category.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </h3>
              </div>
              <p className="tip-content">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

TravelTips.propTypes = {
  tips: PropTypes.shape({
    general: PropTypes.string,
    budget: PropTypes.string,
    photo: PropTypes.string,
    food: PropTypes.string,
    // Add more tip categories as needed
  }),
};

TravelTips.defaultProps = {
  tips: {
    general: 'Mornings are less crowded at popular attractions. Aim to arrive early to beat the crowds.',
    budget: 'Many museums offer free entry on the first Sunday of the month. Local buses are much cheaper than taxis.',
    photo: 'For the best photos, visit the viewpoint at sunrise when the light is perfect and crowds are minimal.',
    food: 'Don\'t miss the street food at the local market. Try the famous local dish for an authentic taste.',
  },
};

export default TravelTips;
