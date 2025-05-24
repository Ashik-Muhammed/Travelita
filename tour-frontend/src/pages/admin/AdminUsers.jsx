import React, { useState, useEffect } from 'react';
import { db, ref, get } from '../../config/firebase';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    displayName: '',
    email: '',
    role: 'user'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await db.get('users');
        const usersList = Object.entries(usersData || {}).map(([id, user]) => ({
          id,
          ...user
        }));
        setUsers(usersList);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({
      displayName: user.displayName || '',
      email: user.email || '',
      role: user.role || 'user'
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async (userId) => {
    try {
      await db.update(`users/${userId}`, {
        displayName: editForm.displayName,
        role: editForm.role
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, ...editForm } 
          : user
      ));
      
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await db.remove(`users/${userId}`);
        
        // Update local state
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    (user.email && user.email.toLowerCase().includes(searchTerm)) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchTerm))
  );

  if (loading) {
    return <div className="admin-users">Loading users...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-users">
      <div className="admin-header">
        <h2>Manage Users</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <i className="fas fa-search"></i>
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="no-results">No users found</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    {editingUser === user.id ? (
                      <input
                        type="text"
                        name="displayName"
                        value={editForm.displayName}
                        onChange={handleEditChange}
                        className="edit-input"
                      />
                    ) : (
                      user.displayName || 'N/A'
                    )}
                  </td>
                  <td>{user.email || 'N/A'}</td>
                  <td>
                    {editingUser === user.id ? (
                      <select
                        name="role"
                        value={editForm.role}
                        onChange={handleEditChange}
                        className="edit-select"
                      >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="vendor">Vendor</option>
                      </select>
                    ) : (
                      <span className={`role-badge ${user.role || 'user'}`}>
                        {user.role || 'user'}
                      </span>
                    )}
                  </td>
                  <td>
                    {user.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString() 
                      : 'N/A'}
                  </td>
                  <td className="actions">
                    {editingUser === user.id ? (
                      <>
                        <button 
                          className="save-btn"
                          onClick={() => handleSaveEdit(user.id)}
                        >
                          Save
                        </button>
                        <button 
                          className="cancel-btn"
                          onClick={() => setEditingUser(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(user)}
                          title="Edit user"
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.role === 'admin'}
                          title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
