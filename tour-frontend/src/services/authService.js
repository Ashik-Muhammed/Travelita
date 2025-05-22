import { auth, rtdb } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, set, get, update, serverTimestamp } from 'firebase/database';

// Register a new user
export const registerUser = async (name, email, password) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with name
    await updateProfile(user, { displayName: name });
    
    // Create user document in Realtime Database
    await set(ref(rtdb, `users/${user.uid}`), {
      name,
      email,
      role: 'user',
      createdAt: Date.now(), // Use timestamp for Realtime Database
      loginCount: 0
    });
    
    return {
      user: {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        role: 'user'
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Realtime Database
    const userRef = ref(rtdb, `users/${user.uid}`);
    const snapshot = await get(userRef);
    const userData = snapshot.exists() ? snapshot.val() : { name: '', role: 'user' };
    
    // Update login count using set with merge option instead of update
    await set(ref(rtdb, `users/${user.uid}`), {
      name: userData.name || user.displayName || email.split('@')[0],
      email: user.email,
      loginCount: (userData.loginCount || 0) + 1,
      lastLogin: Date.now()
    }, { merge: true });
    
    return {
      user: {
        id: user.uid,
        name: user.displayName || userData.name || email.split('@')[0],
        email: user.email,
        role: userData.role || 'user'
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
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

// Get current user
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        unsubscribe();
        if (user) {
          get(ref(rtdb, `users/${user.uid}`))
            .then(snapshot => {
              if (snapshot.exists()) {
                const userData = snapshot.val();
                resolve({
                  id: user.uid,
                  name: user.displayName || userData.name,
                  email: user.email,
                  role: userData.role || 'user'
                });
              } else {
                resolve(null);
              }
            })
            .catch(error => {
              console.error('Error getting user data:', error);
              reject(error);
            });
        } else {
          resolve(null);
        }
      }, 
      (error) => {
        console.error('Auth state change error:', error);
        reject(error);
      }
    );
  });
};

// Check if user is admin
export const isUserAdmin = async (userId) => {
  try {
    const snapshot = await get(ref(rtdb, `users/${userId}`));
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return userData.role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
};
