import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FaStar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUtensils,
  FaHotel,
  FaBus,
  FaPlane,
  FaTrain,
  FaCar,
  FaCheckCircle
} from 'react-icons/fa';
import SectionHeader from '../../../components/SectionHeader';
import '../../../styles/DestinationComponents.css';

// Default packages data
const defaultPackages = [
  {
    id: 1,
    name: 'Classic City Tour',
    duration: '3 Days / 2 Nights',
    price: 8999,
    originalPrice: 10999,
    rating: 4.7,
    reviewCount: 128,
    type: 'sightseeing',
    highlights: ['City tour', 'Heritage walk', 'Local market visit'],
    inclusions: ['2 nights accommodation', 'Daily breakfast', 'Sightseeing as per itinerary', 'Local guide'],
    exclusions: ['Airfare', 'Lunch & dinner', 'Entrance fees'],
    image: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=800',
    tags: ['Best Seller', 'Family Friendly']
  },
  {
    id: 2,
    name: 'Luxury Getaway',
    duration: '5 Days / 4 Nights',
    price: 24999,
    originalPrice: 29999,
    rating: 4.9,
    reviewCount: 85,
    type: 'luxury',
    highlights: ['5-star accommodation', 'Private car with driver', 'Fine dining experiences'],
    inclusions: ['4 nights luxury stay', 'All meals included', 'Private transfers', 'Personal butler service'],
    exclusions: ['Airfare', 'Personal expenses', 'Spa treatments'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    tags: ['Luxury', 'Honeymoon Special']
  },
  {
    id: 3,
    name: 'Adventure Package',
    duration: '4 Days / 3 Nights',
    price: 15999,
    originalPrice: 17999,
    rating: 4.8,
    reviewCount: 64,
    type: 'adventure',
    highlights: ['Trekking', 'Water sports', 'Wildlife safari'],
    inclusions: ['3 nights stay', 'All adventure activities', 'Meals as per itinerary', 'Experienced guides'],
    exclusions: ['Equipment rental', 'Personal expenses', 'Travel insurance'],
    image: 'https://images.unsplash.com/photo-1501785888041-af32ef2c3985?w=800',
    tags: ['Adventure', 'Thrilling']
  },
  {
    id: 4,
    name: 'Weekend Escape',
    duration: '2 Days / 1 Night',
    price: 5999,
    originalPrice: 7499,
    rating: 4.5,
    reviewCount: 92,
    type: 'budget',
    highlights: ['Quick getaway', 'Local experiences', 'Comfortable stay'],
    inclusions: ['1 night accommodation', 'Breakfast', 'Local sightseeing', 'Transport'],
    exclusions: ['Lunch & dinner', 'Entrance fees', 'Personal expenses'],
    image: 'https://images.unsplash.com/photo-1502602897457-915e8e61e3c4?w=800',
    tags: ['Budget', 'Weekend Special']
  }
];

// Filter and sort options
const packageTypes = [
  { id: 'all', name: 'All Packages' },
  { id: 'sightseeing', name: 'Sightseeing' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'luxury', name: 'Luxury' },
  { id: 'budget', name: 'Budget' },
  { id: 'honeymoon', name: 'Honeymoon' },
  { id: 'family', name: 'Family' }
];

const durationOptions = [
  { value: '', label: 'Any Duration' },
  { value: '1-3', label: '1-3 Days' },
  { value: '4-7', label: '4-7 Days' },
  { value: '8-14', label: '1-2 Weeks' },
  { value: '15+', label: '2+ Weeks' }
];

const priceRanges = [
  { value: '', label: 'Any Price' },
  { value: '0-5000', label: 'Under ₹5,000' },
  { value: '5001-10000', label: '₹5,001 - ₹10,000' },
  { value: '10001-20000', label: '₹10,001 - ₹20,000' },
  { value: '20001+', label: 'Over ₹20,000' }
];

const sortOptions = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'duration', label: 'Duration' }
];

const Packages = ({ destination }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    duration: '',
    priceRange: '',
    rating: 0,
    sortBy: 'popularity'
  });

  // Combine default packages with any packages from the destination prop
  const allPackages = [...defaultPackages, ...(destination?.packages?.map(pkg => ({
    ...pkg,
    // Ensure all required fields have default values
    id: pkg.id || Math.floor(Math.random() * 10000),
    rating: pkg.rating || 4.5,
    reviewCount: pkg.reviewCount || 50,
    highlights: pkg.highlights || [],
    inclusions: pkg.inclusions || [],
    originalPrice: pkg.originalPrice || Math.round(pkg.price * 1.2),
    type: pkg.type || 'sightseeing',
    image: pkg.image || 'https://images.unsplash.com/photo-1502602897457-915e8e61e3c4?w=800',
    tags: pkg.tags || []
  })) || [])];

  const packageTypes = [
    { id: 'all', name: 'All Packages' },
    { id: 'sightseeing', name: 'Sightseeing' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'luxury', name: 'Luxury' },
    { id: 'budget', name: 'Budget' },
    { id: 'honeymoon', name: 'Honeymoon' },
    { id: 'family', name: 'Family' }
  ];

  const durationOptions = [
    { value: '', label: 'Any Duration' },
    { value: '1-3', label: '1-3 Days' },
    { value: '4-7', label: '4-7 Days' },
    { value: '8-14', label: '1-2 Weeks' },
    { value: '15+', label: '2+ Weeks' }
  ];

  const priceRanges = [
    { value: '', label: 'Any Price' },
    { value: '0-5000', label: 'Under ₹5,000' },
    { value: '5001-10000', label: '₹5,001 - ₹10,000' },
    { value: '10001-20000', label: '₹10,001 - ₹20,000' },
    { value: '20001+', label: '₹20,001+' }
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'duration', label: 'Duration' }
  ];

  const filteredPackages = allPackages.filter(pkg => {
    if (activeTab !== 'all' && pkg.type !== activeTab) return false;

    if (filters.duration) {
      const [minDays, maxDays] = filters.duration.split('-').map(Number);
      const pkgDays = parseInt(pkg.duration.match(/\d+/)?.[0] || '0', 10);
      if (isNaN(pkgDays)) return false;

      if (isNaN(maxDays)) {
        if (pkgDays < minDays) return false;
      } else if (pkgDays < minDays || pkgDays > maxDays) {
        return false;
      }
    }

    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange.split('-').map(Number);
      if (isNaN(maxPrice)) {
        if (pkg.price < minPrice) return false;
      } else if (pkg.price < minPrice || pkg.price > maxPrice) {
        return false;
      }
    }

    if (filters.rating > 0 && pkg.rating < filters.rating) return false;

    return true;
  });

  const sortedPackages = [...filteredPackages].sort((a, b) => {
    switch (filters.sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'duration':
        return parseInt(a.duration) - parseInt(b.duration);
      case 'popularity':
      default:
        return b.reviewCount - a.reviewCount;
    }
  });

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderStars = (rating) =>
    Array(5).fill(0).map((_, i) => (
      <FaStar key={i} className={`star ${i < Math.floor(rating) ? 'filled' : ''}`} />
    ));

  const renderInclusionIcon = (inclusion) => {
    const lower = inclusion.toLowerCase();
    if (lower.includes('flight') || lower.includes('airport')) return <FaPlane />;
    if (lower.includes('train')) return <FaTrain />;
    if (lower.includes('bus') || lower.includes('transport')) return <FaBus />;
    if (lower.includes('meal') || lower.includes('breakfast') || lower.includes('dinner')) return <FaUtensils />;
    if (lower.includes('hotel') || lower.includes('stay') || lower.includes('accommodation')) return <FaHotel />;
    if (lower.includes('tour') || lower.includes('sightseeing')) return <FaMapMarkerAlt />;
    return <FaCheckCircle />;
  };

  return (
    <section className="packages-section">
      <div className="container">
        <SectionHeader
          title={`${destination.name} Tour Packages`}
          subtitle="Find the perfect package for your next vacation"
        />

        <div className="filter-tabs">
          {packageTypes.map(type => (
            <button
              key={type.id}
              className={`tab-btn ${activeTab === type.id ? 'active' : ''}`}
              onClick={() => setActiveTab(type.id)}
            >
              {type.name}
            </button>
          ))}
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Duration:</label>
            <select onChange={(e) => handleFilterChange('duration', e.target.value)}>
              {durationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range:</label>
            <select onChange={(e) => handleFilterChange('priceRange', e.target.value)}>
              {priceRanges.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Minimum Rating:</label>
            <select onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}>
              <option value={0}>Any Rating</option>
              {[5, 4, 3, 2, 1].map(r => (
                <option key={r} value={r}>{r} stars & up</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="package-list">
          {sortedPackages.length > 0 ? (
            sortedPackages.map(pkg => (
              <div key={pkg.id} className="package-card">
                <img src={pkg.image} alt={pkg.name} className="package-image" />
                <div className="package-details">
                  <h3>{pkg.name}</h3>
                  <div className="package-rating">{renderStars(pkg.rating)} ({pkg.reviewCount})</div>
                  <p><FaCalendarAlt /> {pkg.duration}</p>
                  <ul>
                    {pkg.highlights.map((h, i) => <li key={i}><FaCheckCircle /> {h}</li>)}
                  </ul>
                  <div className="inclusions">
                    {pkg.inclusions.map((inc, i) => (
                      <div key={i} className="inclusion-item">{renderInclusionIcon(inc)} {inc}</div>
                    ))}
                  </div>
                  <div className="price-section">
                    <span className="price">₹{pkg.price.toLocaleString()}</span>
                    <span className="original-price">₹{pkg.originalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No packages match your filters.</p>
          )}
        </div>

        <div className="package-faqs">
          <h3>Frequently Asked Questions</h3>
          <div className="faq-grid">
            {[
              {
                question: 'What is included in the tour package?',
                answer: 'All our tour packages include accommodation, meals as specified, transportation for sightseeing, and a professional guide.'
              },
              {
                question: 'How do I book a tour package?',
                answer: 'Click the "Book Now" button on a package or contact our customer service team.'
              },
              {
                question: 'What is the cancellation policy?',
                answer: 'Cancel 30+ days prior for full refund, 15-29 days for 50%, and less than 15 days are non-refundable.'
              },
              {
                question: 'Can I customize my tour package?',
                answer: 'Yes, contact our team to create a personalized itinerary based on your preferences.'
              }
            ].map((faq, i) => (
              <div key={i} className="faq-item">
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

Packages.propTypes = {
  destination: PropTypes.shape({
    name: PropTypes.string.isRequired,
    packages: PropTypes.array
  }).isRequired
};

export default Packages;
