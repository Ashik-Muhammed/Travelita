import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const { currentUser, isAdmin, logout } = useAuth();

  if (!isAdmin) {
    return (
      <div className="admin-unauthorized">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin dashboard.</p>
        <Link to="/" className="btn">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Travelita Admin</h2>
        </div>
        <nav>
          <ul>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
            <li><Link to="/admin/bookings">Bookings</Link></li>
            <li><Link to="/admin/packages">Packages</Link></li>
            <li><button onClick={logout}>Logout</button></li>
          </ul>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-user">
            <span>Welcome, {currentUser?.email}</span>
          </div>
        </header>
        <div className="admin-content">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
