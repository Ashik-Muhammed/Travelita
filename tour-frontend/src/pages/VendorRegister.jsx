import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, rtdb } from '../config/firebase';
import '../styles/AuthForms.css';

const VendorRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

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
    setSuccess(false);

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...registrationData } = formData;
      
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      
      // Save vendor data to Realtime Database
      const vendorData = {
        ...registrationData,
        uid: user.uid,
        role: 'vendor',
        approved: false, // Vendors need approval before they can create packages
        createdAt: new Date().toISOString()
      };
      
      // Save to vendors collection in Realtime Database
      await set(ref(rtdb, `vendors/${user.uid}`), vendorData);
      
      // Also save minimal user data to users collection
      await set(ref(rtdb, `users/${user.uid}`), {
        email: formData.email,
        name: formData.name,
        role: 'vendor',
        createdAt: new Date().toISOString()
      });
      
      setSuccess(true);
      
      // Store vendor info in localStorage
      localStorage.setItem('vendorInfo', JSON.stringify(vendorData));
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      // Handle Firebase-specific errors
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please use a different email or try logging in.';
            // Add a login button to the error message
            setTimeout(() => {
              if (confirm('Would you like to go to the login page instead?')) {
                navigate('/vendor/login');
              }
            }, 1000);
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address. Please check and try again.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use a stronger password.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          default:
            errorMessage = `Registration failed: ${err.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container vendor-register">
        <h2>Vendor Registration</h2>
        
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">Registration successful! Redirecting...</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              onChange={handleChange}
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
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={loading || success}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Already have an account? <Link to="/vendor/login">Login</Link></p>
          <p><Link to="/">Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister; 