import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, rtdb } from '../config/firebase';
import '../styles/AuthForms.css';

const VendorLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Check if vendor is already logged in
  useEffect(() => {
    const checkExistingVendor = async () => {
      try {
        // Check if user is already authenticated
        const currentUser = auth.currentUser;
        
        // Check if vendor info exists in localStorage
        const storedVendorInfo = localStorage.getItem('vendorInfo');
        
        if (currentUser && storedVendorInfo) {
          // Validate that the stored vendor info matches the current user
          const vendorData = JSON.parse(storedVendorInfo);
          const vendorRef = ref(rtdb, `vendors/${currentUser.uid}`);
          const vendorSnapshot = await get(vendorRef);
          
          if (vendorSnapshot.exists()) {
            console.log('Vendor already logged in, redirecting to dashboard');
            navigate('/vendor/dashboard');
            return;
          }
        }
      } catch (err) {
        console.error('Error checking existing vendor:', err);
        // Clear potentially corrupted data
        localStorage.removeItem('vendorInfo');
      }
    };
    
    checkExistingVendor();
  }, [navigate]);

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

    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      
      // Check if the user is a vendor by fetching vendor data from Realtime Database
      console.log('User authenticated:', user.uid);
      const vendorRef = ref(rtdb, `vendors/${user.uid}`);
      console.log('Vendor reference:', vendorRef);
      const vendorSnapshot = await get(vendorRef);
      console.log('Vendor snapshot exists:', vendorSnapshot.exists());
      
      if (!vendorSnapshot.exists()) {
        // User exists but is not a vendor
        setError('This account is not registered as a vendor. Please use the customer login.');
        console.log('Signing out user - not a vendor');
        await signOut(auth); // Sign out the user - using the imported signOut function
        setLoading(false);
        return;
      }
      
      const vendorData = vendorSnapshot.val();
      console.log('Vendor data retrieved:', vendorData);
      
      // Store vendor info in localStorage
      localStorage.setItem('vendorInfo', JSON.stringify(vendorData));
      console.log('Vendor info stored in localStorage');
      
      // Redirect to vendor dashboard
      console.log('Redirecting to vendor dashboard');
      navigate('/vendor/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle Firebase-specific errors
      let errorMessage = 'Failed to login. Please check your credentials.';
      
      if (err.code) {
        switch (err.code) {
          case 'auth/user-not-found':
            errorMessage = 'Account not found. Please check your email or register if you\'re new.';
            // Add a registration option
            setTimeout(() => {
              if (confirm('Would you like to register as a new vendor instead?')) {
                navigate('/vendor/register');
              }
            }, 1000);
            break;
          case 'auth/wrong-password':
            errorMessage = 'Invalid password. Please try again.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format. Please check and try again.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          default:
            errorMessage = `Login failed: ${err.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Vendor Login</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
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
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Don't have an account? <Link to="/vendor/register">Register</Link></p>
          <p><Link to="/">Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin; 