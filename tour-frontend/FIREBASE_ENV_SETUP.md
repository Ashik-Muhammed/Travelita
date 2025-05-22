# Firebase Environment Setup

To set up your Firebase environment variables, create a `.env` file in the root of your tour-frontend directory with the following content:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Replace the placeholder values with your actual Firebase project details from the Firebase Console.

## How to Create the .env File

1. Open a terminal in your project directory
2. Run one of the following commands:

### On Windows:
```
copy .env.example .env
```

### On macOS/Linux:
```
cp .env.example .env
```

3. Open the newly created `.env` file and replace the placeholder values with your actual Firebase configuration

## Finding Your Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the gear icon (⚙️) next to "Project Overview" to open Project settings
4. Scroll down to the "Your apps" section
5. If you haven't added a web app yet, click on the web icon (</>) to add one
6. In the "SDK setup and configuration" section, you'll find your Firebase configuration object
7. Copy the values from this object to your `.env` file

## Important Notes

- Keep your `.env` file secure and never commit it to version control
- If you're deploying to Firebase Hosting, you'll need to set these environment variables in the Firebase Console under Project settings > Service accounts > Environment variables
