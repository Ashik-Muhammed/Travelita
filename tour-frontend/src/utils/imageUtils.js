/**
 * Utility functions for handling images in the application
 * Designed to work with Firebase Realtime Database
 */

/**
 * Returns a fallback image URL from Unsplash if the provided URL is invalid or missing
 * @param {string} imageUrl - The original image URL
 * @param {string} category - Optional category for the Unsplash image (default: 'travel')
 * @param {string} size - Optional size for the image (default: '300x200')
 * @returns {string} - A valid image URL
 */
export const getFallbackImage = (imageUrl, category = 'travel', size = '300x200') => {
  // If no image URL is provided, return an Unsplash random image
  if (!imageUrl) {
    return `https://source.unsplash.com/random/${size}/?${category}`;
  }
  
  // Handle problematic URLs
  if (
    imageUrl.includes('placeholder.com') || 
    imageUrl.includes('localhost:5000') || 
    imageUrl.includes('uploads/') || 
    imageUrl.includes('undefined')
  ) {
    return `https://source.unsplash.com/random/${size}/?${category}`;
  }
  
  // If the URL doesn't start with http/https, assume it's a relative path or incomplete URL
  if (!imageUrl.startsWith('http')) {
    return `https://source.unsplash.com/random/${size}/?${category}`;
  }
  
  // Otherwise, return the original image URL
  return imageUrl;
};

/**
 * Processes an array of image URLs to ensure they are valid
 * @param {Array} images - Array of image URLs
 * @param {string} category - Optional category for the Unsplash image (default: 'travel')
 * @returns {Array} - Array of processed image URLs
 */
export const processImageArray = (images, category = 'travel') => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    // Return an array with a single fallback image
    return [`https://source.unsplash.com/random/800x600/?${category}`];
  }
  
  // Process each image in the array
  return images.map((img, index) => {
    if (!img) {
      return `https://source.unsplash.com/random/800x600/?${category},${index}`;
    }
    
    // If the image URL is from localhost:5000 or placeholder.com, replace it
    if (img.includes('localhost:5000') || img.includes('placeholder.com')) {
      return `https://source.unsplash.com/random/800x600/?${category},${index}`;
    }
    
    return img;
  });
};

/**
 * Creates an image error handler that sets a fallback image
 * @param {string} category - Optional category for the Unsplash image (default: 'travel')
 * @returns {Function} - An onError handler for image elements
 */
export const createImageErrorHandler = (category = 'travel') => {
  return (e) => {
    e.target.onerror = null; // Prevent infinite error loop
    e.target.src = `https://source.unsplash.com/random/300x200/?${category}`;
  };
};
