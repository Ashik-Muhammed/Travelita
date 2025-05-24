import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setCurrentUser, setIsAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
      setIsAdmin(false);
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <h2>Admin Panel</h2>
      </div>
      <nav className="admin-nav">
        <ul>
          <li className={isActive('/admin/dashboard')}>
            <Link to="/admin/dashboard">
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={isActive('/admin/users')}>
            <Link to="/admin/users">
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
          </li>
          <li className={isActive('/admin/packages')}>
            <Link to="/admin/packages">
              <i className="fas fa-box"></i>
              <span>Packages</span>
            </Link>
          </li>
          <li className={isActive('/admin/bookings')}>
            <Link to="/admin/bookings">
              <i className="fas fa-calendar-check"></i>
              <span>Bookings</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="admin-footer">
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
