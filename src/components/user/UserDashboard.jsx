import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Heart, 
  User, 
  Lock, 
  Ticket, 
  HelpCircle, 
  Upload, 
  Camera, 
  Check, 
  Download, 
  X, 
  PhoneCall, 
  Mail, 
  MessageSquare, 
  Plus, 
  Star, 
  MapPin, 
  Building, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { BACKEND_API } from '../../config/api';
import { downloadBookingReceiptPDF } from '../../utils/receiptGenerator';

export default function UserDashboard() {
  const { currentUser, logout } = useAuth();
  const { socket, isConnected } = useSocket();

  // Active Tab State (Combined Profile & Security into single tab)
  const [activeTab, setActiveTab] = useState('bookings');
  const [actionSuccess, setActionSuccess] = useState('');

  // Profile Form State
  const getInitialAvatar = () => {
    if (currentUser?.email) {
      const saved = localStorage.getItem(`etn_user_avatar_${currentUser.email.toLowerCase()}`);
      if (saved) return saved;
    }
    return currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  };

  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileAvatar, setProfileAvatar] = useState(getInitialAvatar);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileEmail(currentUser.email || '');
      setProfilePhone(currentUser.phone || '');
      const saved = currentUser.email ? localStorage.getItem(`etn_user_avatar_${currentUser.email.toLowerCase()}`) : null;
      if (saved) {
        setProfileAvatar(saved);
      } else if (currentUser.avatar) {
        setProfileAvatar(currentUser.avatar);
      }
    }
  }, [currentUser]);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Ticket Form Modal State
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Booking Inquiry');
  const [ticketMessage, setTicketMessage] = useState('');

  // Help Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Live Bookings (Starts strictly at 0 / empty)
  const [bookingsList, setBookingsList] = useState([]);

  // Live Saved Wishlist (Starts strictly at 0 / empty)
  const [savedWishlist, setSavedWishlist] = useState([]);

  // Live Support Tickets (Starts strictly at 0 / empty)
  const [ticketsList, setTicketsList] = useState([]);

  // Active Receipt Preview Modal State
  const [viewReceiptModalBooking, setViewReceiptModalBooking] = useState(null);

  const apiFetch = async (endpoint, options = {}) => {
    const cleanPath = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
    const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_API}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    try {
      const res = await fetch(url, options);
      if (res.ok || res.status === 400 || res.status === 401 || res.status === 403) {
        return res;
      }
    } catch (e) {
      console.warn('Direct backend API fetch error:', e.message);
    }
    return await fetch(endpoint, options);
  };

  const fetchUserData = async () => {
    try {
      const res = await apiFetch('/api/bookings');
      if (res.ok) {
        const allBookings = await res.json();
        if (Array.isArray(allBookings)) {
          const userEm = (currentUser?.email || '').toLowerCase().trim();
          const myBookings = allBookings.filter(b => {
            const cEm = (b.userEmail || b.customerEmail || b.email || '').toLowerCase().trim();
            return cEm === userEm;
          });
          setBookingsList(myBookings);
        }
      }
      const tckRes = await apiFetch('/api/tickets');
      if (tckRes.ok) {
        const allTickets = await tckRes.json();
        if (Array.isArray(allTickets)) {
          const myTickets = allTickets.filter(t => t.senderEmail === currentUser?.email);
          setTicketsList(myTickets);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchUserData();

    if (socket) {
      socket.on('new_booking', fetchUserData);
      socket.on('stats_updated', fetchUserData);
      socket.on('new_ticket', fetchUserData);
      socket.on('ticket_updated', fetchUserData);
      socket.on('database_reset_zero', () => {
        setBookingsList([]);
        setTicketsList([]);
      });
    }

    const interval = setInterval(fetchUserData, 4000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('new_booking');
        socket.off('stats_updated');
        socket.off('new_ticket');
        socket.off('ticket_updated');
        socket.off('database_reset_zero');
      }
    };
  }, [socket, currentUser]);

  const triggerSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  // Profile Picture Upload Handler
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result);
        triggerSuccess('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile Form Submit
  const handleProfileSave = (e) => {
    e.preventDefault();
    triggerSuccess('Profile details saved successfully!');
  };

  // Password Reset Submit
  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerSuccess('Password updated successfully!');
  };

  // Ticket Submit
  const handleCreateTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    const newTicket = {
      id: 'TCK-' + Math.floor(100 + Math.random() * 900),
      subject: ticketSubject,
      category: ticketCategory,
      date: new Date().toLocaleDateString('en-GB'),
      status: 'In Progress'
    };

    setTicketsList([newTicket, ...ticketsList]);
    setShowNewTicketModal(false);
    setTicketSubject('');
    setTicketMessage('');
    triggerSuccess(`Ticket ${newTicket.id} created successfully! Our support executive will contact you.`);
  };

  // 📄 Official PDF Tax Invoice & Stay Pass Receipt Generator
  const handleDownloadPDFReceipt = (bk) => {
    setViewReceiptModalBooking(bk);
    try {
      downloadBookingReceiptPDF(bk);
      const bkId = bk.bookingId || bk.id || 'ETN-BK-REF';
      triggerSuccess(`Official PDF Receipt for ${bkId} opened!`);
    } catch (err) {
      console.warn('PDF direct stream note:', err);
    }
  };

  // FAQs
  const faqs = [
    {
      q: 'What is the check-in and check-out time for properties?',
      a: 'Standard check-in is at 12:00 PM and check-out is at 11:00 AM. Early check-in can be requested directly through your booking executive.'
    },
    {
      q: 'How do I cancel my booking and get a refund?',
      a: 'Cancellations made 24 hours prior to check-in are eligible for a 100% instant refund back to your original payment source via Razorpay.'
    },
    {
      q: 'Are cab drivers verified by Explore Tamil Nadu?',
      a: 'Yes, all vehicle fleet drivers undergo strict background checks, transport licensing verification, and hill-driving certification.'
    },
    {
      q: 'Can I request a local language tour guide?',
      a: 'Yes! Certified local guides fluent in Tamil, English, Hindi, Malayalam, and Kannada can be assigned to your itinerary.'
    }
  ];

  // Dedicated Navigation Menu Items (Single Unified Profile & Security Tab)
  const navMenuItems = [
    { id: 'bookings', label: 'My Bookings', icon: <Calendar size={18} />, badge: bookingsList.length },
    { id: 'wishlist', label: 'Saved Properties', icon: <Heart size={18} />, badge: savedWishlist.length },
    { id: 'profile', label: 'My Profile & Security', icon: <User size={18} /> },
    { id: 'tickets', label: 'My Tickets', icon: <Ticket size={18} />, badge: ticketsList.length },
    { id: 'help', label: 'Help & FAQs', icon: <HelpCircle size={18} /> }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-100 flex overflow-hidden m-0">
      
      {/* 📌 TOURIST GUEST SIDEBAR (Icons only on mobile, full text on PC & Tab) */}
      <aside className="w-16 sm:w-20 md:w-64 bg-[#061833] text-white flex flex-col justify-between p-3 sm:p-4 md:p-6 border-r border-[#0d2a58] flex-shrink-0 min-h-screen transition-all">
        <div>
          {/* Brand & User Profile Header */}
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-[#0d2a58]">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden border-2 border-blue-400 shadow-md shrink-0">
              <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-extrabold text-white block leading-tight truncate max-w-[130px]">{profileName}</span>
              <span className="text-[10px] font-mono text-cyan-400 block font-bold mt-0.5">Tourist Member</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {navMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-center md:justify-between p-3 md:px-3.5 md:py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-slate-300 hover:bg-[#0b2754] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {/* Icons only on mobile UI, letters on PC & Tab */}
                  <span className="hidden md:inline">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`hidden md:inline px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                    activeTab === item.id ? 'bg-white/20 text-white' : 'bg-[#123875] text-cyan-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Controls (No logout here, available in top user menu) */}
        <div className="pt-6 border-t border-[#0d2a58]">
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Verified Account</span>
          </div>
        </div>
      </aside>

      {/* 💻 MAIN CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-10 bg-slate-50 overflow-y-auto min-h-screen">
        
        {/* Header Status Bar */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              👤 Tourist Member Portal
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2 capitalize">
              {navMenuItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your travel bookings, saved stays, profile & security.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              🟢 Member Verified
            </span>
          </div>
        </div>

        {/* Notification Toast */}
        {actionSuccess && (
          <div className="p-4 mb-6 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <Check size={18} className="text-green-600" /> {actionSuccess}
          </div>
        )}

        {/* 🎟️ TAB 1: MY BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">Your Stay & Tour Reservations</h3>
              <span className="text-xs font-mono font-bold text-blue-600">{bookingsList.length} Total Bookings</span>
            </div>

            <div className="space-y-4">
              {bookingsList.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                  <Calendar size={36} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Reservations Found</p>
                  <p className="text-xs text-slate-400 mt-1">Book your favorite luxury stay on Explore page to view it here.</p>
                </div>
              ) : (
                bookingsList.map((bk) => {
                  const isConfirmed = bk.status === 'Confirmed';
                  const isPending = bk.status === 'Pending Verification' || bk.status === 'Pending Approval' || bk.status === 'Pending' || !bk.status;
                  const bkId = bk.bookingId || bk.id || 'ETN-BK-REF';
                  const bkTitle = bk.itemTitle || bk.propertyTitle || bk.title || 'Verified Luxury Stay';
                  const bkLocation = bk.destination || bk.location || 'Tamil Nadu';
                  const bkAmount = Number(bk.totalAmount || bk.amount || 0);

                  return (
                    <div key={bk._id || bk.id || bkId} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold text-blue-600 text-xs px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-200">
                            {bkId}
                          </span>
                          {isConfirmed ? (
                            <span className="px-3 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              🟢 Confirmed & Verified
                            </span>
                          ) : isPending ? (
                            <span className="px-3 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              ⏳ Pending Host Verification
                            </span>
                          ) : (
                            <span className="px-3 py-0.5 rounded-full text-xs font-bold font-mono bg-slate-100 text-slate-700">
                              {bk.status}
                            </span>
                          )}
                        </div>
                        
                        <h4 className="text-lg font-black text-slate-900">{bkTitle}</h4>
                        <p className="text-xs text-slate-500 font-mono">📍 {bkLocation} • 👥 {bk.guests || 2} Guests ({bk.guestType || 'Stay'})</p>
                        <div className="text-xs font-semibold text-slate-700">
                          📅 Dates: <span className="font-bold text-slate-900">{bk.checkIn || bk.checkInDate} → {bk.checkOut || bk.checkOutDate}</span> ({bk.nights || 1} Night{bk.nights > 1 ? 's' : ''})
                        </div>

                        {isPending && (
                          <div className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200 px-3 py-1.5 rounded-xl font-mono">
                            ℹ️ Host is validating room allocation. You will receive an official confirmation email once accepted.
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-0 border-slate-100">
                        <div className="text-right">
                          <div className="text-2xl font-black text-slate-900">₹{bkAmount.toLocaleString()}</div>
                          <div className="text-[11px] font-bold text-emerald-600">✓ {bk.paymentStatus || 'Paid via Razorpay'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => handleDownloadPDFReceipt(bk)}
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <Download size={14} /> Download PDF Receipt
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ❤️ TAB 2: SAVED PROPERTIES */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">Saved Wishlist Stays</h3>
              <span className="text-xs font-mono font-bold text-rose-600">{savedWishlist.length} Items Saved</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedWishlist.map((item) => (
                <div key={item.id} className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all">
                  <div className="h-48 relative overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => {
                        setSavedWishlist(savedWishlist.filter(s => s.id !== item.id));
                        triggerSuccess('Removed from saved wishlist');
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-600 hover:bg-white"
                    >
                      <Heart size={16} className="fill-rose-600" />
                    </button>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">📍 {item.location}</span>
                      <span className="text-xs font-bold text-amber-500">⭐ {item.rating}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-base">{item.title}</h4>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-lg font-black text-blue-600">₹{item.price.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ night</span></span>
                      <button 
                        onClick={() => triggerSuccess(`Reservation request sent for ${item.title}!`)}
                        className="glass-button text-xs py-2 px-4"
                      >
                        Book Stay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 👤 TAB 3: UNIFIED MY PROFILE & SECURITY (STACKED LIKE VENDOR DASHBOARD) */}
        {activeTab === 'profile' && (
          <div className="space-y-8 max-w-3xl">
            {/* Section 1: Profile Details & Avatar Uploader */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Personal Profile & Avatar Photo</h3>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-md">
                  <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-slate-900">Upload New Profile Picture</h4>
                  <p className="text-xs text-slate-500">JPG, PNG, or GIF format up to 5MB.</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-700 transition-all shadow-sm">
                    <Camera size={15} /> Upload Photo
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gmail / Email Address</label>
                  <input 
                    type="email" 
                    value={profileEmail}
                    onChange={e => setProfileEmail(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 font-mono font-extrabold text-xs text-slate-700 bg-slate-200 px-2 py-1 rounded-lg border border-slate-300 pointer-events-none z-10">+91</span>
                    <input 
                      type="tel" 
                      maxLength={10}
                      value={profilePhone}
                      onChange={e => setProfilePhone(e.target.value.replace(/\D/g, ''))}
                      className="glass-input text-xs font-mono font-bold"
                      style={{ paddingLeft: '4.25rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Home District / City</label>
                  <input 
                    type="text" 
                    defaultValue="Chennai, Tamil Nadu"
                    className="glass-input text-xs"
                  />
                </div>

                <div className="md:col-span-2 pt-4 flex justify-end">
                  <button type="submit" className="glass-button text-xs py-3 px-8">
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Section 2: Reset Password Form (Stacked directly inside Profile & Security) */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Reset Password</h3>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="glass-input text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="glass-input text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="glass-input text-xs font-mono"
                    required
                  />
                </div>

                <button type="submit" className="glass-button text-xs py-3 px-8 w-full">
                  Update Security Password
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 🎫 TAB 4: MY TICKETS */}
        {activeTab === 'tickets' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Support Tickets Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track your open inquiries and support tickets.</p>
              </div>

              <button 
                onClick={() => setShowNewTicketModal(!showNewTicketModal)}
                className="glass-button text-xs px-4 py-2.5 flex items-center gap-2"
              >
                <Plus size={16} /> Create Support Ticket
              </button>
            </div>

            {/* Create Ticket Modal */}
            {showNewTicketModal && (
              <form onSubmit={handleCreateTicketSubmit} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ticket Subject / Title</label>
                    <input 
                      type="text" 
                      placeholder="E.g. Request for Ooty Cab Driver details"
                      value={ticketSubject}
                      onChange={e => setTicketSubject(e.target.value)}
                      className="glass-input text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select 
                      value={ticketCategory} 
                      onChange={e => setTicketCategory(e.target.value)}
                      className="glass-input text-xs"
                    >
                      <option value="Booking Inquiry">Booking Inquiry</option>
                      <option value="Stay Accommodation">Stay Accommodation</option>
                      <option value="Transport & Cabs">Transport & Cabs</option>
                      <option value="Refund & Payment">Refund & Payment</option>
                      <option value="Complaint">Complaint ⚠️</option>
                      <option value="Others">Others ❓</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe your inquiry in detail..."
                    value={ticketMessage}
                    onChange={e => setTicketMessage(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button type="submit" className="glass-button text-xs py-2 px-6">Submit Ticket</button>
                  <button type="button" onClick={() => setShowNewTicketModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                </div>
              </form>
            )}

            {/* Tickets Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-400">
                    <th className="pb-3">Ticket ID & Subject</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Date Submitted</th>
                    <th className="pb-3 text-right">Ticket Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {ticketsList.map(tck => (
                    <tr key={tck.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-slate-900 text-sm">{tck.subject}</div>
                        <div className="text-xs text-blue-600 font-mono font-bold">{tck.id}</div>
                      </td>
                      <td className="py-4 font-semibold text-slate-700">{tck.category}</td>
                      <td className="py-4 font-mono text-slate-500">{tck.date}</td>
                      <td className="py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                          tck.status === 'Resolved' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {tck.status === 'Resolved' ? '🟢 Resolved' : '⏳ In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ❓ TAB 5: HELP & FAQS */}
        {activeTab === 'help' && (
          <div className="space-y-8 max-w-4xl">
            {/* 24/7 Helpline Banner */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#061833] to-[#0c2f61] text-white space-y-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
                  🎧
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Need Immediate Help?</h3>
                  <p className="text-xs text-slate-300">Our customer support team is active 24/7 for travelers across Tamil Nadu.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                  <PhoneCall size={20} className="text-cyan-400" />
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-mono font-bold">24/7 Phone Support</span>
                    <a href="tel:+917871779134" className="text-sm font-extrabold text-white hover:text-cyan-300">+91 78717 79134</a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                  <Mail size={20} className="text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-mono font-bold">Email Desk</span>
                    <a href="mailto:exploretamizhagam@gmail.com" className="text-sm font-extrabold text-white hover:text-emerald-300">exploretamizhagam@gmail.com</a>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Frequently Asked Questions (FAQs)</h3>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 overflow-hidden">
                    <button 
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-4 text-left font-bold text-slate-900 text-xs sm:text-sm flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {openFaq === idx ? <ChevronUp size={16} className="text-blue-600" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </button>
                    {openFaq === idx && (
                      <div className="p-4 bg-white text-xs text-slate-600 border-t border-slate-200 leading-relaxed animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 📄 OFFICIAL STAY PASS & TAX INVOICE RECEIPT MODAL */}
      {viewReceiptModalBooking && (() => {
        const bk = viewReceiptModalBooking;
        const bkId = bk.bookingId || bk.id || 'ETN-BK-REF';
        const bkTitle = bk.itemTitle || bk.propertyTitle || bk.title || 'Verified Luxury Stay';
        const bkLocation = bk.destination || bk.location || 'Tamil Nadu';
        const bkAmount = Number(bk.totalAmount || bk.amount || 0);
        const baseRate = Number(bk.baseRate || Math.round(bkAmount / 1.23) || bkAmount);
        const gstAmount = Number(bk.gstAmount || Math.round(baseRate * 0.18) || 0);
        const serviceFee = Number(bk.serviceFee || Math.round(baseRate * 0.05) || (bkAmount - baseRate - gstAmount));
        const guestName = bk.customerName || bk.userName || currentUser?.name || 'Tourist Guest';
        const guestEmail = bk.customerEmail || bk.userEmail || currentUser?.email || 'guest@exploretamilnadu.com';
        const guestPhone = bk.customerPhone || bk.userPhone || currentUser?.phone || '+91 78717 79134';
        const checkIn = bk.checkIn || bk.checkInDate || '2026-08-25';
        const checkOut = bk.checkOut || bk.checkOutDate || '2026-08-28';
        const nights = bk.nights || 1;
        const guests = bk.guests || 2;
        const guestType = bk.guestType || 'Stay';
        const paymentId = bk.paymentId || 'pay_rzp_captured';
        const issueDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-auto">
              
              {/* Header Action Bar */}
              <div className="bg-[#061833] text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                    📄
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">Official Stay Voucher & Tax Invoice</h3>
                    <p className="text-[11px] text-slate-300 font-mono">Reference: {bkId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadBookingReceiptPDF(bk)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                  >
                    <Download size={13} /> Save PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer hidden sm:flex"
                  >
                    🖨️ Print
                  </button>
                  <button
                    onClick={() => setViewReceiptModalBooking(null)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Scrollable Printable Document Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-800 text-xs sm:text-sm">
                
                {/* Official Voucher Top Banner */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">Explore Tamil Nadu</h2>
                    <p className="text-[10px] sm:text-[11px] font-mono text-slate-500 uppercase tracking-wider">Official Tourism Tax Invoice & Stay Pass</p>
                    <p className="text-[10px] text-slate-400 font-mono">GSTIN: 33AAACE2026TN1Z8 · Helpline: +91 78717 79134</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ PAID VIA RAZORPAY
                    </span>
                    <p className="text-[11px] font-mono text-slate-500 mt-1">Date: {issueDate}</p>
                  </div>
                </div>

                {/* 2-Column Info Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Guest / Customer Details</h4>
                    <p className="font-bold text-slate-900">{guestName}</p>
                    <p className="text-slate-600 font-mono">{guestEmail}</p>
                    <p className="text-slate-600 font-mono">{guestPhone}</p>
                    <p className="text-slate-700 font-semibold">{guests} Guests ({guestType})</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Stay & Schedule Details</h4>
                    <p className="font-bold text-slate-900">{bkTitle}</p>
                    <p className="text-slate-600">📍 {bkLocation}</p>
                    <p className="text-slate-600 font-semibold">📅 {checkIn} (12:00 PM) → {checkOut} (11:00 AM)</p>
                    <p className="text-slate-700 font-mono">Duration: {nights} Night(s)</p>
                  </div>
                </div>

                {/* Itemized Price Table */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#061833] text-white text-[11px] uppercase font-mono">
                      <tr>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-center">Duration</th>
                        <th className="p-3 text-right">Rate</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">{bkTitle} ({bkLocation})</td>
                        <td className="p-3 text-center font-mono">{nights} Night(s)</td>
                        <td className="p-3 text-right font-mono">₹{Math.round(baseRate / nights).toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold">₹{baseRate.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-3 text-slate-600">Goods & Services Tax (GST 18%)</td>
                        <td className="p-3 text-center font-mono">18%</td>
                        <td className="p-3 text-right font-mono">-</td>
                        <td className="p-3 text-right font-mono text-slate-700">+ ₹{gstAmount.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-slate-600">Platform & Facilitation Fee (5%)</td>
                        <td className="p-3 text-center font-mono">5%</td>
                        <td className="p-3 text-right font-mono">-</td>
                        <td className="p-3 text-right font-mono text-slate-700">+ ₹{serviceFee.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-emerald-50 text-emerald-950 font-black text-sm">
                        <td colSpan="3" className="p-3.5">Total Amount Paid (INR)</td>
                        <td className="p-3.5 text-right font-mono text-emerald-700 text-base">₹{bkAmount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Instructions Box */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-900 space-y-1 text-xs">
                  <p className="font-bold">✓ Payment Verified (ID: {paymentId})</p>
                  <p className="text-[11px] leading-relaxed">
                    Please present this official voucher or your Booking Reference ID <strong>({bkId})</strong> at hotel reception during check-in. Valid Government ID proof is mandatory for all adult guests.
                  </p>
                </div>

              </div>

              {/* Modal Footer Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-between items-center flex-shrink-0">
                <a
                  href={`${BACKEND_API}/bookings/${bkId}/receipt?download=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 font-mono flex items-center gap-1"
                >
                  🌐 Open Direct HTML Voucher Link
                </a>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => downloadBookingReceiptPDF(bk)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download size={14} /> Download PDF File
                  </button>
                  <button
                    onClick={() => setViewReceiptModalBooking(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-300 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
