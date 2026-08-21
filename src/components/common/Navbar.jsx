import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  UserPlus, 
  Bell, 
  Check, 
  Inbox, 
  ChevronDown, 
  LayoutDashboard, 
  User, 
  LogOut, 
  ShieldCheck, 
  Building2, 
  Car, 
  Compass, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function Navbar({ onOpenAuth }) {
  const { currentUser, logout, updateUserRole, refreshUserProfile } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotificationsView, setShowNotificationsView] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  
  const dropdownRef = useRef(null);

  // Load real notifications from localStorage for current user
  useEffect(() => {
    if (currentUser?.email) {
      const storageKey = `etn_notifs_${currentUser.email.toLowerCase()}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setNotificationsList(JSON.parse(saved));
        } else {
          setNotificationsList([]);
        }
      } catch (e) {
        setNotificationsList([]);
      }
    } else {
      setNotificationsList([]);
    }
  }, [currentUser]);

  // Sync notifications to localStorage
  const saveNotifications = (newNotifs) => {
    setNotificationsList(newNotifs);
    if (currentUser?.email) {
      const storageKey = `etn_notifs_${currentUser.email.toLowerCase()}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(newNotifs));
      } catch (e) {}
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setShowNotificationsView(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setShowNotificationsView(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Listen to live socket events for real notifications & live role updates
  useEffect(() => {
    if (!socket) return;

    // 1. Live User Role Promotion / Assignment
    const handleRoleUpdated = (updatedUser) => {
      if (updatedUser && currentUser?.email) {
        const userMail = currentUser.email.toLowerCase();
        if (updatedUser.email?.toLowerCase() === userMail || updatedUser._id === currentUser._id) {
          console.log(`✨ [LIVE ROLE SYNC] User role updated to: ${updatedUser.role}`);
          if (typeof updateUserRole === 'function') updateUserRole(updatedUser.role);
          if (typeof refreshUserProfile === 'function') refreshUserProfile();
        }
      }
    };

    // 2. Real booking created for this user
    const handleNewBooking = (booking) => {
      const userMail = currentUser?.email?.toLowerCase();
      if (booking && (booking.userEmail?.toLowerCase() === userMail || booking.email?.toLowerCase() === userMail)) {
        const newNotif = {
          id: 'notif-bk-' + Date.now(),
          title: `Booking Confirmed (${booking.bookingId || 'ETN-BK'}) 🎟️`,
          message: `Your reservation for ${booking.itemTitle || 'Stay / Tour'} (₹${Number(booking.totalAmount || booking.amount || 0).toLocaleString()}) has been confirmed!`,
          date: 'Just now',
          read: false
        };
        saveNotifications([newNotif, ...notificationsList]);
      }
    };

    // 3. Official Super Admin Announcements & Special Offers ONLY
    const handleSpecialOffer = (offer) => {
      if (offer && offer.title) {
        const newNotif = {
          id: 'notif-offer-' + Date.now(),
          title: `Special Offer: ${offer.title} 🎁`,
          message: offer.message || 'New exclusive festival travel discount announced for Tamil Nadu stays.',
          date: 'Just now',
          read: false
        };
        saveNotifications([newNotif, ...notificationsList]);
      }
    };

    // 4. Database reset wipe
    const handleDatabaseReset = () => {
      saveNotifications([]);
    };

    socket.on('user_role_updated', handleRoleUpdated);
    socket.on('new_booking', handleNewBooking);
    socket.on('special_announcement', handleSpecialOffer);
    socket.on('database_reset_zero', handleDatabaseReset);

    return () => {
      socket.off('user_role_updated', handleRoleUpdated);
      socket.off('new_booking', handleNewBooking);
      socket.off('special_announcement', handleSpecialOffer);
      socket.off('database_reset_zero', handleDatabaseReset);
    };
  }, [socket, currentUser, notificationsList, updateUserRole, refreshUserProfile]);

  const unreadCount = notificationsList.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = notificationsList.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const getDashboardPath = (role) => {
    if (role === 'super_admin' || role === 'admin') return '/dashboard/super-admin';
    if (role === 'owner' || role === 'vendor' || role === 'owner_and_vendor') return '/dashboard/vendor';
    if (role === 'user' || role === 'guest') return '/dashboard/user';
    return '/dashboard';
  };

  const getRoleLabel = (role) => {
    const labels = {
      super_admin: '👑 Super Admin',
      admin: '🛡️ Administrator',
      owner: '🏡 Property Host',
      vendor: '🚖 Transport Vendor',
      owner_and_vendor: '🏡🚖 Host & Vendor',
      guide: '🧭 Tour Guide',
      user: '🌴 Tourist / Traveler',
      guest: '🌴 Tourist',
      operations_manager: '💼 Operations Mgr',
      booking_executive: '💼 Booking Exec',
      customer_support_executive: '🎧 Support Exec',
      destination_content_manager: '✍️ Content Mgr',
      property_verification_manager: '🔍 Verification Mgr',
      transport_manager: '🚖 Transport Mgr',
      finance_accounts_manager: '💳 Finance Mgr',
      marketing_manager: '📈 Marketing Mgr',
      media_gallery_manager: '📸 Media Mgr',
      hr_staff_manager: '👥 HR Staff Mgr'
    };
    return labels[role] || (role ? role.replace(/_/g, ' ').toUpperCase() : 'TOURIST');
  };

  const handleNavigate = (path) => {
    setIsDropdownOpen(false);
    setShowNotificationsView(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setShowNotificationsView(false);
    logout();
    navigate('/');
  };

  return (
    <header className="glass-panel sticky top-4 z-50 mx-4 mb-6 rounded-full px-6 py-3 bg-[#f9f5f2]/95 border border-[#242429]/15 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        
        {/* Brand Logo Seal */}
        <Link to="/" className="flex items-center gap-3.5 no-underline group">
          <div className="w-10 h-10 rounded-full bg-[#ffffff] border border-[#242429] flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="Explore Tamil Nadu Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <span className="text-xl font-editorial font-bold tracking-tight text-[#000000] block leading-none">Explore Tamil Nadu</span>
            <span className="font-fira-mono text-[10px] font-medium text-[#919191] tracking-[0.18em] uppercase block mt-1">Stays & Resorts</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/" className="px-4 py-2 rounded-full text-xs font-fira-mono tracking-widest text-[#242429] hover:bg-[#ffffff] hover:border hover:border-[#242429]/20 transition-all">OVERVIEW</Link>
          <Link to="/explore" className="px-4 py-2 rounded-full text-xs font-fira-mono tracking-widest text-[#242429] hover:bg-[#ffffff] hover:border hover:border-[#242429]/20 transition-all">EXPLORE</Link>
          <Link to="/hotels" className="px-4 py-2 rounded-full text-xs font-fira-mono tracking-widest text-[#242429] hover:bg-[#ffffff] hover:border hover:border-[#242429]/20 transition-all">STAYS & RESORTS</Link>
          <Link to="/packages" className="px-4 py-2 rounded-full text-xs font-fira-mono tracking-widest text-[#242429] hover:bg-[#ffffff] hover:border hover:border-[#242429]/20 transition-all">PACKAGES</Link>
        </nav>

        {/* Auth & Downslide Profile Menu Area */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              
              {/* 👤 Sleek User Capsule Button (Click to Downslide Menu) */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full border transition-all shadow-sm ${
                  isDropdownOpen 
                    ? 'bg-[#ffffff] border-[#000000] ring-2 ring-[#242429]/10' 
                    : 'bg-[#ffffff] border-[#242429]/25 hover:border-[#242429]/60 hover:bg-[#f9f5f2]'
                }`}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                {/* Avatar with status indicator */}
                <div className="relative w-7 h-7 rounded-full bg-[#242429] text-[#ffffff] flex items-center justify-center font-bold text-xs shadow-inner">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span>{currentUser.name ? currentUser.name.substring(0, 1).toUpperCase() : 'U'}</span>
                  )}
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                </div>

                {/* Name */}
                <span className="text-xs font-bold text-[#1f242e] font-editorial max-w-[130px] sm:max-w-[160px] truncate">
                  {currentUser.name || currentUser.email.split('@')[0]}
                </span>

                {/* Unread dot indicator if unread notifications */}
                {unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                )}

                {/* Animated Dropdown Chevron */}
                <ChevronDown 
                  size={14} 
                  className={`text-[#242429]/70 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-black' : ''}`} 
                />
              </button>

              {/* 🔻 DOWNSLIDE DROPDOWN MENU */}
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-3 w-72 sm:w-80 rounded-3xl bg-[#ffffff] border border-[#242429]/25 shadow-2xl p-3.5 z-50 space-y-2 origin-top-right transition-all duration-200 animate-in fade-in slide-in-from-top-2"
                  style={{
                    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  
                  {/* 👑 Header Profile Card */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#fbf8f5] to-[#f2ede6] border border-[#242429]/10 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#242429] text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden">
                        {currentUser.avatar ? (
                          <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{currentUser.name ? currentUser.name.substring(0, 1).toUpperCase() : 'U'}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-extrabold text-[#000000] truncate font-editorial leading-snug">
                          {currentUser.name}
                        </h4>
                        <p className="text-[11px] text-[#71717a] truncate font-mono">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>

                    {/* Role Pill */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-[#242429]/15 text-[10px] font-fira-mono font-extrabold text-[#242429] shadow-xs">
                      {getRoleLabel(currentUser.role)}
                    </div>
                  </div>

                  {/* ═════════════════════════════════════════════════════ */}
                  {/* 📑 DOWNSLIDE OPTIONS (DASHBOARD, PROFILE, NOTIFS)     */}
                  {/* ═════════════════════════════════════════════════════ */}
                  {!showNotificationsView ? (
                    <div className="py-1 space-y-1">
                      
                      {/* 1. DASHBOARD OPTION */}
                      <button
                        type="button"
                        onClick={() => handleNavigate(getDashboardPath(currentUser.role))}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#f5f1ea] transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center transition-transform group-hover:scale-105">
                            <LayoutDashboard size={16} />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-[#18181b] block font-editorial">
                              Dashboard Portal
                            </span>
                            <span className="text-[10px] text-[#71717a] block font-mono">
                              {currentUser.role === 'super_admin' ? 'Super Admin Control Center' : currentUser.role === 'owner' ? 'Host & Listings Portal' : 'My Travel Bookings'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-[#a1a1aa] group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                      </button>

                      {/* 2. PROFILE OPTION */}
                      <button
                        type="button"
                        onClick={() => handleNavigate(getDashboardPath(currentUser.role))}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#f5f1ea] transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center transition-transform group-hover:scale-105">
                            <User size={16} />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-[#18181b] block font-editorial">
                              My Profile & Security
                            </span>
                            <span className="text-[10px] text-[#71717a] block font-mono">
                              Account settings, password & contact
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-[#a1a1aa] group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                      </button>

                      {/* 3. NOTIFICATION OPTION */}
                      <button
                        type="button"
                        onClick={() => setShowNotificationsView(true)}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#f5f1ea] transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center transition-transform group-hover:scale-105">
                            <Bell size={16} />
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-mono text-[9px] flex items-center justify-center font-black">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-[#18181b] block font-editorial">
                              Notifications
                            </span>
                            <span className="text-[10px] text-[#71717a] block font-mono">
                              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'Booking & system alerts'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[9px] font-bold">
                              {unreadCount} NEW
                            </span>
                          )}
                          <ChevronRight size={15} className="text-[#a1a1aa] group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>

                      {/* Divider */}
                      <div className="h-px bg-[#242429]/10 my-1" />

                      {/* 4. SIGN OUT OPTION */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-rose-50 text-rose-700 transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center transition-transform group-hover:scale-105">
                          <LogOut size={15} />
                        </div>
                        <span className="text-xs font-extrabold font-editorial">
                          Sign Out Account
                        </span>
                      </button>

                    </div>
                  ) : (
                    /* ═════════════════════════════════════════════════ */
                    /* 🔔 NOTIFICATIONS SUB-VIEW INSIDE DOWNSLIDE MENU    */
                    /* ═════════════════════════════════════════════════ */
                    <div className="space-y-3 p-1 animate-in fade-in">
                      <div className="flex justify-between items-center border-b border-[#242429]/10 pb-2">
                        <button
                          type="button"
                          onClick={() => setShowNotificationsView(false)}
                          className="text-xs font-bold text-slate-700 hover:text-black flex items-center gap-1 font-editorial"
                        >
                          ← Back
                        </button>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="font-fira-mono text-[10px] text-slate-500 hover:text-black uppercase tracking-wider font-bold flex items-center gap-1"
                          >
                            <Check size={11} /> Mark read
                          </button>
                        )}
                      </div>

                      {notificationsList.length === 0 ? (
                        <div className="py-6 text-center text-slate-500 space-y-1">
                          <Inbox size={24} className="mx-auto text-slate-300 mb-1" />
                          <p className="text-xs font-bold text-slate-700 font-editorial">No Notifications Yet</p>
                          <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto leading-tight">
                            Live reservation confirmations, role assignments, and platform updates will appear here.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {notificationsList.map(n => (
                            <div 
                              key={n.id} 
                              className={`p-2.5 rounded-xl border text-xs space-y-0.5 ${
                                n.read 
                                  ? 'bg-slate-50 border-slate-200 text-slate-600' 
                                  : 'bg-amber-50/70 border-amber-200 text-slate-900 font-medium'
                              }`}
                            >
                              <div className="flex justify-between items-center font-bold">
                                <span className="text-xs font-editorial truncate max-w-[170px]">{n.title}</span>
                                <span className="font-mono text-[9px] text-slate-400">{n.date}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onOpenAuth('login')} 
                className="glass-button glass-button-secondary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <LogIn size={14} /> Login
              </button>
              <button 
                onClick={() => onOpenAuth('register')} 
                className="glass-button text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <UserPlus size={14} /> Register
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
