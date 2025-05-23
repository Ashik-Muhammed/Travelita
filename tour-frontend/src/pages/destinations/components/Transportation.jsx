import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaPlane, FaTrain, FaBus, FaCar, FaSubway, FaTaxi, FaBicycle } from 'react-icons/fa';
import { MdDirectionsBoat } from 'react-icons/md';

const transportTypes = [
  { id: 'air', name: 'By Air', icon: <FaPlane /> },
  { id: 'train', name: 'By Train', icon: <FaTrain /> },
  { id: 'bus', name: 'By Bus', icon: <FaBus /> },
  { id: 'car', name: 'By Road', icon: <FaCar /> },
  { id: 'local', name: 'Local Transport', icon: <FaTaxi /> },
];

const transportDetails = {
  air: {
    title: 'By Air',
    icon: <FaPlane className="transport-icon" />,
    description: 'Dabolim Airport (GOI) is well-connected to major Indian cities and some international destinations.',
    details: [
      { label: 'Nearest Airport', value: 'Dabolim Airport (GOI)' },
      { label: 'Distance from City Center', value: '25 km' },
      { label: 'Travel Time', value: '45-60 minutes' },
      { label: 'Major Airlines', value: 'IndiGo, Air India, SpiceJet, Vistara' },
      { label: 'Approx. Flight Duration', value: '1-2 hours from major Indian cities' },
    ],
    tips: [
      'Book flights in advance for better prices',
      'Check for any seasonal flight variations',
      'Airport taxis and app-based cabs are available 24/7',
    ],
  },
  train: {
    title: 'By Train',
    icon: <FaTrain className="transport-icon" />,
    description: 'Madgaon (MAO) and Thivim (THVM) are the main railway stations in Goa.',
    details: [
      { label: 'Nearest Railway Station', value: 'Madgaon Junction (MAO)' },
      { label: 'Distance from City Center', value: '35 km' },
      { label: 'Travel Time', value: '8-12 hours from major cities' },
      { label: 'Major Trains', value: 'Konkan Kanya Express, Jan Shatabdi Express' },
      { label: 'Booking', value: 'Book 120 days in advance' },
    ],
    tips: [
      'Book train tickets 120 days in advance for best availability',
      'Tatkal and Premium Tatkal quotas available for last-minute bookings',
      'Pre-paid auto and taxi counters available at the station',
    ],
  },
  bus: {
    title: 'By Bus',
    icon: <FaBus className="transport-icon" />,
    description: 'Well-connected by road from Mumbai (600 km) and Bangalore (560 km).',
    details: [
      { label: 'Nearest Bus Stand', value: 'Kadamba Bus Stand, Panaji' },
      { label: 'Distance from Major Cities', value: 'Mumbai: 600 km, Bangalore: 560 km' },
      { label: 'Travel Time', value: '10-12 hours from Mumbai/Bangalore' },
      { label: 'Bus Types', value: 'Volvo AC, Sleeper, Semi-sleeper, Ordinary' },
      { label: 'Major Operators', value: 'Kadamba Transport, Private Volvo Services' },
    ],
    tips: [
      'Overnight Volvo buses are comfortable for long distances',
      'Book tickets in advance during peak season',
      'Check road conditions during monsoon season',
    ],
  },
  car: {
    title: 'Self Drive',
    icon: <FaCar className="transport-icon" />,
    description: 'Rent a car or drive your own vehicle with well-maintained highways connecting to the city.',
    details: [
      { label: 'Route 1', value: 'From Mumbai: NH48 via Pune and Satara' },
      { label: 'Route 2', value: 'From Bangalore: NH48 via Hubli and Belgaum' },
      { label: 'Approx. Distance', value: 'Mumbai: 600 km, Bangalore: 560 km' },
      { label: 'Travel Time', value: 'Mumbai: 10-12 hours, Bangalore: 9-11 hours' },
      { label: 'Toll Charges', value: 'Approx. ₹1,500-2,000 one way from Mumbai' },
    ],
    tips: [
      'Plan fuel stops as some stretches have limited facilities',
      'Carry necessary documents (DL, RC, Insurance, PUC)',
      'Check vehicle condition before long drives',
    ],
  },
  local: {
    title: 'Local Transport',
    icon: <FaTaxi className="transport-icon" />,
    description: 'Various options available for getting around the city and nearby attractions.',
    options: [
      {
        name: 'Taxis & Cabs',
        icon: <FaTaxi />,
        description: 'Metered taxis and app-based cabs available throughout the city',
        fare: '₹100 base + ₹15-20/km',
        timings: '24/7',
      },
      {
        name: 'Auto Rickshaws',
        icon: <FaTaxi />,
        description: 'Shared and private autos available for short distances',
        fare: 'Metered: ₹25 for first km, ₹12/km after',
        timings: '6:00 AM - 11:00 PM',
      },
      {
        name: 'Rental Bikes/Scooters',
        icon: <FaBicycle />,
        description: 'Self-ride two-wheelers available for rent',
        fare: '₹300-500 per day',
        timings: '8:00 AM - 8:00 PM',
      },
      {
        name: 'Ferry Services',
        icon: <MdDirectionsBoat />,
        description: 'Connects various points across the rivers',
        fare: '₹5-50 per person',
        timings: '6:00 AM - 10:00 PM',
      },
    ],
    tips: [
      'Negotiate taxi/auto fares before boarding or use meter',
      'Download local transport apps for convenience',
      'Carry change for local transport',
    ],
  },
};

const Transportation = ({ transportInfo }) => {
  const [activeTab, setActiveTab] = useState('air');

  return (
    <section className="transportation-section">
      <div className="container">
        <h2 className="section-title">How to Reach {transportInfo?.destinationName || 'Destination'}</h2>
        
        <div className="transport-tabs">
          {transportTypes.map((type) => (
            <button
              key={type.id}
              className={`transport-tab ${activeTab === type.id ? 'active' : ''}`}
              onClick={() => setActiveTab(type.id)}
            >
              <span className="tab-icon">{type.icon}</span>
              <span className="tab-name">{type.name}</span>
            </button>
          ))}
        </div>

        <div className="transport-details">
          <div className="transport-info">
            <div className="transport-header">
              <div className="transport-icon">
                {transportDetails[activeTab].icon}
              </div>
              <h3>{transportDetails[activeTab].title}</h3>
            </div>
            
            <p className="transport-description">
              {transportDetails[activeTab].description}
            </p>

            {transportDetails[activeTab].details ? (
              <div className="transport-meta">
                {transportDetails[activeTab].details.map((item, index) => (
                  <div key={index} className="meta-item">
                    <span className="meta-label">{item.label}:</span>
                    <span className="meta-value">{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="transport-options">
                {transportDetails[activeTab].options.map((option, index) => (
                  <div key={index} className="transport-option">
                    <div className="option-icon">{option.icon}</div>
                    <div className="option-details">
                      <h4>{option.name}</h4>
                      <p>{option.description}</p>
                      <div className="option-meta">
                        <span>Fare: {option.fare}</span>
                        <span>Timings: {option.timings}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {transportDetails[activeTab].tips && (
              <div className="transport-tips">
                <h4>Travel Tips:</h4>
                <ul>
                  {transportDetails[activeTab].tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

Transportation.propTypes = {
  transportInfo: PropTypes.shape({
    destinationName: PropTypes.string,
    // Add more specific props as needed
  }),
};

Transportation.defaultProps = {
  transportInfo: {
    destinationName: '',
  },
};

export default Transportation;
