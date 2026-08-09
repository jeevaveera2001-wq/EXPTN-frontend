import React, { useState } from 'react';
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

export default function UserDashboard() {
  const { currentUser, logout } = useAuth();

  // Active Tab State (Combined Profile & Security into single tab)
  const [activeTab, setActiveTab] = useState('bookings');
  const [actionSuccess, setActionSuccess] = useState('');

  // Profile Form State
  const [profileName, setProfileName] = useState(currentUser?.name || 'Anitha Selvan');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || 'anitha.user@exploretamilnadu.com');
  const [profilePhone, setProfilePhone] = useState('9842177300');
  const [profileAvatar, setProfileAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

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

  // Mock Bookings
  const [bookingsList, setBookingsList] = useState([
    {
      id: 'ETN-BK-9001',
      title: 'Ooty Lakeview Grand Resort',
      location: 'Ooty Lake Road, Nilgiris',
      checkIn: '15 Aug 2026',
      checkOut: '18 Aug 2026',
      guests: '2 Adults, 1 Child',
      amount: 14400,
      status: 'Confirmed',
      paymentStatus: 'Paid via Razorpay UPI'
    },
    {
      id: 'ETN-BK-8420',
      title: 'Kodaikanal Heritage Pine Cottage',
      location: 'Coaker Walk, Kodaikanal',
      checkIn: '02 Jul 2026',
      checkOut: '04 Jul 2026',
      guests: '2 Adults',
      amount: 6400,
      status: 'Completed',
      paymentStatus: 'Paid via Razorpay UPI'
    }
  ]);

  // Mock Saved Wishlist
  const [savedWishlist, setSavedWishlist] = useState([
    {
      id: 'prop-1',
      title: 'Ooty Lakeview Grand Resort',
      location: 'Ooty Lake Road',
      price: 4800,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945'
    },
    {
      id: 'prop-3',
      title: 'Doddabetta Cloud Mountain Villa',
      location: 'Doddabetta Peak',
      price: 6500,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'
    }
  ]);

  // Mock Support Tickets
  const [ticketsList, setTicketsList] = useState([
    {
      id: 'TCK-108',
      subject: 'Ooty Cab Driver Contact Inquiry',
      category: 'Transport & Cabs',
      date: '06 Aug 2026',
      status: 'Resolved'
    },
    {
      id: 'TCK-109',
      subject: 'Request for Extra Bed in Ooty Resort',
      category: 'Stay Accommodation',
      date: '07 Aug 2026',
      status: 'In Progress'
    }
  ]);

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
      
      {/* 📌 TOURIST GUEST SIDEBAR */}
      <aside className="w-64 bg-[#061833] text-white flex flex-col justify-between p-6 border-r border-[#0d2a58] flex-shrink-0 min-h-screen">
        <div>
          {/* Brand & User Profile Header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#0d2a58]">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-blue-400 shadow-md">
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
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
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
        <div className="pt-6 border-t border-[#0d2a58] space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Verified Account</span>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
          >
            <LogOut size={14} /> Sign Out Account
          </button>
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
              {bookingsList.map((bk) => (
                <div key={bk.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-blue-600 text-xs px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-200">
                        {bk.id}
                      </span>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-bold font-mono ${
                        bk.status === 'Confirmed' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        🟢 {bk.status}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900">{bk.title}</h4>
                    <p className="text-xs text-slate-500 font-mono">📍 {bk.location} • 👥 {bk.guests}</p>
                    <div className="text-xs font-semibold text-slate-700">
                      📅 Dates: <span className="font-bold text-slate-900">{bk.checkIn} → {bk.checkOut}</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900">₹{bk.amount.toLocaleString()}</div>
                      <div className="text-[11px] font-bold text-emerald-600">{bk.paymentStatus}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => triggerSuccess(`PDF Invoice for ${bk.id} downloaded!`)}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-1.5"
                      >
                        <Download size={14} /> Download PDF Receipt
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

    </div>
  );
}
