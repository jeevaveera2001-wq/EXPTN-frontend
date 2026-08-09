import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AuthModal from './components/auth/AuthModal';
import Home from './pages/Home';
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

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col justify-between">
          <div>
            <Navbar onOpenAuth={handleOpenAuth} />
            <main>
              <Routes>
                {/* Main Public Routes */}
                <Route path="/" element={<Home onOpenAuth={handleOpenAuth} />} />
                <Route path="/explore" element={<Home onOpenAuth={handleOpenAuth} />} />
                <Route path="/hotels" element={<Home onOpenAuth={handleOpenAuth} />} />
                <Route path="/packages" element={<Home onOpenAuth={handleOpenAuth} />} />

                {/* Main Dynamic Dashboard Route */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Explicit Dashboard Routes for 12 Roles */}
                <Route path="/dashboard/super-admin" element={<SuperAdminControlCenter />} />
                <Route path="/dashboard/user" element={<UserDashboard />} />
                <Route path="/dashboard/vendor" element={<VendorDashboard />} />
                <Route path="/dashboard/operations" element={<StaffDashboard overrideRole="operations_manager" />} />
                <Route path="/dashboard/booking-executive" element={<StaffDashboard overrideRole="booking_executive" />} />
                <Route path="/dashboard/customer-support" element={<StaffDashboard overrideRole="customer_support_executive" />} />
                <Route path="/dashboard/destination-content" element={<StaffDashboard overrideRole="destination_content_manager" />} />
                <Route path="/dashboard/property-verification" element={<StaffDashboard overrideRole="property_verification_manager" />} />
                <Route path="/dashboard/transport" element={<StaffDashboard overrideRole="transport_manager" />} />
                <Route path="/dashboard/finance" element={<StaffDashboard overrideRole="finance_accounts_manager" />} />
                <Route path="/dashboard/marketing" element={<StaffDashboard overrideRole="marketing_manager" />} />
                <Route path="/dashboard/media-gallery" element={<StaffDashboard overrideRole="media_gallery_manager" />} />
                <Route path="/dashboard/hr-staff" element={<StaffDashboard overrideRole="hr_staff_manager" />} />
              </Routes>
            </main>
          </div>
          <Footer />

          {/* Auth Modal */}
          <AuthModal 
            isOpen={authModalOpen} 
            initialMode={authMode} 
            onClose={() => setAuthModalOpen(false)} 
          />
        </div>
      </Router>
    </AuthProvider>
  );
}
