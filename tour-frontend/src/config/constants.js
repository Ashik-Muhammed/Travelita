// API Configuration
export const API_CONFIG = {
  // In development, this will be empty string since we use Vite's proxy
  // In production, this will be the full URL of our backend
  BASE_URL: import.meta.env.MODE === 'production' 
    ? 'https://travelita-1.onrender.com'
    : '',
  // Add other configuration constants here
}; 