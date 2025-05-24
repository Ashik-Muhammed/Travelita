import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { 
  getDatabase, 
  connectDatabaseEmulator, 
  ref, 
  onValue, 
  get,
  set,
  update,
  remove,
  query,
  orderByChild,
  equalTo
} from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Environment variables
const isDevelopment = import.meta.env.DEV;
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAz0u0GhAOYtNYBub_TrzaeTCUvnZVfZ6M",
  authDomain: "travelita-be5ad.firebaseapp.com",
  projectId: "travelita-be5ad",
  databaseURL: "https://travelita-be5ad-default-rtdb.firebaseio.com",
  storageBucket: "travelita-be5ad.appspot.com",
  messagingSenderId: "419210854770",
  appId: "1:419210854770:web:58f3e13ca864b3c0baddeb"
};

// Firebase state
let _app;
let _auth;
let _rtdb;
let _storage;
let _isInitialized = false;

// Export initialization status
export const isInitialized = () => _isInitialized;

// Initialize Firebase
const initFirebase = () => {
  try {
    if (getApps().length === 0) {
      // Initialize Firebase app
      console.log('Initializing Firebase app...');
      _app = initializeApp(firebaseConfig);
      
      // Initialize Auth, Database, and Storage
      _auth = getAuth(_app);
      _rtdb = getDatabase(_app);
      _storage = getStorage(_app);
      
      // Connect to emulators if in development and enabled
      if (isDevelopment && useEmulators) {
        try {
          connectAuthEmulator(_auth, 'http://localhost:9099');
          connectDatabaseEmulator(_rtdb, 'localhost', 9000);
          console.log('Connected to Firebase emulators');
        } catch (emulatorError) {
          console.warn('Failed to connect to emulators:', emulatorError);
        }
      }
      
      _isInitialized = true;
      console.log('Firebase initialized successfully');
    } else {
      // Use existing app instance
      _app = getApps()[0];
      _auth = getAuth(_app);
      _rtdb = getDatabase(_app);
      _isInitialized = true;
    }
    
    return { app: _app, auth: _auth, rtdb: _rtdb };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    _isInitialized = false;
    throw error;
  }
};

// Initialize Firebase immediately when the module loads
const initializeFirebaseApp = () => {
  try {
    return initFirebase();
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

// Initialize Firebase and get services
const { app: firebaseApp, auth: firebaseAuth, rtdb: firebaseDb } = initializeFirebaseApp();

// Export initialized services
export const app = firebaseApp;
export const auth = firebaseAuth;
export const rtdb = firebaseDb;

// Initialize Storage
export const storage = _storage;

export const uploadFile = async (file, path) => {
  try {
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (url) => {
  try {
    // Create a reference to the file to delete
    const fileRef = storageRef(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Export the database instance
export const getDb = () => {
  if (!rtdb) {
    throw new Error('Database not initialized. Firebase initialization failed.');
  }
  return rtdb;
};

// Export database methods
export const db = {
  // Reference to a path
  ref: (path) => ref(rtdb, path),
  
  // Get data once
  get: async (path) => {
    try {
      const snapshot = await get(ref(rtdb, path));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  },
  
  // Set data
  set: async (path, data) => {
    try {
      await set(ref(rtdb, path), data);
      return true;
    } catch (error) {
      console.error('Error setting data:', error);
      throw error;
    }
  },
  
  // Update data
  update: async (path, data) => {
    try {
      await update(ref(rtdb, path), data);
      return true;
    } catch (error) {
      console.error('Error updating data:', error);
      throw error;
    }
  },
  
  // Remove data
  remove: async (path) => {
    try {
      await remove(ref(rtdb, path));
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  },
  
  // Subscribe to data changes
  onValue: (path, callback) => onValue(ref(rtdb, path), callback),
  
  // Query methods
  query: {
    orderByChild,
    equalTo
  }
};

// Export the initFirebase function
export { initFirebase };

// Export Firebase modules
export { 
  ref, 
  get, 
  set, 
  update, 
  remove, 
  onValue, 
  query, 
  orderByChild, 
  equalTo 
} from 'firebase/database';

// Helper functions
export const fetchData = async (path) => {
  try {
    const snapshot = await get(ref(rtdb, path));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const subscribeToData = (path, callback) => {
  try {
    return onValue(ref(rtdb, path), (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : null);
    });
  } catch (error) {
    console.error('Error subscribing to data:', error);
    throw error;
  }
};

const firebase = {
  get app() {
    if (!isInitialized()) {
      console.warn('Firebase not initialized. Call initFirebase() first.');
    }
    return _app;
  },
  init: initFirebase,
  isInitialized,
  auth: {
    currentUser: () => _auth?.currentUser
  },
  database: {
    ref: (path) => ref(rtdb, path),
    get: (path) => get(ref(rtdb, path)),
    query: {
      orderByChild,
      equalTo
    }
  }
};

export default firebase;
