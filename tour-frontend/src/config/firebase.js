// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Removed Firestore import as we're only using Realtime Database
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
// No longer using Firestore
const rtdb = getDatabase(app);

export { auth, rtdb };
export default app;
