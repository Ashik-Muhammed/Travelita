import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './utils/fixPlaceholders'; // Import the placeholder fix script

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
