# Firebase Deployment Guide for Travelita

This guide will help you deploy your Travelita application to Firebase after the conversion from a Node.js/Express backend to a complete Firebase solution.

## Prerequisites

1. A Firebase account (create one at [https://firebase.google.com/](https://firebase.google.com/) if you don't have one)
2. Node.js and npm installed on your machine
3. Firebase CLI installed globally (`npm install -g firebase-tools`)

## Step 1: Set Up Your Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps to create a new project
3. Once your project is created, click on the Web icon (</>) to add a web app to your project
4. Register your app with a nickname (e.g., "Travelita")
5. Copy the Firebase configuration object that appears

## Step 2: Update Your Firebase Configuration

1. Open `src/config/firebase.js` in your project
2. Replace the placeholder configuration with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 3: Set Up Firebase Services

1. **Authentication**: In the Firebase Console, go to Authentication > Sign-in method and enable Email/Password authentication

2. **Firestore Database**: Go to Firestore Database and click "Create database"
   - Choose either production mode or test mode (you can change this later)
   - Select a location for your database (choose one close to your users)

3. **Storage**: Go to Storage and click "Get started"
   - Accept the default rules or customize them
   - Select a location for your storage bucket

## Step 4: Initialize Firebase in Your Project

1. Open a terminal in your project directory
2. Log in to Firebase:
   ```
   firebase login
   ```
3. Initialize Firebase in your project:
   ```
   firebase init
   ```
4. Select the following features:
   - Firestore
   - Hosting
   - Storage
5. Select your Firebase project
6. For Firestore and Storage, accept the default rules file locations
7. For Hosting:
   - Use `dist` as your public directory (this is where Vite builds your app)
   - Configure as a single-page app (SPA)
   - Do not overwrite `index.html`

## Step 5: Deploy Your Application

### Option 1: Manual Deployment

1. Build your application:
   ```
   npm run build
   ```
2. Deploy to Firebase:
   ```
   firebase deploy
   ```

### Option 2: Using the Deployment Script

We've created a deployment script to make this process easier:

1. Run the deployment script:
   ```
   node deploy.js
   ```
2. Follow the prompts to deploy your application

## Step 6: Verify Your Deployment

1. After deployment, Firebase will provide a hosting URL (e.g., `https://your-project-id.web.app`)
2. Visit this URL to verify that your application is working correctly
3. Test all functionality, including:
   - User registration and login
   - Browsing tour packages
   - Creating bookings
   - Admin and vendor functionality

## Troubleshooting

### Common Issues

1. **Authentication Issues**:
   - Make sure Email/Password authentication is enabled in the Firebase Console
   - Check for any security rules that might be blocking access

2. **Firestore Access Issues**:
   - Review your Firestore security rules in `firestore.rules`
   - Make sure they allow the necessary read/write operations

3. **Storage Access Issues**:
   - Review your Storage security rules in `storage.rules`
   - Ensure they allow uploads and downloads as needed

4. **Deployment Failures**:
   - Check that your build process is completing successfully
   - Verify that the `dist` directory contains your built application

### Getting Help

If you encounter issues not covered here:

1. Check the [Firebase documentation](https://firebase.google.com/docs)
2. Visit the [Firebase community forum](https://firebase.google.com/community)
3. Review the error messages in the Firebase Console and deployment logs

## Next Steps

1. Set up custom domains for your Firebase hosting
2. Configure Firebase Authentication with additional providers (Google, Facebook, etc.)
3. Set up Firebase Analytics to track user behavior
4. Implement Firebase Cloud Messaging for push notifications
