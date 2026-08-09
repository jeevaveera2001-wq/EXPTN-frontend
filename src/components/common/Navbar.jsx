import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Bell, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenAuth }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([
    {
      id: 'notif-welcome',
      title: 'Welcome to Explore Tamil Nadu! 🌴',
      message: 'Account verified successfully. Welcome to Tamil Nadu Editorial Travel Platform!',
      date: 'Just now',
      read: false
    },
    {
      id: 'notif-bk-receipt',
      title: 'Booking Confirmation & Receipt (ETN-BK-9001) 🎟️',
      message: 'Receipt for Ooty Lakeview Grand Resort (₹14,400) sent to your email inbox. Paid via Razorpay UPI.',
      date: 'Today',
      read: false
    }
  ]);

  const unreadCount = notificationsList.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotificationsList(notificationsList.map(n => ({ ...n, read: true })));
  };

  const roleLabels = {
    guest: 'GUEST',
    user: 'TOURIST',
    owner: 'PROPERTY OWNER',
    guide: 'TOUR GUIDE',
    vendor: 'VENDOR',
    owner_and_vendor: 'HOST & VENDOR',
    admin: 'ADMIN',
    super_admin: 'SUPER ADMIN'
  };

  return (
    <header className="glass-panel sticky top-4 z-50 mx-4 mb-6 rounded-full px-6 py-3 bg-[#f9f5f2]/90 border border-[#242429]/15 shadow-xl">
      <div className="flex items-center justify-between">
        
        {/* Brand Logo Seal with Kobu Editorial Type */}
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
          
          {currentUser && (
            <Link to="/dashboard" className="px-4 py-2 rounded-full text-xs font-fira-mono font-bold text-[#000000] bg-[#ffffff] border border-[#242429] transition-all shadow-sm">
              PORTAL: {roleLabels[currentUser.role] || 'PORTAL'}
            </Link>
          )}
        </nav>

        {/* Auth & Notifications Area */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="relative">
              {/* Bell Icon */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-full bg-[#ffffff] border border-[#242429]/20 text-[#242429] hover:bg-[#f9f5f2] transition-all shadow-sm"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#070707] text-[#ffffff] font-fira-mono text-[9px] flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#ffffff] border border-[#242429] shadow-2xl p-5 z-50 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#242429]/15 pb-3">
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-[#242429]" />
                      <span className="font-editorial font-bold text-[#000000] text-sm">Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="font-fira-mono text-[10px] text-[#919191] hover:text-[#000000] flex items-center gap-1 uppercase tracking-wider"
                      >
                        <Check size={12} /> Mark read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto">
                    {notificationsList.map(n => (
                      <div key={n.id} className={`p-3 rounded-xl border text-xs space-y-1 ${n.read ? 'bg-[#f9f5f2] border-[#242429]/10 text-[#3e3e3e]' : 'bg-[#ffffff] border-[#242429] text-[#000000] font-medium'}`}>
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-[#000000] text-xs">{n.title}</span>
                          <span className="font-fira-mono text-[10px] text-[#919191]">{n.date}</span>
                        </div>
                        <p className="text-[11px] text-[#3e3e3e] leading-tight">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#ffffff] border border-[#242429]/30 px-3 py-1.5 rounded-full text-xs font-fira-mono font-medium text-[#242429] shadow-sm">
                <div className="w-5 h-5 rounded-full bg-[#242429] text-[#ffffff] flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name.substring(0, 1).toUpperCase()}
                </div>
                <span className="truncate max-w-[100px]">{currentUser.name}</span>
              </div>
              <button 
                onClick={logout} 
                className="glass-button glass-button-secondary text-xs px-4 py-1.5"
              >
                Sign Out
              </button>
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
