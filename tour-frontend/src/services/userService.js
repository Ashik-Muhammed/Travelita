import { db } from '../config/firebase';
import { collection, getDocs, query, where, getCountFromServer } from 'firebase/firestore';

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
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
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
