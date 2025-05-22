import axios from 'axios';

// Use relative URL to leverage Vite proxy
const API_URL = '/api';

export const fetchPackages = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/packages`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
};

export const getPackage = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/packages/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching package ${id}:`, error);
    throw error;
  }
};

export const createPackage = (data, token) =>
  axios.post(`${API_URL}/packages`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
