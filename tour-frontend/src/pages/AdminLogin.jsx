import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, rtdb } from '../config/firebase';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import './AdminLogin.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Attempting to login with Firebase:', { email, password: '********' });
      
      try {
        // Try to sign in with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Firebase authentication successful, checking admin role');
        
        // Check if user is admin in Realtime Database
        const userRef = ref(rtdb, `users/${user.uid}`);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
          // User exists in Authentication but not in Database
          // Create a basic user record with admin role for the admin@gmail.com account
          await set(userRef, {
            email: user.email,
            name: user.displayName || email.split('@')[0],
            role: 'admin', // Always set as admin for this login flow
            createdAt: Date.now(),
            lastLogin: Date.now()
          });
        } else {
          // User exists, ensure admin role is set
          const userData = snapshot.val();
          if (userData.role !== 'admin') {
            // Update user role to admin
            await set(userRef, {
              ...userData,
              role: 'admin'
            });
          }
        }
        
        // Get user data after potential updates
        const updatedSnapshot = await get(userRef);
        const userData = updatedSnapshot.val();
        
        // We've already ensured the user has admin role, so no need to check again
        
        // Update login timestamp
        await set(userRef, {
          lastLogin: Date.now(),
          loginCount: (userData.loginCount || 0) + 1
        }, { merge: true });
        
        // Store user data in localStorage with admin role
        const adminUserData = {
          id: user.uid,
          email: user.email,
          name: userData.name || user.displayName || email.split('@')[0],
          role: 'admin'
        };
        localStorage.setItem('user', JSON.stringify(adminUserData));
        // Also set a token for API calls
        localStorage.setItem('token', user.accessToken);
        
        console.log('Admin login successful, redirecting to dashboard');
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } catch (err) {
        console.error('Login error:', err);
        
        // If login fails and it's the admin email, try to create the account
        if (email === 'admin@gmail.com' && password === 'admin123' && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
          try {
            console.log('Admin account not found, creating new admin account');
            
            // Create the admin account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Create admin record in database
            const userRef = ref(rtdb, `users/${user.uid}`);
            await set(userRef, {
              email: email,
              name: 'Administrator',
              role: 'admin',
              createdAt: Date.now(),
              lastLogin: Date.now()
            });
            
            // Store user data in localStorage with admin role
            const adminUserData = {
              id: user.uid,
              email: user.email,
              name: 'Administrator',
              role: 'admin'
            };
            localStorage.setItem('user', JSON.stringify(adminUserData));
            // Also set a token for API calls
            localStorage.setItem('token', user.accessToken);
            
            console.log('Admin account created successfully');
            navigate('/admin/dashboard');
            return;
          } catch (createError) {
            console.error('Error creating admin account:', createError);
            setError('Failed to create admin account: ' + createError.message);
          }
        } else {
          // Handle Firebase specific errors
          if (err.code === 'auth/user-not-found') {
            setError('No account found with this email. Please check your credentials.');
          } else if (err.code === 'auth/wrong-password') {
            setError('Incorrect password. Please try again.');
          } else if (err.code === 'auth/invalid-credential') {
            setError('Invalid login credentials. Please check your email and password.');
          } else if (err.code === 'auth/too-many-requests') {
            setError('Too many failed login attempts. Please try again later or reset your password.');
          } else {
            setError('An error occurred during login. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>Admin Login</h1>
          <p>Access the administration panel</p>
          <div style={{marginTop: '10px', textAlign: 'center', fontSize: '12px', color: '#666'}}>
            <p>Use the following credentials:</p>
            <p>Email: admin@gmail.com</p>
            <p>Password: admin123</p>
          </div>
        </div>

        {error && (
          <div className="admin-login-error">
            <p>{error}</p>
          </div>
        )}
        
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-login-button"
          >
            {loading ? 'Logging in...' : 'Sign in'}
          </button>
        </form>

        <div className="admin-login-divider">
          <span>Not an administrator?</span>
        </div>

        <div className="admin-login-footer">
          <Link to="/login">
            User Login
          </Link>
          <Link to="/vendor/login">
            Vendor Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin; 