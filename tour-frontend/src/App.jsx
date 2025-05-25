import React, {
  useState,
  useEffect,
  Suspense,
  lazy,
  useCallback,
  useMemo,
} from 'react';
import { createHashHistory } from 'history';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  unstable_HistoryRouter as HistoryRouter
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './custom.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isAuthenticated } from './services/authService';
import { register as registerServiceWorker, unregister } from './serviceWorkerRegistration';
import { DataProvider } from './contexts/DataContext';
import LoadingFallback from './components/LoadingFallback';
import LoadingSkeleton from './components/LoadingSkeleton';
import BackgroundPattern from './components/BackgroundPattern';
import BackgroundPatternWithLocation from './components/BackgroundPatternWithLocation';
import Unauthorized from './pages/Unauthorized';
import DatabaseInit from './pages/DatabaseInit';
import { initFirebase, subscribeToData } from './config/firebase';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const PackageDetails = lazy(() => import('./pages/PackageDetails'));
const Bookings = lazy(() => import('./pages/Bookings').then(module => ({ default: module.Bookings })));
const AddPackage = lazy(() => import('./pages/AddPackage'));
const AllPackages = lazy(() => import('./pages/AllPackages'));
const AllPackagesPage = lazy(() => import('./pages/AllPackagesPage'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminPackages = lazy(() => import('./pages/admin/AdminPackages'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const VendorLogin = lazy(() => import('./pages/VendorLogin'));
const VendorRegister = lazy(() => import('./pages/VendorRegister'));
const VendorDatabaseInit = lazy(() => import('./pages/VendorDatabaseInit'));
const ManagePackages = lazy(() => import('./pages/ManagePackages'));
const TopPackages = lazy(() => import('./pages/TopPackages'));
const BudgetPackages = lazy(() => import('./pages/BudgetPackages'));
const DestinationPackages = lazy(() => import('./pages/DestinationPackages'));
const PopularDestinations = lazy(() => import('./pages/PopularDestinations'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const FAQs = lazy(() => import('./pages/FAQs'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Cookies = lazy(() => import('./pages/Cookies'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const UserBookings = lazy(() => import('./pages/UserBookings'));

const Goa = lazy(() => import('./pages/destinations/Goa'));
const Manali = lazy(() => import('./pages/destinations/Manali'));
const Jaipur = lazy(() => import('./pages/destinations/Jaipur'));
const Kerala = lazy(() => import('./pages/destinations/Kerala'));
const Ladakh = lazy(() => import('./pages/destinations/Ladakh'));

// ErrorBoundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.FallbackComponent({
        error: this.state.error?.message || 'Unknown error',
        resetError: this.resetError,
      });
    }

    return this.props.children;
  }
}

// Error fallback UI
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

// Function to scroll to top of the page
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// Scroll to top component
function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    scrollToTop();
  }, [location]);

  return null;
}

// Enhanced route protection with better auth handling
const ProtectedRoute = ({ children, allowedRoles, requireVerification = false }) => {
  const { currentUser, isAdmin, isVendor, loading } = useAuth();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication and authorization
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      if (!isMounted) return;
      
      try {
        setIsCheckingAuth(true);
        
        // If we're still loading auth state, wait
        if (loading) return;

        // Check if user is authenticated
        if (!currentUser) {
          console.log('No current user, redirecting to login');
          // Store the attempted URL for redirecting after login
          localStorage.setItem('redirectAfterLogin', location.pathname);
          if (isMounted) {
            setIsAuthorized(false);
            setAuthChecked(true);
            setIsCheckingAuth(false);
          }
          return;
        }

        // Double-check with Firebase if the user is still authenticated
        console.log('Verifying authentication status...');
        const isStillAuthenticated = await isAuthenticated();
        
        if (!isStillAuthenticated) {
          console.log('Session expired or invalid');
          if (isMounted) {
            setIsAuthorized(false);
            setAuthChecked(true);
            setIsCheckingAuth(false);
          }
          return;
        }

        // Check if email verification is required
        if (requireVerification && !currentUser.emailVerified) {
          console.log('Email verification required');
          if (isMounted) {
            setIsAuthorized(false);
            setAuthChecked(true);
            setIsCheckingAuth(false);
          }
          return;
        }

        // Check role-based access if roles are specified
        if (allowedRoles) {
          const isUserAdmin = isAdmin || currentUser.role === 'admin';
          const isUserVendor = isVendor || currentUser.role === 'vendor';
          
          // Determine user role with priority: admin > vendor > user
          const userRole = isUserAdmin ? 'admin' : (isUserVendor ? 'vendor' : (currentUser.role || 'user'));
          
          if (!allowedRoles.includes(userRole)) {
            console.log('Access denied - Insufficient permissions');
            if (isMounted) {
              setIsAuthorized(false);
              setAuthChecked(true);
              setIsCheckingAuth(false);
            }
            return;
          }
        }

        // If we get here, user is authorized
        console.log('User is authorized');
        if (isMounted) {
          setIsAuthorized(true);
          setAuthChecked(true);
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        if (isMounted) {
          setIsAuthorized(false);
          setAuthChecked(true);
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [currentUser, loading, isAdmin, isVendor, allowedRoles, requireVerification, location.pathname]);

  // Show loading state while checking auth
  if (loading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    console.log('Redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to unauthorized if not authorized
  if (!isAuthorized) {
    console.log('Redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  // If email verification is required but not verified
  if (requireVerification && !currentUser.emailVerified) {
    console.log('Email verification required');
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Email Verification Required</h2>
        <p className="mb-4">Please verify your email address to access this page.</p>
        <button
          onClick={() => {
            // Optionally resend verification email
            // auth.currentUser.sendEmailVerification();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Resend Verification Email
        </button>
      </div>
    );
  }

  // User is authenticated and authorized
  console.log('Rendering protected content');
  return children;
};

function App() {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  
  // Move useMemo to the top level, before any conditional returns
  // Create history instance without future flags as they're now the default in v6
  const history = useMemo(() => createHashHistory(), []);

  // Initialize Firebase and service worker
  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        console.log('Initializing Firebase...');
        // Initialize Firebase
        await initFirebase();
        
        // Only update state if component is still mounted
        if (isMounted) {
          console.log('Firebase initialized successfully');
          setIsFirebaseReady(true);
          setInitializationError(null);
        }

        // Register service worker in production
        if (process.env.NODE_ENV === 'production') {
          try {
            registerServiceWorker({
              onUpdate: (registration) => {
                if (registration.waiting) {
                  // Show a custom update UI instead of using window.confirm
                  const shouldUpdate = window.confirm('A new version is available! Refresh to update?');
                  if (shouldUpdate) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              },
            });
          } catch (swError) {
            console.warn('Service worker registration failed:', swError);
          }
        }
      } catch (error) {
        console.error('Firebase initialization error:', error);
        if (isMounted) {
          setInitializationError(error);
          // Still set as ready to show error UI
          setIsFirebaseReady(true);
        }
      }
    };

    // Only initialize if not already ready
    if (!isFirebaseReady) {
      initializeApp();
    }

    return () => {
      isMounted = false;
      if (process.env.NODE_ENV === 'development') {
        try {
          unregister();
        } catch (e) {
          console.warn('Failed to unregister service worker:', e);
        }
      }
    };
  }, [isFirebaseReady]); // Add isFirebaseReady to dependency array

  useEffect(() => {
    const handleControllerChange = () => {
      if (navigator.serviceWorker?.controller) {
        window.location.reload();
      }
    };

    navigator.serviceWorker?.addEventListener('controllerchange', handleControllerChange);
    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // Show loading state until Firebase is ready
  if (!isFirebaseReady) {
    return (
      <div className="app-loading">
        <BackgroundPattern variant="default" />
        <LoadingFallback />
      </div>
    );
  }

  // Show error state if initialization failed
  if (initializationError) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h2>Initialization Error</h2>
          <p>Failed to initialize the application. Please refresh the page to try again.</p>
          <details style={{ marginTop: '1rem' }}>
            <summary>Error details</summary>
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>
              {initializationError.message || 'Unknown error occurred'}
            </pre>
          </details>
          <button 
            className="btn btn-primary mt-3" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <HistoryRouter history={history}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AuthProvider>
          <DataProvider>
            <ScrollToTop />
            {/* Background pattern based on the current URL */}
            <BackgroundPatternWithLocation />
            <Navbar />
            <main className="page-content" style={{ paddingTop: '4rem', flexGrow: 1, padding: '4rem 1rem 2rem' }}>
              <Suspense 
                fallback={
                  <div className="container py-5">
                    <div className="glass-container">
                      <LoadingSkeleton type="card" count={3} className="mb-4" />
                    </div>
                  </div>
                }>
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/packages/:packageId" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <PackageDetails />
                    </Suspense>
                  } />
                  <Route path="/packages" element={<AllPackagesPage />} />
                  <Route path="/packages/old" element={<AllPackages />} />
                  <Route path="/packages/top" element={<TopPackages />} />
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

                  {/* User */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  } />
                  <Route
                    path="/bookings"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <Bookings />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/user/bookings" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <Bookings vendorView={false} />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/book/:packageId" element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <BookingPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />

                  {/* Vendor */}
                  <Route path="/vendor/login" element={<VendorLogin />} />
                  <Route path="/vendor/register" element={<VendorRegister />} />
                  <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                  <Route
                    path="/vendor/bookings"
                    element={
                      <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                        <Suspense fallback={<LoadingFallback />}>
                          <Bookings vendorView={true} />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
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
                  <Route path="/admin/login" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminLogin />
                    </Suspense>
                  } />
                  <Route path="/admin" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    </Suspense>
                  }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="packages" element={<AdminPackages />} />
                    <Route path="bookings" element={<AdminBookings />} />
                  </Route>

                  {/* Destination */}
                  <Route path="/destinations/goa" element={<Goa />} />
                  <Route path="/destinations/manali" element={<Manali />} />
                  <Route path="/destinations/jaipur" element={<Jaipur />} />
                  <Route path="/destinations/kerala" element={<Kerala />} />
                  <Route path="/destinations/ladakh" element={<Ladakh />} />

                  {/* 404 */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </DataProvider>
        </AuthProvider>
      </ErrorBoundary>
    </HistoryRouter>
  );
}

export default App;
