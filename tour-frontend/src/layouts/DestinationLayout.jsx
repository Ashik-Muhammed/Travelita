import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaSun, FaStar, FaUtensils, FaSubway, FaMoneyBillWave } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/DestinationLayout.css';

const DestinationLayout = ({ destination }) => {
  const location = useLocation();
  
  const navLinks = [
    { name: 'Overview', path: '' },
    { name: 'Places to Visit', path: 'places-to-visit' },
    { name: 'Things to Do', path: 'things-to-do' },
    { name: 'Best Time to Visit', path: 'best-time' },
    { name: 'How to Reach', path: 'how-to-reach' },
    { name: 'Packages', path: 'packages' },
  ];

  return (
    <div className="destination-layout">
      <Header />
      
      {/* Hero Section */}
      <div 
        className="destination-hero" 
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${destination.heroImage})` }}
      >
        <div className="container">
          <div className="hero-content">
            <h1>{destination.name}, {destination.country}</h1>
            <div className="destination-meta">
              <span><FaMapMarkerAlt /> {destination.region}, {destination.country}</span>
              <span><FaCalendarAlt /> Best Time: {destination.bestTime}</span>
              <span><FaSun /> {destination.weather}°C</span>
              <span><FaStar /> {destination.rating} ({destination.reviewCount}+ reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="destination-nav">
        <div className="container">
          <nav>
            <ul>
              {navLinks.map((link, index) => {
                const to = `/destinations/${destination.slug}${link.path ? `/${link.path}` : ''}`;
                const isActive = location.pathname === to || 
                              (link.path === '' && location.pathname === `/destinations/${destination.slug}`);
                
                return (
                  <li key={index} className={isActive ? 'active' : ''}>
                    <Link to={to}>
                      {link.name}
                      {isActive && <span className="active-indicator"></span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <main className="destination-main">
        <div className="container">
          <div className="content-wrapper">
            {/* Main Content */}
            <div className="main-content">
              <Outlet context={{ destination }} />
            </div>
            
            {/* Sidebar */}
            <aside className="destination-sidebar">
              <div className="sidebar-card">
                <h3>Quick Facts</h3>
                <ul className="quick-facts">
                  <li>
                    <FaMapMarkerAlt className="icon" />
                    <div>
                      <span className="label">Location</span>
                      <span className="value">{destination.region}, {destination.country}</span>
                    </div>
                  </li>
                  <li>
                    <FaCalendarAlt className="icon" />
                    <div>
                      <span className="label">Best Time</span>
                      <span className="value">{destination.bestTime}</span>
                    </div>
                  </li>
                  <li>
                    <FaSun className="icon" />
                    <div>
                      <span className="label">Weather</span>
                      <span className="value">{destination.weather}°C</span>
                    </div>
                  </li>
                  <li>
                    <FaStar className="icon" />
                    <div>
                      <span className="label">Rating</span>
                      <span className="value">{destination.rating} ({destination.reviewCount}+ reviews)</span>
                    </div>
                  </li>
                </ul>
                
                <h3>Popular Experiences</h3>
                <ul className="popular-experiences">
                  {destination.popularExperiences.map((exp, index) => (
                    <li key={index}>
                      <img src={exp.image} alt={exp.name} />
                      <div>
                        <h4>{exp.name}</h4>
                        <span className="price">From ₹{exp.price.toLocaleString('en-IN')}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="cta-buttons">
                  <button className="btn btn-primary">
                    <i className="fas fa-calendar-alt"></i> Customize Trip
                  </button>
                  <button className="btn btn-outline">
                    <i className="fas fa-download"></i> Download Brochure
                  </button>
                </div>
              </div>
              
              <div className="sidebar-card help-card">
                <h3>Need Help?</h3>
                <p>Our travel experts are here to help you plan your perfect trip.</p>
                <div className="contact-info">
                  <a href="tel:+911234567890">
                    <i className="fas fa-phone-alt"></i> +91 12345 67890
                  </a>
                  <a href="mailto:info@travelita.com">
                    <i className="fas fa-envelope"></i> info@travelita.com
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DestinationLayout;
