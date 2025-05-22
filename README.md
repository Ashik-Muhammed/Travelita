# Travelita

A comprehensive tour package management platform that allows vendors to create and manage tour packages, users to browse and book tours, and administrators to oversee the entire platform.

## Features

- **User Authentication**: Secure login and registration system with Firebase Authentication and role-based access control
- **Package Management**: Create, update, view, and delete tour packages with images, descriptions, itineraries, etc.
- **Admin Dashboard**: Approve/reject tour packages, manage users, and monitor platform activity
- **Vendor Management**: Vendor-specific interfaces to manage their own tour packages
- **Booking System**: Users can browse packages and make bookings

## Tech Stack

- **Frontend**: React.js
- **Database & Backend**: Firebase (Firestore, Authentication, Storage)
- **Hosting**: Firebase Hosting
- **File Uploads**: Firebase Storage
- **Styling**: Custom CSS with responsive design

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Firebase account and project

### Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage
5. Get your Firebase configuration (Project Settings > General > Your Apps > Firebase SDK snippet > Config)
6. Update the Firebase configuration in `src/config/firebase.js`

### Project Setup

```bash
# Navigate to tour-frontend directory
cd tour-frontend

# Install dependencies
npm install

# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in the project (select Hosting, Firestore, and Storage)
firebase init

# Run the development server
npm start
```

### Deployment

```bash
# Build the production version
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

## Project Structure

- `/tour-frontend`: React.js frontend with Firebase
  - `/src/components`: Reusable UI components
  - `/src/pages`: Page components
  - `/src/services`: Firebase service functions
  - `/src/contexts`: React Context providers for Firebase
  - `/src/config`: Configuration files including Firebase setup
  - `/src/assets`: Static assets (images, icons)
  - `firestore.rules`: Security rules for Firestore database
  - `storage.rules`: Security rules for Firebase Storage
  - `firebase.json`: Firebase configuration for deployment

## Contributors

- Ashik - Project Developer 