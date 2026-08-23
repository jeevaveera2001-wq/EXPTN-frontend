import React from 'react';
import { useAuth } from '../context/AuthContext';
import SuperAdminControlCenter from '../components/admin/SuperAdminControlCenter';
import StaffDashboard from '../components/staff/StaffDashboard';
import UserDashboard from '../components/user/UserDashboard';
import VendorDashboard from '../components/vendor/VendorDashboard';

export default function Dashboard() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold">Access Restricted</h2>
        <p className="text-slate-500 mt-2">Please sign in to view your dashboard portal.</p>
      </div>
    );
  }

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

  // Full-width layout for Super Admin & Admin Control Center
  if (currentUser.role === 'super_admin' || currentUser.role === 'admin') {
    return (
      <div className="w-full min-h-screen">
        <SuperAdminControlCenter />
      </div>
    );
  }

  // Dedicated Staff Dashboard Portals for the 10 Staff Roles
  if (staffRoles.includes(currentUser.role)) {
    return (
      <div className="w-full min-h-screen">
        <StaffDashboard />
      </div>
    );
  }

  // Property Owner & Vehicle Vendor Dual Portal
  if (currentUser.role === 'owner' || currentUser.role === 'vendor' || currentUser.role === 'owner_and_vendor') {
    return (
      <div className="w-full min-h-screen">
        <VendorDashboard />
      </div>
    );
  }

  // Tourist Guest User Portal with 6 Dedicated Tabs
  if (currentUser.role === 'user' || currentUser.role === 'guest') {
    return (
      <div className="w-full min-h-screen">
        <UserDashboard />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="glass-panel p-8 bg-white/95 border border-white rounded-3xl flex items-center justify-between shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 uppercase tracking-wider font-mono">
            {currentUser.role.replace(/_/g, ' ')}
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Portal Workstation</h1>
          <p className="text-sm text-slate-500 mt-1">Logged in as {currentUser.name} ({currentUser.email})</p>
        </div>
      </div>
    </div>
  );
}
