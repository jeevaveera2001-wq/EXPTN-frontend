import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AuthModal from './components/auth/AuthModal';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Packages from './pages/Packages';
import Dashboard from './pages/Dashboard';
import SuperAdminControlCenter from './components/admin/SuperAdminControlCenter';
import StaffDashboard from './components/staff/StaffDashboard';
import UserDashboard from './components/user/UserDashboard';
import VendorDashboard from './components/vendor/VendorDashboard';

const staffRoles = [
  'operations_manager',
  'booking_executive',
  'customer_support_executive',
  'destination_content_manager',
  'property_verification_manager',
  'transport_manager',
  'finance_accounts_manager',
  'marketing_manager',
  'media_gallery_manager',
  'hr_staff_manager'
];

const INTERNAL_ROLES = [
  'super_admin',
  'admin',
  'operations_manager',
  'booking_executive',
  'customer_support_executive',
  'destination_content_manager',
  'property_verification_manager',
  'transport_manager',
  'finance_accounts_manager',
  'marketing_manager',
  'media_gallery_manager',
  'hr_staff_manager',
  'owner',
  'vendor',
  'owner_and_vendor'
];

function getRoleDashboardPath(role) {
  if (role === 'super_admin' || role === 'admin') return '/dashboard/super-admin';
  if (['owner', 'vendor', 'owner_and_vendor'].includes(role)) return '/dashboard/vendor';
  if (staffRoles.includes(role)) return `/dashboard/${role.replace(/_/g, '-')}`;
  return '/dashboard/user';
}

function PublicGuestOnlyRoute({ children }) {
  const { currentUser } = useAuth();
  if (currentUser && INTERNAL_ROLES.includes(currentUser.role)) {
    return <Navigate to={getRoleDashboardPath(currentUser.role)} replace />;
  }
  return children;
}

function AppContent() {
  const { currentUser } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const isInternal = currentUser && INTERNAL_ROLES.includes(currentUser.role);

  return (
    <Router>
      <div className="min-h-screen flex flex-col justify-between">
        <div>
          {!isInternal && <Navbar onOpenAuth={handleOpenAuth} />}
          <main>
            <Routes>
              {/* Public Routes: Reserved for Guests & Tourists */}
              <Route path="/" element={<PublicGuestOnlyRoute><Home onOpenAuth={handleOpenAuth} /></PublicGuestOnlyRoute>} />
              <Route path="/explore" element={<PublicGuestOnlyRoute><Explore onOpenAuth={handleOpenAuth} /></PublicGuestOnlyRoute>} />
              <Route path="/hotels" element={<PublicGuestOnlyRoute><Explore onOpenAuth={handleOpenAuth} /></PublicGuestOnlyRoute>} />
              <Route path="/packages" element={<PublicGuestOnlyRoute><Packages onOpenAuth={handleOpenAuth} /></PublicGuestOnlyRoute>} />

              {/* Direct Auth Action Routes */}
              <Route path="/login" element={<PublicGuestOnlyRoute><Home onOpenAuth={() => handleOpenAuth('login')} /></PublicGuestOnlyRoute>} />
              <Route path="/register" element={<PublicGuestOnlyRoute><Home onOpenAuth={() => handleOpenAuth('register')} /></PublicGuestOnlyRoute>} />

              {/* Main Dynamic Protected Dashboard Route */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Dashboard Routes with Strict Role Access Control */}
              <Route 
                path="/dashboard/super-admin" 
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                    <SuperAdminControlCenter />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/dashboard/user" 
                element={
                  <ProtectedRoute allowedRoles={['user', 'guest']}>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/dashboard/vendor" 
                element={
                  <ProtectedRoute allowedRoles={['owner', 'vendor', 'owner_and_vendor']}>
                    <VendorDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Staff Dashboard Routes */}
              {staffRoles.map(role => (
                <Route 
                  key={role}
                  path={`/dashboard/${role.replace(/_/g, '-')}`} 
                  element={
                    <ProtectedRoute allowedRoles={[role, 'super_admin', 'admin']}>
                      <StaffDashboard overrideRole={role} />
                    </ProtectedRoute>
                  } 
                />
              ))}

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Consumer Footer only for Guests & Tourists */}
        {!isInternal && <Footer onOpenAuth={handleOpenAuth} />}

        {/* Auth Modal with Login & Register Isolation and Google Verification Flow */}
        <AuthModal 
          isOpen={authModalOpen} 
          initialMode={authMode} 
          onClose={() => setAuthModalOpen(false)} 
        />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

