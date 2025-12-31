import React from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '/node_modules/bootstrap/dist/js/bootstrap.min.js';
import LandingPage from './components/LandingPage';
import UserRegistration from './components/User/UserRegistrationForm';
import UserLogin from './components/User/UserLogin';
import ForgotPassword from './components/User/ForgotPassword';
import RegisteredUsers from './components/User/RegisteredUsers';
import AdminNavbar from './components/Navbar/AdminNavbar';
import UserNavbar from './components/Navbar/UserNavbar';
import AdminHome from './components/User/AdminHomePage';
import ItemList from './components/Item/ItemList';
import RequestList from './components/Request/RequestList';
import UserHome from './components/User/UserHomePage';
import AddItem from './components/Item/AddItem';
import UserProfile from './components/User/Profile';
import MyReports from './components/User/MyReports';  // ADD THIS IMPORT
import './App.css';

// Auth functions - Define them here since you don't have services.js
const checkAuth = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      return null;
    }

    const user = JSON.parse(userStr);

    // Check if user is logged in
    if (user.isLogin === false || user.isLogin === undefined) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error in checkAuth:', error);
    return null;
  }
};

const isAdmin = () => {
  const user = checkAuth();

  if (!user) return false;

  return user.role === 'ADMIN' || user.role === 'admin';
};

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Navbar Wrapper Component
const NavbarWrapper = ({ children }) => {
  const location = useLocation();
  const user = checkAuth();

  // Don't show navbar on landing/login/registration/forgot-password pages
  const hideNavbarPaths = [
    '/',
    '/landing',
    '/UserLogin',
    '/UserRegistration',
    '/forgot-password',
    '/UserRegistrationForm'
  ];

  if (hideNavbarPaths.includes(location.pathname)) {
    return children;
  }

  return (
    <>
      {user && isAdmin() ? <AdminNavbar /> : <UserNavbar />}
      <div className="content-wrapper">
        {children}
      </div>
    </>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const user = checkAuth();

  if (!user) {
    return <Navigate to="/UserLogin" replace />;
  }

  if (adminOnly && !isAdmin()) {
    // If non-admin tries to access admin route, redirect to user dashboard
    return <Navigate to="/Home" replace />;
  }

  return children;
};

// Auth Route Component - redirects authenticated users to dashboard
const AuthRoute = ({ children }) => {
  const user = checkAuth();

  if (user) {
    // Redirect to appropriate dashboard based on user role
    if (isAdmin()) {
      return <Navigate to="/AdminHome" replace />;
    } else {
      return <Navigate to="/Home" replace />;
    }
  }

  return children;
};

// Landing Page Route - Special handling for root path
const LandingPageRoute = ({ children }) => {
  const user = checkAuth();

  if (user) {
    // If user is logged in, redirect to appropriate dashboard
    if (isAdmin()) {
      return <Navigate to="/AdminHome" replace />;
    } else {
      return <Navigate to="/Home" replace />;
    }
  }

  return children;
};

// Main App Component
function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Listen for authentication changes
  useEffect(() => {
    const handleAuthChange = () => {
      const currentUser = checkAuth();
      setUser(currentUser);

      // If user logs in and is on landing page, redirect to dashboard
      if (currentUser && window.location.pathname === '/') {
        if (isAdmin()) {
          window.location.href = '/AdminHome';
        } else {
          window.location.href = '/Home';
        }
      }
    };

    // Initial check
    const currentUser = checkAuth();
    setUser(currentUser);
    setLoading(false);

    // Set up storage event listener for cross-tab auth changes
    window.addEventListener('storage', handleAuthChange);

    // Custom event for auth changes within same tab
    const handleCustomStorage = () => handleAuthChange();
    window.addEventListener('authChange', handleCustomStorage);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authChange', handleCustomStorage);
    };
  }, []);

  // Add logout function that triggers auth change
  const handleLogout = () => {
    clearAuth();
    window.dispatchEvent(new Event('authChange'));
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <NavbarWrapper>
        <Routes>
          {/* Route 1: Root path - shows LandingPage only for non-logged in users */}
          <Route path="/" element={
            <LandingPageRoute>
              <LandingPage />
            </LandingPageRoute>
          } />

          {/* Route 2: Landing page alias */}
          <Route path="/landing" element={<Navigate to="/" replace />} />

          {/* Route 3: Login page - redirects if already logged in */}
          <Route path="/UserLogin" element={
            <AuthRoute>
              <UserLogin />
            </AuthRoute>
          } />

          {/* Route 4: Registration page - redirects if already logged in */}
          <Route path="/UserRegistration" element={
            <AuthRoute>
              <UserRegistration />
            </AuthRoute>
          } />

          {/* Route 5: Forgot Password page - redirects if already logged in */}
          <Route path="/forgot-password" element={
            <AuthRoute>
              <ForgotPassword />
            </AuthRoute>
          } />

          {/* ============ USER DASHBOARD ROUTES ============ */}

          {/* User Home/Dashboard */}
          <Route path="/Home" element={
            <ProtectedRoute>
              <UserHome />
            </ProtectedRoute>
          } />

          {/* My Reports Page - NEW ROUTE */}
          <Route path="/my-reports" element={
            <ProtectedRoute>
              <MyReports />
            </ProtectedRoute>
          } />

          {/* Alternative path for My Reports */}
          <Route path="/MyReports" element={
            <Navigate to="/my-reports" replace />
          } />

          {/* Report Item (Add Item) */}
          <Route path="/ReportItem/:userId" element={
            <ProtectedRoute>
              <AddItem />
            </ProtectedRoute>
          } />

          {/* Alternative path for Report Item */}
          <Route path="/report-item" element={
            <ProtectedRoute>
              {/* Simple placeholder page since you don't have the component yet */}
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>Report Item</h1>
                <p>This page is under construction.</p>
                <p>Please use the existing ReportItem route with user ID parameter.</p>
                <a href="/Home" className="btn btn-primary mt-3">
                  Back to Dashboard
                </a>
              </div>
            </ProtectedRoute>
          } />

          {/* User Profile */}
          <Route path="/Profile/:userId" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />

          {/* Alternative path for Profile */}
          <Route path="/profile" element={
            <ProtectedRoute>
              {/* Simple placeholder */}
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>Profile</h1>
                <p>Please use the Profile route with user ID parameter.</p>
                <a href="/Home" className="btn btn-primary mt-3">
                  Back to Dashboard
                </a>
              </div>
            </ProtectedRoute>
          } />

          {/* Item List (Browse Items) */}
          <Route path="/ItemList" element={
            <ProtectedRoute>
              <ItemList />
            </ProtectedRoute>
          } />

          {/* Alternative path for Item List */}
          <Route path="/items" element={
            <Navigate to="/ItemList" replace />
          } />

          {/* Found Items - Placeholder since component doesn't exist */}
          <Route path="/found-items" element={
            <ProtectedRoute>
              <div style={{ padding: '20px' }}>
                <h1>Found Items</h1>
                <p>This page will show items found by others.</p>
                <p>Component is not yet created.</p>
                <a href="/Home" className="btn btn-primary mt-3">
                  Back to Dashboard
                </a>
              </div>
            </ProtectedRoute>
          } />

          {/* Alternative path for Found Items */}
          <Route path="/FoundItems" element={
            <Navigate to="/found-items" replace />
          } />

          {/* Request List */}
          <Route path="/RequestList" element={
            <ProtectedRoute>
              <RequestList />
            </ProtectedRoute>
          } />

          {/* Contact Page - Placeholder */}
          <Route path="/contact" element={
            <ProtectedRoute>
              <div style={{ padding: '20px' }}>
                <h1>Contact Support</h1>
                <p>Contact information and support form will go here.</p>
                <p>Component is not yet created.</p>
                <a href="/Home" className="btn btn-primary mt-3">
                  Back to Dashboard
                </a>
              </div>
            </ProtectedRoute>
          } />

          {/* FAQ Page - Placeholder */}
          <Route path="/faq" element={
            <ProtectedRoute>
              <div style={{ padding: '20px' }}>
                <h1>Frequently Asked Questions</h1>
                <p>FAQ content will go here.</p>
                <p>Component is not yet created.</p>
                <a href="/Home" className="btn btn-primary mt-3">
                  Back to Dashboard
                </a>
              </div>
            </ProtectedRoute>
          } />

          {/* ============ ADMIN DASHBOARD ROUTES ============ */}

          {/* Admin Home/Dashboard */}
          <Route path="/AdminHome" element={
            <ProtectedRoute adminOnly>
              <AdminHome />
            </ProtectedRoute>
          } />

          {/* Registered Users Management */}
          <Route path="/Users" element={
            <ProtectedRoute adminOnly>
              <RegisteredUsers />
            </ProtectedRoute>
          } />

          {/* ============ REDIRECTS FOR OLD/ALTERNATIVE PATHS ============ */}

          {/* UserRegistrationForm redirect */}
          <Route path="/UserRegistrationForm" element={
            <Navigate to="/UserRegistration" replace />
          } />

          {/* Login redirects */}
          <Route path="/login" element={
            <Navigate to="/UserLogin" replace />
          } />

          <Route path="/signin" element={
            <Navigate to="/UserLogin" replace />
          } />

          {/* Registration redirects */}
          <Route path="/register" element={
            <Navigate to="/UserRegistration" replace />
          } />

          <Route path="/signup" element={
            <Navigate to="/UserRegistration" replace />
          } />

          {/* Admin redirects */}
          <Route path="/admin" element={
            <Navigate to="/AdminHome" replace />
          } />

          <Route path="/admin-dashboard" element={
            <Navigate to="/AdminHome" replace />
          } />

          {/* User redirects */}
          <Route path="/user" element={
            <Navigate to="/Home" replace />
          } />

          <Route path="/user-dashboard" element={
            <Navigate to="/Home" replace />
          } />

          {/* Dashboard redirect */}
          <Route path="/dashboard" element={
            <Navigate to="/Home" replace />
          } />

          {/* ============ 404 PAGE ============ */}

          <Route path="*" element={
            <div className="not-found-container">
              <div className="not-found-card">
                <h1 className="text-danger">404</h1>
                <h4>Page Not Found</h4>
                <p className="text-muted mb-4">
                  The page you're looking for doesn't exist.
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  {user ? (
                    isAdmin() ? (
                      <a href="/AdminHome" className="btn btn-primary">
                        Go to Admin Dashboard
                      </a>
                    ) : (
                      <a href="/Home" className="btn btn-primary">
                        Go to Dashboard
                      </a>
                    )
                  ) : (
                    <a href="/" className="btn btn-primary">
                      Go to Homepage
                    </a>
                  )}
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => window.history.back()}
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </NavbarWrapper>
    </BrowserRouter>
  );
}

export default App;