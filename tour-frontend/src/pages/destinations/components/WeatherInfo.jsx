import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { WiDaySunny, WiRain, WiSnow, WiCloudy } from 'react-icons/wi';

const months = [
  { name: 'Jan', temp: '15-25°C', season: 'Winter' },
  { name: 'Feb', temp: '16-28°C', season: 'Winter' },
  { name: 'Mar', temp: '20-32°C', season: 'Spring' },
  { name: 'Apr', temp: '25-36°C', season: 'Summer' },
  { name: 'May', temp: '27-38°C', season: 'Summer' },
  { name: 'Jun', temp: '26-35°C', season: 'Monsoon' },
  { name: 'Jul', temp: '25-32°C', season: 'Monsoon' },
  { name: 'Aug', temp: '25-31°C', season: 'Monsoon' },
  { name: 'Sep', temp: '24-32°C', season: 'Monsoon' },
  { name: 'Oct', temp: '23-33°C', season: 'Autumn' },
  { name: 'Nov', temp: '19-30°C', season: 'Autumn' },
  { name: 'Dec', temp: '16-27°C', season: 'Winter' },
];

const seasons = [
  {
    name: 'Winter',
    period: 'December to February',
    description: 'Pleasant weather with cool mornings and evenings. Ideal for sightseeing and outdoor activities.',
    highlights: ['Sightseeing', 'Wildlife safaris', 'Trekking', 'Cultural tours'],
    icon: <WiDaySunny className="season-icon" />,
  },
  {
    name: 'Summer',
    period: 'March to June',
    description: 'Hot and dry weather. Mornings and late afternoons are best for outdoor activities.',
    highlights: ['Hill station visits', 'Early morning safaris', 'Water activities'],
    icon: <WiDaySunny className="season-icon" />,
  },
  {
    name: 'Monsoon',
    period: 'July to September',
    description: 'Heavy rainfall, lush green landscapes. Some areas may be inaccessible due to rain.',
    highlights: ['Nature walks', 'Photography', 'Visiting waterfalls', 'Ayurvedic treatments'],
    icon: <WiRain className="season-icon" />,
  },
  {
    name: 'Autumn',
    period: 'October to November',
    description: 'Pleasant weather with clear skies. One of the best times to visit with fewer crowds.',
    highlights: ['Trekking', 'Wildlife spotting', 'Festival experiences', 'Photography'],
    icon: <WiCloudy className="season-icon" />,
  },
];

const WeatherInfo = ({ bestTimeToVisit }) => {
  const [activeSeason, setActiveSeason] = useState(seasons[0]);

  const getSeasonIcon = (seasonName) => {
    switch (seasonName) {
      case 'Winter':
        return <WiDaySunny className="month-icon" />;
      case 'Summer':
        return <WiDaySunny className="month-icon" />;
      case 'Monsoon':
        return <WiRain className="month-icon" />;
      case 'Autumn':
        return <WiCloudy className="month-icon" />;
      default:
        return <WiDaySunny className="month-icon" />;
    }
  };

  return (
    <section className="weather-info">
      <div className="container">
        <div className="weather-header">
          <h2 className="section-title">Best Time to Visit</h2>
          {bestTimeToVisit && (
            <p className="best-time">
              {bestTimeToVisit.months}: {bestTimeToVisit.description}
            </p>
          )}
        </div>

        <div className="weather-grid">
          <div className="monthly-weather">
            <h3>Monthly Weather Overview</h3>
            <div className="months-grid">
              {months.map((month, index) => (
                <div key={index} className="month-card">
                  <div className="month-header">
                    {getSeasonIcon(month.season)}
                    <span className="month-name">{month.name}</span>
                  </div>
                  <div className="month-temp">{month.temp}</div>
                  <div className="season-name">{month.season}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="seasonal-guide">
            <h3>Seasonal Guide</h3>
            <div className="season-tabs">
              {seasons.map((season) => (
                <button
                  key={season.name}
                  className={`season-tab ${activeSeason.name === season.name ? 'active' : ''}`}
                  onClick={() => setActiveSeason(season)}
                >
                  {season.icon}
                  <span>{season.name}</span>
                </button>
              ))}
            </div>
            <div className="season-details">
              <h4>{activeSeason.period}</h4>
              <p>{activeSeason.description}</p>
              <div className="season-highlights">
                <h5>Best For:</h5>
                <div className="highlight-tags">
                  {activeSeason.highlights.map((highlight, index) => (
                    <span key={index} className="highlight-tag">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

WeatherInfo.propTypes = {
  bestTimeToVisit: PropTypes.shape({
    months: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default WeatherInfo;
