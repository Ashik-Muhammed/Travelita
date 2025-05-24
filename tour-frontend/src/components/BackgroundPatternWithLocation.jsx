import React from 'react';
import { useLocation } from 'react-router-dom';
import BackgroundPattern from './BackgroundPattern';

/**
 * BackgroundPatternWithLocation component
 * Renders a background pattern based on the current URL location
 * It dynamically selects the appropriate pattern variant for different sections of the app
 */
const BackgroundPatternWithLocation = () => {
  const location = useLocation();
  const { pathname } = location;
  
  // Apply different patterns based on the URL path
  let pattern = 'default';
  
  if (pathname.includes('/dashboard') || pathname.includes('/admin')) {
    pattern = 'dashboard';
  } else if (pathname.includes('/booking') || pathname.includes('/packages')) {
    pattern = 'booking';
  } else if (pathname.includes('/login') || pathname.includes('/register')) {
    // Special pattern for auth pages
    pattern = 'default';
  } else {
    pattern = 'travel';
  }
  
  return <BackgroundPattern variant={pattern} />;
};

export default BackgroundPatternWithLocation;
