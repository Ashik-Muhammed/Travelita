import React, { useState, useEffect } from 'react';
import { rtdb } from '../config/firebase';
import { ref, get, update, remove } from 'firebase/database';
import './ManageUsers.css';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || user.role !== 'admin') {
        setError('Admin authentication required');
        setLoading(false);
        return;
      }

      // Get users from Firebase Realtime Database
      const usersRef = ref(rtdb, 'users');
      const usersSnapshot = await get(usersRef);
      
      if (usersSnapshot.exists()) {
        // Convert the object of users to an array with ID included
        const usersData = Object.entries(usersSnapshot.val()).map(([id, data]) => ({
          id,
          ...data,
          active: data.active !== false, // Default to active if not specified
          _id: id // Add _id for backward compatibility with existing code
        }));
        setUsers(usersData);
      } else {
        setUsers([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setActionLoading(true);
      
      // Update user role in Firebase Realtime Database
      const userRef = ref(rtdb, `users/${userId}`);
      await update(userRef, { role: newRole });

      // Update users list with the new role
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      setActionLoading(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user role:', err);
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, isActive) => {
    try {
      setActionLoading(true);
      
      // Update user status in Firebase Realtime Database
      const userRef = ref(rtdb, `users/${userId}`);
      await update(userRef, { active: isActive });

      // Update users list with the new status
      setUsers(users.map(user => 
        user.id === userId ? { ...user, active: isActive } : user
      ));
      
      setActionLoading(false);
    } catch (err) {
      console.error('Error updating user status:', err);
      setActionLoading(false);
    }
  };

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, currentFilter]);

  const filteredUsers = users.filter(user => {
    // Add null checks for name and email properties
    const userName = user?.name || '';
    const userEmail = user?.email || '';
    
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentFilter === 'all') return matchesSearch;
    if (currentFilter === 'active') return matchesSearch && user.active;
    if (currentFilter === 'inactive') return matchesSearch && !user.active;
    if (currentFilter === 'admin') return matchesSearch && user.role === 'admin';
    if (currentFilter === 'vendor') return matchesSearch && user.role === 'vendor';
    if (currentFilter === 'user') return matchesSearch && user.role === 'user';
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2 className="error-title">Error</h2>
          <p className="error-message">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users-container">
      <div className="manage-users-wrapper">
        <div className="manage-users-header">
          <h1 className="manage-users-title">Manage Users</h1>
          <p className="manage-users-subtitle">
            View and manage all users in the system
          </p>
        </div>

        {/* Filters and Search */}
        <div className="filters-container">
          <div className="filters-grid">
            <div>
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="search-container">
                <div className="search-icon">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="search-input"
                  placeholder="Search users by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="filter" className="sr-only">Filter</label>
              <select
                id="filter"
                className="filter-select"
                value={currentFilter}
                onChange={(e) => setCurrentFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="admin">Admins</option>
                <option value="vendor">Vendors</option>
                <option value="user">Regular Users</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-container">
          <div className="table-scroll">
            <table className="users-table">
              <thead className="table-header">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">{filteredUsers.length > 0 ? 
                // Get current users for pagination
                filteredUsers
                  .slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)
                  .map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{user.name || 'Unknown User'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-email">{user.email || 'No email'}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        user.role === 'admin' ? 'badge-admin' : 
                        user.role === 'vendor' ? 'badge-vendor' : 
                        'badge-user'
                      }`}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        user.active ? 'badge-active' : 'badge-inactive'
                      }`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="date-cell">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown date'}
                    </td>
                    <td className="actions-cell">
                      {selectedUser === user._id ? (
                        <div className="action-buttons">
                          <select
                            className="role-select"
                            defaultValue={user.role}
                            onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                            disabled={actionLoading}
                          >
                            <option value="user">User</option>
                            <option value="vendor">Vendor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => setSelectedUser(null)}
                            className="cancel-button"
                            disabled={actionLoading}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button
                            onClick={() => setSelectedUser(user._id)}
                            className="edit-button"
                            disabled={actionLoading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(user._id, !user.active)}
                            className={user.active ? 'deactivate-button' : 'activate-button'}
                            disabled={actionLoading}
                          >
                            {user.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              : 
                <tr>
                  <td colSpan="6" className="empty-message">
                    No users found matching your search.
                  </td>
                </tr>
              }</tbody>
            </table>
            
            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {Math.min((currentPage - 1) * usersPerPage + 1, filteredUsers.length)} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="pagination-buttons">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`pagination-page-button ${currentPage === i + 1 ? 'active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsers.length / usersPerPage)))}
                    disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageUsers; 