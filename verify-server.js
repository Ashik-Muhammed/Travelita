const http = require('http');
const axios = require('axios');

async function checkServerStatus() {
  console.log('Checking server status...');
  
  try {
    // Check if server is running
    const serverResponse = await axios.get('http://localhost:5000/');
    console.log('Backend server is running.');
    console.log('Response:', serverResponse.data);
    
    // Test admin login
    console.log('\nTesting admin login...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@gmail.com',
        password: 'admin'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Login successful!');
      console.log('Status:', loginResponse.status);
      console.log('User role:', loginResponse.data.user.role);
      console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
      
      return true;
    } catch (loginError) {
      console.error('Login failed:');
      if (loginError.response) {
        console.error('Response status:', loginError.response.status);
        console.error('Response data:', loginError.response.data);
      } else {
        console.error('Error:', loginError.message);
      }
      return false;
    }
  } catch (error) {
    console.error('Server check failed:');
    console.error('Error:', error.message);
    return false;
  }
}

checkServerStatus(); 