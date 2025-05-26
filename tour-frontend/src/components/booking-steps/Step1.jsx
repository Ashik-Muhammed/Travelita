import React from 'react';
import { motion } from 'framer-motion';

const Step1 = ({
  bookingData,
  handleInputChange,
  updateTravelerCount,
  handleNextStep,
  tourPackage,
  minDateFormatted,
  maxDateFormatted,
  totalPrice,
  handleSubmit
}) => {
  return (
    <motion.div 
      key="step-1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 p-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600 max-w-lg mx-auto">We'll use this information to send you booking confirmation and important updates about your trip.</p>
      </div>

      {/* Personal Information Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={bookingData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={bookingData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={bookingData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="travelDate" className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
            <input
              type="date"
              id="travelDate"
              name="travelDate"
              value={bookingData.travelDate}
              min={minDateFormatted}
              max={maxDateFormatted}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Traveler Count */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Number of Travelers</h3>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => updateTravelerCount('decrement')}
            disabled={bookingData.travelerCount <= 1}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xl font-semibold w-8 text-center">{bookingData.travelerCount}</span>
          <button
            type="button"
            onClick={() => updateTravelerCount('increment')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Price Summary</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{tourPackage.name} x {bookingData.travelerCount} {bookingData.travelerCount === 1 ? 'person' : 'people'}</span>
          <span className="font-medium">${(tourPackage.price * bookingData.travelerCount).toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 my-2"></div>
        <div className="flex justify-between items-center font-bold text-lg">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={handleNextStep}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Next: Travel Details
        </button>
      </div>
    </motion.div>
  );
};

export default Step1;
