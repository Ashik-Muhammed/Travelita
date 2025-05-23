import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, createHashRouter, RouterProvider } from 'react-router-dom';

// Create router with future flags to fix warnings
const router = {
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true
  }
};
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './custom.css'; // Import the custom CSS file
import './styles/global.css'; // Import the global CSS styles
import './styles/components.css'; // Import component-specific styles
import './styles/enhanced-components.css'; // Import enhanced component styles
import PopularDestinations from './pages/PopularDestinations';
import { scrollToTop } from './utils/scrollUtils';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoadingFallback from './components/LoadingFallback';
import Unauthorized from './pages/Unauthorized';
import DatabaseInit from './pages/DatabaseInit'; // Import the new DatabaseInit page

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PackageDetails = lazy(() => import('./pages/PackageDetails'));
const Bookings = lazy(() => import('./pages/Bookings'));
const AddPackage = lazy(() => import('./pages/AddPackage'));
const AllPackages = lazy(() => import('./pages/AllPackages'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AdminSetup = lazy(() => import('./pages/AdminSetup'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminBookings = lazy(() => import('./pages/AdminBookings'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const VendorLogin = lazy(() => import('./pages/VendorLogin'));
const VendorRegister = lazy(() => import('./pages/VendorRegister'));
const VendorDatabaseInit = lazy(() => import('./pages/VendorDatabaseInit'));
const ManagePackages = lazy(() => import('./pages/ManagePackages'));
const ManageUsers = lazy(() => import('./pages/ManageUsers'));
const TopPackages = lazy(() => import('./pages/TopPackages'));
const BudgetPackages = lazy(() => import('./pages/BudgetPackages'));
const DestinationPackages = lazy(() => import('./pages/DestinationPackages'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const FAQs = lazy(() => import('./pages/FAQs'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Cookies = lazy(() => import('./pages/Cookies'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const UserBookings = lazy(() => import('./pages/UserBookings'));

// Destination Pages
const DestinationLayout = lazy(() => import('./pages/destinations/layouts/DestinationLayout'));
const Goa = lazy(() => import('./pages/destinations/Goa'));
const Manali = lazy(() => import('./pages/destinations/Manali'));
const Jaipur = lazy(() => import('./pages/destinations/Jaipur'));
const Kerala = lazy(() => import('./pages/destinations/Kerala'));
const Ladakh = lazy(() => import('./pages/destinations/Ladakh'));


// Error fallback component
const ErrorFallback = ({ error, resetError }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh',
    padding: '20px',
    textAlign: 'center'
  }}>
    <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>Oops! Something went wrong</h2>
    <p style={{ marginBottom: '1rem' }}>{error}</p>
    <button 
      onClick={resetError}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#3182ce',
        color: 'white',
        border: 'none',
        borderRadius: '0.25rem',
        cursor: 'pointer'
      }}
    >
      Try Again
    </button>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  
  // Check localStorage for user data as a fallback
  const storedUser = localStorage.getItem('user');
  const userFromStorage = storedUser ? JSON.parse(storedUser) : null;
  
  if (loading && !userFromStorage) {
    return <LoadingFallback />;
  }
  
  // If no user in context but exists in localStorage, use that
  const effectiveUser = currentUser || userFromStorage;
  
  if (!effectiveUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access
  if (allowedRoles) {
    // Check if admin in context or in localStorage
    const isUserAdmin = isAdmin || (userFromStorage && userFromStorage.role === 'admin');
    const userRole = isUserAdmin ? 'admin' : (effectiveUser.role || 'user');
    
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  return children;
};

// Scroll to top component
function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    scrollToTop();
  }, [location]);
  
  return null;
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router {...router}>
          <div>
            <ScrollToTop />
            <Navbar />
            <main style={{ paddingTop: '4rem', flexGrow: 1 }}>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/packages/:packageId" element={<PackageDetails />} />
                  <Route path="/packages/top" element={<TopPackages />} />
                  <Route path="/packages/budget" element={<BudgetPackages />} />
                  <Route path="/packages/destination/:destination" element={<DestinationPackages />} />
                  <Route path="/destinations" element={<PopularDestinations />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/faqs" element={<FAQs />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/cookies" element={<Cookies />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/database-init" element={<DatabaseInit />} />
                  
                  {/* User Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/bookings" element={ 
                    <ProtectedRoute>
                      <Bookings />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/bookings" element={ 
                    <ProtectedRoute>
                      <UserBookings />
                    </ProtectedRoute>
                  } />
                  <Route path="/packages/:packageId/book" element={ 
                    <ProtectedRoute>
                      <BookingPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Vendor Routes */}
                  <Route path="/vendor/login" element={<VendorLogin />} />
                  <Route path="/vendor/register" element={<VendorRegister />} />
                  <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                  <Route path="/vendor/database-init" element={<VendorDatabaseInit />} />
                  <Route path="/vendor/edit-package/:packageId" element={<AddPackage isEditing={true} />} />
                  <Route path="/vendor/packages/add" element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <AddPackage />
                    </ProtectedRoute>
                  } />
                  <Route path="/vendor/packages/manage" element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <ManagePackages />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/setup" element={<AdminSetup />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPanel />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageUsers />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/packages" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AllPackages />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/bookings" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminBookings />
                    </ProtectedRoute>
                  } />
                  
                  {/* Destination Pages */}
                  <Route path="/destinations/goa" element={<Goa />} />
                  <Route path="/destinations/manali" element={<Manali />} />
                  <Route path="/destinations/jaipur" element={<Jaipur />} />
                  <Route path="/destinations/kerala" element={<Kerala />} />
                  <Route path="/destinations/ladakh" element={<Ladakh />} />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;