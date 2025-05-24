import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, rtdb } from '../config/firebase';
import '../styles/auth-styles.css';

const VendorLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  
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
      <div className="auth-card">
        <div className="auth-header">
          <h2>Vendor Login</h2>
          <p>Sign in to manage your tours and bookings</p>
        </div>
        
        <div className="auth-body">
          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <FiMail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="input-with-icon">
                <span className="input-icon">
                  <FiLock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <button
                type="submit"
                className="btn btn-primary w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FiArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="auth-divider">
            <span>OR</span>
          </div>
          
          <div className="auth-footer">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/vendor/register" className="font-medium text-primary hover:underline">
                Create account
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-gray-600">
              <Link to="/login" className="font-medium text-primary hover:underline">
                ← Back to user login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin; 