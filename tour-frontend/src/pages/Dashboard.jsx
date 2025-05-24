import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { ref as dbRef, set, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  FiUser, FiMail, FiPhone, FiCalendar, 
  FiMapPin, FiClock, FiEdit2, FiLogOut, 
  FiX, FiSave, FiUserCheck, FiPackage, 
  FiHelpCircle, FiZap, FiHeart, FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { FaHotel, FaPlaneDeparture, FaUtensils, FaHiking } from 'react-icons/fa';
import { BsCalendarCheck, BsPeople, BsClockHistory, BsGeoAlt } from 'react-icons/bs';
import './Dashboard.css';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    photoFile: null
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  
  const navigate = useNavigate();
  const { currentUser, isLoading: authLoading, refreshUser } = useAuth();
  const [localPhoto, setLocalPhoto] = useState('');
  
  // Keep local photo in sync with currentUser
  useEffect(() => {
    if (currentUser?.photoURL) {
      setLocalPhoto(currentUser.photoURL);
      setPhotoPreview(currentUser.photoURL);
    }
  }, [currentUser?.photoURL]);
  const { getUserBookings } = useData();

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !currentUser) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        // Fetch user bookings
        const userBookings = await getUserBookings();
        setBookings(userBookings || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [navigate, currentUser, getUserBookings, authLoading]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  // Helper function to convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleEditProfile = () => {
    try {
      setFormData({
        displayName: currentUser?.displayName || '',
        photoFile: null
      });
      
      // Set photo preview from current user data
      setPhotoPreview(currentUser?.photoURL || '');
      setIsEditing(true);
    } catch (err) {
      console.error('Error loading profile data:', err);
      setUpdateError('Failed to load profile data');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photoFile: null
    }));
    setPhotoPreview('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setUpdateError('Please upload an image file');
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUpdateError('Image size should be less than 5MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      photoFile: file
    }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setUpdateError('');
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        setLoading(true);
        // Update booking status in the database
        const bookingRef = dbRef(db, `bookings/${bookingId}`);
        await set(bookingRef, {
          ...bookings.find(b => b.id === bookingId),
          status: 'cancelled',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        // Refresh bookings
        const userBookings = await getUserBookings();
        setBookings(userBookings || []);
        
        alert('Booking cancelled successfully!');
      } catch (err) {
        console.error('Error cancelling booking:', err);
        alert(`Failed to cancel booking: ${err.message || 'Please try again.'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    if (e) e.preventDefault();
    
    setUpdateError('');
    setUpdateSuccess('');
    
    try {
      setLoading(true);
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      // Prepare updates for auth and database
      const updates = {
        displayName: formData.displayName,
        photoURL: photoPreview,
        email: currentUser.email,
        lastUpdated: new Date().toISOString()
      };
      
      // Update profile in Firebase Auth
      await updateProfile(currentUser, {
        displayName: updates.displayName,
        photoURL: updates.photoURL
      });
      
      // Update user data in Realtime Database
      const userRef = dbRef(db, `users/${currentUser.uid}`);
      await set(userRef, updates);
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        displayName: updates.displayName,
        photoURL: updates.photoURL
      });
      
      // Reset form data
      setFormData({
        displayName: updates.displayName,
        photoFile: null
      });
      
      setUpdateSuccess('Profile updated successfully!');
      
      // Close edit mode after a short delay
      setTimeout(() => {
        setIsEditing(false);
        setUpdateSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err, {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
      setUpdateError(`Failed to update profile. ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <FiAlertCircle className="text-danger" size={48} />
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header with welcome section */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="welcome-section">
            <h1>Welcome back, {currentUser?.displayName?.split(' ')[0] || 'Explorer'}! 👋</h1>
            <p>Here's what's happening with your travel plans</p>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-grid">
          {/* Profile Card */}
          <div className="dashboard-card profile-card">
            <h2><FiUser /> My Profile</h2>
            {isEditing ? (
              <div className="profile-edit-form">
                {updateError && <div className="alert alert-danger"><FiAlertCircle /> {updateError}</div>}
                {updateSuccess && <div className="alert alert-success"><FiCheckCircle /> {updateSuccess}</div>}
                
                <div className="form-group">
                  <label htmlFor="displayName">Full Name</label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Profile Photo</label>
                  <div className="profile-photo-upload">
                    <div className="photo-preview">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile Preview" className="preview-image" />
                      ) : (
                        <FiUser className="photo-placeholder" />
                      )}
                    </div>
                    <div className="file-input-container">
                      <input
                        type="file"
                        id="photoFile"
                        name="photoFile"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                      />
                      <label htmlFor="photoFile" className="btn btn-outline btn-sm">
                        Change Photo
                      </label>
                      {photoPreview && (
                        <button 
                          type="button" 
                          className="btn-text"
                          onClick={handleRemovePhoto}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={handleCancelEdit}
                  >
                    <FiX /> Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleProfileUpdate}
                  >
                    <FiSave /> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="profile-avatar-container">
                  <div className="profile-avatar">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />
                    ) : (
                      <FiUser size={48} />
                    )}
                  </div>
                  <button 
                    className="profile-avatar-edit"
                    onClick={handleEditProfile}
                    title="Edit profile"
                  >
                    <FiEdit2 size={16} />
                  </button>
                </div>
                
                <div className="profile-details">
                  <h3 className="profile-name">{currentUser?.displayName || 'User'}</h3>
                  <p className="profile-email">
                    <FiMail /> {currentUser?.email}
                  </p>
                  
                  <div className="profile-stats">
                    <div className="stat-item">
                      <div className="stat-value">{bookings.length}</div>
                      <div className="stat-label">Trips</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">0</div>
                      <div className="stat-label">Wishlist</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">0</div>
                      <div className="stat-label">Reviews</div>
                    </div>
                  </div>
                </div>
                
                <div className="profile-actions">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={handleEditProfile}
                  >
                    <FiEdit2 /> Edit Profile
                  </button>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={handleLogout}
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bookings Card */}
          <div className="dashboard-card bookings-card">
            <h2><FiCalendar /> Upcoming Trips</h2>
            {bookings.length > 0 ? (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <h3 className="booking-title">
                        <FiPackage size={18} /> {booking.packageName || 'Tour Package'}
                      </h3>
                      <span className={`booking-status status-${(booking.status || 'pending').toLowerCase()}`}>
                        {booking.status || 'Pending'}
                      </span>
                    </div>
                    
                    <div className="booking-details">
                      <div className="detail-item">
                        <FiCalendar />
                        <span>{booking.date || 'Date not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <FiMapPin />
                        <span>{booking.destination || 'Destination not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <FiClock />
                        <span>{booking.duration || 'Duration not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <FiUser />
                        <span>{booking.guests || '1'} {booking.guests === 1 ? 'Person' : 'People'}</span>
                      </div>
                    </div>
                    
                    <div className="booking-actions">
                      <Link 
                        to={`/bookings/${booking.id}`} 
                        className="btn btn-outline btn-sm"
                      >
                        View Details
                      </Link>
                      <button 
                        className="btn btn-outline btn-sm text-danger"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiCalendar size={48} />
                <h3>No Upcoming Trips</h3>
                <p>You don't have any upcoming trips. Start exploring and book your next adventure!</p>
                <Link to="/packages" className="btn btn-primary">
                  Browse Packages
                </Link>
                {bookings.length > 0 && (
                  <Link to="/bookings" className="btn btn-outline btn-sm mt-2">
                    View All Bookings
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card actions-card">
            <h2><FiZap /> Quick Actions</h2>
            <div className="quick-actions">
              <Link to="/packages" className="action-item">
                <FiPackage size={24} />
                <span>Browse Packages</span>
              </Link>
              <Link to="/bookings" className="action-item">
                <BsCalendarCheck size={24} />
                <span>My Bookings</span>
              </Link>
              <Link to="/wishlist" className="action-item">
                <FiHeart size={24} />
                <span>Wishlist</span>
              </Link>
              <Link to="/support" className="action-item">
                <FiHelpCircle size={24} />
                <span>Help Center</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card">
            <h2><FiClock /> Recent Activity</h2>
            <div className="empty-state">
              <FiClock size={48} />
              <h3>No Recent Activity</h3>
              <p>Your recent activities will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
