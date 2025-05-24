import React from 'react';
import './BackgroundPattern.css';

/**
 * BackgroundPattern component adds a visually appealing background pattern to pages
 * It creates an overlay with geometric patterns that doesn't interfere with content
 */
const BackgroundPattern = ({ variant = 'default' }) => {
  // Different pattern classes based on the variant prop
  const patternClass = {
    default: 'bg-pattern-default',
    travel: 'bg-pattern-travel',
    booking: 'bg-pattern-booking',
    dashboard: 'bg-pattern-dashboard'
  }[variant] || 'bg-pattern-default';
  
  return (
    <div className={`background-pattern ${patternClass}`}>
      <div className="pattern-overlay"></div>
    </div>
  );
};

export default BackgroundPattern;
