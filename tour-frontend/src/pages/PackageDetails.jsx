import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import './PackageDetailsPage.css'; // Import CSS

// Placeholder Icons (replace with actual SVGs or an icon library)
const IconPin = () => <span className="icon-style">📍</span>;
const IconClock = () => <span className="icon-style">🕒</span>;
const IconCalendar = () => <span className="icon-style">🗓️</span>; // For departure date
const IconUsers = () => <span className="icon-style">👥</span>; // For group size

const PackageDetails = () => {
  const { packageId } = useParams();
  const [tourPackage, setTourPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0); // For image gallery
  const [bookingLoading, setBookingLoading] = useState(false); // For booking
  const [bookingError, setBookingError] = useState(null);     // For booking
  const [bookingSuccess, setBookingSuccess] = useState(false); // For booking

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getPackageById, createBooking } = useData();

  // Memoize the fetch function to prevent unnecessary re-creations
  const fetchPackage = useCallback(async () => {
    if (!packageId) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching package with ID: ${packageId}`);
      
      const packageData = await getPackageById(packageId);
      
      if (!packageData) {
        throw new Error('Package not found');
      }
      
      console.log("Package data received:", packageData);
      setTourPackage(packageData);
    } catch (err) {
      console.error("Fetch package error:", err);
      setError(err.message || "Failed to fetch package");
    } finally {
      setLoading(false);
    }
  }, [packageId, getPackageById]);

  // Use a ref to track if we've already fetched the data
  const hasFetched = useRef(false);

  // Fetch package data when the component mounts or packageId changes
  useEffect(() => {
    // Only fetch if we haven't already fetched this package
    if (packageId && !hasFetched.current) {
      hasFetched.current = true;
      fetchPackage();
    }
  }, [packageId, fetchPackage]);

  if (loading) {
    // Uses spinner from App.jsx / index.css
    return <div className="package-details-loading"><div className="spinner"></div></div>;
  }
  if (error) {
    return <div className="container package-details-error">Error: {error}</div>;
  }
  if (!tourPackage) {
    return <div className="container package-details-error">Package not found.</div>;
  }

  const handleBooking = () => {
    // Ensure we have all required fields with defaults
    const bookingPackage = {
      id: packageId,
      title: tourPackage.title,
      description: tourPackage.description,
      destination: tourPackage.destination,
      duration: tourPackage.duration,
      price: tourPackage.price,
      images: tourPackage.images || [],
      included: tourPackage.included || [],
      itinerary: tourPackage.itinerary || [],
      available: tourPackage.available,
      packageId: packageId // Keep both id and packageId for backward compatibility
    };

    console.log('Navigating to booking with package:', bookingPackage);
    
    // Navigate to the booking page with package details
    navigate(`/book/${packageId}`, { 
      state: { 
        packageData: bookingPackage
      } 
    });
  };

  const { title, description, destination, duration, price, images = [], included = [], itinerary = [], available } = tourPackage;
  
  // Process image URLs to handle both direct URLs and server paths
  const processedImages = images.map(img => {
    // Check if the image URL starts with http or https (direct URL)
    if (img.startsWith('http://') || img.startsWith('https://')) {
      return img; // Return the direct URL as is
    }
    // For server paths that would normally go through localhost:5000/uploads/
    // Use a direct URL instead
    return 'https://source.unsplash.com/random/800x600/?travel,destination';
  });
  
  const mainImage = processedImages.length > 0 ? 
    processedImages[selectedImage] : 
    'https://source.unsplash.com/random/800x600/?travel';
    
  const isPackageAvailable = available !== false; // Default to true if 'available' is not present

  return (
    <div className="container package-details-container">
      <div className="package-details-content">
        <div className="package-gallery">
          <div className="main-image">
            <img 
              src={mainImage} 
              alt={title} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://source.unsplash.com/random/800x600/?travel';
              }}
            />
          </div>
          
          {processedImages.length > 1 && (
            <div className="image-thumbnails">
              {processedImages.map((image, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`${title} - Image ${index + 1}`} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://source.unsplash.com/random/150x150/?travel';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="package-info">
          <h1>{title}</h1>
          <div className="package-meta">
            <p><IconPin /> <strong>Destination:</strong> {destination}</p>
            <p><IconClock /> <strong>Duration:</strong> {duration}</p>
            {/* Price can be displayed here or elsewhere if desired */}
            <p className="package-price-tag" style={{fontSize: '1.5rem', color: 'var(--secondary-color)', fontWeight: 'bold', marginTop: '1rem'}}>Price: ₹{price.toLocaleString()}</p>
          </div>
          
          <p className="description">{description}</p>
          
          {/* Booking Section */}
          <div className="package-booking-section">
            {!isPackageAvailable ? (
              <p className="package-unavailable-message">This package is currently unavailable for booking.</p>
            ) : (
              <>
                <button 
                  onClick={handleBooking} 
                  disabled={bookingLoading || bookingSuccess} 
                  className="book-now-button"
                >
                  {bookingLoading ? 'Processing...' : bookingSuccess ? 'Booked!' : 'Book Now'}
                </button>
                {bookingError && <p className="booking-error-message">Error: {bookingError}</p>}
                {bookingSuccess && <p className="booking-success-message">Booking successful! You will be contacted shortly.</p>}
              </>
            )}
          </div>
          
          {included.length > 0 && (
            <div className="package-section included-items">
              <h3>What's Included:</h3>
              <ul>
                {included.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          )}

          {itinerary.length > 0 && (
            <div className="package-section itinerary">
              <h3>Itinerary:</h3>
              {itinerary.map((day, index) => (
                <div key={index} className="itinerary-day">
                  <h4>Day {index + 1}: {day.title}</h4>
                  <p>{day.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;
