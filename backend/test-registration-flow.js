const axios = require('axios');

// Random email to avoid duplicates
const testEmail = `test.user.${Date.now()}@example.com`;
const testPassword = 'password123';
const testName = 'Test User';

async function testRegistrationAndLogin() {
  try {
    console.log('Testing registration with:', {
      email: testEmail,
      password: '[HIDDEN]',
      name: testName
    });
    
    // Step 1: Register a new user
    const registrationResponse = await axios.post('http://localhost:5000/api/auth/register', {
      email: testEmail,
      password: testPassword,
      name: testName
    });
    
    console.log('Registration successful!');
    console.log('Status:', registrationResponse.status);
    console.log('Response data:', registrationResponse.data);
    
    // Step 2: Wait a bit and then try logging in with the new credentials
    console.log('\nWaiting 2 seconds before testing login...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\nTesting login with newly created user:', {
      email: testEmail,
      password: '[HIDDEN]'
    });
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: testEmail,
      password: testPassword
    });
    
    console.log('Login successful!');
    console.log('Status:', loginResponse.status);
    console.log('Response data:', loginResponse.data);
    
    return true;
  } catch (error) {
    console.error('Test failed with error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request made but no response received');
      console.error(error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return false;
  }
}

testRegistrationAndLogin().then(success => {
  console.log('\nTest result:', success ? 'PASSED' : 'FAILED');
}); 