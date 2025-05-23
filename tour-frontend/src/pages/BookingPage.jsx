import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rtdb } from '../config/firebase';
import { ref, get, push, set } from 'firebase/database';
import './BookingPage.css';

function BookingPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [tourPackage, setTourPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    travelers: 1,
    date: '',
    specialRequests: ''
  });
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Get user from localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      setUser(userData);
      // Pre-fill form with user data if available
      setBookingData(prev => ({
        ...prev,
        fullName: userData.name || '',
        email: userData.email || ''
      }));
    }

    // Fetch package details
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const packageRef = ref(rtdb, `packages/${packageId}`);
        const packageSnapshot = await get(packageRef);
        
        if (packageSnapshot.exists()) {
          const packageData = packageSnapshot.val();
          packageData.id = packageId; // Add id to the package data
          setTourPackage(packageData);
        } else {
          setError('Package not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching package:', err);
        setError('Failed to fetch package details');
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      // Redirect to login if not logged in
      navigate('/login', { state: { from: `/packages/${packageId}/book` } });
      return;
    }

    try {
      setSubmitting(true);
      
      // Create booking in Firebase
      const bookingsRef = ref(rtdb, 'bookings');
      const newBookingRef = push(bookingsRef);
      
      const bookingToSave = {
        packageId,
        packageName: tourPackage.title,
        packageImage: tourPackage.images?.[0] || '',
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        ...bookingData,
        totalPrice: tourPackage.price * bookingData.travelers,
        status: 'pending',
        createdAt: new Date().toISOString(),
        paymentStatus: 'pending'
      };
      
      await set(newBookingRef, bookingToSave);
      
      setSuccessMessage('Booking submitted successfully! You will receive a confirmation email shortly.');
      setSubmitting(false);
      
      // Reset form
      setBookingData({
        fullName: user.name || '',
        email: user.email || '',
        phone: '',
        travelers: 1,
        date: '',
        specialRequests: ''
      });
      
      // Redirect to bookings page after 3 seconds
      setTimeout(() => {
        navigate('/user/bookings');
      }, 3000);
      
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-loading">
        <div className="spinner"></div>
        <p>Loading package details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/packages')} className="back-button">
          Back to Packages
        </button>
      </div>
    );
  }

  if (!tourPackage) {
    return (
      <div className="booking-error">
        <h2>Package Not Found</h2>
        <p>The requested tour package could not be found.</p>
        <button onClick={() => navigate('/packages')} className="back-button">
          Back to Packages
        </button>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="booking-success">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
        <h2>Booking Confirmed!</h2>
        <p>{successMessage}</p>
        <div className="success-buttons">
          <button onClick={() => navigate('/user/bookings')} className="view-bookings-button">
            View My Bookings
          </button>
          <button onClick={() => navigate('/packages')} className="browse-button">
            Browse More Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Book Your Tour</h1>
          <button onClick={() => navigate(`/packages/${packageId}`)} className="back-link">
            &larr; Back to Package Details
          </button>
        </div>
        
        <div className="booking-content">
          <div className="package-summary">
            <div className="package-image">
              <img 
                src={tourPackage.images && tourPackage.images.length > 0 
                  ? tourPackage.images[0] 
                  : 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} 
                alt={tourPackage.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>
            <div className="package-info">
              <h2>{tourPackage.title}</h2>
              <div className="package-details">
                <p>
                  <span className="detail-label">Destination:</span> 
                  <span className="detail-value">{tourPackage.destination}</span>
                </p>
                <p>
                  <span className="detail-label">Duration:</span> 
                  <span className="detail-value">{tourPackage.duration}</span>
                </p>
                <p>
                  <span className="detail-label">Price:</span> 
                  <span className="detail-value price">₹{tourPackage.price} per person</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="booking-form-container">
            <h3>Personal Information</h3>
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={bookingData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={bookingData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="travelers">Number of Travelers</label>
                  <input
                    type="number"
                    id="travelers"
                    name="travelers"
                    min="1"
                    max="20"
                    value={bookingData.travelers}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="date">Preferred Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="specialRequests">Special Requests (Optional)</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  rows="4"
                  value={bookingData.specialRequests}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div className="booking-summary">
                <h3>Booking Summary</h3>
                <div className="summary-item">
                  <span>Package Price:</span>
                  <span>₹{tourPackage.price} x {bookingData.travelers} travelers</span>
                </div>
                <div className="summary-item total">
                  <span>Total Amount:</span>
                  <span>₹{tourPackage.price * bookingData.travelers}</span>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="book-now-button"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Confirm Booking'}
                </button>
                <p className="booking-note">
                  By clicking "Confirm Booking", you agree to our terms and conditions.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
