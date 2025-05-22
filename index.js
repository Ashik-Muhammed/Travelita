const path = require('path');
const fs = require('fs');

// Set the working directory to the backend folder
const backendPath = path.join(__dirname, 'backend');
process.chdir(backendPath);

// Add the backend directory to the module search path
module.paths.unshift(backendPath);
module.paths.unshift(path.join(backendPath, 'node_modules'));

// Set NODE_PATH to include the backend directory for module resolution
process.env.NODE_PATH = backendPath;
require('module').Module._initPaths();

// Create a symbolic link from user.js to User.js if it doesn't exist
const userModelPath = path.join(backendPath, 'models', 'User.js');
const userModelLowerPath = path.join(backendPath, 'models', 'user.js');

if (fs.existsSync(userModelPath) && !fs.existsSync(userModelLowerPath)) {
  try {
    fs.symlinkSync(userModelPath, userModelLowerPath);
    console.log('Created symbolic link for User model');
  } catch (err) {
    console.warn('Could not create symbolic link:', err.message);
  }
}

// Log the module paths for debugging
console.log('Module search paths:', module.paths);
console.log('Current working directory:', process.cwd());
console.log('User model path exists:', fs.existsSync(userModelPath));
console.log('User model lowercase path exists:', fs.existsSync(userModelLowerPath));

// Require the server using absolute path
require(path.join(backendPath, 'server.js')); 