import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {FiPackage, FiUser, FiMail, FiLock, FiPhone, FiHome, FiBriefcase, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, rtdb } from '../config/firebase';
import '../styles/auth-styles.css';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const navigate = useNavigate();

  // Form validation
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (!formData.companyName || !formData.phone || !formData.address) {
      setError('All business details are required');
      return false;
    }
    
    return true;
  };
  
  // Handle next step in multi-step form
  const nextStep = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all account information');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setFormStep(2);
    setError('');
  };
  
  // Handle previous step
  const prevStep = () => {
    setFormStep(1);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);

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

      // Save additional user data to Realtime Database
      const vendorData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        companyName: formData.companyName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role: 'vendor',
        status: 'pending', // New vendors might need approval
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to vendors collection in Realtime Database
      await set(ref(rtdb, `vendors/${user.uid}`), vendorData);
      
      // Also save minimal user data to users collection
      await set(ref(rtdb, `users/${user.uid}`), {
        email: formData.email.trim().toLowerCase(),
        name: formData.name.trim(),
        role: 'vendor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Store vendor info in localStorage
      localStorage.setItem('vendorInfo', JSON.stringify(vendorData));
      
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle Firebase Auth errors
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please use a different email or login.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Registration is currently disabled. Please contact support.';
          break;
        default:
          errorMessage = 'An error occurred during registration. Please try again.';
      }
      
      setError(errorMessage);
      // Handle Firebase-specific errors
      
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

  // Render step 1 - Account Information
  const renderStep1 = () => (
    <>
      <div className="auth-header">
        <h2>Create Vendor Account</h2>
        <p>Step 1 of 2: Enter your account information</p>
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
        
        <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <FiUser className="h-5 w-5" />
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Your full name"
                required
                disabled={loading}
              />
            </div>
          </div>
          
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
                placeholder="your.email@example.com"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
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
            <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <FiLock className="h-5 w-5" />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="h-5 w-5" />
                ) : (
                  <FiEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="form-group mt-6">
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              <span>Next: Business Details</span>
              <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
        
        <div className="auth-footer">
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/vendor/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            <Link to="/register" className="font-medium text-primary hover:underline">
              ← Back to user registration
            </Link>
          </p>
        </div>
      </div>
    </>
  );
  
  // Render step 2 - Business Information
  const renderStep2 = () => (
    <>
      <div className="auth-header">
        <h2>Business Information</h2>
        <p>Step 2 of 2: Tell us about your business</p>
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
            <label className="form-label">Company Name</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <FiBriefcase className="h-5 w-5" />
              </span>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="form-control"
                placeholder="Your company or business name"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <FiPhone className="h-5 w-5" />
              </span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-control"
                placeholder="+1 (123) 456-7890"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Business Address</label>
            <div className="textarea-with-icon">
              <span className="input-icon">
                <FiHome className="h-5 w-5" />
              </span>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                placeholder="Full business address"
                required
                disabled={loading}
                rows="3"
              />
            </div>
          </div>
          
          <div className="button-group mt-8">
            <button
              type="submit"
              className="btn btn-primary flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-outline"
              disabled={loading}
            >
              ← Back to Account Info
            </button>
          </div>
        </form>
      </div>
    </>
  );
  
  // Render success message
  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <div className="auth-header">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2>Registration Successful!</h2>
            <p>Your vendor account has been created successfully.</p>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              We're setting up your account. You'll be redirected to the dashboard shortly...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the appropriate step
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '28rem' }}>
        {formStep === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );
};

export default VendorRegister;