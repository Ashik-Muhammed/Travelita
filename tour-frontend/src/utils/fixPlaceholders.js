/**
 * Script to fix all placeholder images across the application
 * This script will be imported and run once when the application starts
 */

import { getFallbackImage, processImageArray, createImageErrorHandler } from './imageUtils';

/**
 * Fixes all placeholder images in the document by adding error handlers
 * and replacing problematic src attributes
 */
export const fixAllPlaceholderImages = () => {
  // Run on document load
  document.addEventListener('DOMContentLoaded', () => {
    // Initial fix for all images
    fixImagesInDocument();
    
    // Set up a mutation observer to watch for new images being added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // Check if any of the added nodes are images or contain images
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // ELEMENT_NODE
              if (node.tagName === 'IMG') {
                fixImage(node);
              } else if (node.getElementsByTagName) {
                const images = node.getElementsByTagName('img');
                Array.from(images).forEach(fixImage);
              }
            }
          });
        }
      });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('Placeholder image fix initialized');
  });
};

/**
 * Fixes all images in the current document
 */
const fixImagesInDocument = () => {
  const images = document.getElementsByTagName('img');
  Array.from(images).forEach(fixImage);
};

/**
 * Fixes a single image element by adding error handling and replacing problematic sources
 * @param {HTMLImageElement} imgElement - The image element to fix
 */
const fixImage = (imgElement) => {
  // Skip if already processed
  if (imgElement.dataset.fixed === 'true') return;
  
  // Get current src
  const currentSrc = imgElement.src;
  
  // Check if the source is problematic
  if (
    !currentSrc ||
    currentSrc.includes('placeholder.com') ||
    currentSrc.includes('localhost:5000') ||
    currentSrc.includes('uploads/') ||
    currentSrc.includes('undefined')
  ) {
    // Get image dimensions from the element or use defaults
    const width = imgElement.width || 300;
    const height = imgElement.height || 200;
    const size = `${width}x${height}`;
    
    // Get category from alt text or use default
    const category = imgElement.alt ? 
      imgElement.alt.toLowerCase().replace(/\s+/g, ',') : 
      'travel';
    
    // Set new src
    imgElement.src = getFallbackImage(null, category, size);
  }
  
  // Add error handler
  imgElement.onerror = function() {
    // Get image dimensions from the element or use defaults
    const width = this.width || 300;
    const height = this.height || 200;
    const size = `${width}x${height}`;
    
    // Get category from alt text or use default
    const category = this.alt ? 
      this.alt.toLowerCase().replace(/\s+/g, ',') : 
      'travel';
    
    // Replace with fallback image
    this.src = getFallbackImage(null, category, size);
    
    // Prevent infinite error loop
    this.onerror = null;
  };
  
  // Mark as fixed
  imgElement.dataset.fixed = 'true';
};

/**
 * Initialize the fix
 */
fixAllPlaceholderImages();

export default fixAllPlaceholderImages;
