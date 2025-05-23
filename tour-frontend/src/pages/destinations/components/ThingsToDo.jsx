import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import SectionHeader from '../../../components/SectionHeader';
import StarRating from '../../../components/StarRating';

const ThingsToDo = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="no-activities">
        <p>No activities information available at the moment.</p>
      </div>
    );
  }

  // Group activities by category
  const activitiesByCategory = activities.reduce((acc, activity) => {
    const category = activity.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(activity);
    return acc;
  }, {});

  return (
    <div className="things-to-do">
      <SectionHeader 
        title="Things to Do"
        subtitle="Discover amazing experiences and activities"
      />
      
      <div className="activity-filters">
        <div className="filter-group">
          <label>Categories:</label>
          <div className="filter-tags">
            {['All', 'Adventure', 'Cultural', 'Nature', 'Food', 'Shopping', 'Relaxation'].map((category) => (
              <button 
                key={category} 
                className={`filter-tag ${category === 'All' ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="filter-group">
          <label>Sort by:</label>
          <select className="sort-select">
            <option value="popular">Most Popular</option>
            <option value="rating">Top Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="duration">Duration</option>
          </select>
        </div>
      </div>
      
      {Object.entries(activitiesByCategory).map(([category, categoryActivities]) => (
        <div key={category} className="activity-category">
          <h3 className="category-title">{category} <span className="activity-count">{categoryActivities.length} activities</span></h3>
          <div className="activities-grid">
            {categoryActivities.map((activity, index) => (
              <div key={index} className="activity-card">
                <div className="activity-image">
                  <img 
                    src={activity.image} 
                    alt={activity.name}
                    loading="lazy"
                  />
                  {activity.isPopular && <span className="popular-badge">Popular</span>}
                  {activity.discount && <span className="discount-badge">-{activity.discount}%</span>}
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <h4>{activity.name}</h4>
                    <div className="activity-rating">
                      <StarRating rating={activity.rating || 4.5} size="sm" />
                      <span className="review-count">({activity.reviewCount || '100+'} reviews)</span>
                    </div>
                  </div>
                  
                  <p className="activity-description">
                    {activity.description || 'Experience the best of the destination with this amazing activity.'}
                  </p>
                  
                  <div className="activity-meta">
                    <div className="meta-item">
                      <i className="far fa-clock"></i>
                      <span>{activity.duration || '2-3 hours'}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-users"></i>
                      <span>{activity.groupSize || 'Small group'}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-language"></i>
                      <span>{activity.language || 'English'}</span>
                    </div>
                  </div>
                  
                  <div className="activity-footer">
                    <div className="price">
                      {activity.originalPrice && !isNaN(activity.originalPrice) && (
                        <span className="original-price">₹{Number(activity.originalPrice).toLocaleString('en-IN')}</span>
                      )}
                      <span className="current-price">
                        ₹{activity.price ? Number(activity.price).toLocaleString('en-IN') : '0'}
                      </span>
                      <span className="per-person">per person</span>
                    </div>
                    <Link 
                      to={`/activities/${activity.slug || (activity.name ? activity.name.toLowerCase().replace(/\s+/g, '-') : 'activity')}`} 
                      className="btn-book"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="tours-section">
        <h3>Popular Tours & Day Trips</h3>
        <div className="tours-grid">
          {[
            {
              name: 'Heritage Walk',
              description: 'Explore the rich history and culture with our expert guides',
              duration: '4 hours',
              price: 1200,
              rating: 4.8,
              image: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=400'
            },
            {
              name: 'Food Tour',
              description: 'Taste the local flavors and delicacies',
              duration: '3.5 hours',
              price: 1800,
              rating: 4.9,
              image: 'https://images.unsplash.com/photo-1504674900247-087703934569?w=400'
            },
            {
              name: 'Sunset Cruise',
              description: 'Relaxing cruise with stunning sunset views',
              duration: '2 hours',
              price: 2500,
              rating: 4.7,
              image: 'https://images.unsplash.com/photo-1501785888041-af32ef2c3985?w=400'
            }
          ].map((tour, index) => (
            <div key={index} className="tour-card">
              <div className="tour-image">
                <img src={tour.image} alt={tour.name} />
                <div className="tour-duration">{tour.duration}</div>
              </div>
              <div className="tour-content">
                <h4>{tour.name}</h4>
                <p>{tour.description}</p>
                <div className="tour-footer">
                  <div className="tour-rating">
                    <StarRating rating={tour.rating} size="sm" />
                    <span>{(tour.rating).toFixed(1)}</span>
                  </div>
                  <div className="tour-price">
                    <span>From </span>
                    <span className="price">₹{tour.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <button className="btn-view-tour">View Tour</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="local-tips">
        <h3>Local Tips & Recommendations</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <i className="fas fa-utensils"></i>
            <h4>Best Local Eats</h4>
            <p>Don't miss the street food at the local market. Try the famous local dish for an authentic taste.</p>
          </div>
          <div className="tip-card">
            <i className="fas fa-camera"></i>
            <h4>Photo Spots</h4>
            <p>For the best photos, visit the viewpoint at sunrise when the light is perfect and crowds are minimal.</p>
          </div>
          <div className="tip-card">
            <i className="fas fa-wallet"></i>
            <h4>Budget Tips</h4>
            <p>Many museums offer free entry on the first Sunday of the month. Local buses are much cheaper than taxis.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

ThingsToDo.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      image: PropTypes.string.isRequired,
      category: PropTypes.string,
      duration: PropTypes.string,
      price: PropTypes.number.isRequired,
      originalPrice: PropTypes.number,
      rating: PropTypes.number,
      reviewCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      isPopular: PropTypes.bool,
      discount: PropTypes.number,
      groupSize: PropTypes.string,
      language: PropTypes.string,
      slug: PropTypes.string
    })
  )
};

export default ThingsToDo;
