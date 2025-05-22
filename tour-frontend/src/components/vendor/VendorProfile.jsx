import React, { useState, useEffect } from 'react';
import { rtdb } from '../../config/firebase';
import { ref, update, get } from 'firebase/database';

const VendorProfile = ({ vendorInfo }) => {
  const [formData, setFormData] = useState({
    name: vendorInfo?.name || '',
    email: vendorInfo?.email || '',
    companyName: vendorInfo?.companyName || '',
    phone: vendorInfo?.phone || '',
    address: vendorInfo?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.uid) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      // Only include relevant fields (password changing not supported in this version)
      const dataToSend = {
        name: formData.name,
        companyName: formData.companyName,
        phone: formData.phone,
        address: formData.address,
        updatedAt: Date.now()
      };
      
      // Reference to the vendor's profile in Firebase
      const vendorRef = ref(rtdb, `users/${user.uid}`);
      
      // Update the vendor profile
      await update(vendorRef, dataToSend);
      
      setSuccess('Profile updated successfully');
      
      // Update stored user info
      const updatedUser = {
        ...user,
        ...dataToSend
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Reset password fields if they were being changed
      if (changingPassword) {
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setChangingPassword(false);
      }
      
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(
        err.response?.data?.message || 
        'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-profile">
      <h2>Profile Information</h2>
      
      {error && <div className="profile-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!editing}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            disabled={true} // Email cannot be changed
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="companyName">Company Name</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            disabled={!editing}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Business Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            disabled={!editing}
          ></textarea>
        </div>
        
        {editing && changingPassword && (
          <>
            <h3>Change Password</h3>
            
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength="6"
              />
            </div>
          </>
        )}
        
        <div className="profile-actions">
          {!editing ? (
            <>
              <button 
                type="button" 
                className="edit-button"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <button 
                type="submit" 
                className="save-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setEditing(false);
                  setChangingPassword(false);
                  // Reset form data
                  setFormData({
                    name: vendorInfo?.name || '',
                    email: vendorInfo?.email || '',
                    companyName: vendorInfo?.companyName || '',
                    phone: vendorInfo?.phone || '',
                    address: vendorInfo?.address || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
              >
                Cancel
              </button>
              
              {!changingPassword && (
                <button 
                  type="button" 
                  className="password-button"
                  onClick={() => setChangingPassword(true)}
                >
                  Change Password
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default VendorProfile; 