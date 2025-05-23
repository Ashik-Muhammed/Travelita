import React from 'react';
import PropTypes from 'prop-types';
import { FaSun, FaCloudRain, FaSnowflake, FaLeaf, FaUmbrellaBeach, FaTemperatureHigh } from 'react-icons/fa';
import SectionHeader from '../../../components/SectionHeader';

const BestTimeToVisit = ({ destination }) => {
  const months = [
    { name: 'Jan', temp: '15-25°C', season: 'Winter', icon: <FaSnowflake /> },
    { name: 'Feb', temp: '16-28°C', season: 'Winter', icon: <FaSnowflake /> },
    { name: 'Mar', temp: '20-32°C', season: 'Spring', icon: <FaLeaf /> },
    { name: 'Apr', temp: '25-36°C', season: 'Summer', icon: <FaSun /> },
    { name: 'May', temp: '27-38°C', season: 'Summer', icon: <FaSun /> },
    { name: 'Jun', temp: '26-35°C', season: 'Monsoon', icon: <FaCloudRain /> },
    { name: 'Jul', temp: '25-32°C', season: 'Monsoon', icon: <FaCloudRain /> },
    { name: 'Aug', temp: '25-31°C', season: 'Monsoon', icon: <FaCloudRain /> },
    { name: 'Sep', temp: '24-32°C', season: 'Monsoon', icon: <FaCloudRain /> },
    { name: 'Oct', temp: '23-33°C', season: 'Autumn', icon: <FaLeaf /> },
    { name: 'Nov', temp: '19-30°C', season: 'Autumn', icon: <FaLeaf /> },
    { name: 'Dec', temp: '16-27°C', season: 'Winter', icon: <FaSnowflake /> },
  ];

  const seasons = [
    {
      name: 'Winter',
      months: 'December to February',
      icon: <FaSnowflake className="w-6 h-6" />,
      description: 'Pleasant weather with cool mornings and evenings. Ideal for sightseeing and outdoor activities.',
      activities: ['Sightseeing', 'Wildlife safaris', 'Trekking', 'Cultural tours'],
      tips: ['Carry light woolens for the evenings', 'Book accommodations in advance as it\'s peak season']
    },
    {
      name: 'Summer',
      months: 'March to June',
      icon: <FaSun className="w-6 h-6" />,
      description: 'Hot and dry weather. Mornings and late afternoons are best for outdoor activities.',
      activities: ['Hill station visits', 'Early morning safaris', 'Water activities'],
      tips: ['Carry sun protection (hat, sunscreen, sunglasses)', 'Stay hydrated', 'Plan activities for early morning or late afternoon']
    },
    {
      name: 'Monsoon',
      months: 'July to September',
      icon: <FaCloudRain className="w-6 h-6" />,
      description: 'Heavy rainfall, lush green landscapes. Some areas may be inaccessible due to rain.',
      activities: ['Nature walks', 'Photography', 'Visiting waterfalls', 'Ayurvedic treatments'],
      tips: ['Carry rain gear and waterproof bags', 'Check weather forecasts regularly', 'Be prepared for possible travel delays']
    },
    {
      name: 'Autumn',
      months: 'October to November',
      icon: <FaLeaf className="w-6 h-6" />,
      description: 'Pleasant weather with clear skies. One of the best times to visit with fewer crowds.',
      activities: ['Trekking', 'Wildlife spotting', 'Festival experiences', 'Photography'],
      tips: ['Ideal for outdoor activities', 'Great time for photography with clear skies', 'Book in advance for festivals']
    }
  ];

  const bestTime = destination.overview?.bestTime || 'October to March';
  const bestMonths = bestTime.split(' to ').map(m => m.trim());
  
  // Find start and end month indices for highlighting
  const startMonthIndex = months.findIndex(m => m.name.toLowerCase().startsWith(bestMonths[0].substring(0, 3).toLowerCase()));
  const endMonthIndex = bestMonths[1] ? 
    months.findIndex(m => m.name.toLowerCase().startsWith(bestMonths[1].substring(0, 3).toLowerCase())) : 
    startMonthIndex;

  return (
    <div className="best-time-page">
      <SectionHeader 
        title="Best Time to Visit"
        subtitle={`The best time to visit ${destination.name} is between ${bestTime}`}
      />
      
      <div className="best-time-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <FaTemperatureHigh className="w-8 h-8" />
          </div>
          <div>
            <h3>Best Time</h3>
            <p>{bestTime}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">
            <FaSun className="w-8 h-8" />
          </div>
          <div>
            <h3>Peak Season</h3>
            <p>November to February</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">
            <FaUmbrellaBeach className="w-8 h-8" />
          </div>
          <div>
            <h3>Ideal Duration</h3>
            <p>{destination.overview?.idealDuration || '5-7 days'}</p>
          </div>
        </div>
      </div>
      
      <div className="monthly-weather">
        <h3>Monthly Weather Overview</h3>
        <div className="months-grid">
          {months.map((month, index) => {
            const isBestTime = index >= startMonthIndex && index <= endMonthIndex;
            return (
              <div 
                key={month.name} 
                className={`month-card ${isBestTime ? 'best-time' : ''} ${month.season.toLowerCase()}`}
              >
                <div className="month-header">
                  <span className="month-name">{month.name}</span>
                  <span className="month-icon">{month.icon}</span>
                </div>
                <div className="month-temp">{month.temp}</div>
                <div className="month-season">{month.season}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="seasons-guide">
        <h3>Seasonal Guide</h3>
        <div className="seasons-grid">
          {seasons.map((season, index) => (
            <div key={season.name} className="season-card">
              <div className="season-header">
                <div className="season-icon">
                  {season.icon}
                </div>
                <div>
                  <h4>{season.name}</h4>
                  <p className="season-months">{season.months}</p>
                </div>
              </div>
              <p className="season-description">{season.description}</p>
              
              <div className="season-activities">
                <h5>Best For:</h5>
                <div className="activity-tags">
                  {season.activities.map((activity, i) => (
                    <span key={i} className="activity-tag">{activity}</span>
                  ))}
                </div>
              </div>
              
              <div className="season-tips">
                <h5>Travel Tips:</h5>
                <ul>
                  {season.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
              
              {season.name === 'Winter' && (
                <div className="season-badge">
                  <span>Recommended Season</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="monthly-breakdown">
        <h3>Month-by-Month Breakdown</h3>
        <div className="monthly-details">
          {months.map((month, index) => {
            const isBestTime = index >= startMonthIndex && index <= endMonthIndex;
            return (
              <div key={month.name} className="month-detail">
                <div className="month-detail-header">
                  <h4>{month.name}</h4>
                  <div className="month-meta">
                    <span className="temp">{month.temp}</span>
                    <span className="season">{month.season}</span>
                    {isBestTime && <span className="best-badge">Best Time</span>}
                  </div>
                </div>
                <div className="month-detail-content">
                  <p>
                    {getMonthDescription(month.name, isBestTime)}
                  </p>
                  <div className="month-highlights">
                    <div>
                      <h5>Highlights:</h5>
                      <ul>
                        {getMonthHighlights(month.name).map((highlight, i) => (
                          <li key={i}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5>Tips:</h5>
                      <ul>
                        {getMonthTips(month.name).map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="festivals-events">
        <h3>Festivals & Events</h3>
        <div className="events-timeline">
          {[
            { month: 'Jan', name: 'Makar Sankranti', description: 'Harvest festival celebrated with kite flying and traditional sweets' },
            { month: 'Feb', name: 'Desert Festival', description: 'Vibrant cultural festival with folk music, dance, and camel races' },
            { month: 'Mar', name: 'Holi', description: 'Festival of colors marking the arrival of spring' },
            { month: 'Aug', name: 'Teej', description: 'Celebration of monsoon with swings, songs, and traditional dances' },
            { month: 'Oct', name: 'Diwali', description: 'Festival of lights, best experienced with local celebrations' },
            { month: 'Dec', name: 'Christmas & New Year', description: 'Festive celebrations with decorations and special events' },
          ].map((event, index) => (
            <div key={index} className="event-item">
              <div className="event-month">{event.month}</div>
              <div className="event-details">
                <h4>{event.name}</h4>
                <p>{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions for month descriptions
function getMonthDescription(month, isBestTime) {
  const descriptions = {
    Jan: 'Cool and pleasant weather makes it ideal for sightseeing and outdoor activities.',
    Feb: 'One of the best months to visit with comfortable temperatures and clear skies.',
    Mar: 'Temperatures start rising, but mornings and evenings remain pleasant for exploration.',
    Apr: 'Hot during the day, but still manageable for early morning and late evening activities.',
    May: 'The beginning of the hot season with temperatures often exceeding 35°C.',
    Jun: 'The onset of monsoon brings relief from the heat, with occasional showers.',
    Jul: 'Heavy rainfall results in lush green landscapes and cooler temperatures.',
    Aug: 'Continued monsoon with high humidity, but fewer crowds at popular sites.',
    Sep: 'Rain starts to recede, leaving behind beautiful greenery and waterfalls.',
    Oct: 'Pleasant weather returns, making it another excellent time to visit.',
    Nov: 'Ideal weather conditions with cool breezes and clear skies.',
    Dec: 'Peak tourist season begins with perfect weather for all activities.'
  };
  
  let desc = descriptions[month] || 'A good time to visit with varying weather conditions.';
  if (isBestTime) {
    desc = `One of the best months to visit ${month === 'Dec' ? 'as the peak season begins' : 'with ideal weather conditions'}. ` + desc;
  }
  return desc;
}

function getMonthHighlights(month) {
  const highlights = {
    Jan: ['Clear skies', 'Pleasant weather', 'Festival season'],
    Feb: ['Ideal for sightseeing', 'Wildlife spotting', 'Outdoor activities'],
    Mar: ['Spring blooms', 'Moderate temperatures', 'Fewer crowds'],
    Apr: ['Hot days', 'Early morning safaris', 'Hill station visits'],
    May: ['Off-season discounts', 'Indoor attractions', 'Early morning outings'],
    Jun: ['Lush greenery', 'Waterfalls in full flow', 'Cooler temperatures'],
    Jul: ['Monsoon landscapes', 'Ayurvedic treatments', 'Cultural experiences'],
    Aug: ['Festivals', 'Photography', 'Indoor activities'],
    Sep: ['Retreating monsoon', 'Pleasant evenings', 'Fewer tourists'],
    Oct: ['Post-monsoon freshness', 'Festival preparations', 'Good trekking conditions'],
    Nov: ['Peak season begins', 'Excellent weather', 'All activities available'],
    Dec: ['Holiday season', 'Festive atmosphere', 'Best for all experiences']
  };
  return highlights[month] || ['Sightseeing', 'Cultural experiences', 'Local cuisine'];
}

function getMonthTips(month) {
  const tips = {
    Jan: ['Book accommodations well in advance', 'Carry light woolens for evenings'],
    Feb: ['Ideal for outdoor activities and photography', 'Stay hydrated during the day'],
    Mar: ['Plan activities for early morning or late afternoon', 'Carry sun protection'],
    Apr: ['Stay hydrated', 'Visit hill stations to escape the heat'],
    May: ['Avoid outdoor activities during peak afternoon', 'Stay in air-conditioned accommodations'],
    Jun: ['Carry rain gear', 'Be prepared for possible travel delays'],
    Jul: ['Waterproof your belongings', 'Check weather forecasts regularly'],
    Aug: ['Carry umbrellas or raincoats', 'Visit indoor attractions during heavy rain'],
    Sep: ['Good time for photography with dramatic skies', 'Some areas may still be wet'],
    Oct: ['Ideal for trekking and outdoor activities', 'Early bookings recommended'],
    Nov: ['Peak season begins', 'Book everything in advance'],
    Dec: ['Highest prices of the year', 'Make reservations well in advance']
  };
  return tips[month] || ['Check local weather forecasts', 'Carry appropriate clothing'];
}

BestTimeToVisit.propTypes = {
  destination: PropTypes.shape({
    name: PropTypes.string.isRequired,
    overview: PropTypes.shape({
      bestTime: PropTypes.string,
      idealDuration: PropTypes.string
    })
  }).isRequired
};

export default BestTimeToVisit;
