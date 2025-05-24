import { auth, rtdb } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import { ref, set, get, update, serverTimestamp } from 'firebase/database';

// Set persistence for auth state
const initAuthPersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('Auth persistence set to LOCAL');
  } catch (error) {
    console.error('Error setting auth persistence:', error);
    throw new Error('Failed to initialize authentication service');
  }
};

// Initialize auth persistence when the service is imported
initAuthPersistence().catch(console.error);

// Error handler for auth operations
const handleAuthError = (error) => {
  console.error('Auth Error:', error);
  
  // Common Firebase Auth error codes
  const errorMap = {
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email already in use',
    'auth/operation-not-allowed': 'This operation is not allowed',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
  };

  const message = errorMap[error.code] || 'An error occurred. Please try again';
  const errorToThrow = new Error(message);
  errorToThrow.code = error.code;
  throw errorToThrow;
};

// Register a new user
export const registerUser = async (name, email, password) => {
  try {
    // Input validation
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with name
    await updateProfile(user, { displayName: name });
    
    // Create user document in Realtime Database
    const userData = {
      name,
      email,
      role: 'user',
      emailVerified: false,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      loginCount: 1,
      status: 'active'
    };

    await set(ref(rtdb, `users/${user.uid}`), userData);
    
    // Send email verification
    // await sendEmailVerification(user);
    
    // Get ID token to ensure it's available
    const idToken = await user.getIdToken();
    
    return {
      user: {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        emailVerified: user.emailVerified,
        role: 'user',
        token: idToken
      }
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

// Login user - returns user data without modifying auth state
export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    // Use a separate auth instance to avoid triggering state changes
    const { getAuth, signInWithEmailAndPassword: signIn } = await import('firebase/auth');
    const tempAuth = getAuth();
    
    // Sign in with the temporary auth instance
    const userCredential = await signIn(tempAuth, email, password);
    const user = userCredential.user;
    
    // Get fresh ID token
    const idToken = await user.getIdToken();
    
    // Get user data from Realtime Database
    const { get: getDb, ref: dbRef } = await import('firebase/database');
    const userRef = dbRef(rtdb, `users/${user.uid}`);
    const snapshot = await getDb(userRef);
    
    // If user doesn't exist in database, throw error
    if (!snapshot.exists()) {
      await signOut(tempAuth);
      throw new Error('User account not found');
    }
    
    const userData = snapshot.val();
    
    // Prepare updated user data
    const updatedUserData = {
      ...userData,
      lastLogin: serverTimestamp(),
      loginCount: (userData.loginCount || 0) + 1,
      status: 'active'
    };
    
    // Update user data in database
    await set(dbRef(rtdb, `users/${user.uid}`), updatedUserData, { merge: true });
    
    // Sign out from the temporary auth instance
    await signOut(tempAuth);
    
    // Return user data without modifying the main auth state
    return {
      user: {
        id: user.uid,
        name: user.displayName || userData.name,
        email: user.email,
        emailVerified: user.emailVerified,
        role: userData.role || 'user',
        token: idToken
      }
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    // Clear local storage first
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('redirectAfterLogin');
    }
    
    // Sign out from Firebase
    await signOut(auth);
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, we should still clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
    throw new Error('Failed to log out. Please try again.');
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Get current user with token
export const getCurrentUser = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    // Get fresh token
    const token = await user.getIdToken(true); // Force refresh if needed
    
    // Get additional user data from database
    const userRef = ref(rtdb, `users/${user.uid}`);
    const snapshot = await get(userRef);
    const userData = snapshot.exists() ? snapshot.val() : { role: 'user' };
    
    // Update local storage with fresh data
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: user.displayName || userData.name,
        role: userData.role || 'user',
        emailVerified: user.emailVerified
      }));
    }
    
    return {
      ...user,
      ...userData,
      token,
      isAdmin: userData.role === 'admin',
      isVendor: userData.role === 'vendor'
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    // Clear invalid auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
    return null;
  }
};

// Get auth token (for API requests)
export const getAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    // Get fresh token (will auto-refresh if needed)
    return await user.getIdToken(true);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Check if user is authenticated with thorough validation
export const isAuthenticated = async () => {
  try {
    // Check if there's a current user in Firebase Auth
    const user = auth.currentUser;
    if (!user) {
      console.log('No current user found in Firebase Auth');
      return false;
    }
    
    // Verify the token is still valid
    const token = await user.getIdToken(true).catch(error => {
      console.log('Token refresh failed:', error);
      return null;
    });
    
    if (!token) {
      console.log('No valid token found');
      return false;
    }
    
    // Store the token for API requests
    localStorage.setItem('authToken', token);
    
    // Check if user exists in the database
    const userRef = ref(rtdb, `users/${user.uid}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      console.log('User not found in database');
      return false;
    }
    
    // Check if user account is active in database
    const userData = snapshot.val();
    if (userData.status === 'disabled' || userData.status === 'banned') {
      console.log('User account is disabled or banned');
      return false;
    }
    
    // Store user data in localStorage for quick access
    if (typeof window !== 'undefined') {
      localStorage.setItem('authUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: userData.role || 'user',
        isAdmin: userData.role === 'admin',
        isVendor: userData.role === 'vendor'
      }));
    }
    
    console.log('User is authenticated');
    return true;
  } catch (error) {
    console.error('Auth check failed:', error);
    // Clear any local storage data to ensure consistency
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
    return false;
  }
};

// Check if user is admin
export const isUserAdmin = async (userId) => {
  if (!userId) return false;
  
  try {
    const snapshot = await get(ref(rtdb, `users/${userId}`));
    if (!snapshot.exists()) {
      console.log('User not found in database');
      return false;
    }
    
    const userData = snapshot.val();
    console.log('User data for admin check:', userData);
    
    // Check for admin role (case insensitive and handle different formats)
    const userRole = userData.role || userData.roleType || '';
    const isAdmin = userRole.toString().toLowerCase().trim() === 'admin';
    
    console.log(`Admin check for user ${userId}:`, { role: userRole, isAdmin });
    return isAdmin;
    
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
};
