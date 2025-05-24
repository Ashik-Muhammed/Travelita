import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { registerUser } from '../services/authService';
import '../styles/auth-styles.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Redirect if already logged in
  if (currentUser) {
    navigate('/dashboard');
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      // Register user with name, email, and password
      const result = await registerUser(formData.name, formData.email, formData.password);
      
      if (result && result.user) {
        setSuccess('Registration successful! Redirecting to dashboard...');
        setLoading(false);
        navigate('/dashboard');
      } else {
        setSuccess('Registration successful! Please login.');
        setFormData({ name: '', email: '', password: '', role: 'user' });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(getFirebaseAuthErrorMessage(err.code) || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user-friendly Firebase auth error messages
  const getFirebaseAuthErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please use a different email or login.';
      case 'auth/invalid-email':
        return 'Invalid email format.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'auth/operation-not-allowed':
        return 'Registration is currently disabled. Please try again later.';
      default:
        return 'An error occurred during registration. Please try again.';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '32rem' }}>
        <div className="auth-header">
          <h2>Create an Account</h2>
          <p>Join us to start your journey</p>
        </div>

        <div className="auth-form">
          {success && (
            <div className="auth-message success-message">
              {success}
            </div>
          )}
          
          {error && (
            <div className="auth-message error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="John Doe"
                  required
                  disabled={loading}
                />
                <FiUser className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
                <FiMail className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <FiLock className="input-icon" />
              </div>
              <p className="password-hint" style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                margin: '0.25rem 0 0',
                textAlign: 'left'
              }}>
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={loading}
              style={{
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <FiUserPlus />
                  Sign Up
                </>
              )}
            </button>

          </form>
        </div>


        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
