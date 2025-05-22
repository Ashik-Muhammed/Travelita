# Firebase Configuration Instructions

I noticed you have a Firebase service account key file for project ID `travelita-be5ad`. To properly configure your frontend application, you need to create a `.env` file with the following information.

## Steps to Create Your .env File

1. Create a new file named `.env` in the `tour-frontend` directory
2. Add the following content to the file, replacing the placeholder values with your actual Firebase web app configuration:

```
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=travelita-be5ad.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=travelita-be5ad
VITE_FIREBASE_STORAGE_BUCKET=travelita-be5ad.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=XXXXXXXXXXXX
VITE_FIREBASE_APP_ID=1:XXXXXXXXXXXX:web:XXXXXXXXXXXX
```

## Important Note

The values above are not the same as your service account credentials. You need to get the web app configuration from the Firebase Console:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`travelita-be5ad`)
3. Click on the gear icon (⚙️) next to "Project Overview" to open Project settings
4. Scroll down to the "Your apps" section
5. If you haven't added a web app yet, click on the web icon (</>) to add one
6. In the "SDK setup and configuration" section, you'll find your Firebase configuration object
7. Copy the values from this object to your `.env` file

## Security Warning

Do not include your service account private key in the frontend code or in the `.env` file. The service account credentials you shared are for backend use only and should be kept secure.

The service account key contains sensitive information including a private key that should never be exposed in client-side code or committed to version control.
