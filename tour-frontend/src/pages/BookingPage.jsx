import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { rtdb } from '../config/firebase';
import { ref, get, push, set } from 'firebase/database';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaCalendarAlt, FaLeaf, FaUtensils,
  FaCar, FaCheck, FaClipboardList, FaWheelchair,
  FaShieldAlt, FaCamera, FaUserTie, FaBaby,
  FaCreditCard, FaMinus, FaPlus, FaArrowLeft,
  FaUserShield, FaPlane, FaBus, FaTrain, FaShip,
  FaSubway, FaArrowRight, FaCheckCircle, FaClock
} from 'react-icons/fa';

// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BookingPage.css';

function BookingPage() {
  const { packageId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [tourPackage, setTourPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ message: null, isNotFound: false });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

  const [bookingData, setBookingData] = useState({
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    date: tomorrowFormatted,
    time: '09:00',
    duration: 1,
    travelers: 1,
    adults: 1,
    children: 0,
    infants: 0,
    specialNeeds: false,
    mealPreference: 'vegetarian',
    transportation: 'bus',
    accommodation: 'standard',
    specialRequests: '',
    travelInsurance: false,
    photography: false,
    privateGuide: false
  });

  const handleNextStep = () => {
    // Basic validation before proceeding to next step
    if (currentStep === 1) {
      // Validate personal info
      if (!bookingData.fullName || !bookingData.email || !bookingData.phone) {
        toast.error('Please fill in all required fields');
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
      // Move to step 2 (travel details)
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate travel details
      if (!bookingData.date || !bookingData.time) {
        toast.error('Please select date and time for your tour');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // No validation needed for preferences step, just proceed to confirmation
      setCurrentStep(4);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prevStep => Math.max(prevStep - 1, 1));
  };



  const fetchPackageFromFirebase = async (id) => {
    if (!id) {
      throw new Error('No package ID provided');
    }

    try {
      const packageRef = ref(rtdb, `packages/${id}`);
      const snapshot = await get(packageRef);
      
      if (!snapshot.exists()) {
        const notFoundError = new Error(`Package with ID ${id} not found`);
        notFoundError.isNotFound = true;
        throw notFoundError;
      }
      
      return { id, ...snapshot.val() };
    } catch (error) {
      console.error('Error fetching package from Firebase:', error);
      throw new Error(`Failed to load package: ${error.message}`);
    }
  };

  const processPackage = (pkg) => {
    if (!pkg) {
      console.error('No package data provided to processPackage');
      setError({ message: 'Invalid package data', isNotFound: false });
      setLoading(false);
      return;
    }

    try {
      // Extract duration from string if needed (e.g., '5 days' -> 5)
      let duration = 1;
      if (typeof pkg.duration === 'string') {
        const match = pkg.duration.match(/\d+/);
        duration = match ? parseInt(match[0]) : 1;
      } else if (typeof pkg.duration === 'number') {
        duration = pkg.duration;
      }
      
      // Create processed package with defaults
      const processedPackage = {
        id: pkg.id || packageId || 'unknown-package-id',
        title: pkg.title || 'Tour Package',
        description: pkg.description || '',
        price: parseFloat(pkg.price) || 0,
        duration: duration,
        destination: pkg.destination || 'Unknown',
        images: Array.isArray(pkg.images) ? pkg.images : [],
        included: Array.isArray(pkg.included) ? pkg.included : [],
        itinerary: Array.isArray(pkg.itinerary) ? pkg.itinerary : [],
        available: pkg.available !== undefined ? Boolean(pkg.available) : true,
        packageId: pkg.id || packageId || 'unknown-package-id'
      };

      setTourPackage(processedPackage);
      setBookingData(prev => ({
        ...prev,
        duration: processedPackage.duration,
        fullName: currentUser?.displayName || '',
        email: currentUser?.email || ''
      }));
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error('Error processing package:', error);
      setError({ message: 'Invalid package data format', isNotFound: false });
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      
      console.log('Starting data loading process...');
      setLoading(true);
      setError(null);
      
      try {
        // Check location state first
        if (location.state?.packageData) {
          console.log('Processing package from location state');
          await processPackage(location.state.packageData);
        } 
        // If no location state but we have packageId, try Firebase
        else if (packageId) {
          console.log('Fetching package from Firebase:', packageId);
          const firebasePkg = await fetchPackageFromFirebase(packageId);
          await processPackage(firebasePkg);
        } else {
          throw new Error('No package data or ID provided');
        }
      } catch (error) {
        console.error('Error loading package data:', error);
        if (isMounted) {
          setError({
            message: error.message || 'Failed to load package',
            isNotFound: error.isNotFound || false
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [packageId, location.state, currentUser]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setBookingData({
      ...bookingData,
      [name]: type === 'number' ? parseInt(value) || 1 : value
    });
  };

  // Calculate minimum date (tomorrow)
  const minDate = tomorrowFormatted;
  // Calculate maximum date (1 year from now)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateFormatted = maxDate.toISOString().split('T')[0];

  // Show loading state
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <h3>Loading your booking details</h3>
        <p className="text-gray-500">Please wait while we prepare your experience</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="error-state">
        <div className="error-message">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3>Something went wrong</h3>
          <p>{error.message || 'We couldn\'t load the booking details. Please try again later.'}</p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/packages')}
              className="btn btn-outline"
            >
              Browse Packages
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!tourPackage) {
    return (
      <div className="not-found-state">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-blue-50 p-4 rounded-full inline-flex items-center justify-center mb-6">
            <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Package Not Found</h2>
          <p className="text-gray-600 mb-8">The package you're looking for doesn't exist or may have been removed. Please check the URL or browse our available packages.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline"
            >
              <FaArrowLeft className="mr-2" /> Go Back
            </button>
            <button
              onClick={() => navigate('/packages')}
              className="btn btn-primary"
            >
              Browse Packages
            </button>
          </div>
        </div>
      </div>
    );
  }

  const updateTravelerCount = (type, change) => {
    setBookingData(prev => {
      const currentValue = prev[type] || 0;
      const newValue = Math.max(0, currentValue + change);
      
      return {
        ...prev,
        [type]: newValue,
        travelers: type === 'adults' ? 
          newValue + prev.children + prev.infants :
          prev.adults + (type === 'children' ? newValue : prev.children) + (type === 'infants' ? newValue : prev.infants)
      };
    });
  };

  const totalPrice = tourPackage ? 
    (tourPackage.price * bookingData.travelers) +
    (bookingData.travelInsurance ? 500 * bookingData.travelers : 0) +
    (bookingData.photography ? 1500 : 0) +
    (bookingData.privateGuide ? 2500 : 0) +
    (bookingData.transportation === 'premium' ? 2000 : 0)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep < 3) {
      handleNextStep();
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage('');

      // Validate all required fields
      const requiredFields = ['fullName', 'email', 'phone', 'date', 'time'];
      const missingFields = requiredFields.filter(field => !bookingData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      if (!currentUser) {
        throw new Error('You must be logged in to make a booking');
      }

      if (!tourPackage) {
        throw new Error('Package information is missing');
      }

      // Calculate end date based on duration
      const endDate = new Date(
        new Date(bookingData.date).getTime() + 
        ((bookingData.duration || 1) * 24 * 60 * 60 * 1000)
      ).toISOString();

      // Create booking object with all necessary fields
      const booking = {
        // User information
        userId: currentUser.uid,
        userName: bookingData.fullName,
        userEmail: bookingData.email,
        userPhone: bookingData.phone,
        
        // Package information
        packageId: tourPackage.id,
        packageTitle: tourPackage.title || 'Tour Package',
        packagePrice: tourPackage.price || 0,
        vendorId: tourPackage.vendorId || 'system',
        destination: tourPackage.destination || 'Unknown',
        
        // Booking details
        bookingDate: new Date().toISOString(),
        startDate: bookingData.date,
        endDate: endDate,
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration || 1,
        travelers: bookingData.travelers,
        adults: bookingData.adults,
        children: bookingData.children,
        infants: bookingData.infants,
        
        // Preferences
        mealPreference: bookingData.mealPreference,
        transportation: bookingData.transportation,
        accommodation: bookingData.accommodation,
        specialRequests: bookingData.specialRequests,
        specialNeeds: bookingData.specialNeeds,
        travelInsurance: bookingData.travelInsurance,
        photography: bookingData.photography,
        privateGuide: bookingData.privateGuide,
        
        // Pricing
        totalPrice: totalPrice,
        
        // Status
        status: 'pending', // Changed from 'confirmed' to 'pending' to require vendor confirmation
        paymentStatus: 'pending',
        
        // Timestamps
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to Firebase
      const bookingsRef = ref(rtdb, 'bookings');
      const newBookingRef = push(bookingsRef);
      await set(newBookingRef, booking);
      
      // Show success message and move to confirmation step
      setSuccessMessage('Your booking has been confirmed! We\'ve sent a confirmation to your email.');
      setIsBookingComplete(true);
      setCurrentStep(5); // Move to confirmation step
      
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error(error.message || 'An error occurred while processing your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!bookingData.fullName) errors.fullName = 'Full name is required';
      if (!bookingData.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(bookingData.email)) {
        errors.email = 'Please enter a valid email';
      }
      if (!bookingData.phone) {
        errors.phone = 'Phone number is required';
      } else if (!/^[0-9]{10,15}$/.test(bookingData.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
    } else if (step === 2) {
      if (!bookingData.travelers || bookingData.travelers < 1) {
        errors.travelers = 'At least one traveler is required';
      }
      if (!bookingData.date) {
        errors.date = 'Please select a date';
      }
      if (!bookingData.time) {
        errors.time = 'Please select a time';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    console.log('Current step:', currentStep);
    
    // Simple validation for step 1
    if (currentStep === 1) {
      if (!bookingData.fullName || !bookingData.email || !bookingData.phone) {
        toast.error('Please fill in all required fields');
        return false;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingData.email)) {
        toast.error('Please enter a valid email address');
        return false;
      }
    }
    
    // Simple validation for step 2
    if (currentStep === 2) {
      if (!bookingData.date || !bookingData.time) {
        toast.error('Please select date and time for your tour');
        return false;
      }
    }
    
    // If we get here, validation passed - move to next step
    setCurrentStep(prev => {
      const next = Math.min(prev + 1, 4);
      console.log('Moving to step:', next);
      return next;
    });
    return true;
  };
  
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // This will be called when the form is submitted (e.g., pressing Enter)
    if (currentStep < 4) {
      nextStep();
    } else {
      handleSubmit(e);
    }
  };
  
  const handleContinueClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    nextStep();
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Your Info' },
      { number: 2, label: 'Travel Details' },
      { number: 3, label: 'Preferences' },
      { number: 4, label: 'Confirmation' }
    ];
    
    return (
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex items-center justify-between relative">
          {/* Progress bar */}
          <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-200 -translate-y-1/2 -z-10">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
          
          {/* Steps */}
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-sm mb-2 transition-all duration-300 ${
                  currentStep >= step.number 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 scale-110 shadow-lg' 
                    : 'bg-gray-300'
                }`}
              >
                {currentStep > step.number ? <FaCheck className="w-5 h-5" /> : step.number}
              </div>
              <span className={`text-sm font-medium transition-colors duration-200 ${
                currentStep >= step.number ? 'text-indigo-700 font-semibold' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFormSteps = () => {
    switch(currentStep) {
      case 1:
        return (
          <motion.div 
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600 max-w-lg mx-auto">We'll use this information to send you booking confirmation and important updates about your trip.</p>
            </div>
            
            <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="input-wrapper">
                <label htmlFor="fullName">
                  <FaUser className="input-icon" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={bookingData.fullName}
                  onChange={handleInputChange}
                  className="block w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-colors duration-200"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="input-wrapper">
                  <label htmlFor="email">
                    <FaEnvelope className="input-icon" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    className="block w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-colors duration-200"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="input-wrapper">
                  <label htmlFor="phone">
                    <FaPhone className="input-icon" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={bookingData.phone}
                    onChange={handleInputChange}
                    className="block w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-colors duration-200"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>
              
              {/* Navigation buttons removed from individual steps to avoid duplication */}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Travel Details</h2>
              <p className="text-gray-600 max-w-lg mx-auto">When would you like to go and who's coming along?</p>
            </div>
            
            <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="input-wrapper">
                  <label htmlFor="date">
                    <FaCalendarAlt className="input-icon" />
                    Tour Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleInputChange}
                    min={minDate}
                    max={maxDate}
                    className="block w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-colors duration-200"
                    required
                  />
                </div>
                
                <div className="input-wrapper">
                  <label htmlFor="time">
                    <FaClock className="input-icon" />
                    Tour Time
                  </label>
                  <select
                    id="time"
                    name="time"
                    value={bookingData.time}
                    onChange={handleInputChange}
                    className="block w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-colors duration-200"
                    required
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:30">03:30 PM</option>
                  </select>
                </div>
                
                <div className="input-wrapper">
                  <label>
                    <FaUser className="input-icon" />
                    Travelers
                  </label>
                  <div className="flex items-center mt-1">
                    <button
                      type="button"
                      onClick={() => updateTravelerCount('adults', -1)}
                      disabled={bookingData.adults <= 1}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      <FaMinus className="h-4 w-4" />
                    </button>
                    <span className="mx-4 text-gray-900 font-medium">
                      {bookingData.adults} {bookingData.adults === 1 ? 'Adult' : 'Adults'}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateTravelerCount('adults', 1)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <FaPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="input-wrapper">
                  <label>
                    <FaBaby className="input-icon" />
                    Children (2-12)
                  </label>
                  <div className="flex items-center mt-1">
                    <button
                      type="button"
                      onClick={() => updateTravelerCount('children', -1)}
                      disabled={bookingData.children <= 0}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      <FaMinus className="h-4 w-4" />
                    </button>
                    <span className="mx-4 text-gray-900 font-medium">
                      {bookingData.children} {bookingData.children === 1 ? 'Child' : 'Children'}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateTravelerCount('children', 1)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <FaPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Special Requirements</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <div className="relative flex items-center">
                        <input
                          id="specialNeeds"
                          name="specialNeeds"
                          type="checkbox"
                          checked={!!bookingData.specialNeeds}
                          onChange={(e) => {
                            setBookingData(prev => ({
                              ...prev,
                              specialNeeds: e.target.checked
                            }));
                          }}
                          className={`
                            appearance-none h-5 w-5 rounded border-2 
                            ${bookingData.specialNeeds ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}
                            transition-colors duration-200 ease-in-out
                            focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                            relative
                          `}
                        />
                        {bookingData.specialNeeds && (
                          <svg
                            className="absolute left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white pointer-events-none"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="specialNeeds" className="font-medium text-gray-700">Accessibility Requirements</label>
                      <p className="text-gray-500">Check if you or anyone in your group has mobility or accessibility needs</p>
                    </div>
                  </div>
                  
                  <div className="input-wrapper">
                    <FaClipboardList className="input-icon" />
                    <div>
                      <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                      <textarea
                        id="specialRequests"
                        name="specialRequests"
                        value={bookingData.specialRequests}
                        onChange={handleInputChange}
                        rows="3"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-colors duration-200"
                        placeholder="Dietary restrictions, special accommodations, or any other requests..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-center">
                  <div className="text-sm text-gray-500">
                    Step 2 of 4
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Preferences</h2>
              <p className="text-gray-600 max-w-lg mx-auto">Let us know your preferences to enhance your experience</p>
            </div>
            
            <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              {/* Meal Preferences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Meal Preferences</h3>
                <div className="space-y-3">
                  {[
                    { id: 'vegetarian', label: 'Vegetarian' },
                    { id: 'vegan', label: 'Vegan' },
                    { id: 'glutenFree', label: 'Gluten-Free' },
                    { id: 'noRestrictions', label: 'No Dietary Restrictions' }
                  ].map((meal) => (
                    <div key={meal.id} className="flex items-start">
                      <div className="flex items-center h-5 relative">
                        <div className="relative flex items-center">
                          <input
                            id={`meal-${meal.id}`}
                            name="mealPreferences"
                            type="checkbox"
                            checked={bookingData.mealPreferences?.includes(meal.id) || false}
                            onChange={(e) => {
                              const currentPreferences = bookingData.mealPreferences || [];
                              const isChecked = currentPreferences.includes(meal.id);
                              
                              setBookingData(prev => ({
                                ...prev,
                                mealPreferences: isChecked
                                  ? currentPreferences.filter(id => id !== meal.id)
                                  : [...currentPreferences, meal.id]
                              }));
                            }}
                            className="h-5 w-5 rounded border-gray-300 appearance-none bg-white border-2 checked:bg-indigo-600 checked:border-indigo-600 focus:ring-0 focus:ring-offset-0"
                          />
                          {bookingData.mealPreferences?.includes(meal.id) && (
                            <svg
                              className="absolute left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white pointer-events-none"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`meal-${meal.id}`} className="font-medium text-gray-700">
                          {meal.label}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="mt-4">
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">Additional Requests</label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={bookingData.specialRequests || ''}
                      onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                      rows="3"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-colors duration-200"
                      placeholder="Dietary restrictions, special accommodations, or any other requests..."
                    />
                  </div>
                </div>
              </div>

              {/* Removed duplicate navigation buttons - using the main form's navigation instead */}
            </div>
          </motion.div>
        );
        
      case 4:
        return (
          <motion.div 
            key="step-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
              <p className="text-gray-600 max-w-lg mx-auto">Please review your booking details before confirmation</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Booking Summary</h3>
                <p className="text-gray-500 text-sm mt-1">Your tour package details and preferences</p>
              </div>
              
              <div className="divide-y divide-gray-100">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-3">Tour Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Package Name</p>
                      <p className="font-medium">{tourPackage.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">
                        {new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        <span className="mx-2">•</span>
                        {bookingData.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">4 hours (approx)</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Travelers</p>
                      <p className="font-medium">
                        {bookingData.travelers} {bookingData.travelers === 1 ? 'person' : 'people'}
                        {bookingData.adults > 0 && ` • ${bookingData.adults} ${bookingData.adults === 1 ? 'adult' : 'adults'}`}
                        {bookingData.children > 0 && ` • ${bookingData.children} ${bookingData.children === 1 ? 'child' : 'children'}`}
                        {bookingData.infants > 0 && ` • ${bookingData.infants} ${bookingData.infants === 1 ? 'infant' : 'infants'}`}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Your Preferences</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Meal Preference</p>
                      <p className="font-medium capitalize">
                        {bookingData.mealPreference || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Transportation</p>
                      <p className="font-medium capitalize">
                        {bookingData.transportation || 'Standard (included)'}
                      </p>
                    </div>
                    {bookingData.specialRequests && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Special Requests</p>
                        <p className="font-medium">{bookingData.specialRequests}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-3">Pricing</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price (x{bookingData.travelers})</span>
                      <span className="font-medium">₹{(tourPackage.price * bookingData.travelers).toLocaleString()}</span>
                    </div>
                    
                    {bookingData.travelInsurance && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Travel Insurance (x{bookingData.travelers})</span>
                        <span className="font-medium">+ ₹{(500 * bookingData.travelers).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {bookingData.photography && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Professional Photography</span>
                        <span className="font-medium">+ ₹1,500</span>
                      </div>
                    )}
                    
                    {bookingData.privateGuide && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Private Guide</span>
                        <span className="font-medium">+ ₹2,500</span>
                      </div>
                    )}
                    
                    {bookingData.transportation === 'premium' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Premium Transportation</span>
                        <span className="font-medium">+ ₹2,000</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total Amount</span>
                        <span className="text-indigo-600">₹{totalPrice.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center space-y-4 sm:space-y-0">
                  <div className="w-full sm:w-auto">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 ${
                        isSubmitting 
                          ? 'bg-indigo-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCreditCard className="mr-2 -ml-1 w-5 h-5" />
                          Confirm & Pay ₹{totalPrice.toLocaleString()}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
        
      case 5:
        return (
          <motion.div 
            className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-white bg-opacity-20 mb-4">
                  <FaCheck className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
                <p className="mt-2 text-green-100">Your reservation has been successfully processed</p>
              </div>
              
              {/* Booking Summary */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column - Booking Details */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">Booking Information</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Booking Reference</p>
                        <p className="text-gray-800 font-mono">#{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tour Package</p>
                        <p className="text-gray-800">{tourPackage?.title || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date & Time</p>
                        <p className="text-gray-800">
                          {new Date(bookingData.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                          <span className="mx-2">•</span>
                          {bookingData.time}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Duration</p>
                        <p className="text-gray-800">{bookingData.duration} {bookingData.duration === 1 ? 'day' : 'days'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Travelers</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {bookingData.adults > 0 && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                              {bookingData.adults} {bookingData.adults === 1 ? 'Adult' : 'Adults'}
                            </span>
                          )}
                          {bookingData.children > 0 && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                              {bookingData.children} {bookingData.children === 1 ? 'Child' : 'Children'}
                            </span>
                          )}
                          {bookingData.infants > 0 && (
                            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                              {bookingData.infants} {bookingData.infants === 1 ? 'Infant' : 'Infants'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Price & Preferences */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">Price Summary</h2>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Base Price</span>
                        <span className="font-medium">₹{tourPackage?.price?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Travelers (x{bookingData.travelers})</span>
                        <span>× {bookingData.travelers}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b-2 border-gray-300 font-semibold">
                        <span>Total Amount</span>
                        <span className="text-lg text-indigo-600">₹{totalPrice.toLocaleString()}</span>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Preferences</h3>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="text-gray-500">Meal:</span>{' '}
                            <span className="capitalize">{bookingData.mealPreference || 'Standard'}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">Transport:</span>{' '}
                            <span className="capitalize">{bookingData.transportation || 'Not specified'}</span>
                          </p>
                          {bookingData.specialRequests && (
                            <p className="text-sm">
                              <span className="text-gray-500">Special Requests:</span>{' '}
                              <span>{bookingData.specialRequests}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Receipt
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Back to Home
                  </button>
                </div>
                
                {/* Help Section */}
                <div className="mt-12 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Need Help?
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    If you have any questions about your booking, please contact our customer support at{' '}
                    <a href="mailto:support@travelita.com" className="font-medium text-blue-800 hover:underline">support@travelita.com</a>
                    {' '}or call us at +91 9567184287
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (isBookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <FaCheck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
          <p className="mt-2 text-gray-600">Your tour has been successfully booked. We've sent a confirmation to your email.</p>
          
          <div className="mt-8 bg-gray-50 p-6 rounded-lg text-left">
            <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Booking Reference</dt>
                <dd className="text-sm text-gray-900">#{Math.random().toString(36).substr(2, 8).toUpperCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Tour</dt>
                <dd className="text-sm text-gray-900 text-right">{tourPackage.title}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Time</dt>
                <dd className="text-sm text-gray-900">{bookingData.time}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Travelers</dt>
                <dd className="text-sm text-gray-900">{bookingData.travelers}</dd>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <dt className="text-base font-medium text-gray-900">Total Paid</dt>
                  <dd className="text-base font-bold text-indigo-600">₹{totalPrice.toLocaleString()}</dd>
                </div>
              </div>
            </dl>
          </div>
          
          <div className="mt-8">
            <button
              onClick={() => window.print()}
              className="w-full px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <button 
            onClick={() => navigate(-1)} 
            className="back-link group flex items-center text-primary-600 hover:text-primary-800 transition-colors mx-auto"
          >
            <FaArrowLeft className="mr-2 transition-transform group-hover:-translate-x-1" /> 
            <span>Back to Tour</span>
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent mt-4">
            Complete Your Booking
          </h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        {/* Loading State */}
        {tourPackage === null && (
          <motion.div 
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600">Loading package details...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div 
            className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg my-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading package</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error.message}</p>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {isBookingComplete && (
          <motion.div 
            className="max-w-2xl mx-auto text-center py-16 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <FaCheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Booking Confirmed!</h2>
            <p className="text-lg text-gray-600 mb-8">{successMessage}</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => navigate('/my-bookings')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                View My Bookings
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Booking Form */}
        {!isBookingComplete && tourPackage && (
          <div className="booking-content">
            {/* Left Column - Package Summary */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Exotic Goa Beach Retreat</h3>
              <motion.div 
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={tourPackage.images?.[0] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'} 
                    alt={tourPackage.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium flex items-center">
                        <FaCalendarAlt className="mr-2 text-primary-500" />
                        {tourPackage.duration} days
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Price per person</p>
                      <p className="text-2xl font-bold text-primary-600">
                        ₹{tourPackage.price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mr-3">
                        <FaCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Free Cancellation</h4>
                        <p className="text-sm text-gray-500">Cancel up to 24 hours before the tour for a full refund</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mr-3">
                        <FaUserTie className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Expert Guide</h4>
                        <p className="text-sm text-gray-500">Knowledgeable and friendly local guides</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-8">

              <div className="step-indicator">
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step} 
                    className={`step ${currentStep > step ? 'completed' : ''} ${currentStep === step ? 'active' : ''}`}
                  >
                    <div className="step-number">
                      {currentStep > step ? <FaCheck className="w-4 h-4" /> : step}
                    </div>
                    <span className="step-label">
                      {step === 1 ? 'Your Info' : step === 2 ? 'Travel Details' : step === 3 ? 'Preferences' : 'Confirmation'}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="mt-8">
                {renderFormSteps()}
                
                {currentStep !== 4 && (
                  <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between">
                    {currentStep > 1 ? (
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          handlePreviousStep();
                        }}
                        className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                      >
                        <FaArrowLeft className="mr-2" /> Back
                      </button>
                    ) : (
                      <div></div> // Empty div to push the next button to the right
                    )}
                    
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNextStep();
                      }}
                      className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={isSubmitting || 
                        (currentStep === 1 && (!bookingData.fullName || !bookingData.email || !bookingData.phone)) || 
                        (currentStep === 2 && (!bookingData.date || !bookingData.time))
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          {currentStep === 1 ? 'Continue to Travel Details' : 
                           currentStep === 2 ? 'Continue to Preferences' : 
                           'Continue to Review'} 
                          <FaArrowRight className="ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingPage;
