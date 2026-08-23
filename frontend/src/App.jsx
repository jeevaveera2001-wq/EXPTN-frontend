import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AuthModal from './components/auth/AuthModal';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageLoader from './components/common/PageLoader';
import NetworkStatusNotifier from './components/common/NetworkStatusNotifier';
import MaintenanceScreen from './components/common/MaintenanceScreen';
import { startBackendWarmupHeartbeat } from './utils/cache';
import { BACKEND_API } from './config/api';

// Core Public Pages (Eagerly Loaded for Instant 0ms Paint)
import Home from './pages/Home';
import Explore from './pages/Explore';
import Cabs from './pages/Cabs';

// Heavy Dashboard and Legal Pages (Lazy Loaded for 80% Bundle Reduction)
const Packages = lazy(() => import('./pages/Packages'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const CancellationRefundPolicy = lazy(() => import('./pages/CancellationRefundPolicy'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SuperAdminControlCenter = lazy(() => import('./components/admin/SuperAdminControlCenter'));
const StaffDashboard = lazy(() => import('./components/staff/StaffDashboard'));
const UserDashboard = lazy(() => import('./components/user/UserDashboard'));
const VendorDashboard = lazy(() => import('./components/vendor/VendorDashboard'));

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
  const { socket } = useSocket();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Maintenance & System Upgrade State (Persisted & Socket Driven)
  const [maintenanceState, setMaintenanceState] = useState(() => {
    try {
      const saved = localStorage.getItem('etn_maintenance_mode');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      isMaintenance: false,
      message: 'Explore Tamil Nadu is undergoing scheduled system upgrades for high-speed performance, live database caching, and enhanced reservation security.',
      estimatedTime: '30 Minutes',
      upgradeTitle: 'Platform Upgrade & Performance Optimization in Progress'
    };
  });

  // Start background warm-up heartbeat once
  useEffect(() => {
    startBackendWarmupHeartbeat();
  }, []);

  // Real-time socket sync for maintenance mode
  useEffect(() => {
    if (!socket) return;
    const handleMaintChange = (data) => {
      if (data) {
        setMaintenanceState(prev => ({
          ...prev,
          isMaintenance: Boolean(data.isMaintenance),
          message: data.message || prev.message,
          estimatedTime: data.estimatedTime || prev.estimatedTime,
          upgradeTitle: data.upgradeTitle || prev.upgradeTitle
        }));
      }
    };
    socket.on('maintenance_mode_changed', handleMaintChange);
    return () => socket.off('maintenance_mode_changed', handleMaintChange);
  }, [socket]);

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const isInternal = currentUser && INTERNAL_ROLES.includes(currentUser.role);
  const isSuperAdmin = currentUser && ['super_admin', 'admin'].includes(currentUser.role);

  // If System is under maintenance and current user is NOT Super Admin, display Maintenance Screen
  if (maintenanceState.isMaintenance && !isSuperAdmin) {
    return (
      <>
        <NetworkStatusNotifier />
        <MaintenanceScreen 
          maintenanceInfo={maintenanceState} 
          onAdminLogin={() => window.location.reload()} 
        />
      </>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col justify-between">
        
        {/* Global Real-time Network Error & Offline Alert */}
        <NetworkStatusNotifier />

        <div>
          {!isInternal && <Navbar onOpenAuth={handleOpenAuth} />}
          <main>
            <Suspense fallback={<PageLoader fullScreen text="Loading Explore Tamil Nadu..." />}>
              <Routes>
                {/* Public Routes: Reserved for Guests & Tourists */}
                <Route path="/" element={<PublicGuestOnlyRoute><Home onOpenAuth={handleOpenAuth} /></PublicGuestOnlyRoute>} />
                <Route path="/explore" element={<PublicGuestOnlyRoute><Explore onOpenAuth={handleOpenAuth} /></PublicGuestOnlyRoute>} />
                <Route path="/hotels" element={<PublicGuestOnlyRoute><Explore onOpenAuth={handleOpenAuth} /></PublicGuestOnlyRoute>} />
                <Route path="/packages" element={<PublicGuestOnlyRoute><Packages onOpenAuth={handleOpenAuth} /></PublicGuestOnlyRoute>} />
                <Route path="/cabs" element={<PublicGuestOnlyRoute><Cabs onOpenAuth={handleOpenAuth} /></PublicGuestOnlyRoute>} />

                {/* Public Legal & Policy Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/cancellation-refund" element={<CancellationRefundPolicy />} />

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
            </Suspense>
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
