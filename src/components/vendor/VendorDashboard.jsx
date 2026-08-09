import React, { useState } from 'react';
import { 
  Building2, 
  Car, 
  User, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  HelpCircle, 
  Plus, 
  Upload, 
  Camera, 
  Check, 
  X, 
  Lock, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  PhoneCall, 
  Mail, 
  MessageSquare, 
  LogOut, 
  Building, 
  Home, 
  Castle, 
  ArrowUpRight, 
  FileText,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function VendorDashboard() {
  const { currentUser, logout } = useAuth();
  const role = currentUser?.role || 'owner_and_vendor';

  // Active Tab State (6 Requested Vendor Tabs)
  const [activeTab, setActiveTab] = useState('properties_vehicles');
  const [actionSuccess, setActionSuccess] = useState('');

  // Profile Form State
  const [vendorName, setVendorName] = useState(currentUser?.name || 'Sundaram Pillai');
  const [vendorEmail, setVendorEmail] = useState(currentUser?.email || 'sundaram.vendor@exploretamilnadu.com');
  const [vendorPhone, setVendorPhone] = useState('9443188200');
  const [vendorAvatar, setVendorAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');

  // Password Reset State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Bank Accounts State
  const [bankAccountsList, setBankAccountsList] = useState([
    {
      id: 'bnk-1',
      bankName: 'HDFC Bank',
      accountNumber: '••••••••4892',
      ifscCode: 'HDFC0001204',
      holderName: 'Sundaram Pillai',
      upiId: 'sundaram@hdfcbank',
      isPrimary: true
    },
    {
      id: 'bnk-2',
      bankName: 'State Bank of India (SBI)',
      accountNumber: '••••••••1008',
      ifscCode: 'SBIN0008401',
      holderName: 'Sundaram Pillai',
      upiId: '7871779134@sbi',
      isPrimary: false
    }
  ]);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBankName, setNewBankName] = useState('HDFC Bank');
  const [newAccNo, setNewAccNo] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [newHolderName, setNewHolderName] = useState('');
  const [newUpi, setNewUpi] = useState('');

  // Properties & Vehicles State
  const [myPropertiesList, setMyPropertiesList] = useState([
    { id: 'p1', title: 'Ooty Lakeview Grand Resort', location: 'Ooty Lake Road', type: 'Resort', price: 4800, status: 'Approved' },
    { id: 'p2', title: 'Kodaikanal Heritage Pine Cottage', location: 'Coaker Walk', type: 'Homestay', price: 3200, status: 'Approved' }
  ]);
  const [myVehiclesList, setMyVehiclesList] = useState([
    { id: 'v1', title: 'Innova Crysta 7-Seater Luxury Cab', regNo: 'TN-37-ET-2026', price: 3500, status: 'Approved' },
    { id: 'v2', title: 'Tempo Traveller 12-Seater AC Bus', regNo: 'TN-59-AB-1008', price: 5800, status: 'Pending Approval' }
  ]);

  // Modals for Adding Property / Vehicle
  const [showAddPropModal, setShowAddPropModal] = useState(false);
  const [propTitle, setPropTitle] = useState('');
  const [propLocation, setPropLocation] = useState('');
  const [propPrice, setPropPrice] = useState('');

  const [showAddVehModal, setShowAddVehModal] = useState(false);
  const [vehTitle, setVehTitle] = useState('');
  const [vehRegNo, setVehRegNo] = useState('');
  const [vehPrice, setVehPrice] = useState('');

  // Payouts Log
  const [payoutsList, setPayoutsList] = useState([
    { id: 'PAY-801', date: '01 Aug 2026', amount: 32400, bank: 'HDFC Bank (••••4892)', status: 'Transferred via Razorpay UPI' },
    { id: 'PAY-742', date: '15 Jul 2026', amount: 28500, bank: 'HDFC Bank (••••4892)', status: 'Transferred via Razorpay UPI' }
  ]);

  // Bookings List
  const [vendorBookings, setVendorBookings] = useState([
    { id: 'ETN-BK-9001', guestName: 'Anitha Selvan', itemTitle: 'Ooty Lakeview Grand Resort', dates: '15 Aug - 18 Aug 2026', amount: 14400, status: 'Confirmed' },
    { id: 'ETN-BK-9004', guestName: 'Ramesh Kumar', itemTitle: 'Innova Crysta (TN-37-ET-2026)', dates: '20 Aug - 22 Aug 2026', amount: 7000, status: 'Pending Approval' }
  ]);

  // Support Tickets
  const [vendorTickets, setVendorTickets] = useState([
    { id: 'TCK-2002', subject: 'Property Listing Update & Razorpay Payout Inquiry', category: 'Property Host Settlement', date: '07 Aug 2026', status: 'In Progress' }
  ]);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Property Host Settlement');
  const [ticketMessage, setTicketMessage] = useState('');

  const triggerSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  // Handlers
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVendorAvatar(reader.result);
        triggerSuccess('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    triggerSuccess('Vendor profile details updated in database!');
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerSuccess('Vendor security password updated!');
  };

  const handleAddBankSubmit = (e) => {
    e.preventDefault();
    if (!newAccNo || !newIfsc) return;

    const newBank = {
      id: 'bnk-' + Date.now(),
      bankName: newBankName,
      accountNumber: '••••••••' + newAccNo.slice(-4),
      ifscCode: newIfsc.toUpperCase(),
      holderName: newHolderName || vendorName,
      upiId: newUpi || `${vendorPhone}@upi`,
      isPrimary: bankAccountsList.length === 0
    };

    setBankAccountsList([...bankAccountsList, newBank]);
    setShowAddBankModal(false);
    setNewAccNo('');
    setNewIfsc('');
    setNewHolderName('');
    setNewUpi('');
    triggerSuccess(`Bank account ${newBank.bankName} added successfully!`);
  };

  const handleAddPropertySubmit = (e) => {
    e.preventDefault();
    if (!propTitle || !propPrice) return;

    const newProp = {
      id: 'p-' + Date.now(),
      title: propTitle,
      location: propLocation || 'Ooty Lake Road',
      type: 'Homestay',
      price: Number(propPrice),
      status: 'Pending Approval'
    };

    setMyPropertiesList([newProp, ...myPropertiesList]);
    setShowAddPropModal(false);
    setPropTitle('');
    setPropPrice('');
    triggerSuccess(`Property "${propTitle}" submitted for Super Admin approval!`);
  };

  const handleAddVehicleSubmit = (e) => {
    e.preventDefault();
    if (!vehTitle || !vehRegNo) return;

    const newVeh = {
      id: 'v-' + Date.now(),
      title: vehTitle,
      regNo: vehRegNo.toUpperCase(),
      price: Number(vehPrice || 3500),
      status: 'Pending Approval'
    };

    setMyVehiclesList([newVeh, ...myVehiclesList]);
    setShowAddVehModal(false);
    setVehTitle('');
    setVehRegNo('');
    setVehPrice('');
    triggerSuccess(`Vehicle "${vehTitle}" submitted for Super Admin approval!`);
  };

  const handleCreateTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    const newTck = {
      id: 'TCK-' + Math.floor(2000 + Math.random() * 8000),
      subject: ticketSubject,
      category: ticketCategory,
      date: new Date().toLocaleDateString('en-GB'),
      status: 'Open'
    };

    setVendorTickets([newTck, ...vendorTickets]);
    setShowNewTicketModal(false);
    setTicketSubject('');
    setTicketMessage('');
    triggerSuccess(`Ticket ${newTck.id} submitted! Super Admin Jeeva will review your request.`);
  };

  // Nav Menu Items for Vendors & Property Hosts
  const navMenuItems = [
    { id: 'properties_vehicles', label: 'My Properties & Vehicles', icon: <Building2 size={18} />, badge: myPropertiesList.length + myVehiclesList.length },
    { id: 'profile', label: 'Vendor Profile & Security', icon: <User size={18} /> },
    { id: 'bank_accounts', label: 'Bank Accounts', icon: <CreditCard size={18} />, badge: bankAccountsList.length },
    { id: 'payouts', label: 'Payouts & Earnings', icon: <DollarSign size={18} />, badge: '₹60.9K' },
    { id: 'bookings', label: 'Booking Requests', icon: <Calendar size={18} />, badge: vendorBookings.length },
    { id: 'support', label: 'Support & Help', icon: <HelpCircle size={18} /> }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-100 flex overflow-hidden m-0">
      
      {/* 📌 VENDOR & HOST SIDEBAR */}
      <aside className="w-64 bg-[#081d3d] text-white flex flex-col justify-between p-6 border-r border-[#0e2e5c] flex-shrink-0 min-h-screen">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#0e2e5c]">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md">
              <img src={vendorAvatar} alt={vendorName} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white block leading-tight truncate max-w-[130px]">{vendorName}</span>
              <span className="text-[10px] font-mono text-amber-400 block font-bold mt-0.5">
                {role === 'owner_and_vendor' ? '🏡🚖 Host & Vendor' : '🏡 Property Host'}
              </span>
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
                    : 'text-slate-300 hover:bg-[#0c2a54] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
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
        <div className="pt-6 border-t border-[#0e2e5c] space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Razorpay Payouts Active</span>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
          >
            <LogOut size={14} /> Sign Out Vendor
          </button>
        </div>
      </aside>

      {/* 💻 MAIN CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-10 bg-slate-50 overflow-y-auto min-h-screen">
        
        {/* Header Status Bar */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 font-mono">
              🏡🚖 Host & Transport Vendor Portal
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2 capitalize">
              {navMenuItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage stay listings, vehicle fleets, bank accounts, and payouts.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-green-100 text-green-800 border border-green-300">
              🟢 Host Verified
            </span>
          </div>
        </div>

        {/* Notification Toast */}
        {actionSuccess && (
          <div className="p-4 mb-6 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <Check size={18} className="text-green-600" /> {actionSuccess}
          </div>
        )}

        {/* 🏡🚖 TAB 1: MY PROPERTIES & VEHICLES */}
        {activeTab === 'properties_vehicles' && (
          <div className="space-y-8">
            {/* Properties Section */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">🏡 My Listed Properties</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Hotels, homestays, & lakeview resorts managed by you.</p>
                </div>
                <button 
                  onClick={() => setShowAddPropModal(!showAddPropModal)}
                  className="glass-button text-xs px-4 py-2.5 flex items-center gap-2"
                >
                  <Plus size={16} /> Add New Property
                </button>
              </div>

              {/* Add Property Modal Form */}
              {showAddPropModal && (
                <form onSubmit={handleAddPropertySubmit} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Property Name</label>
                    <input type="text" placeholder="E.g. Ooty Pine Cottage" value={propTitle} onChange={e => setPropTitle(e.target.value)} className="glass-input text-xs" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Location Address</label>
                    <input type="text" placeholder="Coaker Walk, Kodaikanal" value={propLocation} onChange={e => setPropLocation(e.target.value)} className="glass-input text-xs" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Price Per Night (₹)</label>
                    <input type="number" placeholder="3800" value={propPrice} onChange={e => setPropPrice(e.target.value)} className="glass-input text-xs" required />
                  </div>
                  <div className="md:col-span-3 flex justify-end gap-2">
                    <button type="submit" className="glass-button text-xs py-2 px-6">Submit for Approval</button>
                    <button type="button" onClick={() => setShowAddPropModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                  </div>
                </form>
              )}

              {/* Property Directory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPropertiesList.map(p => (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                      <p className="text-slate-500">📍 {p.location} • <span className="font-bold text-blue-600">₹{p.price}/night</span></p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono uppercase ${
                      p.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {p.status === 'Approved' ? '🟢 Approved' : '⏳ Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicles Section */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">🚖 My Vehicle Transport Fleet</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Cabs, Tempo Travellers, & rental vehicles managed by you.</p>
                </div>
                <button 
                  onClick={() => setShowAddVehModal(!showAddVehModal)}
                  className="glass-button text-xs px-4 py-2.5 flex items-center gap-2"
                >
                  <Plus size={16} /> Add New Vehicle
                </button>
              </div>

              {/* Add Vehicle Modal Form */}
              {showAddVehModal && (
                <form onSubmit={handleAddVehicleSubmit} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Title</label>
                    <input type="text" placeholder="E.g. Innova Crysta Cab" value={vehTitle} onChange={e => setVehTitle(e.target.value)} className="glass-input text-xs" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Registration Number</label>
                    <input type="text" placeholder="TN-37-ET-2026" value={vehRegNo} onChange={e => setVehRegNo(e.target.value)} className="glass-input text-xs font-mono font-bold" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Daily Rate (₹)</label>
                    <input type="number" placeholder="3500" value={vehPrice} onChange={e => setVehPrice(e.target.value)} className="glass-input text-xs" required />
                  </div>
                  <div className="md:col-span-3 flex justify-end gap-2">
                    <button type="submit" className="glass-button text-xs py-2 px-6">Submit for Approval</button>
                    <button type="button" onClick={() => setShowAddVehModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                  </div>
                </form>
              )}

              {/* Vehicles Directory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myVehiclesList.map(v => (
                  <div key={v.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{v.title}</h4>
                      <p className="text-blue-600 font-mono font-bold">{v.regNo} • <span className="font-bold text-slate-900">₹{v.price}/day</span></p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono uppercase ${
                      v.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {v.status === 'Approved' ? '🟢 Approved' : '⏳ Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 👤 TAB 2: VENDOR PROFILE & SECURITY */}
        {activeTab === 'profile' && (
          <div className="space-y-8 max-w-3xl">
            {/* Profile Information & Photo */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Vendor Profile & Contact Information</h3>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-md">
                  <img src={vendorAvatar} alt={vendorName} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-slate-900">Upload Vendor Profile Photo</h4>
                  <p className="text-xs text-slate-500">Visible on host listings and trip invoices.</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-700 transition-all shadow-sm">
                    <Camera size={15} /> Upload Photo
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name / Host Title</label>
                  <input type="text" value={vendorName} onChange={e => setVendorName(e.target.value)} className="glass-input text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gmail / Email</label>
                  <input type="email" value={vendorEmail} onChange={e => setVendorEmail(e.target.value)} className="glass-input text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 font-mono font-extrabold text-xs text-slate-700 bg-slate-200 px-2 py-1 rounded-lg border border-slate-300 pointer-events-none z-10">+91</span>
                    <input type="tel" maxLength={10} value={vendorPhone} onChange={e => setVendorPhone(e.target.value.replace(/\D/g, ''))} className="glass-input text-xs font-mono font-bold" style={{ paddingLeft: '4.25rem' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Region</label>
                  <input type="text" defaultValue="Nilgiris & Kodaikanal Circuit" className="glass-input text-xs" />
                </div>
                <div className="md:col-span-2 pt-4 flex justify-end">
                  <button type="submit" className="glass-button text-xs py-3 px-8">Save Profile Updates</button>
                </div>
              </form>
            </div>

            {/* Password Reset Section */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Reset Password</h3>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                  <input type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="glass-input text-xs font-mono" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="glass-input text-xs font-mono" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="glass-input text-xs font-mono" required />
                </div>
                <button type="submit" className="glass-button text-xs py-3 px-8 w-full">Update Security Password</button>
              </form>
            </div>
          </div>
        )}

        {/* 🏦 TAB 3: BANK ACCOUNTS */}
        {activeTab === 'bank_accounts' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Linked Bank Accounts & UPI IDs</h3>
                <p className="text-xs text-slate-500 mt-0.5">Used for direct Razorpay automated payouts and booking settlements.</p>
              </div>
              <button onClick={() => setShowAddBankModal(!showAddBankModal)} className="glass-button text-xs px-4 py-2.5 flex items-center gap-2">
                <Plus size={16} /> Add Bank Account
              </button>
            </div>

            {/* Add Bank Modal */}
            {showAddBankModal && (
              <form onSubmit={handleAddBankSubmit} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                  <select value={newBankName} onChange={e => setNewBankName(e.target.value)} className="glass-input text-xs">
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Canara Bank">Canara Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                  <input type="text" placeholder="9182374892" value={newAccNo} onChange={e => setNewAccNo(e.target.value)} className="glass-input text-xs font-mono font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
                  <input type="text" placeholder="HDFC0001204" value={newIfsc} onChange={e => setNewIfsc(e.target.value)} className="glass-input text-xs font-mono uppercase font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder Name</label>
                  <input type="text" placeholder="Sundaram Pillai" value={newHolderName} onChange={e => setNewHolderName(e.target.value)} className="glass-input text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">UPI ID (Optional)</label>
                  <input type="text" placeholder="sundaram@hdfcbank" value={newUpi} onChange={e => setNewUpi(e.target.value)} className="glass-input text-xs font-mono" />
                </div>
                <div className="flex items-end gap-2">
                  <button type="submit" className="glass-button text-xs py-2.5 px-4 w-full">Save Bank Account</button>
                  <button type="button" onClick={() => setShowAddBankModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                </div>
              </form>
            )}

            {/* Bank Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bankAccountsList.map(b => (
                <div key={b.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 text-sm">{b.bankName}</span>
                    {b.isPrimary && <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">PRIMARY PAYOUT</span>}
                  </div>
                  <div className="text-xs text-slate-600 font-mono space-y-1">
                    <div>Acc No: <span className="font-bold text-slate-900">{b.accountNumber}</span></div>
                    <div>IFSC: <span className="font-bold text-slate-900">{b.ifscCode}</span></div>
                    <div>Holder: <span className="font-bold text-slate-900">{b.holderName}</span></div>
                    <div>UPI: <span className="font-bold text-blue-600">{b.upiId}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 💰 TAB 4: PAYOUTS & EARNINGS */}
        {activeTab === 'payouts' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-sm">
                <div className="text-xs font-extrabold uppercase text-emerald-800">Total Transferred Payouts</div>
                <div className="text-3xl font-black text-emerald-950 mt-2">₹60,900</div>
                <div className="text-xs font-semibold text-emerald-700 mt-1">Processed via Razorpay Direct UPI</div>
              </div>
              <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 shadow-sm">
                <div className="text-xs font-extrabold uppercase text-amber-800">Pending Check-in Settlements</div>
                <div className="text-3xl font-black text-amber-950 mt-2">₹14,400</div>
                <div className="text-xs font-semibold text-amber-700 mt-1">Settles after check-in date</div>
              </div>
              <div className="p-6 rounded-3xl bg-blue-50 border border-blue-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs font-extrabold uppercase text-blue-800">Instant Payout Transfer</div>
                  <div className="text-xs font-semibold text-blue-700 mt-1">Transfer directly to primary bank account</div>
                </div>
                <button onClick={() => triggerSuccess('Instant payout request sent to Razorpay gateway!')} className="glass-button text-xs py-2 px-4 mt-4">
                  Request Instant Payout
                </button>
              </div>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Payout Transactions Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-400">
                      <th className="pb-3">Payout ID & Date</th>
                      <th className="pb-3">Bank Account</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3 text-right">Transfer Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {payoutsList.map(pay => (
                      <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-slate-900 text-sm">{pay.id}</div>
                          <div className="text-xs text-slate-400 font-mono">{pay.date}</div>
                        </td>
                        <td className="py-4 font-mono text-slate-700">{pay.bank}</td>
                        <td className="py-4 font-black text-emerald-600 text-base">₹{pay.amount.toLocaleString()}</td>
                        <td className="py-4 text-right">
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold font-mono">🟢 Transferred</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 🎟️ TAB 5: MY BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Guest Reservation Requests</h3>
            <div className="space-y-4">
              {vendorBookings.map(bk => (
                <div key={bk.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 text-xs">
                  <div>
                    <span className="font-mono text-blue-600 font-bold">{bk.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{bk.itemTitle}</h4>
                    <p className="text-slate-500">Guest: <span className="font-bold text-slate-800">{bk.guestName}</span> • Dates: {bk.dates}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900 text-base">₹{bk.amount.toLocaleString()}</span>
                    {bk.status === 'Pending Approval' ? (
                      <button onClick={() => {
                        setVendorBookings(vendorBookings.map(b => b.id === bk.id ? { ...b, status: 'Confirmed' } : b));
                        triggerSuccess(`Reservation ${bk.id} confirmed!`);
                      }} className="px-3 py-1.5 rounded-xl bg-green-600 text-white font-bold">
                        Confirm Reservation
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold font-mono">🟢 Confirmed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎧 TAB 6: SUPPORT & HELP */}
        {activeTab === 'support' && (
          <div className="space-y-8 max-w-4xl">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#081d3d] to-[#0d346b] text-white space-y-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
                  🎧
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Host & Vendor Support Helpline</h3>
                  <p className="text-xs text-slate-300">Dedicated Super Admin assistance for property hosts & transport providers.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                  <PhoneCall size={20} className="text-cyan-400" />
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-mono font-bold">Super Admin Hotline</span>
                    <a href="tel:+917871779134" className="text-sm font-extrabold text-white hover:text-cyan-300">+91 78717 79134</a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                  <Mail size={20} className="text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-mono font-bold">Host Support Email</span>
                    <a href="mailto:exploretamizhagam@gmail.com" className="text-sm font-extrabold text-white hover:text-emerald-300">exploretamizhagam@gmail.com</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Tickets Section */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Your Support Tickets & Requests</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Directly connected to Super Admin Jeeva Veeramani.</p>
                </div>
                <button onClick={() => setShowNewTicketModal(!showNewTicketModal)} className="glass-button text-xs px-4 py-2.5 flex items-center gap-2">
                  <Plus size={16} /> Submit New Request
                </button>
              </div>

              {/* Create Ticket Form */}
              {showNewTicketModal && (
                <form onSubmit={handleCreateTicketSubmit} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Ticket Subject</label>
                      <input type="text" placeholder="E.g. Request payout verification for Ooty Resort" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} className="glass-input text-xs" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                      <select value={ticketCategory} onChange={e => setTicketCategory(e.target.value)} className="glass-input text-xs">
                        <option value="Property Host Settlement">Property Host Settlement</option>
                        <option value="Vehicle Approval">Vehicle Approval</option>
                        <option value="Complaint">Complaint ⚠️</option>
                        <option value="Refund & Payment">Refund & Payment</option>
                        <option value="Others">Others ❓</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message Description</label>
                    <textarea rows={3} placeholder="Describe your request..." value={ticketMessage} onChange={e => setTicketMessage(e.target.value)} className="glass-input text-xs" required />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="submit" className="glass-button text-xs py-2 px-6">Submit Ticket</button>
                    <button type="button" onClick={() => setShowNewTicketModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                  </div>
                </form>
              )}

              {/* Tickets Table */}
              <div className="space-y-3">
                {vendorTickets.map(tck => (
                  <div key={tck.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono text-blue-600 font-bold">{tck.id}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{tck.subject}</h4>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">{tck.category} • Submitted: {tck.date}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                      tck.status === 'Resolved' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {tck.status === 'Resolved' ? '🟢 Resolved' : '⏳ In Progress'}
                    </span>
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
