import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import '../components/FormFields.css';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../services/authService';
import { auth } from '../config/firebase';

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
        navigate('/admin/dashboard', { replace: true });
      } else if (currentUser.role === 'vendor') {
        navigate('/vendor/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
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
    setLoading(true);
    
    try {
      // First validate credentials without changing auth state
      const result = await loginUser(formData.email, formData.password);
      
      if (!result || !result.user) {
        throw new Error('Login failed. Please check your credentials.');
      }
      
      const { user } = result;
      
      // Store the token for subsequent requests
      if (user.token) {
        localStorage.setItem('authToken', user.token);
      }
      
      // Only update auth state after successful login
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Clear the form
      setFormData({ email: '', password: '' });
      
      // Determine the redirect path based on user role
      let redirectPath = '/dashboard'; // Default for regular users
      
      if (user.role === 'admin') {
        redirectPath = '/admin/dashboard';
      } else if (user.role === 'vendor') {
        redirectPath = '/vendor/dashboard';
      }
      
      // Use navigate for client-side routing instead of window.location
      navigate(redirectPath, { replace: true });
      
    } catch (err) {
      console.error('Login error:', err);
      // Clear the password field for security
      setFormData(prev => ({ ...prev, password: '' }));
      // Use the error message from the error object if available
      setError(err.message || 'Login failed. Please try again.');
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
