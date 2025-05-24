import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, storage, uploadFile, deleteFile, db } from '../config/firebase';
import { getDatabase, ref, remove } from 'firebase/database';
import { signOut, updateProfile } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, 
  FiClock, FiEdit2, FiLogOut, FiX, FiSave, FiUserCheck, FiPlus, FiCamera, FiImage 
} from 'react-icons/fi';
import PlaceholderImage from '../components/PlaceholderImage';
import { FaPlaneDeparture, FaHotel, FaUtensils, FaHiking } from 'react-icons/fa';
import '../styles/NewDashboard.css';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [formData, setFormData] = useState({
    displayName: '',
    photoFile: null,
    photoURL: ''
  });
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [nextTrip, setNextTrip] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [totalTripDays, setTotalTripDays] = useState({ days: 0, nights: 0 });
  
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { refreshUser } = useData();
  const { getUserBookings } = useData();

  // Format date and time helper with relative time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Date not set';
    
    const date = new Date(dateTimeString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format options for date and time
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    
    const timeString = date.toLocaleTimeString(undefined, timeOptions);
    const dateString = date.toLocaleDateString(undefined, dateOptions);
    
    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${timeString}`;
    }
    // Check if date is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${timeString}`;
    }
    
    // For dates in the future, show relative time (e.g., "in 5 days")
    if (date > today) {
      const diffTime = date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
    
    // For past dates, just show the formatted date
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  // Get trip status based on date
  const getTripStatus = (dateString) => {
    if (!dateString) return 'upcoming';
    
    const tripDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tripDate < today) return 'completed';
    if (tripDate.toDateString() === today.toDateString()) return 'today';
    return 'upcoming';
  };

  // Get upcoming bookings (next 90 days)
  const upcomingBookings = bookings
    .filter(booking => {
      if (!booking.date) return false;
      const bookingDate = new Date(booking.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const next90Days = new Date();
      next90Days.setDate(today.getDate() + 90);
      return bookingDate >= today && bookingDate <= next90Days;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

  // Get recent bookings (last 3 bookings)
  const recentBookings = [...bookings]
    .filter(booking => booking.date) // Filter out bookings without a date
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  const loadUserData = useCallback(async () => {
    if (!currentUser) return;

    try {
      // Load user profile data
      const userSnapshot = await db.get(`users/${currentUser.uid}`);
      
      if (userSnapshot) {
        setFormData(prev => ({
          ...prev,
          displayName: userSnapshot.displayName || '',
          photoURL: userSnapshot.photoURL || ''
        }));
        setPhotoPreview(userSnapshot.photoURL || '');
      }

      // Load upcoming trips
      const tripsSnapshot = await db.get(`users/${currentUser.uid}/trips`);
      if (tripsSnapshot) {
        const tripsArray = Object.entries(tripsSnapshot).map(([id, trip]) => ({
          id,
          ...trip
        }));
        
        // Filter upcoming trips (next 30 days)
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        
        const upcomingTrips = tripsArray.filter(trip => {
          const tripDate = new Date(trip.startDate);
          return tripDate > now && tripDate <= thirtyDaysFromNow;
        });
        
        setBookings(upcomingTrips);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUpdateError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Delete a trip
  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to cancel this trip? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(tripId);
      
      // Get the database instance
      const database = getDatabase();
      const tripRef = ref(database, `bookings/${tripId}`);
      
      // Remove the trip from the database
      await remove(tripRef);
      
      // Update local state to remove the deleted trip
      setBookings(prev => prev.filter(trip => trip.id !== tripId));
      setRecentBookings(prev => prev.filter(trip => trip.id !== tripId));
      
      // Show success message
      setUpdateSuccess('Trip cancelled successfully!');
      setTimeout(() => setUpdateSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error deleting trip:', error);
      setUpdateError('Failed to cancel trip. Please try again.');
      setTimeout(() => setUpdateError(''), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate time left for a trip
  const getTimeLeft = (trip) => {
    if (!trip.startDate) return '';
    
    const now = new Date();
    const tripDate = new Date(trip.startDate);
    const diffTime = tripDate - now;
    
    if (diffTime <= 0) return 'Trip in progress';
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 1) return `${days} days, ${hours} hours left`;
    if (days === 1) return `1 day, ${hours} hours left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes} minutes left`;
  };

  // Calculate time until next trip
  const updateNextTripTimer = useCallback(() => {
    if (!bookings || bookings.length === 0) return;
    
    const now = new Date();
    const upcomingTrips = bookings
      .filter(trip => new Date(trip.startDate) > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    if (upcomingTrips.length > 0) {
      const nextTrip = upcomingTrips[0];
      setNextTrip(nextTrip);
      
      const tripDate = new Date(nextTrip.startDate);
      const diffTime = tripDate - now;
      
      if (diffTime > 0) {
        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft(`${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m`);
      }
    }
  }, [bookings]);

  // Calculate total days and nights from trip durations
  const calculateTotalDays = useCallback((bookings) => {
    if (!bookings || !bookings.length) return { days: 0, nights: 0 };
    
    let totalDays = 0;
    let totalNights = 0;

    // Process each booking
    bookings.forEach(trip => {
      // Get the text to search in
      const searchText = [
        trip.packageName || '',
        trip.description || '',
        trip.durationText || ''
      ].join(' ');

      // Find all occurrences of "X days, Y nights" pattern
      const dayNightMatches = [...searchText.matchAll(/(\d+)\s*days?\s*,\s*(\d+)\s*nights?/gi)];
      
      if (dayNightMatches.length > 0) {
        // If we have matches in "X days, Y nights" format
        dayNightMatches.forEach(match => {
          const days = parseInt(match[1], 10) || 0;
          const nights = parseInt(match[2], 10) || 0;
          totalDays += days;
          totalNights += nights;
        });
      } else {
        // If no "X days, Y nights" format, look for individual days and nights
        const daysMatch = searchText.match(/(\d+)\s*days?/i);
        const nightsMatch = searchText.match(/(\d+)\s*nights?/i);
        
        const days = daysMatch ? parseInt(daysMatch[1], 10) : 0;
        const nights = nightsMatch ? parseInt(nightsMatch[1], 10) : 0;
        
        if (days > 0 || nights > 0) {
          totalDays += days || (nights + 1);
          totalNights += nights || (days > 0 ? days - 1 : 0);
        } else {
          // Default to 1 day if no duration found
          totalDays += 1;
        }
      }
    });
    
    return { days: totalDays, nights: totalNights };
  }, []);

  // Update timer every minute
  useEffect(() => {
    updateNextTripTimer();
    const timer = setInterval(updateNextTripTimer, 60000);
    return () => clearInterval(timer);
  }, [updateNextTripTimer]);

  // Load user bookings
  const loadUserBookings = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const userBookings = await getUserBookings(currentUser.uid);
      setBookings(userBookings);
      
      // Get recent bookings for activity feed (last 5)
      const recent = [...userBookings]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentBookings(recent);
      
          // Calculate and set total trip days and nights
      const { days, nights } = calculateTotalDays(userBookings);
      setTotalTripDays({ days, nights });
      
      // Update next trip info
      updateNextTripTimer();
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, getUserBookings, updateNextTripTimer]);

  // Render upcoming trips section
  const renderUpcomingTrips = () => {
    if (loading) {
      return <div className="loading">Loading trips...</div>;
    }
    
    if (bookings.length === 0) {
      return <div className="no-trips">No upcoming trips in the next 30 days</div>;
    }
    
    return (
      <div className="upcoming-trips">
        {bookings.map((trip) => (
          <div key={trip.id} className="trip-card">
            <div className="trip-image">
              {trip.packageImage ? (
                <img 
                  src={trip.packageImage} 
                  alt={trip.packageName} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <PlaceholderImage className="trip-placeholder" />
            </div>
            <div className="trip-details">
              <h3>{trip.packageName}</h3>
              <div className="trip-meta">
                <span className="trip-date">
                  <FiCalendar /> {formatDateTime(trip.startDate)}
                </span>
                {trip.timeSlot && (
                  <span className="trip-time">
                    <FiClock /> {trip.timeSlot}
                  </span>
                )}
                {trip.duration && (
                  <span className="trip-duration">
                    <FiClock /> {trip.duration} {trip.duration === 1 ? 'hour' : 'hours'}
                  </span>
                )}
              </div>
              <div className="time-left">
                <span className="badge">{getTimeLeft(trip)}</span>
              </div>
              <div className="trip-actions">
                <button 
                  className="btn btn-sm btn-outline cancel-trip-btn"
                  onClick={() => handleDeleteTrip(trip.id)}
                  disabled={isDeleting === trip.id}
                >
                  {isDeleting === trip.id ? 'Cancelling...' : 'Cancel Trip'}
                </button>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => navigate(`/booking/${trip.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Rest of your component code
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleEditProfile = () => {
    setFormData({
      displayName: currentUser?.displayName || '',
      photoURL: currentUser?.photoURL || ''
    });
    setPhotoPreview(currentUser?.photoURL || '');
    setIsEditing(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image/(jpeg|png|jpg|gif)')) {
      setUpdateError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }
    
    // Validate file size (max 500KB for base64)
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      setUpdateError('Image size should be less than 500KB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result;
      setFormData(prev => ({
        ...prev,
        photoFile: base64String,
        photoURL: base64String
      }));
      setPhotoPreview(base64String);
      setUpdateError('');
    };
    reader.onerror = () => {
      console.error('Error reading file');
      setUpdateError('Error reading the image file');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    try {
      setUploading(true);
      setUpdateError('');
      setUpdateSuccess('');

      // Update user profile in Firebase Authentication
      if (formData.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: formData.displayName
        });
      }

      // Upload new photo if selected
      let photoURL = formData.photoURL;
      if (formData.photoFile) {
        // Delete old photo if exists
        if (currentUser.photoURL) {
          try {
            // await deleteFile(currentUser.photoURL);
          } catch (error) {
            console.error('Error deleting old photo:', error);
          }
        }

        // Upload new photo
        // const filePath = `profile_photos/${currentUser.uid}/${formData.photoFile.name}`;
        // photoURL = await uploadFile(formData.photoFile, filePath);
      }

      // Update user data in Realtime Database
      const userData = await db.get(`users/${currentUser.uid}`) || {};
      
      await db.update(`users/${currentUser.uid}`, {
        ...userData,
        displayName: formData.displayName || currentUser.displayName || '',
        photoURL: photoURL,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setFormData(prev => ({
        ...prev,
        photoURL: photoURL,
        photoFile: null
      }));
      setPhotoPreview(photoURL);
      setUpdateSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Update auth state with new data
      await auth.currentUser.reload();
      
      // Update local state with the latest user data
      const updatedUser = auth.currentUser;
      setFormData(prev => ({
        ...prev,
        displayName: updatedUser.displayName || '',
        photoURL: photoURL || updatedUser.photoURL || ''
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError(error.message || 'Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  // Calculate total trip days from bookings
  const calculateTotalTripDays = (bookings) => {
    let totalDays = 0;
    let totalNights = 0;
    
    bookings.forEach(booking => {
      if (booking.duration) {
        // If duration is a string like "2 days 1 night"
        const daysMatch = booking.duration.match(/(\d+)\s*day/i);
        const nightsMatch = booking.duration.match(/(\d+)\s*night/i);
        
        if (daysMatch) totalDays += parseInt(daysMatch[1], 10);
        if (nightsMatch) totalNights += parseInt(nightsMatch[1], 10);
      }
    });
    
    // If no nights specified but days are, assume 1 night per day
    if (totalDays > 0 && totalNights === 0) {
      totalNights = totalDays - 1; // For example, 3 days = 2 nights
    }
    
    return { days: totalDays, nights: totalNights };
  };

  // Fetch user bookings on component mount
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const userBookings = await getUserBookings();
        setBookings(userBookings || []);
        
        // Calculate and update total trip days
        if (userBookings && userBookings.length > 0) {
          const calculatedDays = calculateTotalTripDays(userBookings);
          setTotalTripDays(calculatedDays);
        } else {
          setTotalTripDays({ days: 0, nights: 0 });
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [getUserBookings]);

  return (
    <div className="dashboard">
      {/* Header with welcome section */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="welcome-section">
            <h1>Welcome back, {currentUser?.displayName?.split(' ')[0] || 'Explorer'}! 👋</h1>
            <p>Here's what's happening with your travel plans</p>
          </div>
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FiCalendar size={24} />
              </div>
              <div>
                <h3>{bookings.length}</h3>
                <p>Upcoming Trips</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiClock size={24} />
              </div>
              <div>
                <h3>{totalTripDays.days} days, {totalTripDays.nights} nights</h3>
                <p>Total Trip Duration</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiUserCheck size={24} />
              </div>
              <div>
                <h3>{bookings.length}</h3>
                <p>Total Bookings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Main content */}
        <div className="dashboard-main">
          {/* Upcoming Trips */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Upcoming Trips</h2>
              <Link to="/tours" className="btn-link">Explore More Tours</Link>
            </div>
            
            {loading ? (
              <div className="loading-state">Loading your trips...</div>
            ) : upcomingBookings.length > 0 ? (
              <div className="booking-cards">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className={`booking-card ${getTripStatus(booking.date)}`}>
                    <div 
                      className="booking-image" 
                      style={{ backgroundImage: `url(${booking.packageImage || '/placeholder-tour.jpg'})` }}
                    >
                      <div className="trip-status">
                        {getTripStatus(booking.date) === 'today' && 'Today'}
                        {getTripStatus(booking.date) === 'upcoming' && formatDate(booking.date)}
                        {getTripStatus(booking.date) === 'completed' && 'Completed'}
                      </div>
                    </div>
                    <div className="booking-details">
                      <div className="booking-header">
                        <h3>{booking.packageName}</h3>
                        <span className={`status-badge ${booking.status}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="booking-meta">
                        <span><FiCalendar className="icon" /> {new Date(booking.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                        <span><FiUser className="icon" /> {booking.travelers} traveler{booking.travelers > 1 ? 's' : ''}</span>
                        {booking.specialRequests && (
                          <span className="special-request">
                            <FiMessageCircle className="icon" /> Special request
                          </span>
                        )}
                      </div>
                      <div className="booking-actions">
                        <Link to={`/bookings/${booking.id}`} className="btn btn-outline btn-sm">
                          View Details
                        </Link>
                        {getTripStatus(booking.date) === 'today' && (
                          <Link to={`/tours/${booking.tourId || 'tour'}`} className="btn btn-primary btn-sm">
                            Start Trip
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-illustration">
                  <FaPlaneDeparture size={48} className="text-muted" />
                </div>
                <h3>No Upcoming Trips</h3>
                <p>You don't have any trips planned in the next 30 days.</p>
                <Link to="/tours" className="btn btn-primary">
                  Browse Tours
                </Link>
              </div>
            )}
          </section>

          {/* Recent Activity */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
            </div>
            <div className="upcoming-bookings">
              <div className="section-header">
                <h3>Upcoming Trips</h3>
                {nextTrip && (
                  <div className="next-trip-countdown">
                    <span className="countdown-label">Next trip in:</span>
                    <span className="countdown-timer">{timeLeft}</span>
                  </div>
                )}
              </div>
              {nextTrip && (
                <div className="next-trip-highlight">
                  <div className="next-trip-card">
                    <div className="trip-image">
                      {nextTrip.packageImage ? (
                        <img 
                          src={nextTrip.packageImage} 
                          alt={nextTrip.packageName}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <PlaceholderImage className="trip-placeholder" />
                      <div className="trip-overlay">
                        <span className="badge">Next Up</span>
                      </div>
                    </div>
                    <div className="trip-content">
                      <h4>{nextTrip.packageName}</h4>
                      <div className="trip-meta">
                        <span className="trip-date">
                          <FiCalendar /> {formatDateTime(nextTrip.startDate)}
                        </span>
                        {nextTrip.duration && (
                          <span className="trip-duration">
                            <FiClock /> {nextTrip.duration} {nextTrip.duration === 1 ? 'hour' : 'hours'}
                          </span>
                        )}
                      </div>
                      <div className="trip-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{
                              width: `${Math.min(
                                100,
                                ((new Date(nextTrip.startDate) - new Date()) / 
                                (new Date(nextTrip.startDate) - new Date(nextTrip.createdAt || new Date()))) * 100
                              )}%`
                            }}
                          />
                        </div>
                        <div className="progress-labels">
                          <span>Booked</span>
                          <span>Departure</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {bookings.length > 1 && (
                <div className="other-trips">
                  <h4>Other Upcoming Trips</h4>
                  {renderUpcomingTrips()}
                </div>
              )}
            </div>
            {recentBookings.length > 0 ? (
              <div className="activity-feed">
                {recentBookings.map((booking, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <FiCalendar size={20} />
                    </div>
                    <div className="activity-content">
                      <p>You booked <strong>{booking.tourName}</strong></p>
                      <span className="activity-time">{formatDate(booking.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent activity to show</p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar" onClick={handleEditProfile}>
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />
                ) : (
                  <div className="avatar-placeholder">
                    <FiUser size={32} />
                  </div>
                )}
                <div className="edit-overlay">
                  <FiEdit2 size={20} />
                </div>
              </div>
              <h3>{currentUser?.displayName || 'Travel Enthusiast'}</h3>
              <p className="text-muted">{currentUser?.email}</p>
              <button 
                className="btn btn-sm btn-outline"
                onClick={handleEditProfile}
              >
                <FiEdit2 size={14} className="mr-1" /> Edit Profile
              </button>
            </div>
            
            <div className="profile-details">
              <div className="detail-item">
                <FiMail size={18} className="text-primary" />
                <span>{currentUser?.email || 'No email provided'}</span>
              </div>
              {currentUser?.phoneNumber && (
                <div className="detail-item">
                  <FiPhone size={18} className="text-primary" />
                  <span>{currentUser.phoneNumber}</span>
                </div>
              )}
              <div className="detail-item">
                <FiCalendar size={18} className="text-primary" />
                <span>Member since {currentUser?.metadata?.creationTime ? 
                  new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 
                  'recently'}
                </span>
              </div>
            </div>
            
            <div className="profile-actions">
              <button 
                className="btn btn-outline btn-block"
                onClick={handleLogout}
              >
                <FiLogOut size={16} className="mr-1" /> Sign Out
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <Link to="/tours" className="action-item">
              <FaPlaneDeparture size={20} className="text-primary" />
              <span>Book a Tour</span>
            </Link>
            <Link to="/bookings" className="action-item">
              <FiCalendar size={20} className="text-primary" />
              <span>My Bookings</span>
            </Link>           
          </div>
        </aside>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-btn" onClick={() => setIsEditing(false)}>
                <FiX size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Profile Photo</label>
                <div className="profile-photo-upload">
                  <div className="photo-preview">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" />
                    ) : currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="Profile" />
                    ) : (
                      <FiUser size={48} />
                    )}
                  </div>
                  <div className="photo-upload-actions">
                    <label className="btn btn-outline">
                      {formData.photoFile ? 'Change Photo' : 'Choose Photo'}
                      <input 
                        type="file" 
                        onChange={handlePhotoChange} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    {currentUser?.photoURL && (
                      <button 
                        type="button" 
                        className="btn btn-text"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            photoFile: null
                          });
                          setPhotoPreview('');
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="photo-hint">JPG, PNG, or GIF (max 2MB)</p>
                </div>
              </div>
              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  placeholder="Enter your name"
                />
              </div>
              
              {updateError && <div className="alert alert-error">{updateError}</div>}
              {updateSuccess && <div className="alert alert-success">{updateSuccess}</div>}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveProfile}
                  disabled={!formData.displayName.trim()}
                >
                  <FiSave size={18} className="mr-1" /> Save Changes
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                  style={{
                    fontColor: 'black',
                    padding: '0.5rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginLeft: '0.75rem'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
