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

  const toggleMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const willOpen = !isMenuOpen;
    setIsMenuOpen(willOpen);
    document.body.style.overflow = willOpen ? 'hidden' : 'auto';
    
    // Close other menus when toggling main menu
    if (willOpen) {
      setIsVendorMenuOpen(false);
      setIsUserMenuOpen(false);
    }
  };
  
  // Toggle vendor dropdown menu
  const toggleVendorMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const willOpen = !isVendorMenuOpen;
    setIsVendorMenuOpen(willOpen);
    if (willOpen) {
      setIsUserMenuOpen(false);
    }
    e.stopPropagation(); // Prevent event bubbling
    setIsVendorMenuOpen(!isVendorMenuOpen);
    setIsUserMenuOpen(false); // Close user menu when vendor menu is toggled
  };
  
  // Toggle user dropdown menu
  const toggleUserMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const willOpen = !isUserMenuOpen;
    setIsUserMenuOpen(willOpen);
    if (willOpen) {
      setIsVendorMenuOpen(false);
    }
    e.stopPropagation(); // Prevent event bubbling
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsVendorMenuOpen(false); // Close vendor menu when user menu is toggled
  };
  
  // Close mobile menu when clicking outside or on overlay
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Don't close if clicking on a link or button
      if (e.target.closest('a') || e.target.closest('button')) {
        // Close only if it's a navigation link (not a dropdown toggle)
        if (e.target.closest('.navbar-link') || e.target.closest('.nav-link')) {
          setIsMenuOpen(false);
          setIsVendorMenuOpen(false);
          setIsUserMenuOpen(false);
          document.body.style.overflow = 'auto';
        }
        return;
      }
      
      // Close all menus when clicking outside
      if (isMenuOpen || isVendorMenuOpen || isUserMenuOpen) {
        setIsMenuOpen(false);
        setIsVendorMenuOpen(false);
        setIsUserMenuOpen(false);
        document.body.style.overflow = 'auto';
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen, isVendorMenuOpen, isUserMenuOpen]);

  // Handle link clicks in mobile menu
  const handleMobileLinkClick = () => {
    // Close the menu after a slight delay to allow navigation
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsVendorMenuOpen(false);
      setIsUserMenuOpen(false);
      document.body.style.overflow = 'auto';
    }, 50);
  };

  // Handle logout click
  const handleLogoutClick = async () => {
    try {
      await logoutUser();
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get link class based on current path
  const getLinkClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Close menus when route changes
  useEffect(() => {
    const unlisten = () => {
      setIsMenuOpen(false);
      setIsVendorMenuOpen(false);
      setIsUserMenuOpen(false);
      document.body.style.overflow = 'auto';
    };
    
    // Listen for route changes
    window.addEventListener('popstate', unlisten);
    
    return () => {
      window.removeEventListener('popstate', unlisten);
    };
  }, []);

  // Toggle body scroll when menu is open/closed
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsVendorMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={handleMobileLinkClick}>
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
              <li><Link to="/" className="navbar-link nav-link" onClick={handleMobileLinkClick}>Home</Link></li>
              <li><Link to="/packages/top" className="navbar-link nav-link" onClick={handleMobileLinkClick}>Top Packages</Link></li>
              <li><Link to="/packages/budget" className="navbar-link nav-link" onClick={handleMobileLinkClick}>Budget Friendly</Link></li>
              <li><Link to="/about" className="navbar-link nav-link" onClick={handleMobileLinkClick}>About Us</Link></li>
              <li><Link to="/contact" className="navbar-link nav-link" onClick={handleMobileLinkClick}>Contact</Link></li>
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
                    <Link to="/user/bookings" className={getLinkClass('/user/bookings')} onClick={handleMobileLinkClick}>My Bookings</Link>
                    <Link to="/dashboard" className={getLinkClass('/dashboard')} onClick={handleMobileLinkClick}>My Dashboard</Link>
                    {userRole === 'vendor' && (
                      <Link to="/vendor/dashboard" className={getLinkClass('/vendor/dashboard')} onClick={handleMobileLinkClick}>Vendor Dashboard</Link>
                    )}
                    {userRole === 'admin' && (
                      <Link to="/admin/dashboard" className={getLinkClass('/admin/dashboard')} onClick={handleMobileLinkClick}>Admin Panel</Link>
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
                  <Link to="/login" className="btn btn-outline" onClick={handleMobileLinkClick}>Login</Link>
                  <Link to="/register" className="btn btn-primary" onClick={handleMobileLinkClick}>Sign Up</Link>
                  <div className="vendor-dropdown-container">
                    <button 
                      className="vendor-dropdown-button"
                      onClick={toggleVendorMenu}
                      aria-expanded={isVendorMenuOpen}
                      aria-controls="vendor-menu"
                    >
                      For Vendors
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="dropdown-arrow">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div 
                      id="vendor-menu"
                      className={`vendor-dropdown-menu ${isVendorMenuOpen ? 'show' : ''}`}
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="vendor-menu-button"
                      tabIndex="-1"
                    >
                      <Link to="/vendor/login" role="menuitem" tabIndex="-1" onClick={handleMobileLinkClick}>Vendor Login</Link>
                      <Link to="/vendor/register" role="menuitem" tabIndex="-1" onClick={handleMobileLinkClick}>Vendor Registration</Link>
                      <Link to="/admin/login" role="menuitem" tabIndex="-1" onClick={handleMobileLinkClick}>Admin Login</Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Overlay - Click to close menu */}
      {isMenuOpen && (
        <div 
          className="navbar-overlay"
          onClick={toggleMenu}
        ></div>
      )}
    </>
  );
}

export default Navbar;
