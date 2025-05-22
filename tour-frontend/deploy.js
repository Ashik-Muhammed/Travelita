const { exec } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Check if firebase.json exists
if (!fs.existsSync(path.join(__dirname, 'firebase.json'))) {
  console.log(`${colors.red}${colors.bright}Error: firebase.json not found.${colors.reset}`);
  console.log(`Please run 'firebase init' first to initialize Firebase in this project.`);
  process.exit(1);
}

// Check if firestore.rules exists
if (!fs.existsSync(path.join(__dirname, 'firestore.rules'))) {
  console.log(`${colors.yellow}${colors.bright}Warning: firestore.rules not found.${colors.reset}`);
  console.log(`Make sure you have security rules set up for Firestore.`);
}

// Check if storage.rules exists
if (!fs.existsSync(path.join(__dirname, 'storage.rules'))) {
  console.log(`${colors.yellow}${colors.bright}Warning: storage.rules not found.${colors.reset}`);
  console.log(`Make sure you have security rules set up for Storage.`);
}

// Check if firebase config is set up
const configPath = path.join(__dirname, 'src', 'config', 'firebase.js');
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  if (configContent.includes('apiKey: "YOUR_API_KEY"') || 
      configContent.includes('apiKey: ""') || 
      configContent.includes('projectId: "YOUR_PROJECT_ID"')) {
    console.log(`${colors.red}${colors.bright}Error: Firebase configuration not set up.${colors.reset}`);
    console.log(`Please update the Firebase configuration in src/config/firebase.js with your project details.`);
    process.exit(1);
  }
} else {
  console.log(`${colors.red}${colors.bright}Error: Firebase configuration file not found.${colors.reset}`);
  console.log(`Please create src/config/firebase.js with your Firebase configuration.`);
  process.exit(1);
}

console.log(`${colors.cyan}${colors.bright}=== Travelita Firebase Deployment ===${colors.reset}`);
console.log(`This script will build and deploy your React application to Firebase.`);

rl.question(`${colors.yellow}Do you want to proceed with deployment? (y/n) ${colors.reset}`, (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('Deployment cancelled.');
    rl.close();
    return;
  }

  console.log(`\n${colors.cyan}${colors.bright}Step 1: Building the React application...${colors.reset}`);
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error(`${colors.red}Build error: ${error.message}${colors.reset}`);
      rl.close();
      return;
    }
    
    console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log(`${colors.green}${colors.bright}Build completed successfully!${colors.reset}`);
    console.log(`\n${colors.cyan}${colors.bright}Step 2: Deploying to Firebase...${colors.reset}`);
    
    exec('firebase deploy', (error, stdout, stderr) => {
      if (error) {
        console.error(`${colors.red}Deployment error: ${error.message}${colors.reset}`);
        rl.close();
        return;
      }
      
      console.log(stdout);
      if (stderr) console.error(stderr);
      
      console.log(`\n${colors.green}${colors.bright}Deployment completed successfully!${colors.reset}`);
      console.log(`Your application is now live on Firebase.`);
      
      // Extract hosting URL from stdout
      const hostingUrlMatch = stdout.match(/Hosting URL: (https:\/\/[^\s]+)/);
      if (hostingUrlMatch && hostingUrlMatch[1]) {
        console.log(`\n${colors.bright}Visit your application at: ${colors.cyan}${hostingUrlMatch[1]}${colors.reset}`);
      }
      
      rl.close();
    });
  });
});

rl.on('close', () => {
  process.exit(0);
});
