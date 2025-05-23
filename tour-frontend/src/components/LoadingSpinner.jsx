import React from 'react';
import PropTypes from 'prop-types';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', color = 'primary', className = '', fullPage = false }) => {
  const sizeClass = `spinner-${size}`;
  const colorClass = `spinner-${color}`;
  const fullPageClass = fullPage ? 'full-page' : '';

  return (
    <div className={`loading-spinner ${sizeClass} ${colorClass} ${fullPageClass} ${className}`}>
      <div className="spinner">
        <div className="spinner-inner"></div>
      </div>
      {fullPage && <div className="spinner-overlay"></div>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'light', 'dark', 'white']),
  className: PropTypes.string,
  fullPage: PropTypes.bool,
};

export default LoadingSpinner;
