# Firebase Realtime Database Integration Guide

## Overview

This guide explains how to use Firebase Realtime Database in your Travelita application instead of Firestore and Storage to reduce costs. The Realtime Database is a NoSQL cloud database that lets you store and sync data between your users in realtime.

## Configuration

We've already updated your Firebase configuration in `src/config/firebase.js` to include Realtime Database:

```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAz0u0GhAOYtNYBub_TrzaeTCUvnZVfZ6M",
  authDomain: "travelita-be5ad.firebaseapp.com",
  projectId: "travelita-be5ad",
  databaseURL: "https://travelita-be5ad-default-rtdb.firebaseio.com",
  storageBucket: "travelita-be5ad.appspot.com",
  messagingSenderId: "419210854770",
  appId: "1:419210854770:web:58f3e13ca864b3c0baddeb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { auth, db, rtdb };
export default app;
```

## Basic Operations with Realtime Database

### 1. Reading Data

```javascript
import { ref, get, child } from "firebase/database";
import { rtdb } from "../config/firebase";

// Read data once
const fetchTourPackage = async (packageId) => {
  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, `tourPackages/${packageId}`));
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Listen for real-time updates
import { ref, onValue } from "firebase/database";

const listenToPackages = (callback) => {
  const packagesRef = ref(rtdb, 'tourPackages');
  return onValue(packagesRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};
```

### 2. Writing Data

```javascript
import { ref, set, push, update, remove } from "firebase/database";
import { rtdb } from "../config/firebase";

// Create or update data
const saveTourPackage = async (packageId, packageData) => {
  try {
    const packageRef = ref(rtdb, `tourPackages/${packageId}`);
    await set(packageRef, packageData);
    return packageId;
  } catch (error) {
    console.error("Error saving package:", error);
    throw error;
  }
};

// Generate a new unique ID and save data
const createTourPackage = async (packageData) => {
  try {
    const packagesRef = ref(rtdb, 'tourPackages');
    const newPackageRef = push(packagesRef);
    await set(newPackageRef, packageData);
    return newPackageRef.key; // Return the generated ID
  } catch (error) {
    console.error("Error creating package:", error);
    throw error;
  }
};

// Update specific fields
const updatePackageFields = async (packageId, updates) => {
  try {
    const packageRef = ref(rtdb, `tourPackages/${packageId}`);
    await update(packageRef, updates);
    return packageId;
  } catch (error) {
    console.error("Error updating package:", error);
    throw error;
  }
};

// Delete data
const deletePackage = async (packageId) => {
  try {
    const packageRef = ref(rtdb, `tourPackages/${packageId}`);
    await remove(packageRef);
    return true;
  } catch (error) {
    console.error("Error deleting package:", error);
    throw error;
  }
};
```

### 3. Querying Data

Realtime Database has more limited querying capabilities compared to Firestore. Here's how to implement common queries:

```javascript
import { ref, query, orderByChild, equalTo, limitToFirst, get } from "firebase/database";
import { rtdb } from "../config/firebase";

// Get featured packages
const getFeaturedPackages = async (limit = 6) => {
  try {
    const packagesRef = ref(rtdb, 'tourPackages');
    const featuredQuery = query(
      packagesRef,
      orderByChild('featured'),
      equalTo(true),
      limitToFirst(limit)
    );
    
    const snapshot = await get(featuredQuery);
    const packages = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        packages.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    return packages;
  } catch (error) {
    console.error("Error fetching featured packages:", error);
    throw error;
  }
};
```

## Handling File Uploads

Since you're not using Firebase Storage, you have a few options for handling file uploads:

1. **Base64 Encoding**: Convert images to base64 strings and store them directly in the Realtime Database (not recommended for large files)

2. **External Storage Services**: Use free tiers of services like Cloudinary or Imgur for image hosting

3. **Use Firebase Storage Sparingly**: Only use Storage for critical files and implement strict quotas

## Data Structure

Realtime Database is a giant JSON tree, so structure your data efficiently:

```
{
  "users": {
    "user1": {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  },
  "tourPackages": {
    "package1": {
      "title": "Beach Getaway",
      "description": "Relaxing beach vacation",
      "price": 299,
      "featured": true,
      "vendorId": "user2"
    }
  },
  "bookings": {
    "booking1": {
      "userId": "user1",
      "packageId": "package1",
      "date": "2025-06-15",
      "status": "confirmed"
    }
  }
}
```

## Security Rules

We've created a `database.rules.json` file with permissive rules for development:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

For production, you should implement more restrictive rules.

## Deploying Rules

To deploy your Realtime Database rules:

```bash
firebase deploy --only database
```

Or update them manually through the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Realtime Database > Rules
4. Update the rules and publish

## Next Steps

1. Update your services to use Realtime Database instead of Firestore
2. Implement proper data validation and error handling
3. Test your application thoroughly
4. Deploy your application to Firebase Hosting
