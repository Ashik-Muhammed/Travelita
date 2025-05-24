import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getCurrentUser, isUserAdmin } from '../services/authService';

export const AuthContext = createContext();

// Define the hook separately for better Fast Refresh support
export const useAuth = () => useContext(AuthContext);

// Function to fetch and update user data
const fetchAndUpdateUserData = async (firebaseUser, setCurrentUser, setIsAdmin, setIsVendor) => {
  if (!firebaseUser) {
    setCurrentUser?.(null);
    setIsAdmin?.(false);
    setIsVendor?.(false);
    return null;
  }

  try {
    // Get user data from Firebase Realtime Database
    const userData = await getCurrentUser();
    console.log('Fetched user data:', userData);
    
    // Check if user is admin or vendor
    const adminStatus = await isUserAdmin(firebaseUser.uid);
    const vendorStatus = userData?.role === 'vendor' || false;
    
    // Merge Firebase Auth data with database data
    const updatedUser = {
      ...firebaseUser,
      ...userData,
      isAdmin: adminStatus,
      isVendor: vendorStatus,
      role: userData?.role || 'user' // Ensure role is set (default to 'user' if not set)
    };
    
    console.log('Updated user object:', {
      ...updatedUser,
      // Don't log sensitive data
      email: updatedUser.email,
      role: updatedUser.role,
      isAdmin: updatedUser.isAdmin,
      isVendor: updatedUser.isVendor
    });
    
    setCurrentUser?.(updatedUser);
    setIsAdmin?.(adminStatus);
    setIsVendor?.(vendorStatus);
    return updatedUser;
  } catch (error) {
    console.error('Error getting user data:', error);
    setCurrentUser?.(null);
    setIsAdmin?.(false);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const [pendingAuthCheck, setPendingAuthCheck] = useState(true);

  // Function to refresh user data
  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      try {
        return await fetchAndUpdateUserData(auth.currentUser, setCurrentUser, setIsAdmin, setIsVendor);
      } catch (error) {
        console.error('Error refreshing user:', error);
        return null;
      }
    }
    return null;
  }, [setCurrentUser, setIsAdmin, setIsVendor]);

  // Custom login function that updates the auth state
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      // First sign out any existing session
      await signOut(auth);
      
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch and update user data
      const userData = await fetchAndUpdateUserData(user, setCurrentUser, setIsAdmin, setIsVendor);
      setPendingAuthCheck(false);
      return { user: userData };
    } catch (error) {
      console.error('Login error:', error);
      // Ensure we're fully signed out on error
      await signOut(auth);
      setCurrentUser(null);
      setIsAdmin(false);
      setIsVendor(false);
      setPendingAuthCheck(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Custom logout function
  const logout = useCallback(async () => {
    try {
      const { signOut } = await import('firebase/auth');
      // First clear local state
      setCurrentUser(null);
      setIsAdmin(false);
      setIsVendor(false);
      // Then sign out from Firebase
      await signOut(auth);
      // Clear any stored tokens or user data
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      // Clear session storage as well
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to log out:', error);
      // Even if sign out fails, ensure we clear the local state
      setCurrentUser(null);
      setIsAdmin(false);
      setIsVendor(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      sessionStorage.clear();
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      setLoading(true);
      try {
        if (firebaseUser) {
          await fetchAndUpdateUserData(firebaseUser, setCurrentUser, setIsAdmin, setIsVendor);
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
          setIsVendor(false);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setCurrentUser(null);
        setIsAdmin(false);
        setIsVendor(false);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setCurrentUser, setIsAdmin, setIsVendor]);

  const value = {
    currentUser,
    isAdmin,
    isVendor,
    loading,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
