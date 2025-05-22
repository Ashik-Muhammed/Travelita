const axios = require('axios');
const http = require('http');

// Test if the port is accessible
function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new http.Socket();
    
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(port, 'localhost');
  });
}

// Test basic API endpoint
async function testBasicEndpoint() {
  try {
    console.log('Testing backend API accessibility...');
    
    // Check if port 5000 is accessible
    const portAccessible = await checkPort(5000);
    console.log('Is port 5000 accessible?', portAccessible);
    
    if (!portAccessible) {
      console.log('Port 5000 is not accessible. The server might not be running.');
      return false;
    }
    
    console.log('Attempting to reach root endpoint...');
    const response = await axios.get('http://localhost:5000/', {
      timeout: 5000
    });
    
    console.log('Root endpoint accessible!');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
    
    return true;
  } catch (error) {
    console.error('Error testing endpoint:');
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Request:', error.request._currentUrl);
      console.error('Error code:', error.code);
    } else {
      console.error('Error message:', error.message);
    }
    
    return false;
  }
}

// Run the test
testBasicEndpoint()
  .then(success => {
    console.log('Test completed with ' + (success ? 'success' : 'failure'));
    
    if (!success) {
      console.log('\nPossible solutions:');
      console.log('1. Make sure the server is running on port 5000');
      console.log('2. Check for any firewall or antivirus blocking the connection');
      console.log('3. Try restarting the server');
      console.log('4. Check if another process is using port 5000');
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
  }); 