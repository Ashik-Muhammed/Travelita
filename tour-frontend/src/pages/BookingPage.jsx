import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation ,Link} from 'react-router-dom';
import { rtdb } from '../config/firebase';
import { ref, get, push, set } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BookingPage.css';

// Icons
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaCalendarAlt, FaLeaf, FaUtensils, FaPrint,
  FaCar, FaCheck, FaClipboardList, FaWheelchair,
  FaShieldAlt, FaCamera, FaUserTie, FaBaby,
  FaCreditCard, FaMinus, FaPlus, FaArrowLeft,
  FaUserShield, FaPlane, FaBus, FaTrain, FaShip,
  FaSubway, FaArrowRight, FaCheckCircle, FaClock,
  FaExclamationCircle, FaInfoCircle,
  FaHome, FaDownload, FaShare, FaQuestionCircle, FaCog
} from 'react-icons/fa';

// Form validation
const validateForm = (data, currentStep) => {
  const errors = {};
  
  // Step 1: Personal Information
  if (currentStep === 1) {
    // Full Name validation
    if (!data.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    } else if (data.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters long';
    } else if (data.fullName.trim().length > 100) {
      errors.fullName = 'Name cannot exceed 100 characters';
    }
    
    // Email validation
    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (!data.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(data.phone)) {
      errors.phone = 'Please enter a valid 10-15 digit phone number';
    }
  }
  
  // Step 2: Travel Details
  if (currentStep === 2) {
    // Travel date validation
    if (!data.date) {
      errors.date = 'Travel date is required';
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'Travel date must be today or in the future';
      } else if (selectedDate > new Date(today.setFullYear(today.getFullYear() + 1))) {
        errors.date = 'Travel date cannot be more than 1 year in advance';
      }
    }
    
    // Time validation
    if (!data.time) {
      errors.time = 'Travel time is required';
    }
    
    // Travelers validation
    if (!data.adults && data.adults !== 0) {
      errors.adults = 'Number of adults is required';
    } else if (data.adults < 1) {
      errors.adults = 'At least one adult is required';
    } else if (data.adults > 10) {
      errors.adults = 'Maximum 10 adults allowed per booking';
    }
    
    if (data.children < 0) {
      errors.children = 'Number of children cannot be negative';
    } else if (data.children > 10) {
      errors.children = 'Maximum 10 children allowed per booking';
    }
    
    if (data.infants < 0) {
      errors.infants = 'Number of infants cannot be negative';
    } else if (data.infants > 5) {
      errors.infants = 'Maximum 5 infants allowed per booking';
    }
    
    // Total travelers validation
    const totalTravelers = (data.adults || 0) + (data.children || 0) + (data.infants || 0);
    if (totalTravelers < 1) {
      errors.travelers = 'At least one traveler is required';
    } else if (totalTravelers > 15) {
      errors.travelers = 'Maximum 15 travelers allowed per booking';
    }
  }
  
  // Step 3: Additional Requirements
  if (currentStep === 3) {
    // Special requests validation (if needed)
    if (data.specialRequests && data.specialRequests.length > 500) {
      errors.specialRequests = 'Special requests cannot exceed 500 characters';
    }
  }
  
  return errors;
};

// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

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
  const [formTouched, setFormTouched] = useState({});
  
  // Calculate dates for date picker
  const today = new Date();
  
  // Min date (tomorrow)
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1);
  const minDateFormatted = minDate.toISOString().split('T')[0];
  
  // Max date (1 year from now)
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() + 1);
  const maxDateFormatted = maxDate.toISOString().split('T')[0];
  
  // Alias for date picker
  const datePickerMinDate = minDateFormatted;
  const datePickerMaxDate = maxDateFormatted;

  const [bookingData, setBookingData] = useState({
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    date: minDateFormatted,
    time: '09:00',
    duration: 1,
    travelers: 1,
    adults: 1,
    children: 0,
    infants: 0,
    specialNeeds: false,
    mealPreference: '',
    transportation: '',
    accommodation: '',
    specialRequests: '',
    travelInsurance: false,
    photography: false,
    privateGuide: false,
    bookingRef: '' // Initialize with empty string, will be set on submission
  });

  const validateCurrentStep = () => {
    // Mark all fields in current step as touched
    const newTouched = { ...formTouched };
    let hasError = false;
    
    // Mark all fields in current step as touched
    if (currentStep === 1) {
      ['fullName', 'email', 'phone'].forEach(field => {
        newTouched[field] = true;
      });
    } else if (currentStep === 2) {
      ['date', 'time', 'adults', 'children', 'infants'].forEach(field => {
        newTouched[field] = true;
      });
    }
    
    setFormTouched(newTouched);
    
    // Validate current step
    const errors = validateForm(bookingData, currentStep);
    setValidationErrors(errors);
    
    // Check if there are any errors for the current step
    const stepFields = {
      1: ['fullName', 'email', 'phone'],
      2: ['date', 'time', 'adults', 'children', 'infants', 'travelers'],
      3: [] // No required fields in step 3
    };
    
    const hasStepErrors = stepFields[currentStep].some(field => errors[field]);
    
    if (hasStepErrors) {
      // Scroll to first error
      const firstError = Object.keys(errors).find(key => stepFields[currentStep].includes(key));
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus({ preventScroll: true });
        }
      }
      return false;
    }
    
    return true;
  };
  
  const handleNextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    // Proceed to next step if validation passes
    setCurrentStep(prevStep => Math.min(prevStep + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    console.log('Processing package data:', pkg);
    console.log('Package images:', pkg.images);
    if (pkg.images && pkg.images.length > 0) {
      console.log('First image URL:', pkg.images[0]);
      console.log('Type of first image:', typeof pkg.images[0]);
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
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const inputValue = type === 'checkbox' ? checked : value;
    
    setBookingData(prev => ({
      ...prev,
      [name]: inputValue
    }));
    
    // Mark field as touched
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field on change if it's been touched before
    if (formTouched[name]) {
      const errors = validateForm({ ...bookingData, [name]: inputValue }, currentStep);
      setValidationErrors(prev => ({
        ...prev,
        [name]: errors[name] || null
      }));
    }
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    
    // Mark field as touched
    if (!formTouched[name]) {
      setFormTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Validate field on blur
    const errors = validateForm(bookingData, currentStep);
    setValidationErrors(prev => ({
      ...prev,
      [name]: errors[name] || null
    }));
  };

  // Using minDateFormatted defined at the top of the component

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

  // Generate a booking reference
  const generateBookingRef = () => {
    return 'BK' + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show all errors
    const newTouched = {};
    Object.keys(bookingData).forEach(field => {
      newTouched[field] = true;
    });
    setFormTouched(newTouched);
    
    // Generate booking reference if not already set
    const updatedBookingData = { ...bookingData };
    if (!updatedBookingData.bookingRef) {
      updatedBookingData.bookingRef = generateBookingRef();
      setBookingData(updatedBookingData);
    }
    
    // Validate form before submission
    const errors = validateForm(updatedBookingData, currentStep);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus({ preventScroll: true });
      }
      
      return;
    }
    
    // Clear any previous errors
    setValidationErrors({});
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // If this is the final step, submit the booking
    try {
      setIsSubmitting(true);
      
      // Generate booking reference
      const bookingRef = generateBookingRef();
      
      // Create booking object
      // Handle image fallback
      const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '/placeholder-tour.jpg'; // Local fallback image
        if (imageUrl.startsWith('http')) return imageUrl;
        return imageUrl;
      };

      const booking = {
        ...bookingData,
        bookingRef, // Add the generated booking reference
        packageId: tourPackage.id,
        packageName: tourPackage.title,
        packageImage: getImageUrl(tourPackage.images?.[0]),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        userEmail: currentUser.email,
        totalPrice: totalPrice,
        paymentStatus: 'pending',
        bookingDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      // Save to Firebase
      const bookingsRef = ref(rtdb, 'bookings');
      const newBookingRef = push(bookingsRef);
      await set(newBookingRef, {
        ...booking,
        id: newBookingRef.key // Save the Firebase-generated ID
      });
      
      // Show success message
      toast.success('Your booking has been confirmed!', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      
      setSuccessMessage('Your booking has been confirmed!');
      setIsBookingComplete(true);
      
      // // Redirect to bookings page after 3 seconds
      // setTimeout(() => {
      //   navigate('/bookings');
      // }, 3000);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      
      setError({
        message: 'Failed to create booking. Please try again.',
        isNotFound: false
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (step) => {
    const errors = validateForm(bookingData, step);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
    
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
      <div className="step-indicator-container">
        <div className="step-indicator">
          {/* Progress bar */}
          <div className="progress-bar-container">
            <div 
              className="progress-bar"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
          
          {/* Steps */}
          {steps.map((step) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            const stepClass = isActive ? 'active' : isCompleted ? 'completed' : '';
            
            return (
              <div key={step.number} className={`step ${stepClass}`}>
                <div className="step-number">
                  {isCompleted ? null : step.number}
                </div>
                <span className="step-label">
                  {step.label}
                </span>
              </div>
            );
          })}
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
                    placeholder="+91 "
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{tourPackage?.title || 'Loading package...'}</h3>
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
                    <div className="flex items-start mt-0.5">
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
                            relative mt-1
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
                    <div className="ml-3">
                      <label htmlFor="specialNeeds" className="block text-sm font-medium text-gray-700">Accessibility Requirements</label>
                      <p className="mt-1 text-sm text-gray-500">Check if you or anyone in your group has mobility or accessibility needs</p>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Travel Preferences */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Travel Preferences</h3>
                    <button
                      type="button"
                      onClick={() => setBookingData(prev => ({
                        ...prev,
                        travelPreferences: [],
                        transportationType: '',
                        travelStyle: '',
                        preferredSeating: '',
                        specialRequests: ''
                      }))}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Preferred Mode of Transport</h4>
                    {[
                      { id: 'bus', label: 'Luxury Coach', icon: <FaBus className="mr-2" /> },
                      { id: 'train', label: 'Train (1st Class)', icon: <FaTrain className="mr-2" /> },
                      { id: 'flight', label: 'Flight (Economy)', icon: <FaPlane className="mr-2" /> },
                      { id: 'privateCar', label: 'Private Car', icon: <FaCar className="mr-2" /> },
                      { id: 'cruise', label: 'Cruise', icon: <FaShip className="mr-2" /> }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div className="custom-input-container">
                          <input
                            id={`transport-${item.id}`}
                            name="transportationType"
                            type="radio"
                            checked={bookingData.transportationType === item.id}
                            onChange={() => setBookingData(prev => ({
                              ...prev,
                              transportationType: item.id
                            }))}
                            className="custom-input"
                          />
                          <span className="custom-radio-checkmark"></span>
                        </div>
                        <label htmlFor={`transport-${item.id}`} className="ml-3 flex items-center text-sm font-medium text-gray-700">
                          {item.icon}
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Seating Preference</h4>
                    {[
                      { id: 'window', label: 'Window Seat' },
                      { id: 'aisle', label: 'Aisle Seat' },
                      { id: 'front', label: 'Front of Vehicle' },
                      { id: 'back', label: 'Back of Vehicle' },
                      { id: 'noPreference', label: 'No Preference' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div className="custom-input-container">
                          <input
                            id={`seating-${item.id}`}
                            name="preferredSeating"
                            type="radio"
                            checked={bookingData.preferredSeating === item.id}
                            onChange={() => setBookingData(prev => ({
                              ...prev,
                              preferredSeating: item.id
                            }))}
                            className="custom-input"
                          />
                          <span className="custom-radio-checkmark"></span>
                        </div>
                        <label htmlFor={`seating-${item.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Accommodation Preferences */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Accommodation</h3>
                    <button
                      type="button"
                      onClick={() => setBookingData(prev => ({
                        ...prev,
                        roomType: '',
                        roomView: '',
                        bedType: '',
                        smokingPreference: '',
                        floorPreference: ''
                      }))}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Room Type</h4>
                    {[
                      { id: 'standard', label: 'Standard' },
                      { id: 'deluxe', label: 'Deluxe' },
                      { id: 'suite', label: 'Suite' },
                      { id: 'family', label: 'Family Room' },
                      { id: 'executive', label: 'Executive' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div className="custom-input-container">
                          <input
                            id={`room-${item.id}`}
                            name="roomType"
                            type="radio"
                            checked={bookingData.roomType === item.id}
                            onChange={() => setBookingData(prev => ({
                              ...prev,
                              roomType: item.id
                            }))}
                            className="custom-input"
                          />
                          <span className="custom-radio-checkmark"></span>
                        </div>
                        <label htmlFor={`room-${item.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Room Features</h4>
                    {[
                      { id: 'ac', label: 'Air Conditioning' },
                      { id: 'nonAc', label: 'Non-AC' },
                      { id: 'balcony', label: 'Balcony' },
                      { id: 'oceanView', label: 'Ocean View' },
                      { id: 'cityView', label: 'City View' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div className="custom-input-container">
                          <input
                            id={`feature-${item.id}`}
                            name="roomFeatures"
                            type="checkbox"
                            checked={bookingData.roomFeatures?.includes(item.id) || false}
                            onChange={(e) => {
                              const currentFeatures = bookingData.roomFeatures || [];
                              const isChecked = currentFeatures.includes(item.id);
                              
                              setBookingData(prev => ({
                                ...prev,
                                roomFeatures: isChecked
                                  ? currentFeatures.filter(id => id !== item.id)
                                  : [...currentFeatures, item.id]
                              }));
                            }}
                            className="custom-input"
                          />
                          <span className="custom-checkbox-checkmark"></span>
                        </div>
                        <label htmlFor={`feature-${item.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Bed Type</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'king', label: 'King Bed' },
                        { id: 'queen', label: 'Queen Bed' },
                        { id: 'twin', label: 'Twin Beds' },
                        { id: 'double', label: 'Double Bed' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center">
                          <div className="custom-input-container">
                            <input
                              id={`bed-${item.id}`}
                              name="bedType"
                              type="radio"
                              checked={bookingData.bedType === item.id}
                              onChange={() => setBookingData(prev => ({
                                ...prev,
                                bedType: item.id
                              }))}
                              className="custom-input"
                            />
                            <div className="custom-radio-checkmark"></div>
                          </div>
                          <label htmlFor={`bed-${item.id}`} className="ml-2 block text-sm font-medium text-gray-700">
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 3: Meal & Special Preferences */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Meal Preferences</h3>
                    <button
                      type="button"
                      onClick={() => setBookingData(prev => ({
                        ...prev,
                        mealPreferences: [],
                        dietaryRestrictions: [],
                        foodAllergies: ''
                      }))}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                      {[
                        { id: 'vegetarian', label: 'Vegetarian' },
                        { id: 'vegan', label: 'Vegan' },
                        { id: 'glutenFree', label: 'Gluten-Free' },
                        { id: 'kosher', label: 'Kosher' },
                        { id: 'noRestrictions', label: 'No Dietary Restrictions' }
                      ].map((meal) => (
                        <div key={meal.id} className="flex items-center">
                          <div className="custom-input-container">
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
                                    : [...currentPreferences.filter(id => id !== 'noRestrictions'), meal.id]
                                }));
                              }}
                              className="custom-input"
                            />
                            <span className="custom-checkbox-checkmark"></span>
                          </div>
                          <label htmlFor={`meal-${meal.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                            {meal.label}
                          </label>
                        </div>
                    ))}
                  </div>

                  <div>
                    <label htmlFor="foodAllergies" className="block text-sm font-medium text-gray-700 mb-1">Food Allergies</label>
                    <input
                      type="text"
                      id="foodAllergies"
                      name="foodAllergies"
                      value={bookingData.foodAllergies || ''}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-colors duration-200"
                      placeholder="List any food allergies..."
                    />
                  </div>
                </div>

                {/* Travel Preferences */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Travel Preferences</h3>
                    <button
                      type="button"
                      onClick={() => setBookingData(prev => ({
                        ...prev,
                        travelPreferences: [],
                        accessibilityNeeds: [],
                        specialRequests: ''
                      }))}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Accessibility Needs</h4>
                    {[
                      { id: 'wheelchair', label: 'Wheelchair Accessible' },
                      { id: 'elevator', label: 'Requires Elevator' },
                      { id: 'walkingAid', label: 'Walking Aid Required' },
                      { id: 'hearingAid', label: 'Hearing Loop Required' },
                      { id: 'visualAid', label: 'Visual Assistance Required' },
                      { id: 'none', label: 'No Special Requirements' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div className="custom-input-container">
                          <input
                            id={`access-${item.id}`}
                            name="accessibilityNeeds"
                            type="checkbox"
                            checked={bookingData.accessibilityNeeds?.includes(item.id) || false}
                            onChange={(e) => {
                              const currentAccessibility = bookingData.accessibilityNeeds || [];
                              const isChecked = currentAccessibility.includes(item.id);
                              
                              setBookingData(prev => ({
                                ...prev,
                                accessibilityNeeds: isChecked
                                  ? currentAccessibility.filter(id => id !== item.id)
                                  : [...currentAccessibility.filter(id => id !== 'none'), item.id]
                              }));
                            }}
                            className="custom-input"
                          />
                          <span className="custom-checkbox-checkmark"></span>
                        </div>
                        <label htmlFor={`access-${item.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Travel Style</h4>
                    {[
                      { id: 'leisurely', label: 'Leisurely Pace' },
                      { id: 'moderate', label: 'Moderate Pace' },
                      { id: 'fast', label: 'Fast-Paced' },
                      { id: 'adventure', label: 'Adventure Seeker' },
                      { id: 'relaxed', label: 'Relaxed Experience' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div className="custom-input-container">
                          <input
                            id={`style-${item.id}`}
                            name="travelStyle"
                            type="radio"
                            checked={bookingData.travelStyle === item.id}
                            onChange={() => setBookingData(prev => ({
                              ...prev,
                              travelStyle: item.id
                            }))}
                            className="custom-input"
                          />
                          <span className="custom-radio-checkmark"></span>
                        </div>
                        <label htmlFor={`style-${item.id}`} className="ml-2 block text-sm font-medium text-gray-700">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">Special Requests</label>
                      {bookingData.specialRequests && (
                        <button
                          type="button"
                          onClick={() => setBookingData(prev => ({
                            ...prev,
                            specialRequests: ''
                          }))}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={bookingData.specialRequests || ''}
                      onChange={handleInputChange}
                      rows="3"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-colors duration-200"
                      placeholder="Any special requests or additional information..."
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Meal Preferences */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Meal Preferences</p>
                      <div className="space-y-1">
                        {bookingData.mealPreferences?.length > 0 ? (
                          bookingData.mealPreferences.map(pref => (
                            <p key={pref} className="text-gray-700 capitalize">
                              {pref.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No meal preferences selected</p>
                        )}
                        {bookingData.foodAllergies && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-500">Food Allergies</p>
                            <p className="text-gray-700">{bookingData.foodAllergies}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Room Preferences */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Room Preferences</p>
                      <div className="space-y-1">
                        {bookingData.roomType && (
                          <p className="text-gray-700 capitalize">
                            <span className="text-gray-500">Type:</span> {bookingData.roomType}
                          </p>
                        )}
                        {bookingData.bedType && (
                          <p className="text-gray-700 capitalize">
                            <span className="text-gray-500">Bed:</span> {bookingData.bedType}
                          </p>
                        )}
                        {bookingData.roomFeatures?.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">Room Features:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {bookingData.roomFeatures.map(feature => (
                                <span key={feature} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Accessibility Needs */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Accessibility Needs</p>
                      <div className="space-y-1">
                        {bookingData.accessibilityNeeds?.length > 0 ? (
                          bookingData.accessibilityNeeds.map(need => (
                            <p key={need} className="text-gray-700">
                              {need === 'none' ? 'No special requirements' : 
                               need.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No special accessibility needs</p>
                        )}
                      </div>
                    </div>

                    {/* Travel Style */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Travel Style</p>
                      <p className="text-gray-700 capitalize">
                        {bookingData.travelStyle ? 
                         bookingData.travelStyle.replace(/([A-Z])/g, ' $1').trim() : 
                         'Not specified'}
                      </p>
                    </div>

                    {/* Special Requests */}
                    {bookingData.specialRequests && (
                      <div className="md:col-span-2 space-y-2">
                        <p className="text-sm font-medium text-gray-500">Special Requests</p>
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-gray-700 whitespace-pre-line">{bookingData.specialRequests}</p>
                        </div>
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
    const colors = ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'];
    const sizes = ['w-1.5 h-1.5', 'w-2 h-2', 'w-2.5 h-2.5'];
  
    const confettiArray = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      rotate: `${Math.random() * 360}deg`,
      opacity: Math.random() * 0.5 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)],
    }));

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 print:bg-white">
        
        {/* 🎊 Confetti Animation */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {confettiArray.map(({ id, left, delay, rotate, opacity, color, size }) => (
            <div
              key={id}
              className={`absolute ${size} ${color} rounded-full animate-confetti`}
              style={{
                left,
                top: '-10px',
                animationDelay: delay,
                transform: `rotate(${rotate})`,
                opacity,
              }}
            />
          ))}
        </div>
  
        {/* 🎉 Confirmation Card */}
        <div className="relative z-10 max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:max-w-full print:w-full">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-10 text-center">
            <div className="h-24 w-24 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
              <FaCheck className="h-12 w-12 animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-emerald-100">
              We've sent details to <strong>{bookingData.email || 'your email'}</strong>
            </p>
            <div className="mt-6 flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => window.print()}
                className="px-6 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-medium text-white hover:bg-white/20 flex items-center shadow-sm transition"
              >
                <FaPrint className="mr-2" /> Print Ticket
              </button>
              <Link
                to="/"
                className="px-6 py-2 bg-white text-emerald-600 rounded-full text-sm font-semibold hover:bg-gray-100 flex items-center transition shadow-sm"
              >
                <FaHome className="mr-2" /> Back to Home
              </Link>
            </div>
          </div>
  
          <div className="p-6 md:p-10 space-y-10">
            <div className="border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{tourPackage.title}</h2>
                  <p className="text-sm text-emerald-600 mt-1">Booking #{bookingData.bookingRef}</p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-medium">
                  Confirmed
                </span>
              </div>
            </div>
  
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center justify-center"
              >
                <FaPrint className="mr-2" /> Print Receipt
              </button>
              <button
                onClick={() => navigate('/bookings')}
                className="flex-1 px-6 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition flex items-center justify-center"
              >
                View My Bookings
              </button>
            </div>
          </div>
  
          {/* Print Section - Only visible when printing */}
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-section, .print-section * {
                visibility: visible;
              }
              .print-section {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
            }
          `}</style>
          <div className="print-section hidden print:block p-8 space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">Booking Confirmation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-semibold">Booking Details</h3>
                <p><strong>Ref:</strong> #{bookingData.bookingRef}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Status:</strong> Confirmed</p>
              </div>
              <div>
                <h3 className="font-semibold">Package</h3>
                <p>{tourPackage.title}</p>
                <p><strong>Travel Date:</strong> {new Date(bookingData.date).toLocaleDateString()}</p>
                <p><strong>Duration:</strong> {bookingData.duration} {bookingData.duration === 1 ? 'day' : 'days'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Traveler</h3>
                <p>{bookingData.fullName}</p>
                <p>{bookingData.email}</p>
                <p>{bookingData.phone}</p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {bookingData.adults > 0 && <span className="text-xs bg-blue-100 px-2 py-1 rounded">{bookingData.adults} Adults</span>}
                  {bookingData.children > 0 && <span className="text-xs bg-green-100 px-2 py-1 rounded">{bookingData.children} Children</span>}
                  {bookingData.infants > 0 && <span className="text-xs bg-purple-100 px-2 py-1 rounded">{bookingData.infants} Infants</span>}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Preferences</h3>
                <div className="grid grid-cols-1 gap-1">
                  <p><strong>Meal:</strong> {bookingData.mealPreference || 'Not specified'}</p>
                  <p><strong>Transport:</strong> {bookingData.transportation || 'Not specified'}</p>
                  <p><strong>Accommodation:</strong> {bookingData.accommodation || 'Not specified'}</p>
                  {bookingData.roomType && <p><strong>Room Type:</strong> {bookingData.roomType}</p>}
                  {bookingData.bedType && <p><strong>Bed Type:</strong> {bookingData.bedType}</p>}
                  {bookingData.specialNeeds && <p><strong>Special Needs:</strong> Yes</p>}
                  {bookingData.foodAllergies && <p><strong>Food Allergies:</strong> {bookingData.foodAllergies}</p>}
                  {bookingData.specialRequests && <p><strong>Special Requests:</strong> {bookingData.specialRequests}</p>}
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-2">Important Notes</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Please arrive 15 minutes before the scheduled time</li>
                <li>Bring a valid ID for verification</li>
                <li>Contact us at support@travelita.com for any changes</li>
              </ul>
            </div>
          </div>
          {/* Help Section */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 print:hidden">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-1" fill="currentColor">
                  <path d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0ZM11 7a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-2 2a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9Z" />
                </svg>
                <div className="ml-3 text-sm text-blue-700">
                  <h3 className="font-semibold text-blue-800">Need Help?</h3>
                  <p className="mt-1">For any booking questions, contact:</p>
                  <p className="mt-2">
                    <a href="mailto:support@travelita.com" className="text-blue-800 hover:underline">
                      support@travelita.com
                    </a>{' '}
                    •{' '}
                    <a href="tel:+919567184287" className="text-blue-800 hover:underline">
                      +91 9567184287
                    </a>
                  </p>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  };

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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{tourPackage?.title || 'Loading package...'}</h3>
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
