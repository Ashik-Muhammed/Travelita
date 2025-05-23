import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/PopularTours.css';

const PopularTours = ({ tours, destination }) => {
  // If tours is not provided but destination is, use destination's popularExperiences
  const tourList = tours || (destination?.popularExperiences || [
    // Sample tour data - in a real app, this would come from props or an API
    {
      id: 'heritage-walk',
      title: 'Heritage Walk',
      duration: '4 hours',
      price: 999,
      rating: 4.8,
      reviewCount: 124,
      image: 'https://images.unsplash.com/photo-1585506942812-aa00a2b2b604?w=800',
      highlights: [
        'Guided tour of historical sites',
        'Learn about local history',
        'Visit famous landmarks',
        'Professional guide'
      ]
    },
    {
      id: 'food-tour',
      title: 'Food Tour',
      duration: '3 hours',
      price: 1499,
      rating: 4.9,
      reviewCount: 98,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      highlights: [
        'Taste local delicacies',
        'Visit food markets',
        'Learn about local cuisine',
        'Small group experience'
      ]
    },
    {
      id: 'sunset-cruise',
      title: 'Sunset Cruise',
      duration: '2 hours',
      price: 1999,
      rating: 4.7,
      reviewCount: 156,
      image: 'https://images.unsplash.com/photo-1506929562872-b56f5b37b1d4?w=800',
      highlights: [
        'Scenic views',
        'Complimentary drinks',
        'Professional photographer',
        'Evening entertainment'
      ]
    }
  ]);
  
  const destinationName = destination?.name || 'this destination';

  // Ensure each tour has a unique ID
  const toursWithIds = tourList.map((tour, index) => ({
    ...tour,
    _uid: tour.id || `tour-${index}-${Date.now()}`
  }));

  return (
    <section className="popular-tours">
      <div className="container">
        <div className="section-header">
          <h2>Popular {destinationName} Tours</h2>
          <p>Handpicked experiences for your perfect vacation</p>
        </div>

        <div className="tours-grid">
          {toursWithIds.map((tour) => (
            <div key={tour._uid} className="tour-card">
              <div className="tour-image">
                <img src={tour.image} alt={tour.title} />
                <div className="tour-price">From ${tour.price}</div>
                <div className="tour-duration">{tour.duration}</div>
              </div>
              <div className="tour-content">
                <div className="tour-header">
                  <h3>{tour.title}</h3>
                  <div className="tour-rating">
                    <i className="fas fa-star"></i>
                    <span>{tour.rating}</span>
                    <span className="review-count">({tour.reviewCount} reviews)</span>
                  </div>
                </div>
                
                <div className="tour-highlights">
                  <h4>Tour Highlights</h4>
                  <ul>
                    {(tour.highlights || []).map((highlight, index) => (
                      <li key={`${tour.id}-highlight-${index}`}>
                        <i className="fas fa-check-circle"></i>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="tour-footer">
                  <Link to={`/tours/${tour.id}`} className="btn btn-primary">
                    View Details
                  </Link>
                  <button className="btn btn-outline">
                    <i className="far fa-heart"></i> Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="view-all-tours">
          <Link to={`/tours?destination=${destinationName.toLowerCase()}`} className="btn btn-outline">
            View All {destinationName} Tours
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularTours;
