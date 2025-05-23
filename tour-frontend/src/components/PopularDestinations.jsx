import React from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from './SectionHeader';
import StarRating from './StarRating';
import '../styles/PopularDestinations.css';

const PopularDestinations = () => {
  const destinations = [
    {
      id: 1,
      name: 'Goa',
      country: 'India',
      description: 'Famous for its beaches, nightlife, and Portuguese heritage sites',
      image: 'https://images.unsplash.com/photo-1506929562872-b5415f302be9?w=800',
      rating: 4.7,
      price: 15999,
      duration: '4-7',
      slug: 'goa-india',
      tags: ['Beaches', 'Nightlife', 'Heritage']
    },
    {
      id: 2,
      name: 'Manali',
      country: 'India',
      description: 'Himalayan resort town known for its skiing, trekking, and hot springs',
      image: 'https://images.unsplash.com/photo-1582038832823-044f3b0a2f2b?w=800',
      rating: 4.6,
      price: 18999,
      duration: '5-8',
      slug: 'manali-india',
      tags: ['Mountains', 'Adventure', 'Honeymoon']
    },
    {
      id: 3,
      name: 'Jaipur',
      country: 'India',
      description: 'The Pink City, known for its stunning palaces and rich cultural heritage',
      image: 'https://images.unsplash.com/photo-1534751679422-95e3eafaa592?w=800',
      rating: 4.8,
      price: 12999,
      duration: '3-5',
      slug: 'jaipur-india',
      tags: ['Heritage', 'Culture', 'Shopping']
    },
    {
      id: 4,
      name: 'Kerala',
      country: 'India',
      description: 'God\'s Own Country with backwaters, beaches, and hill stations',
      image: 'https://images.unsplash.com/photo-1583422409516-289911ce76b3?w=800',
      rating: 4.9,
      price: 21999,
      duration: '7-10',
      slug: 'kerala-india',
      tags: ['Backwaters', 'Ayurveda', 'Nature']
    },
    {
      id: 5,
      name: 'Ladakh',
      country: 'India',
      description: 'Land of high passes with stunning landscapes and Buddhist culture',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528edc?w=800',
      rating: 4.8,
      price: 24999,
      duration: '8-12',
      slug: 'ladakh-india',
      tags: ['Adventure', 'Buddhism', 'Lakes']
    }
  ];

  return (
    <section className="popular-destinations">
      <div className="container">
        <SectionHeader 
          title="Popular Destinations in India"
          subtitle="Explore the diverse beauty of India's most loved destinations"
          className="decorative"
        />
        
        <div className="destinations-grid">
          {destinations.map(destination => (
            <div key={destination.id} className="destination-card">
              <div className="destination-image">
                <img 
                  src={destination.image} 
                  alt={`${destination.name}, ${destination.country}`} 
                  loading="lazy"
                />
                <div className="destination-price">
                  From ₹{destination.price.toLocaleString('en-IN')}
                </div>
                <div className="destination-tags">
                  {destination.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="destination-content">
                <h3>{destination.name}</h3>
                <p className="destination-description">{destination.description}</p>
                <div className="destination-meta">
                  <div className="rating">
                    <StarRating rating={destination.rating} size="sm" />
                    <span className="reviews">({Math.floor(Math.random() * 500) + 100} reviews)</span>
                  </div>
                  <span className="duration">
                    <i className="far fa-clock"></i> {destination.duration} days
                  </span>
                </div>
                <Link to={`/destinations/${destination.slug}`} className="btn btn-outline">
                  Explore {destination.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="view-all">
          <Link to="/destinations/india" className="btn btn-primary">
            View All Indian Destinations
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
