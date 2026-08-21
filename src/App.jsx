import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

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

  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen flex flex-col justify-between">
            <div>
              <Navbar onOpenAuth={handleOpenAuth} />
              <main>
                <Routes>
                  {/* Main Public Routes */}
                  <Route path="/" element={<Home onOpenAuth={handleOpenAuth} />} />
                  <Route path="/explore" element={<Explore onOpenAuth={handleOpenAuth} />} />
                  <Route path="/hotels" element={<Explore onOpenAuth={handleOpenAuth} />} />
                  <Route path="/packages" element={<Packages onOpenAuth={handleOpenAuth} />} />

                  {/* Direct Auth Action Routes */}
                  <Route path="/login" element={<Home onOpenAuth={() => handleOpenAuth('login')} />} />
                  <Route path="/register" element={<Home onOpenAuth={() => handleOpenAuth('register')} />} />

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
            <Footer onOpenAuth={handleOpenAuth} />

            {/* Auth Modal with Login & Register Isolation and Google Verification Flow */}
            <AuthModal 
              isOpen={authModalOpen} 
              initialMode={authMode} 
              onClose={() => setAuthModalOpen(false)} 
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
