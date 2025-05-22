const axios = require('axios');

async function testAdminStats() {
  try {
    console.log('1. Testing admin login first...');
    
    // Step 1: Admin login to get token
    const loginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'admin@gmail.com',
      password: 'admin'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Status:', loginResponse.status);
    console.log('Response data (user only):', {
      user: loginResponse.data.user
    });
    
    const token = loginResponse.data.token;
    
    if (!token) {
      console.error('No token received from login');
      return false;
    }
    
    console.log('2. Testing admin stats endpoint with token...');
    
    // Step 2: Use token to access admin stats endpoint
    const statsResponse = await axios.get('http://localhost:5000/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Stats request successful!');
    console.log('Status:', statsResponse.status);
    console.log('Stats data:', statsResponse.data);
    
    return true;
  } catch (error) {
    console.error('Error in test:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    return false;
  }
}

// Run the test
testAdminStats()
  .then(success => {
    console.log('Test completed with ' + (success ? 'success' : 'failure'));
  })
  .catch(err => {
    console.error('Unexpected error:', err);
  }); 