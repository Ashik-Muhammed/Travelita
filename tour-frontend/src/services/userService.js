import { db, auth } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  getCountFromServer, 
  doc, 
  updateDoc,
  deleteDoc,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { 
  updateProfile, 
  deleteUser as deleteAuthUser, 
  updateEmail,
  getAuth
} from 'firebase/auth';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { toast } from 'react-toastify';

// Get total number of users
export const getTotalUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getCountFromServer(usersRef);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error getting user count:', error);
    throw error;
  }
};

// Get all users (with pagination for large datasets)
export const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ 
        id: doc.id, 
        ...doc.data(),
        // Ensure we have default values
        role: doc.data().role || 'user',
        isActive: doc.data().isActive !== false // Default to true if not set
      });
    });
    
    // Simple pagination (for production, use startAfter for better performance with large datasets)
    const startIndex = (page - 1) * limit;
    const paginatedUsers = users.slice(startIndex, startIndex + limit);
    
    return {
      data: paginatedUsers,
      total: users.length,
      page,
      totalPages: Math.ceil(users.length / limit)
    };
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// Update user role
export const updateUserRole = async (userId, newRole) => {
  try {
    if (!['admin', 'vendor', 'user'].includes(newRole)) {
      throw new Error('Invalid role');
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
    
    // If user is being demoted from admin, ensure there's at least one admin left
    if (newRole !== 'admin') {
      const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
      const adminsSnapshot = await getDocs(adminsQuery);
      
      if (adminsSnapshot.size <= 1) {
        throw new Error('Cannot remove the last admin');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    // First check if this is the last admin
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.data()?.role === 'admin') {
      const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
      const adminsSnapshot = await getDocs(adminsQuery);
      
      if (adminsSnapshot.size <= 1) {
        throw new Error('Cannot delete the last admin');
      }
    }
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'users', userId));
    
    // Try to delete from Auth (requires admin privileges in production)
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (currentUser && currentUser.uid === userId) {
        // Don't allow users to delete themselves
        throw new Error('You cannot delete your own account');
      }
      
      // Note: This requires the Firebase Admin SDK on the server side
      // In a real app, you would call a Cloud Function to handle this
      // For now, we'll just log a message
      console.log(`User ${userId} would be deleted from Auth here`);
      // await deleteAuthUser(userId);
      
    } catch (authError) {
      console.warn('Could not delete user from Auth:', authError);
      // Continue even if Auth deletion fails
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Search users by email or display name
export const searchUsers = async (searchTerm) => {
  try {
    if (!searchTerm.trim()) {
      return [];
    }
    
    const usersRef = collection(db, 'users');
    
    // Search by email
    const emailQuery = query(
      usersRef,
      where('email', '>=', searchTerm),
      where('email', '<=', searchTerm + '\uf8ff')
    );
    
    // Search by display name
    const nameQuery = query(
      usersRef,
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff')
    );
    
    const [emailSnapshot, nameSnapshot] = await Promise.all([
      getDocs(emailQuery),
      getDocs(nameQuery)
    ]);
    
    // Combine and deduplicate results
    const usersMap = new Map();
    
    const processSnapshot = (snapshot) => {
      snapshot.forEach(doc => {
        usersMap.set(doc.id, { id: doc.id, ...doc.data() });
      });
    };
    
    processSnapshot(emailSnapshot);
    processSnapshot(nameSnapshot);
    
    return Array.from(usersMap.values());
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};
