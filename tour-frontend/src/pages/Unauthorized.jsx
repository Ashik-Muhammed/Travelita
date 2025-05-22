import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container" style={{ 
      textAlign: 'center', 
      padding: '4rem 1rem',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h1 style={{ color: 'var(--primary-color)' }}>Access Denied</h1>
        <div style={{ fontSize: '4rem', margin: '1rem 0' }}>🔒</div>
        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          You don't have permission to access this page. This area is restricted to authorized users only.
        </p>
        
        {currentUser ? (
          <div>
            <p>You are logged in as: <strong>{currentUser.email}</strong></p>
            <p>Your current role does not have access to this section.</p>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/dashboard" className="btn btn-primary" style={{ marginRight: '1rem' }}>
                Go to Dashboard
              </Link>
              <Link to="/" className="btn btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p>Please log in with an account that has the required permissions.</p>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/login" className="btn btn-primary" style={{ marginRight: '1rem' }}>
                Login
              </Link>
              <Link to="/" className="btn btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unauthorized;
