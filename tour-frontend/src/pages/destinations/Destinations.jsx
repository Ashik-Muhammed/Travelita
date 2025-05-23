import React from 'react';
import { Link } from 'react-router-dom';
import { destinations } from './destinationsData';
import DestinationCard from '../../components/DestinationCard';
import '../../styles/Destinations.css';

const Destinations = () => {
  return (
    <div className="destinations-page">
      {/* Hero Section */}
      <section className="destinations-hero">
        <div className="container">
          <h1>Explore Our Top Destinations</h1>
          <p>Discover the world's most amazing places with our handpicked selection of destinations</p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="search-section">
        <div className="container">
          <div className="search-box">
            <div className="search-input">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Search destinations..." 
                // Add search functionality here
              />
            </div>
            <div className="filter-options">
              <select>
                <option value="">All Regions</option>
                <option value="asia">Asia</option>
                <option value="europe">Europe</option>
                <option value="americas">Americas</option>
                <option value="africa">Africa</option>
                <option value="oceania">Oceania</option>
              </select>
              <select>
                <option value="">All Prices</option>
                <option value="budget">$ (Budget)</option>
                <option value="mid-range">$$ (Mid-Range)</option>
                <option value="luxury">$$$ (Luxury)</option>
              </select>
              <button className="btn btn-primary">Apply Filters</button>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="destinations-grid">
        <div className="container">
          <div className="section-header">
            <h2>Popular Destinations</h2>
            <p>Explore our most sought-after travel destinations</p>
          </div>
          
          <div className="destinations-container">
            {destinations.map(destination => (
              <div key={destination.id} className="destination-item">
                <DestinationCard destination={destination} />
              </div>
            ))}
          </div>

          <div className="load-more">
            <button className="btn btn-outline">Load More Destinations</button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-us">
        <div className="container">
          <div className="section-header">
            <h2>Why Travel With Us?</h2>
            <p>Experience the difference with our exceptional travel services</p>
          </div>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">
                <i className="fas fa-award"></i>
              </div>
              <h3>Best Price Guarantee</h3>
              <p>We offer the best prices for your dream vacation</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h3>24/7 Support</h3>
              <p>Our travel experts are available round the clock</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Safe & Secure</h3>
              <p>Your safety and security is our top priority</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2>Get Travel Deals & Updates</h2>
            <p>Subscribe to our newsletter and never miss our latest deals and promotions</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Destinations;
