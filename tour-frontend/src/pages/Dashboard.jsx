import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { ref as dbRef, set, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Prepare updates for auth and database
      const authUpdates = {};
      const dbUpdates = {
        email: user.email,
        lastUpdated: Date.now()
      };
      
      // Handle display name update
      const newDisplayName = formData.displayName.trim();
      if (newDisplayName && newDisplayName !== (user.displayName || '')) {
        authUpdates.displayName = newDisplayName;
        dbUpdates.displayName = newDisplayName;
      }
      
      // Handle photo URL update
      if (formData.photoFile) {
        // For new photos, convert to base64 and store in database
        const base64Image = await convertToBase64(formData.photoFile);
        dbUpdates.photoURL = base64Image;
      } else if (photoPreview === '') {
        // If photo was removed
        dbUpdates.photoURL = '';
      } else if (photoPreview && photoPreview !== currentUser?.photoURL) {
        // If it's an existing preview (from editing)
        dbUpdates.photoURL = photoPreview;
      }
      
      // Update auth profile first (only non-photo updates)
      if (Object.keys(authUpdates).length > 0) {
        console.log('Updating auth with:', authUpdates);
        await updateProfile(user, authUpdates);
      }
      
      // Then update the database with all user data
      console.log('Updating database with:', dbUpdates);
      await db.set(`users/${user.uid}`, dbUpdates);
      
      // Update the auth profile with display name if it changed
      if (authUpdates.displayName) {
        await updateProfile(user, { displayName: authUpdates.displayName });
      }
      
      setUpdateSuccess('Profile updated successfully!');
      
      // Update local state to reflect changes
      setFormData({
        displayName: newDisplayName,
        photoFile: null
      });
      
      // Force refresh the user data
      if (refreshUser) {
        // First update the local state
        const refreshedUser = await refreshUser();
        // Then update the photo preview with the latest data
        if (refreshedUser?.photoURL) {
          setPhotoPreview(refreshedUser.photoURL);
        }
      }
      
      // Close edit mode after a short delay
      setTimeout(() => {
        setIsEditing(false);
        setUpdateSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Error updating profile:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
      setUpdateError(`Failed to update profile. ${err.message || 'Please try again.'}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="container">
          <h1>My Dashboard</h1>
          <p>Welcome back, {currentUser?.displayName || currentUser?.email}!</p>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-grid">
          {/* Profile Section */}
          <div className="dashboard-card profile-card">
            <h2>My Profile</h2>
            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="profile-edit-form">
                <div className="form-group">
                  <label htmlFor="displayName">Display Name</label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profilePhoto">Profile Photo</label>
                  <div className="profile-photo-upload">
                    <div className="photo-preview">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile preview" className="preview-image" />
                      ) : (
                        <div className="photo-placeholder">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="file-input-container">
                      <input
                        type="file"
                        id="profilePhoto"
                        name="profilePhoto"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                      />
                      <label htmlFor="profilePhoto" className="btn btn-outline">
                        {formData.photoFile ? 'Change Photo' : 'Upload Photo'}
                      </label>
                      {formData.photoFile && (
                        <button 
                          type="button" 
                          className="btn btn-text"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, photoFile: null }));
                            setPhotoPreview(currentUser?.photoURL || '');
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {updateError && <div className="alert alert-danger">{updateError}</div>}
                {updateSuccess && <div className="alert alert-success">{updateSuccess}</div>}
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-info">
                  <div className="profile-avatar">
                    {localPhoto ? (
                      <img 
                        src={localPhoto} 
                        alt={currentUser?.displayName || 'User'} 
                        className="profile-image"
                        onError={(e) => {
                          // Fallback to default avatar if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'block';
                        }}
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" style={{display: localPhoto ? 'none' : 'block'}} />
                      </svg>
                    )}
                  </div>
                  <div className="profile-details">
                    <p><strong>Name:</strong> {currentUser?.displayName || 'Not set'}</p>
                    <p><strong>Email:</strong> {currentUser?.email}</p>
                    <p><strong>Role:</strong> {currentUser?.role || 'user'}</p>
                    <p><strong>Member Since:</strong> {currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                </div>
                <div className="profile-actions">
                  <button 
                    className="btn btn-outline" 
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </button>
                  <button onClick={handleLogout} className="btn btn-danger">Logout</button>
                </div>
              </>
            )}
          </div>

          {/* Bookings Section */}
          <div className="dashboard-card bookings-card">
            <h2>Recent Bookings</h2>
            {bookings.length > 0 ? (
              <div className="bookings-list">
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-info">
                      <h3>{booking.packageTitle || 'Package Title'}</h3>
                      <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{booking.status}</span></p>
                      <p><strong>Date:</strong> {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'Unknown'}</p>
                      <p><strong>Price:</strong> ₹{booking.price?.toLocaleString() || '0'}</p>
                    </div>
                    <Link to={`/packages/${booking.packageId}`} className="btn btn-sm btn-primary">
                      View Package
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-bookings">
                <p>You haven't made any bookings yet.</p>
                <Link to="/packages" className="btn btn-primary">Browse Packages</Link>
              </div>
            )}
            {bookings.length > 3 && (
              <Link to="/bookings" className="btn btn-outline view-all">
                View All Bookings
              </Link>
            )}
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card actions-card">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <Link to="/packages" className="action-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
                Browse Packages
              </Link>
              <Link to="/bookings" className="action-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V15zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 18a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V18zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
                My Bookings
              </Link>
              <Link to="/packages/top" className="action-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                Top Packages
              </Link>
              <Link to="/packages/budget" className="action-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
                Budget Packages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
