# Firebase Setup Guide for Travelita

## Introduction

This guide will help you set up your Firebase project and properly configure your Travelita application to work with Firebase. Follow these steps to resolve the configuration errors you're currently experiencing.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps to create a new project
3. Give your project a name (e.g., "Travelita")
4. Choose whether to enable Google Analytics (recommended)
5. Accept the terms and click "Create project"

## Step 2: Register Your Web App

1. Once your project is created, click on the Web icon (</>) on the project overview page
2. Register your app with a nickname (e.g., "Travelita Web")
3. Check the box for "Also set up Firebase Hosting" if you plan to deploy to Firebase Hosting
4. Click "Register app"
5. You'll be presented with your Firebase configuration object - **SAVE THIS INFORMATION**

## Step 3: Configure Your Application

1. Create a `.env` file in your project root (tour-frontend directory) by copying the provided `.env.example` file:

```bash
cp .env.example .env
```

2. Open the `.env` file and replace the placeholder values with your actual Firebase configuration values:

```
REACT_APP_FIREBASE_API_KEY=your_actual_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

3. Alternatively, you can directly update the `src/config/firebase.js` file with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your_actual_api_key_here",
  authDomain: "your_project_id.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project_id.appspot.com",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id"
};
```

## Step 4: Enable Authentication

1. In the Firebase Console, go to Authentication > Sign-in method
2. Enable Email/Password authentication:
   - Click on "Email/Password"
   - Toggle the "Enable" switch to on
   - Click "Save"

## Step 5: Set Up Firestore Database

1. In the Firebase Console, go to Firestore Database
2. Click "Create database"
3. Choose either "Start in production mode" or "Start in test mode" (you can change this later)
   - Production mode requires you to set up security rules
   - Test mode allows read/write access to anyone for 30 days
4. Select a location for your database (choose one close to your users)
5. Click "Enable"

## Step 6: Set Up Storage

1. In the Firebase Console, go to Storage
2. Click "Get started"
3. Choose either "Start in production mode" or "Start in test mode"
4. Click "Next"
5. Select a location for your storage bucket
6. Click "Done"

## Step 7: Initialize Firebase in Your Project

1. Install the Firebase CLI if you haven't already:

```bash
npm install -g firebase-tools
```

2. Log in to Firebase:

```bash
firebase login
```

3. Initialize Firebase in your project:

```bash
firebase init
```

4. Select the following features:
   - Firestore
   - Hosting
   - Storage
5. Select your Firebase project
6. Accept the default file locations for Firestore and Storage rules
7. For Hosting configuration:
   - Use `dist` as your public directory
   - Configure as a single-page app (SPA)
   - Do not overwrite `index.html`

## Step 8: Fix Common Issues

### Registration Error

If you're seeing the error `Firebase: Error (auth/invalid-value-(password),-starting-an-object-on-a-scalar-field)`, it means there's a mismatch between how the `registerUser` function is defined and how it's being called. We've already fixed this issue by updating the Register.jsx component.

### Firestore Connection Errors

If you're seeing errors like `Failed to load resource: the server responded with a status of 400 ()` for Firestore connections, it's because your Firebase configuration is still using placeholder values. Make sure to update your configuration as described in Step 3.

## Step 9: Test Your Application

1. Restart your development server:

```bash
npm run dev
```

2. Try registering a new user
3. Test the login functionality
4. Verify that you can view tour packages and other data

## Step 10: Deploy Your Application

Once everything is working correctly, you can deploy your application to Firebase Hosting:

1. Build your application:

```bash
npm run build
```

2. Deploy to Firebase:

```bash
firebase deploy
```

Alternatively, you can use the provided deployment script:

```bash
node deploy.js
```

## Troubleshooting

### Environment Variables Not Loading

If your environment variables aren't being loaded correctly, you may need to prefix them with `VITE_` instead of `REACT_APP_` since Vite uses a different naming convention:

```
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
...
```

And then update your firebase.js file to use these variables:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  ...
};
```

### Security Rules

If you're having issues with permissions, check your Firestore and Storage security rules. The rules files we've created (`firestore.rules` and `storage.rules`) should provide a good starting point, but you may need to adjust them based on your specific requirements.

### Still Having Issues?

If you're still experiencing problems after following these steps, try the following:

1. Check the Firebase documentation: [https://firebase.google.com/docs](https://firebase.google.com/docs)
2. Look for error messages in your browser's console
3. Verify that your Firebase project is properly set up in the Firebase Console
4. Make sure your Firebase billing plan supports the features you're trying to use
