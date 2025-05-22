import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import '../components/FormFields.css';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../services/authService';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [currentUser, navigate]);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const result = await loginUser(formData.email, formData.password);
      
      // Navigation will happen automatically through the AuthContext
      // The useEffect in AuthContext will detect the auth state change
    } catch (err) {
      console.error('Login error:', err);
      setError(getFirebaseAuthErrorMessage(err.code) || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user-friendly Firebase auth error messages
  const getFirebaseAuthErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Invalid email format.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      default:
        return 'An error occurred during login. Please try again.';
    }
  };

  return (
    <div className="login-page-container">
      <div className="card login-form-card">
        <h2>Login</h2>

        {error && (
          <p className="error-message-login">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <p className="login-page-text">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
