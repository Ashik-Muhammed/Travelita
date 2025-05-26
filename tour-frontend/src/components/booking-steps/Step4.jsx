import React from 'react';
import { motion } from 'framer-motion';

const Step4 = ({
  bookingData,
  tourPackage,
  totalPrice,
  handleSubmit,
  handlePreviousStep
}) => {
  return (
    <motion.div 
      key="step-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 p-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
        <p className="text-gray-600 max-w-lg mx-auto">Please review your booking details before confirmation</p>
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h3>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-900">Tour Package</h4>
            <p className="text-gray-600">{tourPackage.name}</p>
            <p className="text-gray-600">{tourPackage.duration} days • {tourPackage.destination}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">Travel Date</h4>
              <p className="text-gray-600">{new Date(bookingData.travelDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Travelers</h4>
              <p className="text-gray-600">{bookingData.travelerCount} {bookingData.travelerCount === 1 ? 'person' : 'people'}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Price Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price</span>
                <span>${tourPackage.price.toFixed(2)} × {bookingData.travelerCount}</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t">
                <span>Total Amount</span>
                <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traveler Information */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Traveler Information</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Primary Traveler</h4>
            <p className="text-gray-600">{bookingData.fullName}</p>
            <p className="text-gray-600">{bookingData.email}</p>
            <p className="text-gray-600">{bookingData.phone}</p>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="text-sm text-gray-600">
        <p className="mb-2">By completing this booking, you agree to our Terms & Conditions and Privacy Policy.</p>
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            className="mt-1 mr-2"
            required
          />
          <label htmlFor="terms">I agree to the terms and conditions</label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Confirm Booking
        </button>
      </div>
    </motion.div>
  );
};

export default Step4;
