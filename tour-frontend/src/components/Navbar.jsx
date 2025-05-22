import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../services/authService';
import './Navbar.css'; // Import Navbar.css

function Navbar() {
  // Get auth context for user information
  const { currentUser, isAdmin, logout } = useAuth();
  const isAuthenticated = !!currentUser;
  const userRole = currentUser?.role || (isAdmin ? 'admin' : 'user');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVendorMenuOpen, setIsVendorMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsVendorMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Add scroll effect for better UX
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close other menus when main menu is toggled
    if (!isMenuOpen) {
      setIsVendorMenuOpen(false);
      setIsUserMenuOpen(false);
    }
  };

  const toggleVendorMenu = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsVendorMenuOpen(!isVendorMenuOpen);
    setIsUserMenuOpen(false); // Close user menu when vendor menu is toggled
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsVendorMenuOpen(false); // Close vendor menu when user menu is toggled
  };

  const handleLogoutClick = async () => {
    try {
      await logoutUser();
      // Clear any stored vendor or user info from localStorage
      localStorage.removeItem('vendorInfo');
      localStorage.removeItem('userInfo');
      
      navigate('/');
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsVendorMenuOpen(false);
      setIsUserMenuOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getLinkClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-container">
            <span className="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </span>
            <span className="logo-text">Travelita</span>
          </div>
        </Link>

        {/* Mobile Menu Toggle Button */}
        <button 
          className={`navbar-mobile-toggle ${isMenuOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-links-container ${isMenuOpen ? 'open' : ''}`}>
          <ul className="navbar-links">
            <li><Link to="/" className={getLinkClass('/')}>Home</Link></li>
            <li><Link to="/packages/top" className={getLinkClass('/packages/top')}>Top Packages</Link></li>
            <li><Link to="/packages/budget" className={getLinkClass('/packages/budget')}>Budget Friendly</Link></li>

            <li><Link to="/about" className={getLinkClass('/about')}>About Us</Link></li>
            <li><Link to="/contact" className={getLinkClass('/contact')}>Contact</Link></li>
          </ul>

          <div className="navbar-auth-links">
            {isAuthenticated ? (
              <div className="user-menu-container">
                <button 
                  className="user-menu-button"
                  onClick={toggleUserMenu}
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="user-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="user-name">{currentUser?.displayName || 'My Account'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="dropdown-arrow">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className={`user-dropdown-menu ${isUserMenuOpen ? 'show' : ''}`}>
                  <Link to="/user/bookings" className={getLinkClass('/user/bookings')}>My Bookings</Link>
                  <Link to="/dashboard" className={getLinkClass('/dashboard')}>My Dashboard</Link>
                  {userRole === 'vendor' && (
                    <Link to="/vendor/dashboard" className={getLinkClass('/vendor/dashboard')}>Vendor Dashboard</Link>
                  )}
                  {userRole === 'admin' && (
                    <Link to="/admin/dashboard" className={getLinkClass('/admin/dashboard')}>Admin Panel</Link>
                  )}
                  <button onClick={handleLogoutClick} className="logout-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
                <div className="vendor-section" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="vendor-dropdown-toggle" 
                    onClick={toggleVendorMenu}
                    aria-expanded={isVendorMenuOpen}
                  >
                    For Vendors
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="dropdown-arrow">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className={`vendor-dropdown-menu ${isVendorMenuOpen ? 'show' : ''}`}>
                    <Link to="/vendor/login">Vendor Login</Link>
                    <Link to="/vendor/register">Vendor Registration</Link>
                    <Link to="/admin/login">Admin Login</Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
