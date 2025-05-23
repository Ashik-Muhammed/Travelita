import React from 'react';
import PropTypes from 'prop-types';
import { FaPlane, FaTrain, FaBus, FaCar, FaShip, FaSubway, FaTaxi, FaWalking, FaBicycle, FaMotorcycle } from 'react-icons/fa';
import { MdFlight, MdDirectionsCar, MdDirectionsBoat, MdDirectionsTransit, MdDirectionsWalk, MdDirectionsBike } from 'react-icons/md';
import SectionHeader from '../../../components/SectionHeader';

const HowToReach = ({ destination }) => {
  const travelOptions = [
    {
      id: 'by-air',
      title: 'By Air',
      icon: <FaPlane className="text-blue-500 text-2xl" />,
      description: destination.howToReach?.byAir || `The nearest airport is well-connected to major cities across India and some international destinations.`,
      details: [
        { label: 'Nearest Airport', value: destination.howToReach?.nearestAirport || 'City International Airport (CIA)' },
        { label: 'Distance from City Center', value: destination.howToReach?.airportDistance || '15 km' },
        { label: 'Travel Time', value: destination.howToReach?.airportTravelTime || '30-45 minutes' },
        { label: 'Major Airlines', value: 'IndiGo, Air India, SpiceJet, Vistara' },
        { label: 'Approx. Flight Duration', value: '2-3 hours from major Indian cities' }
      ],
      tips: [
        'Book flights in advance for better prices',
        'Check for any seasonal flight variations',
        'Airport taxis and app-based cabs are available 24/7'
      ]
    },
    {
      id: 'by-train',
      title: 'By Train',
      icon: <FaTrain className="text-green-500 text-2xl" />,
      description: destination.howToReach?.byTrain || `The city is well-connected by rail to all major cities in India.`,
      details: [
        { label: 'Nearest Railway Station', value: destination.howToReach?.railwayStation || 'City Junction (CJN)' },
        { label: 'Station Code', value: destination.howToReach?.stationCode || 'CJN' },
        { label: 'Distance from City Center', value: destination.howToReach?.stationDistance || '5 km' },
        { label: 'Travel Time', value: 'Varies by origin (typically 12-36 hours from major cities)' },
        { label: 'Major Trains', value: 'Rajdhani Express, Shatabdi Express, Duronto Express' }
      ],
      tips: [
        'Book train tickets 120 days in advance for best availability',
        'Tatkal and Premium Tatkal quotas available for last-minute bookings',
        'Pre-paid auto and taxi counters available at the station'
      ]
    },
    {
      id: 'by-road',
      title: 'By Road',
      icon: <FaBus className="text-yellow-500 text-2xl" />,
      description: destination.howToReach?.byRoad || `Well-connected by national and state highways with regular bus services from nearby cities.`,
      details: [
        { label: 'Nearest Bus Terminal', value: destination.howToReach?.busTerminal || 'City Bus Stand (CBS)' },
        { label: 'Distance from Major Cities', value: 'Mumbai: 800 km, Delhi: 1,200 km, Bangalore: 600 km' },
        { label: 'Travel Time', value: 'Varies by origin (typically 8-24 hours from major cities)' },
        { label: 'Bus Types', value: 'Volvo AC, Sleeper, Semi-sleeper, Ordinary' },
        { label: 'Major Bus Operators', value: 'State Transport, Private Volvo Services' }
      ],
      tips: [
        'Overnight Volvo buses are comfortable for long distances',
        'Book tickets in advance during peak season',
        'Check road conditions during monsoon season'
      ]
    },
    {
      id: 'self-drive',
      title: 'Self Drive',
      icon: <FaCar className="text-red-500 text-2xl" />,
      description: 'Rent a car or drive your own vehicle with well-maintained highways connecting to the city.',
      details: [
        { label: 'Route 1', value: 'From Mumbai: NH48 via Pune and Satara' },
        { label: 'Route 2', value: 'From Delhi: NH44 via Jaipur and Udaipur' },
        { label: 'Approx. Distance', value: 'Mumbai: 800 km, Delhi: 1,200 km, Bangalore: 600 km' },
        { label: 'Travel Time', value: 'Mumbai: 14 hours, Delhi: 20 hours, Bangalore: 10 hours' },
        { label: 'Toll Charges', value: 'Approx. ₹1,500-2,000 one way from Mumbai' }
      ],
      tips: [
        'Plan fuel stops as some stretches have limited facilities',
        'Carry necessary documents (DL, RC, Insurance, PUC)',
        'Check vehicle condition before long drives'
      ]
    }
  ];

  const localTransport = [
    {
      id: 'metro',
      name: 'Metro',
      icon: <FaSubway className="text-purple-500" />,
      description: 'Air-conditioned metro trains connect major parts of the city.',
      fare: '₹10-50',
      timings: '6:00 AM - 11:00 PM',
      frequency: '5-10 minutes'
    },
    {
      id: 'buses',
      name: 'City Buses',
      icon: <FaBus className="text-blue-600" />,
      description: 'Extensive network covering all major areas of the city.',
      fare: '₹5-30',
      timings: '5:00 AM - 11:30 PM',
      frequency: '10-20 minutes'
    },
    {
      id: 'auto-rickshaw',
      name: 'Auto Rickshaws',
      icon: <FaMotorcycle className="text-green-600" />,
      description: 'Metered and shared autos available throughout the city.',
      fare: 'Metered: ₹25 for first km, ₹12/km after',
      timings: '24/7 (limited at night)',
      frequency: 'Readily available'
    },
    {
      id: 'taxis',
      name: 'Taxis & Cabs',
      icon: <FaTaxi className="text-yellow-600" />,
      description: 'App-based cabs and local taxis for comfortable travel.',
      fare: '₹100 base + ₹15-20/km',
      timings: '24/7',
      frequency: 'On-demand'
    },
    {
      id: 'bike-taxis',
      name: 'Bike Taxis',
      icon: <FaMotorcycle className="text-red-500" />,
      description: 'Quick and economical for short distances.',
      fare: '₹3-5/km',
      timings: '6:00 AM - 11:00 PM',
      frequency: 'On-demand'
    }
  ];

  return (
    <div className="how-to-reach">
      <SectionHeader 
        title="How to Reach"
        subtitle={`Best ways to travel to ${destination.name}`}
      />
      
      <div className="travel-options">
        {travelOptions.map((option) => (
          <div key={option.id} className="travel-option">
            <div className="option-header">
              <div className="option-icon">
                {option.icon}
              </div>
              <h3>{option.title}</h3>
            </div>
            <p className="option-description">{option.description}</p>
            
            <div className="option-details">
              <h4>Details:</h4>
              <ul>
                {option.details.map((detail, index) => (
                  <li key={index}>
                    <strong>{detail.label}:</strong> {detail.value}
                  </li>
                ))}
              </ul>
            </div>
            
            {option.tips && option.tips.length > 0 && (
              <div className="option-tips">
                <h4>Travel Tips:</h4>
                <ul>
                  {option.tips.map((tip, index) => (
                    <li key={index}>
                      <i className="fas fa-lightbulb"></i> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {option.id === 'by-air' && (
              <div className="airport-transfer">
                <h4>Airport Transfer Options:</h4>
                <div className="transfer-options">
                  <div className="transfer-option">
                    <div className="transfer-icon">
                      <FaTaxi />
                    </div>
                    <div>
                      <h5>Pre-paid Taxi</h5>
                      <p>Available 24/7 at the airport</p>
                      <p className="price">Approx. ₹500-800 to city center</p>
                    </div>
                  </div>
                  <div className="transfer-option">
                    <div className="transfer-icon">
                      <FaBus />
                    </div>
                    <div>
                      <h5>Airport Shuttle</h5>
                      <p>Runs every 30 minutes</p>
                      <p className="price">Approx. ₹100-200 per person</p>
                    </div>
                  </div>
                  <div className="transfer-option">
                    <div className="transfer-icon">
                      <FaSubway />
                    </div>
                    <div>
                      <h5>Metro</h5>
                      <p>Direct connection to city center</p>
                      <p className="price">Approx. ₹30-50 per person</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="local-transport">
        <h3>Getting Around {destination.name}</h3>
        <p className="section-description">
          Explore the city with these convenient local transportation options:
        </p>
        
        <div className="transport-grid">
          {localTransport.map((transport) => (
            <div key={transport.id} className="transport-card">
              <div className="transport-icon">
                {transport.icon}
              </div>
              <h4>{transport.name}</h4>
              <p className="transport-description">{transport.description}</p>
              <div className="transport-details">
                <div className="detail">
                  <span className="detail-label">Fare:</span>
                  <span className="detail-value">{transport.fare}</span>
                </div>
                <div className="detail">
                  <span className="detail-label">Timings:</span>
                  <span className="detail-value">{transport.timings}</span>
                </div>
                <div className="detail">
                  <span className="detail-label">Frequency:</span>
                  <span className="detail-value">{transport.frequency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="travel-tips">
        <h3>Travel Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">
              <i className="fas fa-ticket-alt"></i>
            </div>
            <h4>Ticket Booking</h4>
            <p>Book train/flight tickets well in advance, especially during peak season (October-March).</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <h4>Navigation</h4>
            <p>Use Google Maps or local taxi apps for navigation and estimated fares.</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">
              <i className="fas fa-wallet"></i>
            </div>
            <h4>Cash & Payments</h4>
            <p>Carry some cash as some local transport may not accept digital payments.</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">
              <i className="fas fa-language"></i>
            </div>
            <h4>Language</h4>
            <p>English is widely understood, but learning a few local phrases can be helpful.</p>
          </div>
        </div>
      </div>
      
      <div className="accessibility">
        <h3>Accessibility Information</h3>
        <div className="accessibility-content">
          <div className="accessibility-details">
            <h4>For Travelers with Disabilities</h4>
            <ul>
              <li>Most airports and major railway stations have wheelchair assistance</li>
              <li>Low-floor buses available on select routes</li>
              <li>Many hotels and attractions have accessible facilities</li>
              <li>Pre-booking assistance recommended for special needs</li>
            </ul>
          </div>
          <div className="accessibility-contacts">
            <h4>Important Contacts</h4>
            <ul>
              <li><strong>Tourist Helpline:</strong> 1800-11-1363</li>
              <li><strong>Medical Emergency:</strong> 108</li>
              <li><strong>Police:</strong> 100</li>
              <li><strong>Women's Helpline:</strong> 181</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

HowToReach.propTypes = {
  destination: PropTypes.shape({
    name: PropTypes.string.isRequired,
    howToReach: PropTypes.shape({
      byAir: PropTypes.string,
      byTrain: PropTypes.string,
      byRoad: PropTypes.string,
      nearestAirport: PropTypes.string,
      airportDistance: PropTypes.string,
      airportTravelTime: PropTypes.string,
      railwayStation: PropTypes.string,
      stationCode: PropTypes.string,
      stationDistance: PropTypes.string,
      busTerminal: PropTypes.string
    })
  }).isRequired
};

export default HowToReach;
