import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { rtdb } from '../config/firebase';
import { ref, get, push, set } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import step components
import Step1 from '../components/booking-steps/Step1';
import Step4 from '../components/booking-steps/Step4';

const BookingPage = () => {
  const { id: packageId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tourPackage, setTourPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking data state
  const [bookingData, setBookingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    travelDate: '',
    travelerCount: 1,
    specialRequests: '',
    // Add other fields as needed
  });

  // Calculate total price
  const totalPrice = tourPackage ? tourPackage.price * bookingData.travelerCount : 0;

  // Format dates for the date input
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDate = new Date(today.setMonth(today.getMonth() + 6)).toISOString().split('T')[0];

  // Fetch package details
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const packageRef = ref(rtdb, `packages/${packageId}`);
        const snapshot = await get(packageRef);
        
        if (snapshot.exists()) {
          setTourPackage({ id: snapshot.key, ...snapshot.val() });
          
          // Pre-fill user data if logged in
          if (currentUser) {
            setBookingData(prev => ({
              ...prev,
              fullName: currentUser.displayName || '',
              email: currentUser.email || ''
            }));
          }
        } else {
          toast.error('Package not found');
          navigate('/packages');
        }
      } catch (error) {
        console.error('Error fetching package:', error);
        toast.error('Failed to load package details');
        navigate('/packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId, currentUser, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update traveler count
  const updateTravelerCount = (action) => {
    setBookingData(prev => ({
      ...prev,
      travelerCount: action === 'increment' 
        ? Math.min(prev.travelerCount + 1, 10) 
        : Math.max(prev.travelerCount - 1, 1)
    }));
  };

  // Navigation between steps
  const handleNextStep = () => {
    // Add validation here if needed
    setCurrentStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create booking object
      const booking = {
        ...bookingData,
        packageId: tourPackage.id,
        packageName: tourPackage.name,
        totalPrice,
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: currentUser?.uid || 'guest',
      };

      // Save to Firebase
      const bookingsRef = ref(rtdb, 'bookings');
      const newBookingRef = push(bookingsRef);
      await set(newBookingRef, booking);
      
      // Show success message
      toast.success('Booking confirmed! Check your email for details.');
      
      // Redirect to confirmation page or home
      navigate('/thank-you', { state: { bookingId: newBookingRef.key } });
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center">
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              } font-medium`}
            >
              {step}
            </div>
            {step < 4 && (
              <div className={`h-1 w-16 ${
                currentStep > step ? 'bg-indigo-600' : 'bg-gray-200'
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // Main render function
  const renderCurrentStep = () => {
    const commonProps = {
      bookingData,
      handleInputChange,
      updateTravelerCount,
      handleNextStep,
      handlePreviousStep,
      handleSubmit,
      tourPackage,
      minDate,
      maxDate,
      totalPrice,
      isSubmitting
    };

    switch(currentStep) {
      case 1:
        return <Step1 {...commonProps} />;
      case 4:
        return <Step4 {...commonProps} />;
      default:
        return <div>Step not found</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!tourPackage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Package not found</h2>
          <p className="text-gray-600 mb-6">The package you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/packages')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Browse Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Step Indicator */}
        {renderStepIndicator()}
        
        {/* Main Form */}
        <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            {renderCurrentStep()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
