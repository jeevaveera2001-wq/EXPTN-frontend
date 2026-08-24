import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BACKEND_API } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ETN_USER');
      if (!saved) return null;
      const user = JSON.parse(saved);
      if (user?.token) {
        localStorage.setItem('token', user.token);
      }
      if (user?.email) {
        const savedAvatar = localStorage.getItem(`etn_user_avatar_${user.email.toLowerCase()}`);
        if (savedAvatar) {
          user.avatar = savedAvatar;
        }
      }
      return user;
    } catch (e) {
      return null;
    }
  });

  const login = (userObj) => {
    if (userObj?.token) {
      try {
        localStorage.setItem('token', userObj.token);
      } catch (e) {}
    }

    if (userObj?.email) {
      const savedAvatar = localStorage.getItem(`etn_user_avatar_${userObj.email.toLowerCase()}`);
      if (savedAvatar && !userObj.avatar) {
        userObj.avatar = savedAvatar;
      } else if (userObj.avatar) {
        try {
          localStorage.setItem(`etn_user_avatar_${userObj.email.toLowerCase()}`, userObj.avatar);
        } catch (e) {}
      }
    }

    setCurrentUser(userObj);
    try {
      localStorage.setItem('ETN_USER', JSON.stringify(userObj));
    } catch (e) {}

    // Record login security notification
    if (userObj?.email) {
      const storageKey = `etn_notifs_${userObj.email.toLowerCase()}`;
      try {
        const saved = localStorage.getItem(storageKey);
        const list = saved ? JSON.parse(saved) : [];
        const loginNotif = {
          id: 'notif-login-' + Date.now(),
          title: '🛡️ Login Session Active',
          message: `Logged in as ${userObj.name || userObj.email} (${(userObj.role || 'Tourist').toUpperCase()}) at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          date: 'Just now',
          read: false
        };
        const updated = [loginNotif, ...list.slice(0, 30)];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('etn_notification_event', { detail: updated }));
      } catch (e) {}
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('ETN_USER');
      localStorage.removeItem('token');
    } catch (e) {}
  };

  const updateUserProfile = useCallback((updatedFields) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...updatedFields };
      try {
        localStorage.setItem('ETN_USER', JSON.stringify(merged));
        if (merged.token) {
          localStorage.setItem('token', merged.token);
        }
        if (merged.email && merged.avatar) {
          localStorage.setItem(`etn_user_avatar_${merged.email.toLowerCase()}`, merged.avatar);
        }
      } catch (e) {}
      return merged;
    });
  }, []);

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

  // Live profile check function to synchronize role & avatar from server
  const refreshUserProfile = useCallback(async () => {
    if (!currentUser?.email) return;
    try {
      const token = localStorage.getItem('token') || currentUser?.token || '';
      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res;
      try {
        res = await fetch(`${BACKEND_API}/auth/me?email=${encodeURIComponent(currentUser.email)}`, { headers });
        if (!res.ok) throw new Error();
      } catch (e) {
        res = await fetch(`/api/auth/me?email=${encodeURIComponent(currentUser.email)}`, { headers });
      }

      if (res && res.ok) {
        const freshUser = await res.json();
        if (freshUser) {
          setCurrentUser((prev) => {
            if (!prev) return freshUser;
            const emailKey = prev.email ? prev.email.toLowerCase() : '';
            const localSavedAvatar = emailKey ? localStorage.getItem(`etn_user_avatar_${emailKey}`) : null;
            
            // Retain local uploaded avatar if backend avatar is empty or default
            const finalAvatar = freshUser.avatar || localSavedAvatar || prev.avatar || '';
            const finalToken = freshUser.token || prev.token || token;
            const merged = { ...prev, ...freshUser, avatar: finalAvatar, token: finalToken };

            try {
              localStorage.setItem('ETN_USER', JSON.stringify(merged));
              if (finalToken) localStorage.setItem('token', finalToken);
              if (emailKey && finalAvatar) {
                localStorage.setItem(`etn_user_avatar_${emailKey}`, finalAvatar);
              }
            } catch (e) {}
            return merged;
          });
        }
      }
    } catch (err) {}
  }, [currentUser?.email, currentUser?.token]);

  // Initial profile sync on startup or login session hydration (NO periodic polling loop)
  useEffect(() => {
    if (currentUser?.email) {
      refreshUserProfile();
    }
  }, [currentUser?.email]); // Runs once when user email changes / initial mount

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateUserRole, updateUserProfile, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
