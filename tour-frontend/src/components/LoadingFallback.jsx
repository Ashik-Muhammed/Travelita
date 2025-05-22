import React from 'react';

const LoadingFallback = () => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: 'calc(100vh - var(--header-height))',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingFallback;
