import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser } = useAuth();

  // If not logged in, redirect to home
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // If role is not allowed, redirect to appropriate role dashboard
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'super_admin' || currentUser.role === 'admin') {
      return <Navigate to="/dashboard/super-admin" replace />;
    }
    if (currentUser.role === 'owner' || currentUser.role === 'vendor' || currentUser.role === 'owner_and_vendor') {
      return <Navigate to="/dashboard/vendor" replace />;
    }
    if (currentUser.role === 'user' || currentUser.role === 'guest') {
      return <Navigate to="/dashboard/user" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
