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
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ProfileModal from '../profile/ProfileModal';

export default function Navbar({ onOpenAuth }) {
  const { currentUser, logout, updateUserRole, refreshUserProfile } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotificationsView, setShowNotificationsView] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  // Load real notifications from localStorage for current user
  const loadNotifications = () => {
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
  };

  useEffect(() => {
    loadNotifications();
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
        setMobileNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Listen to custom notification events & live socket broadcasts
  useEffect(() => {
    const handleCustomNotif = () => loadNotifications();
    window.addEventListener('etn_notification_event', handleCustomNotif);

    if (!socket) return () => window.removeEventListener('etn_notification_event', handleCustomNotif);

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

    // 3. New Notification broadcast
    const handleNewNotification = (notif) => {
      const userMail = currentUser?.email?.toLowerCase();
      if (!notif.userEmail || notif.userEmail.toLowerCase() === userMail) {
        const newNotifObj = {
          id: notif.id || 'notif-' + Date.now(),
          title: notif.title || 'Platform Notification',
          message: notif.message || '',
          date: 'Just now',
          read: false
        };
        saveNotifications([newNotifObj, ...notificationsList]);
      }
    };

    socket.on('user_role_updated', handleRoleUpdated);
    socket.on('new_booking', handleNewBooking);
    socket.on('new_notification', handleNewNotification);

    return () => {
      window.removeEventListener('etn_notification_event', handleCustomNotif);
      socket.off('user_role_updated', handleRoleUpdated);
      socket.off('new_booking', handleNewBooking);
      socket.off('new_notification', handleNewNotification);
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
    setMobileNavOpen(false);
    navigate(path);
  };

  const handleOpenProfileModal = () => {
    setIsDropdownOpen(false);
    setShowNotificationsView(false);
    setMobileNavOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setShowNotificationsView(false);
    setMobileNavOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-2 sm:top-4 z-40 mx-2 sm:mx-4 mb-3 sm:mb-6 rounded-full px-3.5 sm:px-6 py-2 sm:py-3 bg-[#f9f5f2]/95 border border-[#242429]/15 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          
          {/* Brand Logo Seal */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3.5 no-underline group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ffffff] border border-[#242429] flex items-center justify-center p-0.5 sm:p-1 shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <img src="/logo.png" alt="Explore Tamil Nadu Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-lg font-editorial font-bold tracking-tight text-[#000000] block leading-none truncate max-w-[120px] sm:max-w-none">
                Explore Tamil Nadu
              </span>
              <span className="font-fira-mono text-[7px] sm:text-[9px] font-medium text-[#919191] tracking-[0.12em] sm:tracking-[0.18em] uppercase block mt-0.5 sm:mt-1">
                Stays & Resorts
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link to="/" className="px-3.5 py-1.5 rounded-full text-xs font-fira-mono tracking-widest text-[#242429] hover:bg-[#ffffff] hover:border hover:border-[#242429]/20 transition-all">OVERVIEW</Link>
            <Link to="/explore" className="px-3.5 py-1.5 rounded-full text-xs font-fira-mono tracking-widest text-[#242429] hover:bg-[#ffffff] hover:border hover:border-[#242429]/20 transition-all">EXPLORE</Link>
            <Link to="/hotels" className="px-3.5 py-1.5 rounded-full text-xs font-fira-mono tracking-widest text-[#242429] hover:bg-[#ffffff] hover:border hover:border-[#242429]/20 transition-all">STAYS & RESORTS</Link>
            <Link to="/packages" className="px-3.5 py-1.5 rounded-full text-xs font-fira-mono tracking-widest text-[#242429] hover:bg-[#ffffff] hover:border hover:border-[#242429]/20 transition-all">PACKAGES</Link>
          </nav>

          {/* Auth & Profile Area */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Mobile Nav Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-full bg-white border border-[#242429]/20 text-[#242429] hover:bg-slate-100 transition-all shrink-0"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X size={15} /> : <Menu size={15} />}
            </button>

            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                
                {/* 👤 Sleek User Capsule Button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-1.5 sm:gap-2.5 pl-1.5 pr-2.5 sm:pl-2 sm:pr-3.5 py-1 sm:py-1.5 rounded-full border transition-all shadow-sm shrink-0 ${
                    isDropdownOpen 
                      ? 'bg-[#ffffff] border-[#000000] ring-2 ring-[#242429]/10' 
                      : 'bg-[#ffffff] border-[#242429]/25 hover:border-[#242429]/60 hover:bg-[#f9f5f2]'
                  }`}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  {/* Avatar */}
                  <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#242429] text-[#ffffff] flex items-center justify-center font-bold text-xs shadow-inner shrink-0 overflow-hidden">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{currentUser.name ? currentUser.name.substring(0, 1).toUpperCase() : 'U'}</span>
                    )}
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                  </div>

                  {/* Name (hidden on tiny screens, shown on sm+) */}
                  <span className="text-xs font-bold text-[#1f242e] font-editorial max-w-[70px] sm:max-w-[130px] truncate">
                    {currentUser.name || currentUser.email.split('@')[0]}
                  </span>

                  {/* Unread indicator */}
                  {unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  )}

                  <ChevronDown 
                    size={12} 
                    className={`text-[#242429]/70 transition-transform duration-300 shrink-0 ${isDropdownOpen ? 'rotate-180 text-black' : ''}`} 
                  />
                </button>

                {/* 🔻 DOWNSLIDE DROPDOWN MENU */}
                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-3 w-72 sm:w-80 rounded-3xl bg-[#ffffff] border border-[#242429]/25 shadow-2xl p-3 sm:p-3.5 z-50 space-y-2 origin-top-right transition-all duration-200 animate-in fade-in slide-in-from-top-2"
                    style={{
                      boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    
                    {/* Header Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#fbf8f5] to-[#f2ede6] border border-[#242429]/10 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#242429] text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden shrink-0">
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

                    {!showNotificationsView ? (
                      <div className="py-1 space-y-1">
                        
                        {/* Dashboard Option */}
                        <button
                          type="button"
                          onClick={() => handleNavigate(getDashboardPath(currentUser.role))}
                          className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#f5f1ea] transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                              <LayoutDashboard size={16} />
                            </div>
                            <div>
                              <span className="text-xs font-extrabold text-[#18181b] block font-editorial">
                                Dashboard Portal
                              </span>
                              <span className="text-[10px] text-[#71717a] block font-mono truncate max-w-[170px]">
                                {currentUser.role === 'super_admin' ? 'Super Admin Control Center' : currentUser.role === 'owner' ? 'Host & Listings Portal' : 'My Travel Bookings'}
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={15} className="text-[#a1a1aa] group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                        </button>

                        {/* Profile Option */}
                        <button
                          type="button"
                          onClick={handleOpenProfileModal}
                          className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#f5f1ea] transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                              <User size={16} />
                            </div>
                            <div>
                              <span className="text-xs font-extrabold text-[#18181b] block font-editorial">
                                My Profile & Security
                              </span>
                              <span className="text-[10px] text-[#71717a] block font-mono">
                                Photo upload & password reset
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={15} className="text-[#a1a1aa] group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                        </button>

                        {/* Notifications Option */}
                        <button
                          type="button"
                          onClick={() => setShowNotificationsView(true)}
                          className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#f5f1ea] transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
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
                                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'Booking & security alerts'}
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

                        <div className="h-px bg-[#242429]/10 my-1" />

                        {/* Sign Out Option */}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-rose-50 text-rose-700 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                            <LogOut size={15} />
                          </div>
                          <span className="text-xs font-extrabold font-editorial">
                            Sign Out Account
                          </span>
                        </button>

                      </div>
                    ) : (
                      /* Notifications Sub-View */
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
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {notificationsList.map(n => (
                              <div 
                                key={n.id} 
                                className={`p-2.5 rounded-2xl border text-xs space-y-0.5 transition-all ${
                                  n.read 
                                    ? 'bg-slate-50 border-slate-200 text-slate-600' 
                                    : 'bg-amber-50/70 border-amber-200 text-slate-900 font-medium'
                                }`}
                              >
                                <div className="flex justify-between items-center font-bold">
                                  <span className="text-xs font-editorial truncate max-w-[170px]">{n.title}</span>
                                  <span className="font-mono text-[9px] text-slate-400">{n.date}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-snug font-mono">{n.message}</p>
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
              /* Logged Out Buttons: Perfectly aligned for mobile & desktop */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button 
                  onClick={() => onOpenAuth('login')} 
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#242429] text-white hover:bg-black font-editorial font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  <LogIn size={13} /> Login
                </button>
                <button 
                  onClick={() => onOpenAuth('register')} 
                  className="hidden sm:flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-[#242429]/25 text-[#242429] hover:bg-slate-100 font-editorial font-bold text-xs items-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  <UserPlus size={13} /> Register
                </button>
              </div>
            )}
          </div>

        </div>

        {/* 📱 Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-[#242429]/15 flex flex-col gap-2 animate-in fade-in">
            <Link 
              to="/" 
              onClick={() => setMobileNavOpen(false)}
              className="px-4 py-2 rounded-2xl text-xs font-fira-mono tracking-widest text-[#242429] hover:bg-white transition-all font-bold"
            >
              OVERVIEW
            </Link>
            <Link 
              to="/explore" 
              onClick={() => setMobileNavOpen(false)}
              className="px-4 py-2 rounded-2xl text-xs font-fira-mono tracking-widest text-[#242429] hover:bg-white transition-all font-bold"
            >
              EXPLORE
            </Link>
            <Link 
              to="/hotels" 
              onClick={() => setMobileNavOpen(false)}
              className="px-4 py-2 rounded-2xl text-xs font-fira-mono tracking-widest text-[#242429] hover:bg-white transition-all font-bold"
            >
              STAYS & RESORTS
            </Link>
            <Link 
              to="/packages" 
              onClick={() => setMobileNavOpen(false)}
              className="px-4 py-2 rounded-2xl text-xs font-fira-mono tracking-widest text-[#242429] hover:bg-white transition-all font-bold"
            >
              PACKAGES
            </Link>

            {/* Quick Register link inside mobile drawer if logged out */}
            {!currentUser && (
              <div className="pt-2 border-t border-[#242429]/10 grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setMobileNavOpen(false); onOpenAuth('login'); }}
                  className="py-2.5 rounded-2xl bg-[#242429] text-white text-xs font-bold font-editorial flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <LogIn size={13} /> Sign In
                </button>
                <button
                  onClick={() => { setMobileNavOpen(false); onOpenAuth('register'); }}
                  className="py-2.5 rounded-2xl bg-white border border-[#242429]/25 text-[#242429] text-xs font-bold font-editorial flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <UserPlus size={13} /> Register
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* 👤 Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
}
