import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, rtdb } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import './AdminLogin.css'; // Reuse the same CSS

function AdminSetup() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const createAdminAccount = async () => {
    try {
      setLoading(true);
      setMessage('');
      
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
      setSuccess(true);
      setMessage('Admin account created successfully! Email: admin@gmail.com, Password: admin');
    } catch (error) {
      console.error('Error creating admin account:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setMessage('Admin account already exists. You can use email: admin@gmail.com, password: admin to log in.');
        setSuccess(true);
      } else {
        setMessage(`Error creating admin account: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>Admin Setup</h1>
          <p>Create an administrator account</p>
        </div>
        
        {message && (
          <div className={`message ${success ? 'success' : 'error'}`} style={{
            padding: '10px',
            margin: '15px 0',
            borderRadius: '4px',
            backgroundColor: success ? '#d4edda' : '#f8d7da',
            color: success ? '#155724' : '#721c24',
            border: `1px solid ${success ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            <p>{message}</p>
          </div>
        )}
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            onClick={createAdminAccount} 
            disabled={loading}
            className="admin-login-button"
            style={{ marginBottom: '20px' }}
          >
            {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
          </button>
          
          <p>This will create an admin account with:</p>
          <p><strong>Email:</strong> admin@gmail.com</p>
          <p><strong>Password:</strong> admin</p>
        </div>

        <div className="admin-login-divider">
          <span>Return to</span>
        </div>

        <div className="admin-login-footer">
          <Link to="/admin/login">
            Admin Login
          </Link>
          <Link to="/">
            Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminSetup;
