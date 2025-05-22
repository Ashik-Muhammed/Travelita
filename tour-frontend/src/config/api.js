import axios from 'axios';
import { API_CONFIG } from './constants';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies and auth headers
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear local storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('vendorToken');
          localStorage.removeItem('vendorInfo');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - redirect to unauthorized page
          window.location.href = '/unauthorized';
          break;
        case 404:
          console.error('API endpoint not found:', error.config.url);
          break;
        default:
          // Handle other errors
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default api; 