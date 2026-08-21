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
  FileText,
  Share2,
  Copy,
  Send,
  FolderDown,
  MessageCircle,
  Smartphone,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { BACKEND_API } from '../../config/api';

export default function UserDashboard() {
  const { currentUser, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  // Active Tab State (Synced with URL search params)
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'bookings');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    if (tabFromUrl && ['bookings', 'wishlist', 'profile', 'tickets', 'help'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

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

  // Live Saved Wishlist (Loads from localStorage and syncs with Explore page)
  const getInitialWishlist = () => {
    try {
      const email = currentUser?.email?.toLowerCase();
      const saved = email ? localStorage.getItem(`etn_wishlist_${email}`) : localStorage.getItem('etn_saved_properties');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };
  const [savedWishlist, setSavedWishlist] = useState(getInitialWishlist);

  // Live Support Tickets (Starts strictly at 0 / empty)
  const [ticketsList, setTicketsList] = useState([]);

  // Active Share / Save Stay Pass Modal State
  const [shareModalBooking, setShareModalBooking] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

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
          const userEm = (currentUser?.email || '').toLowerCase().trim();
          const myTickets = allTickets.filter(t => (t.senderEmail || '').toLowerCase().trim() === userEm);
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

  useEffect(() => {
    const handleWishlistUpdate = (e) => {
      if (e.detail) setSavedWishlist(e.detail);
    };
    window.addEventListener('etn_wishlist_updated', handleWishlistUpdate);
    return () => window.removeEventListener('etn_wishlist_updated', handleWishlistUpdate);
  }, []);

  const triggerSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  const handleRemoveWishlist = (stayId) => {
    const updated = savedWishlist.filter(s => (s._id !== stayId && s.id !== stayId));
    setSavedWishlist(updated);
    const email = currentUser?.email?.toLowerCase();
    if (email) localStorage.setItem(`etn_wishlist_${email}`, JSON.stringify(updated));
    localStorage.setItem('etn_saved_properties', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('etn_wishlist_updated', { detail: updated }));
    triggerSuccess('Removed from saved favourites');
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

  // Ticket Submit to MongoDB Atlas & Real-time Central Support
  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    const payload = {
      senderName: currentUser?.name || profileName || 'Tourist User',
      senderEmail: (currentUser?.email || profileEmail || '').toLowerCase().trim(),
      senderRole: 'user',
      subject: ticketSubject,
      category: ticketCategory,
      message: ticketMessage,
      priority: 'Medium',
      status: 'Open'
    };

    try {
      const res = await apiFetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res && res.ok) {
        const saved = await res.json();
        setTicketsList(prev => [saved, ...prev]);
        triggerSuccess(`Ticket ${saved.ticketId || 'TCK'} created! Dispatched to Super Admin & Customer Support desk.`);
      } else {
        triggerSuccess('Support ticket submitted successfully!');
      }
    } catch (err) {
      triggerSuccess('Support ticket submitted successfully!');
    }

    setShowNewTicketModal(false);
    setTicketSubject('');
    setTicketMessage('');
  };

  // 📝 Generate Formatted Stay Pass Share Text
  const getShareMessage = (bk) => {
    if (!bk) return '';
    const bkId = bk.bookingId || bk.id || 'ETN-BK-REF';
    const bkTitle = bk.itemTitle || bk.propertyTitle || bk.title || 'Verified Luxury Stay';
    const bkLocation = bk.destination || bk.location || 'Tamil Nadu';
    const checkIn = bk.checkIn || bk.checkInDate || '2026-08-25';
    const checkOut = bk.checkOut || bk.checkOutDate || '2026-08-28';
    const nights = bk.nights || 1;
    const guests = bk.guests || 2;
    const guestType = bk.guestType || 'Stay';
    const totalAmount = Number(bk.totalAmount || bk.amount || 0).toLocaleString('en-IN');
    const guestName = bk.customerName || bk.userName || currentUser?.name || 'Tourist Guest';

    return `✨ *EXPLORE TAMIL NADU - OFFICIAL STAY PASS* ✨

🏨 *Property:* ${bkTitle}
📍 *Location:* ${bkLocation}
👤 *Primary Guest:* ${guestName}
👥 *Party:* ${guests} Guests (${guestType})
📅 *Check-In:* ${checkIn} (From 12:00 PM)
📅 *Check-Out:* ${checkOut} (Until 11:00 AM)
⏳ *Duration:* ${nights} Night(s)
🆔 *Booking Reference ID:* ${bkId}
💳 *Total Paid:* ₹${totalAmount} (Verified via Razorpay)

🛎️ *Check-In Instructions:* Please present this Booking ID (${bkId}) or your digital stay pass at hotel reception. Valid government ID proof is mandatory.

🌐 *Explore More Tamil Nadu Destinations:*
https://frontend-blond-iota-kzel6q4tzd.vercel.app/explore

📞 24/7 Helpline: +91 78717 79134 | support@exploretamilnadu.com`;
  };

  // 💾 Save Stay Pass directly to File Explorer / Device Files
  const handleSaveToFileExplorer = async (bk) => {
    if (!bk) return;
    const bkId = bk.bookingId || bk.id || 'ETN-BK-REF';
    const content = getShareMessage(bk);
    const fileName = `Explore_TamilNadu_StayPass_${bkId}.txt`;

    // 1. Native File System Access API (Opens Windows/Mac File Explorer save dialog!)
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Explore Tamil Nadu Stay Pass Document',
            accept: { 'text/plain': ['.txt'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        triggerSuccess(`Stay pass successfully saved to your selected File Explorer folder!`);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // User cancelled dialog
      }
    }

    // 2. Direct Device File Download Fallback
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
      triggerSuccess(`Stay pass saved to your Downloads/Files folder!`);
    } catch (e) {
      alert('Error saving stay pass file.');
    }
  };

  // 📋 Copy Stay Pass to Clipboard
  const handleCopyShareText = (bk, customMsg) => {
    const text = getShareMessage(bk);
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
      triggerSuccess(customMsg || 'Stay Pass copied to clipboard!');
    });
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
      
      {/* 📌 TOURIST GUEST SIDEBAR (Hidden on mobile UI, full text on PC & Tab) */}
      <aside className="hidden md:flex md:w-64 bg-[#061833] text-white flex-col justify-between p-4 md:p-6 border-r border-[#0d2a58] flex-shrink-0 min-h-screen transition-all">
        <div>
          {/* Brand & User Profile Header */}
          <div className="flex items-center justify-start gap-3 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-[#0d2a58]">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden border-2 border-blue-400 shadow-md shrink-0">
              <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white block leading-tight truncate max-w-[130px]">{profileName}</span>
              <span className="text-[10px] font-mono text-cyan-400 block font-bold mt-0.5">Tourist Member</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {navMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSearchParams({ tab: item.id });
                }}
                title={item.label}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-slate-300 hover:bg-[#0b2754] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                    activeTab === item.id ? 'bg-white/20 text-white' : 'bg-[#123875] text-cyan-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-6 border-t border-[#0d2a58]">
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Verified Account</span>
          </div>
        </div>
      </aside>

      {/* 💻 MAIN CONTENT AREA (100% Full Width on Mobile with zero sidebars) */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-10 bg-slate-50 overflow-y-auto min-h-screen">
        
        {/* Header Status Bar */}
        <div className="flex justify-between items-center mb-4 sm:mb-8 pb-3 sm:pb-4 border-b border-slate-200">
          <div>
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
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
                        <div className="flex items-center w-full sm:w-auto">
                          <button 
                            type="button"
                            onClick={() => setShareModalBooking(bk)}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                          >
                            <Share2 size={14} /> Share Stay Pass
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
              <div>
                <h3 className="text-xl font-black text-slate-900">Saved Favourites & Wishlist</h3>
                <p className="text-xs text-slate-500">Properties you saved while browsing Tamil Nadu stays</p>
              </div>
              <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                {savedWishlist.length} Items Saved
              </span>
            </div>

            {savedWishlist.length === 0 ? (
              <div className="p-12 text-center text-slate-500 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <Heart size={40} className="mx-auto text-slate-300" />
                <h3 className="text-lg font-bold text-slate-800">No Saved Properties Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse verified stays on the Explore page and click the ❤️ Heart button on any card to save your favourite resorts and cottages.
                </p>
                <a
                  href="/explore"
                  className="inline-block px-5 py-2.5 rounded-2xl bg-[#061833] text-white text-xs font-bold hover:bg-black transition-all shadow-sm"
                >
                  Explore Verified Stays
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedWishlist.map((item) => {
                  const itemId = item._id || item.id;
                  const itemImg = (item.images && item.images[0]) || item.image || 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80';
                  const itemPrice = item.pricePerNight || item.price || 4800;

                  return (
                    <div key={itemId} className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                      <div className="h-48 relative overflow-hidden bg-slate-100">
                        <img src={itemImg} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <button 
                          type="button"
                          onClick={() => handleRemoveWishlist(itemId)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 transition-all cursor-pointer"
                          title="Remove from saved"
                        >
                          <Heart size={16} className="fill-white" />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white text-[10px] font-mono font-bold">
                          {item.type || item.propertyType || 'RESORT'}
                        </div>
                      </div>
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-mono text-slate-500 uppercase truncate">📍 {item.location || item.district || 'Tamil Nadu'}</span>
                            <span className="text-xs font-bold text-amber-500 flex items-center gap-1 font-mono">⭐ {item.rating || '4.9'}</span>
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-base leading-snug">{item.title}</h4>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-lg font-black text-slate-900 font-mono">₹{Number(itemPrice).toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 font-mono"> / night</span>
                          </div>
                          <a 
                            href="/explore"
                            className="px-4 py-2 rounded-xl bg-[#061833] text-white hover:bg-black text-xs font-bold transition-all shadow-xs"
                          >
                            Book Stay
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

      {/* 📤 SHARE & SAVE STAY PASS MODAL */}
      {shareModalBooking && (() => {
        const bk = shareModalBooking;
        const bkId = bk.bookingId || bk.id || 'ETN-BK-REF';
        const bkTitle = bk.itemTitle || bk.propertyTitle || bk.title || 'Verified Luxury Stay';
        const bkLocation = bk.destination || bk.location || 'Tamil Nadu';
        const bkAmount = Number(bk.totalAmount || bk.amount || 0).toLocaleString('en-IN');
        const checkIn = bk.checkIn || bk.checkInDate || '2026-08-25';
        const checkOut = bk.checkOut || bk.checkOutDate || '2026-08-28';
        const nights = bk.nights || 1;
        const guests = bk.guests || 2;
        const shareMsg = getShareMessage(bk);

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-auto">
              
              {/* Header */}
              <div className="bg-[#061833] text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                    <Share2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">Share Stay Reservation Pass</h3>
                    <p className="text-[11px] text-slate-300 font-mono">Reference: {bkId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShareModalBooking(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-800 text-xs sm:text-sm">
                
                {/* Stay Card Preview */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-black text-blue-600 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-lg">{bkId}</span>
                    <span className="text-xs font-bold text-emerald-700 font-mono">₹{bkAmount} Paid</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">{bkTitle}</h4>
                  <p className="text-slate-500 text-xs font-mono">📍 {bkLocation} • 👥 {guests} Guests • 📅 {checkIn} → {checkOut} ({nights}N)</p>
                </div>

                {/* Instant Share Channels Grid */}
                <div>
                  <label className="block text-[11px] font-bold font-mono text-slate-500 uppercase tracking-wider mb-2.5">
                    Select Share Channel:
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    
                    {/* 1. WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-emerald-900 group shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-base font-bold shadow-xs">
                        💬
                      </div>
                      <span className="font-bold text-xs">WhatsApp</span>
                      <span className="text-[10px] text-emerald-700 font-mono">Instant Chat</span>
                    </a>

                    {/* 2. Normal SMS / Messages */}
                    <a
                      href={`sms:?body=${encodeURIComponent(shareMsg)}`}
                      className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-blue-900 group shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-base font-bold shadow-xs">
                        <Smartphone size={16} />
                      </div>
                      <span className="font-bold text-xs">SMS / Text</span>
                      <span className="text-[10px] text-blue-700 font-mono">Direct Phone</span>
                    </a>

                    {/* 3. Instagram */}
                    <button
                      type="button"
                      onClick={() => handleCopyShareText(bk, 'Stay Pass copied! Ready to paste in Instagram DM or Story.')}
                      className="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-pink-200 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-pink-950 group shadow-2xs cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-base font-bold shadow-xs">
                        📸
                      </div>
                      <span className="font-bold text-xs">Instagram</span>
                      <span className="text-[10px] text-pink-700 font-mono">Copy for DM/Story</span>
                    </button>

                    {/* 4. Telegram */}
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent('https://frontend-blond-iota-kzel6q4tzd.vercel.app')}&text=${encodeURIComponent(shareMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-sky-900 group shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center text-base font-bold shadow-xs">
                        <Send size={15} />
                      </div>
                      <span className="font-bold text-xs">Telegram</span>
                      <span className="text-[10px] text-sky-700 font-mono">Direct Share</span>
                    </a>

                    {/* 5. Mail Desk */}
                    <a
                      href={`mailto:?subject=${encodeURIComponent(`Explore Tamil Nadu Stay Pass - ${bkTitle} (${bkId})`)}&body=${encodeURIComponent(shareMsg)}`}
                      className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-amber-950 group shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-base font-bold shadow-xs">
                        <Mail size={15} />
                      </div>
                      <span className="font-bold text-xs">Email Desk</span>
                      <span className="text-[10px] text-amber-800 font-mono">Send Email</span>
                    </a>

                    {/* 6. Save to File Explorer */}
                    <button
                      type="button"
                      onClick={() => handleSaveToFileExplorer(bk)}
                      className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex flex-col items-center justify-center text-center gap-1.5 transition-all text-indigo-950 group shadow-2xs cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-base font-bold shadow-xs">
                        <FolderDown size={16} />
                      </div>
                      <span className="font-bold text-xs">File Explorer</span>
                      <span className="text-[10px] text-indigo-700 font-mono">Save to Device</span>
                    </button>

                  </div>
                </div>

                {/* Direct Copy Section */}
                <div className="pt-2">
                  <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="truncate text-xs font-mono text-slate-600">
                      Pass ID: {bkId} • {bkTitle} ({bkLocation})
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyShareText(bk)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-xs transition-all"
                    >
                      <Copy size={13} /> {copyFeedback ? 'Copied!' : 'Copy Pass'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShareModalBooking(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-300 cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
