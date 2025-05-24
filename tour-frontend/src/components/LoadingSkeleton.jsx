import React from 'react';
import './LoadingSkeleton.css';

export const CardSkeleton = ({ count = 1, className = '' }) => {
  return Array(count).fill(0).map((_, index) => (
    <div key={index} className={`skeleton-card ${className}`}>
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  ));
};

export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`skeleton-text-container ${className}`}>
    {Array(lines).fill(0).map((_, i) => (
      <div key={i} className="skeleton-text-line"></div>
    ))}
  </div>
);

export const ImageSkeleton = ({ className = '' }) => (
  <div className={`skeleton-image-container ${className}`}>
    <div className="skeleton-image"></div>
  </div>
);

const LoadingSkeleton = ({ type = 'card', count = 1, className = '' }) => {
  switch (type) {
    case 'card':
      return <CardSkeleton count={count} className={className} />;
    case 'text':
      return <TextSkeleton className={className} />;
    case 'image':
      return <ImageSkeleton className={className} />;
    default:
      return <CardSkeleton count={count} className={className} />;
  }
};

export default LoadingSkeleton;
