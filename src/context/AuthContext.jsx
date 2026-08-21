import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { BACKEND_API } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ETN_USER');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const login = (userObj) => {
    setCurrentUser(userObj);
    try {
      localStorage.setItem('ETN_USER', JSON.stringify(userObj));
    } catch (e) {}
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('ETN_USER');
    } catch (e) {}
  };

  const updateUserRole = useCallback((newRole) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, role: newRole };
      try {
        localStorage.setItem('ETN_USER', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Live profile check function to synchronize role from server
  const refreshUserProfile = useCallback(async () => {
    if (!currentUser?.email) return;
    try {
      let res;
      try {
        res = await fetch(`/api/auth/me?email=${encodeURIComponent(currentUser.email)}`);
        if (!res.ok) throw new Error();
      } catch (e) {
        res = await fetch(`${BACKEND_API}/auth/me?email=${encodeURIComponent(currentUser.email)}`);
      }

      if (res && res.ok) {
        const freshUser = await res.json();
        if (freshUser && freshUser.role && freshUser.role !== currentUser.role) {
          console.log(`⚡ [LIVE ROLE UPDATE] Role changed from ${currentUser.role} -> ${freshUser.role}`);
          setCurrentUser((prev) => {
            const merged = { ...prev, ...freshUser };
            try {
              localStorage.setItem('ETN_USER', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      }
    } catch (err) {}
  }, [currentUser?.email, currentUser?.role]);

  // Periodic and window-focus live profile refresh
  useEffect(() => {
    if (currentUser?.email) {
      refreshUserProfile();
      const interval = setInterval(refreshUserProfile, 4000);
      window.addEventListener('focus', refreshUserProfile);
      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', refreshUserProfile);
      };
    }
  }, [currentUser?.email, refreshUserProfile]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateUserRole, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
