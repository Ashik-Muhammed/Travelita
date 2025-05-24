import React, { useState, useEffect, useRef } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholderSrc = '/placeholder.jpg',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholderSrc);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef();

  useEffect(() => {
    // Start loading the actual image
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      // When image is loaded, update the source
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      // If image fails to load, keep the placeholder
      console.error(`Failed to load image: ${src}`);
      setIsLoading(false);
    };

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  // Calculate aspect ratio for padding-bottom
  const aspectRatio = (height / width) * 100;

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        paddingBottom: `${aspectRatio}%`,
        width: '100%',
        backgroundColor: isLoading ? '#f3f4f6' : 'transparent',
      }}
    >
      <LazyLoadImage
        src={imageSrc}
        alt={alt || ''}
        width="100%"
        height="100%"
        effect="blur"
        placeholderSrc={placeholderSrc}
        wrapperClassName="absolute inset-0 w-full h-full object-cover"
        style={{
          transition: 'opacity 0.3s ease-in-out',
          opacity: isLoading ? 0 : 1,
        }}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse rounded-full bg-gray-200 h-8 w-8"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
