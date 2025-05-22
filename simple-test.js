const axios = require('axios');

async function testConnection() {
  try {
    console.log('Testing connection to backend server...');
    
    const response = await axios.get('http://localhost:5000/');
    console.log('Connection successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return true;
  } catch (error) {
    console.error('Connection failed!');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('The server is not running or the port is blocked.');
    } else if (error.response) {
      console.error('Server returned an error:', error.response.status);
    } else {
      console.error('Error:', error.message);
    }
    
    return false;
  }
}

// Test the auth login endpoint
async function testAuthLogin() {
  try {
    console.log('\nTesting auth login endpoint...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@gmail.com',
      password: 'admin'
    });
    
    console.log('Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data (token hidden):', {
      ...response.data,
      token: response.data.token ? '[HIDDEN]' : undefined
    });
    
    return true;
  } catch (error) {
    console.error('Login failed!');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('The server is not running or the port is blocked.');
    } else if (error.response) {
      console.error('Server returned an error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    
    return false;
  }
}

// Run the tests
async function runTests() {
  const connectionResult = await testConnection();
  
  if (connectionResult) {
    await testAuthLogin();
  }
  
  console.log('\nTests completed.');
}

runTests().catch(console.error); 