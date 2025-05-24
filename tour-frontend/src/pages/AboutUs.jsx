import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AboutUs.css';

function AboutUs() {
  const [activeTab, setActiveTab] = useState('story');

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Adventure Traveler',
      quote: 'Travelita made our family trip to Kerala absolutely magical! The guides were knowledgeable and everything was perfectly organized.',
      image: 'images/testimonials/sarah.jpg',
      fallbackImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 5
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Business Traveler',
      quote: 'As a frequent business traveler, I appreciate the efficiency and reliability of Travelita. Their attention to detail makes every trip smooth.',
      image: 'images/testimonials/michael.jpg',
      fallbackImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 5
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      role: 'Solo Traveler',
      quote: 'I felt safe and supported throughout my solo journey across India. The local experiences Travelita arranged were authentic and unforgettable.',
      image: 'images/testimonials/emma.jpg',
      fallbackImage: 'https://randomuser.me/api/portraits/women/68.jpg',
      rating: 5
    }
  ];

  const renderStars = (rating) => {
    return Array(5).fill().map((_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>★</span>
    ));
  };

  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1>About Travelita</h1>
          <p className="subtitle">Your trusted partner in creating unforgettable travel experiences</p>
        </div>
      </div>

      <div className="container">
        <div className="about-tabs">
          <button 
            className={`tab-button ${activeTab === 'story' ? 'active' : ''}`}
            onClick={() => setActiveTab('story')}
          >
            Our Story
          </button>
          <button 
            className={`tab-button ${activeTab === 'mission' ? 'active' : ''}`}
            onClick={() => setActiveTab('mission')}
          >
            Mission & Vision
          </button>
          <button 
            className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Our Team
          </button>
        </div>

        {activeTab === 'story' && (
          <section className="about-section">
            <h2>Our Story</h2>
            <p>
              Founded in 2024, Travelita has quickly become a leading name in the travel industry. 
              We started with a simple mission: to make travel accessible, enjoyable, and memorable 
              for everyone. Our journey began with a small team of passionate travelers who wanted 
              to share their love for exploration with the world.
            </p>
            <div className="story-timeline">
              <div className="timeline-item">
                <div className="year">2024</div>
                <div className="content">
                  <h3>Our Beginning</h3>
                  <p>Travelita was founded with a vision to transform the travel experience.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="year">2024</div>
                <div className="content">
                  <h3>Expanding Horizons</h3>
                  <p>Launched our first international tour packages.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="year">2024</div>
                <div className="content">
                  <h3>Growing Together</h3>
                  <p>Reached 10,000+ happy travelers and counting.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'mission' && (
          <section className="about-section">
            <h2>Our Mission & Vision</h2>
            <div className="mission-video">
              <div className="video-placeholder">
                <div className="play-button">▶</div>
                <p>Watch our mission statement</p>
              </div>
            </div>
            <div className="mission-content">
              <h3>Our Mission</h3>
              <p>
                At Travelita, we believe that travel has the power to transform lives. Our mission is 
                to provide exceptional travel experiences that inspire, educate, and connect people 
                with different cultures and destinations. We strive to make every journey meaningful 
                and memorable.
              </p>
              <h3>Our Vision</h3>
              <p>
                We envision a world where travel is accessible to everyone, where cultural exchange 
                fosters understanding, and where sustainable tourism practices preserve the beauty of 
                our planet for future generations.
              </p>
            </div>
          </section>
        )}

        {activeTab === 'team' && (
          <section className="about-section team">
            <h2>Our Team</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-image">
                  <img src="/images/team/ceo.jpg" alt="CEO" />
                </div>
                <h3>John Doe</h3>
                <p className="position">CEO & Founder</p>
                <p className="bio">
                  With over 15 years of experience in the travel industry, John leads our team with 
                  passion and vision.
                </p>
                <div className="social-links">
                  <a href="#" className="social-link">LinkedIn</a>
                  <a href="#" className="social-link">Twitter</a>
                </div>
              </div>
              <div className="team-member">
                <div className="member-image">
                  <img src="/images/team/operations.jpg" alt="Operations Director" />
                </div>
                <h3>Jane Smith</h3>
                <p className="position">Operations Director</p>
                <p className="bio">
                  Jane ensures that every aspect of our travel packages meets the highest standards.
                </p>
                <div className="social-links">
                  <a href="#" className="social-link">LinkedIn</a>
                  <a href="#" className="social-link">Twitter</a>
                </div>
              </div>
              <div className="team-member">
                <div className="member-image">
                  <img src="/images/team/customer-service.jpg" alt="Customer Service Head" />
                </div>
                <h3>Mike Johnson</h3>
                <p className="position">Customer Service Head</p>
                <p className="bio">
                  Mike and his team are dedicated to providing exceptional support to our customers.
                </p>
                <div className="social-links">
                  <a href="#" className="social-link">LinkedIn</a>
                  <a href="#" className="social-link">Twitter</a>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="about-section values">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Excellence</h3>
              <p>We are committed to delivering the highest quality travel experiences.</p>
            </div>
            <div className="value-card">
              <h3>Customer Focus</h3>
              <p>Your satisfaction and comfort are our top priorities.</p>
            </div>
            <div className="value-card">
              <h3>Sustainability</h3>
              <p>We promote responsible tourism and environmental conservation.</p>
            </div>
          </div>
        </section>

        <section className="about-section testimonials">
          <h2>What Our Travelers Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-image">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = testimonial.fallbackImage;
                    }}
                  />
                </div>
                <div className="testimonial-content">
                  <div className="testimonial-rating">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="testimonial-text">{testimonial.quote}</p>
                  <div className="testimonial-author">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section achievements">
          <h2>Our Achievements</h2>
          <div className="achievements-grid">
            <div className="achievement-card">
              <div className="achievement-number">10K+</div>
              <p>Happy Travelers</p>
            </div>
            <div className="achievement-card">
              <div className="achievement-number">50+</div>
              <p>Destinations</p>
            </div>
            <div className="achievement-card">
              <div className="achievement-number">98%</div>
              <p>Customer Satisfaction</p>
            </div>
            <div className="achievement-card">
              <div className="achievement-number">24/7</div>
              <p>Support Available</p>
            </div>
          </div>
        </section>

        <section className="about-section cta">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of happy travelers who have experienced the Travelita difference.</p>
          <div className="cta-buttons">
            <Link to="/packages/top" className="btn btn-primary">Explore Packages</Link>
            <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutUs; 