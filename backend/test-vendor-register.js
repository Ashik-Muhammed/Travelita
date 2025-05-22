const axios = require('axios');

const testVendorRegistration = async () => {
  try {
    console.log('Testing vendor registration...');
    
    const testVendor = {
      name: 'Test Vendor',
      email: 'test@vendor.com',
      password: 'password123',
      companyName: 'Test Company',
      phone: '1234567890',
      address: 'Test Address'
    };
    
    console.log('Sending registration request with data:', testVendor);
    
    const response = await axios.post('http://localhost:5000/api/vendors/register', testVendor);
    
    console.log('Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('Registration failed with error:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Request details:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
  }
};

testVendorRegistration(); 