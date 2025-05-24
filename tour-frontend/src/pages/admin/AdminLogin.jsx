import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { FiAlertCircle, FiLock, FiMail } from 'react-icons/fi';
import { auth } from '../../config/firebase';
import { isUserAdmin } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, isAdmin, loading: authLoading } = useAuth() || {};
  
  // If already logged in as admin, redirect to dashboard
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-box" style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user has admin role using the centralized function
      console.log('Checking admin status for user:', user.uid);
      const isAdminUser = await isUserAdmin(user.uid);
      
      console.log('Admin check result:', { userId: user.uid, isAdmin: isAdminUser });
      
      if (!isAdminUser) {
        console.log('Access denied - user is not an admin');
        await firebaseSignOut(auth);
        throw new Error('Access denied. This account does not have admin privileges. Please contact your administrator.');
      }
      
      // The AuthProvider's useEffect will handle setting the user and isAdmin state
      // which will trigger the redirect in our effect above
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="login-header">
          <h2>Admin Portal</h2>
          <p>Sign in to access the admin dashboard</p>
        </div>
        
        {error && (
          <div className="error-message">
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '1.1rem'
                }} 
              />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control"
                placeholder="your@email.com"
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="username"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '1.1rem'
                }} 
              />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control"
                placeholder="••••••••"
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="current-password"
              />
            </div>
          </div>
          
          <div className="form-group" style={{ marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Signing in...</span>
                </>
              ) : 'Sign In'}
            </button>
          </div>
          
          <div className="login-links">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
