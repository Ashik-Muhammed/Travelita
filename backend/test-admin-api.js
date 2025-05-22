const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Testing admin login API...');
    
    const response = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'admin@gmail.com',
      password: 'admin'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Status:', response.status);
    console.log('Response data:', {
      ...response.data,
      token: response.data.token ? '[REDACTED]' : undefined
    });
    
    return true;
  } catch (error) {
    console.error('Error testing admin login:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
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
testAdminLogin()
  .then(success => {
    console.log('Test completed with ' + (success ? 'success' : 'failure'));
  })
  .catch(err => {
    console.error('Unexpected error:', err);
  }); 