import { auth, rtdb } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';

/**
 * Creates an admin account in Firebase Authentication and Realtime Database
 * This function should be called from the browser console or a special admin setup page
 */
export const createAdminAccount = async () => {
  try {
    // Admin credentials
    const email = 'admin@gmail.com';
    const password = 'admin';
    
    console.log('Creating admin account...');
    
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Admin user created in Firebase Authentication');
    
    // Create admin record in Firebase Realtime Database
    const userRef = ref(rtdb, `users/${user.uid}`);
    await set(userRef, {
      email: email,
      name: 'Administrator',
      role: 'admin',
      createdAt: Date.now(),
      lastLogin: Date.now()
    });
    
    console.log('Admin record created in Firebase Realtime Database');
    console.log('Admin account creation successful!');
    
    return {
      success: true,
      userId: user.uid,
      message: 'Admin account created successfully'
    };
  } catch (error) {
    console.error('Error creating admin account:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
