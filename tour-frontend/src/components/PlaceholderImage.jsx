import React from 'react';

const PlaceholderImage = ({ className = '', width = '100%', height = '200px' }) => (
  <div 
    className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className}`}
    style={{ width, height }}
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="48" 
      height="48" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="opacity-50"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  </div>
);

export default PlaceholderImage;
