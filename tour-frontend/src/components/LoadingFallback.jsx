import React from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import './LoadingFallback.css';

const LoadingFallback = ({ type, count, className }) => {
  if (type) {
    return <LoadingSkeleton type={type} count={count} className={className} />;
  }
  
  return (
    <div className="loading-fallback">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading content...</p>
    </div>
  );
};

// Default props
LoadingFallback.defaultProps = {
  type: null,
  count: 1,
  className: ''
};

export default LoadingFallback;
