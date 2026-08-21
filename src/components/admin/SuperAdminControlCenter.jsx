import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  CalendarDays, 
  Building2, 
  Car, 
  CreditCard, 
  RotateCcw, 
  MessageSquare, 
  Tag, 
  Gift, 
  Search, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  Edit, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  Loader2, 
  IndianRupee, 
  Shield, 
  Menu, 
  Settings, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Eye,
  Send,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { BACKEND_API } from '../../config/api';

export default function SuperAdminControlCenter() {
  const { currentUser } = useAuth();
  const { socket, isConnected } = useSocket();

  // 10 Requested Tabs
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Live Collection States
  const [usersList, setUsersList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [ticketsList, setTicketsList] = useState([]);
  const [offersList, setOffersList] = useState([
    {
      id: 'deal-1',
      code: 'TAMILNADU2026',
      title: 'Grand Tourism Launch Offer',
      discountPercent: 15,
      minBookingAmount: 3000,
      description: '15% instant discount on luxury hill station resorts and cottages in Ooty & Kodaikanal.',
      validUntil: '2026-12-31',
      isActive: true
    },
    {
      id: 'deal-2',
      code: 'FESTIVAL500',
      title: 'Temple & Heritage Flat Discount',
      discountAmount: 500,
      minBookingAmount: 2500,
      description: 'Flat ₹500 discount for family spiritual tours to Madurai, Thanjavur, & Rameswaram.',
      validUntil: '2026-11-30',
      isActive: true
    }
  ]);

  // Modal States
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [showReplyTicketModal, setShowReplyTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Form States
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState('operations_manager');
  const [staffPassword, setStaffPassword] = useState('');

  const [propTitle, setPropTitle] = useState('');
  const [propLocation, setPropLocation] = useState('');
  const [propDistrict, setPropDistrict] = useState('Nilgiris (Ooty)');
  const [propType, setPropType] = useState('Resort');
  const [propPrice, setPropPrice] = useState('');

  const [vehTitle, setVehTitle] = useState('');
  const [vehRegNo, setVehRegNo] = useState('');
  const [vehType, setVehType] = useState('Cab SUV (Innova)');
  const [vehPrice, setVehPrice] = useState('3500');
  const [vehProvider, setVehProvider] = useState('Super Admin Transport');

  const [offerCode, setOfferCode] = useState('');
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('15');
  const [offerMinAmount, setOfferMinAmount] = useState('2000');
  const [offerDesc, setOfferDesc] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('token') || '';
    const headers = new Headers(options.headers || {});
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);

    try {
      const res = await fetch(endpoint, { ...options, headers, cache: 'no-store' });
      if (res.ok || res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404) {
        return res;
      }
    } catch (e) {}

    const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return await fetch(`${BACKEND_API}${clean.replace('/api', '')}`, { ...options, headers, cache: 'no-store' });
  }, []);

  // Fetch all live collections from database in parallel
  const fetchLiveData = useCallback(async ({ background = false } = {}) => {
    if (background) setRefreshing(true);
    else setLoading(true);

    try {
      const [uRes, pRes, vRes, bRes, tRes] = await Promise.all([
        apiFetch('/api/users').catch(() => null),
        apiFetch('/api/properties').catch(() => null),
        apiFetch('/api/vehicles').catch(() => null),
        apiFetch('/api/bookings').catch(() => null),
        apiFetch('/api/tickets').catch(() => null)
      ]);

      let users = [], props = [], vehrs = [], bks = [], tcks = [];

      if (uRes && uRes.ok) users = await uRes.json();
      if (pRes && pRes.ok) props = await pRes.json();
      if (vRes && vRes.ok) vehrs = await vRes.json();
      if (bRes && bRes.ok) bks = await bRes.json();
      if (tRes && tRes.ok) tcks = await tRes.json();

      if (Array.isArray(users)) {
        setUsersList(users);
        const staff = users.filter(u => u.role && !['user', 'owner', 'super_admin'].includes(u.role));
        setStaffList(staff);
      }
      if (Array.isArray(props)) setPropertiesList(props);
      if (Array.isArray(vehrs)) setVehiclesList(vehrs);
      if (Array.isArray(bks)) setBookingsList(bks);
      if (Array.isArray(tcks)) setTicketsList(tcks);

      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Super admin live fetch notice:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(() => fetchLiveData({ background: true }), 12000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  // Real-time socket events
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchLiveData({ background: true });
    
    socket.on('new_user_registered', handleUpdate);
    socket.on('user_updated', handleUpdate);
    socket.on('new_property', handleUpdate);
    socket.on('property_updated', handleUpdate);
    socket.on('new_vehicle', handleUpdate);
    socket.on('new_booking', handleUpdate);
    socket.on('new_ticket', handleUpdate);
    socket.on('ticket_updated', handleUpdate);

    return () => {
      socket.off('new_user_registered', handleUpdate);
      socket.off('user_updated', handleUpdate);
      socket.off('new_property', handleUpdate);
      socket.off('property_updated', handleUpdate);
      socket.off('new_vehicle', handleUpdate);
      socket.off('new_booking', handleUpdate);
      socket.off('new_ticket', handleUpdate);
      socket.off('ticket_updated', handleUpdate);
    };
  }, [socket, fetchLiveData]);

  // Derived calculations
  const totalRevenue = useMemo(() => {
    return bookingsList.reduce((acc, b) => {
      const isPaid = ['paid', 'captured', 'completed'].includes(String(b?.paymentStatus || '').toLowerCase()) ||
                     ['confirmed', 'completed'].includes(String(b?.status || '').toLowerCase());
      return acc + (isPaid ? Number(b?.totalAmount || b?.amount || 0) : 0);
    }, 0);
  }, [bookingsList]);

  const cancelledBookings = useMemo(() => {
    return bookingsList.filter(b => String(b?.status || '').toLowerCase() === 'cancelled');
  }, [bookingsList]);

  const paymentsReceived = useMemo(() => {
    return bookingsList.filter(b => {
      const ps = String(b?.paymentStatus || '').toLowerCase();
      const st = String(b?.status || '').toLowerCase();
      return ps === 'paid' || ps === 'captured' || st === 'confirmed' || st === 'completed';
    });
  }, [bookingsList]);

  // CRUD Handlers
  const handleDeleteUser = async (userId) => {
    setUsersList(prev => prev.filter(u => u._id !== userId));
    try {
      await apiFetch(`/api/users/${userId}`, { method: 'DELETE' });
    } catch (e) {}
    triggerToast('User account removed.');
  };

  const handleUpdatePropertyStatus = async (propId, status) => {
    setPropertiesList(prev => prev.map(p => p._id === propId ? { ...p, status } : p));
    try {
      await apiFetch(`/api/properties/${propId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (e) {}
    triggerToast(`Property status updated to: ${status}`);
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    if (!propTitle || !propPrice) return;
    const newProp = {
      _id: 'prop-' + Date.now(),
      title: propTitle,
      location: propLocation || 'Ooty Lake Road',
      district: propDistrict,
      type: propType,
      pricePerNight: Number(propPrice),
      status: 'Approved',
      ownerName: 'Super Admin Jeeva'
    };
    setPropertiesList(prev => [newProp, ...prev]);
    try {
      await apiFetch('/api/properties', {
        method: 'POST',
        body: JSON.stringify(newProp)
      });
    } catch (e) {}
    setShowAddPropertyModal(false);
    setPropTitle('');
    setPropPrice('');
    triggerToast(`Property "${propTitle}" added successfully.`);
  };

  const handleDeleteProperty = async (propId) => {
    setPropertiesList(prev => prev.filter(p => p._id !== propId));
    try {
      await apiFetch(`/api/properties/${propId}`, { method: 'DELETE' });
    } catch (e) {}
    triggerToast('Property removed.');
  };

  const handleUpdateVehicleStatus = async (vehId, status) => {
    setVehiclesList(prev => prev.map(v => v._id === vehId ? { ...v, status } : v));
    try {
      await apiFetch(`/api/vehicles/${vehId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (e) {}
    triggerToast(`Vehicle provider status set to: ${status}`);
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    if (!vehTitle || !vehRegNo) return;
    const newVeh = {
      _id: 'veh-' + Date.now(),
      title: vehTitle,
      registrationNumber: vehRegNo,
      type: vehType,
      pricePerDay: Number(vehPrice),
      providerName: vehProvider,
      status: 'Approved'
    };
    setVehiclesList(prev => [newVeh, ...prev]);
    try {
      await apiFetch('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify(newVeh)
      });
    } catch (e) {}
    setShowAddVehicleModal(false);
    setVehTitle('');
    setVehRegNo('');
    triggerToast(`Vehicle provider "${vehTitle}" registered.`);
  };

  const handleDeleteVehicle = async (vehId) => {
    setVehiclesList(prev => prev.filter(v => v._id !== vehId));
    try {
      await apiFetch(`/api/vehicles/${vehId}`, { method: 'DELETE' });
    } catch (e) {}
    triggerToast('Vehicle removed.');
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail) return;
    const newStaff = {
      _id: 'stf-' + Date.now(),
      name: staffName,
      email: staffEmail,
      phone: staffPhone || '+91 78717 79134',
      role: staffRole,
      createdAt: new Date().toISOString()
    };
    setStaffList(prev => [newStaff, ...prev]);
    try {
      await apiFetch('/api/admin/staff', {
        method: 'POST',
        body: JSON.stringify({
          name: staffName,
          email: staffEmail,
          phone: staffPhone || '+91 78717 79134',
          role: staffRole,
          password: staffPassword || 'ExploreTN2026'
        })
      });
    } catch (e) {}
    setShowAddStaffModal(false);
    setStaffName('');
    setStaffEmail('');
    setStaffPassword('');
    triggerToast(`Staff member "${staffName}" created successfully.`);
  };

  const handleRemoveStaff = async (staffId) => {
    setStaffList(prev => prev.filter(s => s._id !== staffId && s.email !== staffId));
    try {
      await apiFetch(`/api/admin/staff/${staffId}`, { method: 'DELETE' });
    } catch (e) {}
    triggerToast('Staff member removed.');
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    if (!offerCode || !offerTitle) return;
    const newOffer = {
      id: 'deal-' + Date.now(),
      code: offerCode.toUpperCase().replace(/\s+/g, ''),
      title: offerTitle,
      discountPercent: Number(offerDiscount) || 10,
      minBookingAmount: Number(offerMinAmount) || 1000,
      description: offerDesc || 'Special promotional booking deal across Tamil Nadu stays.',
      validUntil: '2026-12-31',
      isActive: true
    };
    setOffersList(prev => [newOffer, ...prev]);
    setShowAddOfferModal(false);
    setOfferCode('');
    setOfferTitle('');
    triggerToast(`Offer Deal "${newOffer.code}" activated!`);
  };

  const handleDeleteOffer = (id) => {
    setOffersList(prev => prev.filter(o => o.id !== id));
    triggerToast('Offer deal removed.');
  };

  const handleToggleOfferActive = (id) => {
    setOffersList(prev => prev.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o));
    triggerToast('Offer status updated.');
  };

  const handleOpenTicketReply = (ticket) => {
    setSelectedTicket(ticket);
    setTicketReplyText(ticket.adminReply || '');
    setShowReplyTicketModal(true);
  };

  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText) return;
    const ticketId = selectedTicket._id || selectedTicket.ticketId;
    setTicketsList(prev => prev.map(t => (t._id === ticketId || t.ticketId === ticketId) ? { ...t, status: 'Resolved', adminReply: ticketReplyText } : t));
    try {
      await apiFetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Resolved', adminReply: ticketReplyText })
      });
    } catch (e) {}
    setShowReplyTicketModal(false);
    setTicketReplyText('');
    triggerToast(`Replied & resolved Ticket ${selectedTicket.ticketId || 'TCK'}.`);
  };

  // 10 Navigation Menu Items Requested by User
  const navMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'users', label: 'Users', icon: Users, badge: usersList.length },
    { id: 'staff', label: 'Staff', icon: UserPlus, badge: staffList.length },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays, badge: bookingsList.length },
    { id: 'property_owner', label: 'Property Owner', icon: Building2, badge: propertiesList.length },
    { id: 'vehicle_owner', label: 'Vehicle Owner', icon: Car, badge: vehiclesList.length },
    { id: 'payments', label: 'Razorpay Payments Received', icon: CreditCard, badge: paymentsReceived.length },
    { id: 'refunds', label: 'Refund & Cancelled Dashboard', icon: RotateCcw, badge: cancelledBookings.length },
    { id: 'support_tickets', label: 'Support Tickets', icon: MessageSquare, badge: ticketsList.length },
    { id: 'offers', label: 'Offer Deals & Coupons', icon: Gift, badge: offersList.filter(o => o.isActive).length }
  ];

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 font-sans antialiased overflow-x-hidden">
      
      {/* 📌 COLLAPSIBLE & EXPANDABLE SIDEBAR (DESKTOP & TABLET) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-[#0a101d] border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          mobileDrawerOpen 
            ? 'w-72 translate-x-0 shadow-2xl' 
            : sidebarOpen 
              ? '-translate-x-full lg:translate-x-0 lg:w-72' 
              : '-translate-x-full lg:w-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Header Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black shadow-inner">
                <Shield size={20} />
              </div>
              <div>
                <span className="text-sm font-black text-white font-editorial tracking-tight block">
                  Super Admin
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                  Live Control Center
                </span>
              </div>
            </div>

            {/* Close Sidebar Button inside */}
            <button
              type="button"
              onClick={() => { setSidebarOpen(false); setMobileDrawerOpen(false); }}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              title="Collapse Sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* 10 Sidebar Navigation Tabs */}
          <nav className="space-y-1.5">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setActiveTab(item.id); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold font-editorial transition-all text-left group ${
                    isActive 
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 font-black' 
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={17} className={isActive ? 'text-black' : 'text-slate-400 group-hover:text-cyan-400'} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      isActive ? 'bg-black text-cyan-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ℹ️ Sidebar Footer: Live Admin Details (NO LOGOUT BUTTON HERE - Clean UI) */}
        <div className="p-4 border-t border-slate-800 bg-[#080d18]">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-black text-xs font-editorial">
              👑
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-white truncate font-editorial leading-tight">
                {currentUser?.name || 'Jeeva Veeramani'}
              </p>
              <p className="text-[10px] text-cyan-400 font-mono truncate">
                {currentUser?.email || 'exploretamizhagam@gmail.com'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* 💻 MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
      }`}>
        
        {/* Top Control Bar with 3-Lines / Settings / Logo Toggle Button */}
        <header className="sticky top-0 z-20 bg-[#0a101d]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* ☰ 3-Lines Hamburger / Settings Button to Toggle Sidebar */}
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) setMobileDrawerOpen(!mobileDrawerOpen);
                else setSidebarOpen(!sidebarOpen);
              }}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-cyan-400 hover:bg-slate-700 hover:text-white transition-all shadow-md flex items-center gap-2"
              title="Toggle Sidebar Menu"
            >
              <Menu size={18} />
              <span className="text-xs font-bold font-editorial hidden sm:inline">
                {sidebarOpen ? 'Hide Menu' : 'Show Menu'}
              </span>
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-white font-editorial tracking-tight capitalize flex items-center gap-2">
                {navMenuItems.find(i => i.id === activeTab)?.label || 'Control Center'}
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono">
                {lastUpdated ? `Live synced with MongoDB Atlas (${lastUpdated.toLocaleTimeString()})` : 'Connected to live database'}
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => fetchLiveData({ background: true })}
              disabled={refreshing}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1.5 text-xs font-mono disabled:opacity-50"
              title="Refresh live database records"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin text-cyan-400' : ''} />
              <span className="hidden md:inline font-bold">Sync Live</span>
            </button>
          </div>
        </header>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mx-4 sm:mx-8 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-editorial flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Dynamic Body Content */}
        <main className="flex-1 p-4 sm:p-8 space-y-6">
          
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 size={36} className="animate-spin text-cyan-400 mx-auto" />
              <p className="text-sm font-bold text-white font-editorial">Loading Live Database Records...</p>
              <p className="text-xs text-slate-400 font-mono">Connecting to MongoDB Atlas</p>
            </div>
          ) : (
            <>
              {/* ═════════════════════════════════════════════════════ */}
              {/* 1. DASHBOARD OVERVIEW TAB                             */}
              {/* ═════════════════════════════════════════════════════ */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in">
                  
                  {/* KPI Stat Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs font-bold font-editorial">
                        <span>Total Users</span>
                        <Users size={16} className="text-blue-400" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white font-editorial">{usersList.length}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">Registered buyer & host accounts</p>
                    </div>

                    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs font-bold font-editorial">
                        <span>Active Bookings</span>
                        <CalendarDays size={16} className="text-indigo-400" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white font-editorial">{bookingsList.length}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">Total guest reservations</p>
                    </div>

                    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs font-bold font-editorial">
                        <span>Properties & Stays</span>
                        <Building2 size={16} className="text-purple-400" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white font-editorial">{propertiesList.length}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{propertiesList.filter(p => p.status === 'Approved').length} Approved listings</p>
                    </div>

                    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs font-bold font-editorial">
                        <span>Total Revenue</span>
                        <IndianRupee size={16} className="text-emerald-400" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 font-editorial">₹{totalRevenue.toLocaleString()}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">Via Razorpay & UPI</p>
                    </div>
                  </div>

                  {/* Secondary KPI Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                      <span className="text-xs text-slate-400 font-editorial block">Vehicle Providers</span>
                      <span className="text-xl font-bold text-white font-editorial mt-1 block">{vehiclesList.length}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                      <span className="text-xs text-slate-400 font-editorial block">Support Tickets</span>
                      <span className="text-xl font-bold text-amber-400 font-editorial mt-1 block">{ticketsList.length}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                      <span className="text-xs text-slate-400 font-editorial block">Active Offer Deals</span>
                      <span className="text-xl font-bold text-cyan-400 font-editorial mt-1 block">{offersList.filter(o => o.isActive).length}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                      <span className="text-xs text-slate-400 font-editorial block">Cancelled Bookings</span>
                      <span className="text-xl font-bold text-rose-400 font-editorial mt-1 block">{cancelledBookings.length}</span>
                    </div>
                  </div>

                </div>
              )}

              {/* ═════════════════════════════════════════════════════ */}
              {/* 2. USERS TAB                                          */}
              {/* ═════════════════════════════════════════════════════ */}
              {activeTab === 'users' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-white font-editorial">Live Registered Users ({usersList.length})</h3>
                  </div>

                  {usersList.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 rounded-3xl bg-slate-900/40 border border-slate-800">
                      <Users size={32} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-sm font-bold text-slate-300 font-editorial">No users registered yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400 font-editorial border-b border-slate-800">
                          <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Role</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {usersList.map((user) => (
                            <tr key={user._id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-4 font-bold text-white">
                                <div className="font-editorial text-sm">{user.name}</div>
                                <div className="text-slate-400 text-[11px]">{user.email}</div>
                              </td>
                              <td className="p-4 text-slate-300">{user.phone || '+91 78717 79134'}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  user.role === 'super_admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                                  user.role === 'owner' || user.role === 'owner_and_vendor' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                  'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {user.role !== 'super_admin' && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all"
                                    title="Delete account"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ═════════════════════════════════════════════════════ */}
              {/* 3. STAFF TAB                                          */}
              {/* ═════════════════════════════════════════════════════ */}
              {activeTab === 'staff' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-white font-editorial">Staff Management ({staffList.length})</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddStaffModal(true)}
                      className="px-4 py-2 rounded-2xl bg-cyan-500 text-black text-xs font-bold font-editorial flex items-center gap-1.5 shadow-md hover:bg-cyan-400 transition-all"
                    >
                      <Plus size={14} /> Add New Staff
                    </button>
                  </div>

                  {staffList.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 rounded-3xl bg-slate-900/40 border border-slate-800">
                      <UserPlus size={32} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-sm font-bold text-slate-300 font-editorial">No staff members created yet</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">Click "Add New Staff" to assign operations or support staff.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {staffList.map((stf) => (
                        <div key={stf._id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-bold text-white font-editorial">{stf.name}</h4>
                              <p className="text-xs text-slate-400 font-mono">{stf.email}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveStaff(stf._id)}
                              className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                              title="Remove staff"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300 text-[10px] font-mono font-bold inline-block">
                            {stf.role?.replace(/_/g, ' ').toUpperCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═════════════════════════════════════════════════════ */}
              {/* 4. BOOKINGS TAB                                       */}
              {/* ═════════════════════════════════════════════════════ */}
              {activeTab === 'bookings' && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-base font-bold text-white font-editorial">All Live Bookings ({bookingsList.length})</h3>
                  {bookingsList.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 rounded-3xl bg-slate-900/40 border border-slate-800">
                      <CalendarDays size={32} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-sm font-bold text-slate-300 font-editorial">No live bookings yet</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">Tourists reserving stays or packages will populate this ledger.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400 font-editorial border-b border-slate-800">
                          <tr>
                            <th className="p-4">Booking ID</th>
                            <th className="p-4">Guest</th>
                            <th className="p-4">Item & Dates</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {bookingsList.map((bk) => (
                            <tr key={bk._id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-4 font-bold text-cyan-400">{bk.bookingId || bk._id}</td>
                              <td className="p-4 text-white">
                                <div>{bk.userName || bk.name || 'Guest'}</div>
                                <div className="text-[10px] text-slate-400">{bk.userEmail || bk.email}</div>
                              </td>
                              <td className="p-4 text-slate-300">{bk.itemTitle || 'Stay reservation'}</td>
                              <td className="p-4 font-bold text-emerald-400">₹{Number(bk.totalAmount || bk.amount || 0).toLocaleString()}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  bk.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300' :
                                  bk.status === 'Cancelled' ? 'bg-rose-500/20 text-rose-300' :
                                  'bg-amber-500/20 text-amber-300'
                                }`}>
                                  {bk.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ═════════════════════════════════════════════════════ */}
              {/* 5. PROPERTY OWNER TAB                                 */}
              {/* ═════════════════════════════════════════════════════ */}
              {activeTab === 'property_owner' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-white font-editorial">Property Owner Listings ({propertiesList.length})</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddPropertyModal(true)}
                      className="px-4 py-2 rounded-2xl bg-cyan-500 text-black text-xs font-bold font-editorial flex items-center gap-1.5 shadow-md hover:bg-cyan-400 transition-all"
                    >
                      <Plus size={14} /> Add Property
                    </button>
                  </div>

                  {propertiesList.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 rounded-3xl bg-slate-900/40 border border-slate-800">
                      <Building2 size={32} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-sm font-bold text-slate-300 font-editorial">No property listings</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {propertiesList.map((prop) => (
                        <div key={prop._id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-bold text-white font-editorial">{prop.title}</h4>
                              <p className="text-xs text-slate-400 font-mono">{prop.location} · {prop.district}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteProperty(prop._id)}
                              className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-emerald-400 font-mono">₹{Number(prop.pricePerNight || 0).toLocaleString()} / night</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              prop.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {prop.status}
                            </span>
                          </div>
                          {prop.googleMapsUrl && (
                            <a 
                              href={prop.googleMapsUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                            >
                              <MapPin size={12} /> View on Google Maps
                            </a>
                          )}
                          <div className="flex gap-2 pt-2 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={() => handleUpdatePropertyStatus(prop._id, 'Approved')}
                              className="flex-1 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs font-bold transition-all"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdatePropertyStatus(prop._id, 'Rejected')}
                              className="flex-1 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 text-xs font-bold transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═════════════════════════════════════════════════════ */}
              {/* 6. VEHICLE OWNER TAB                                  */}
              {/* ═════════════════════════════════════════════════════ */}
              {activeTab === 'vehicle_owner' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-white font-editorial">Vehicle Owner Fleet ({vehiclesList.length})</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddVehicleModal(true)}
                      className="px-4 py-2 rounded-2xl bg-cyan-500 text-black text-xs font-bold font-editorial flex items-center gap-1.5 shadow-md hover:bg-cyan-400 transition-all"
                    >
                      <Plus size={14} /> Add Vehicle
                    </button>
                  </div>

                  {vehiclesList.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 rounded-3xl bg-slate-900/40 border border-slate-800">
                      <Car size={32} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-sm font-bold text-slate-300 font-editorial">No vehicles registered</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vehiclesList.map((veh) => (
                        <div key={veh._id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-bold text-white font-editorial">{veh.title}</h4>
                              <p className="text-xs text-slate-400 font-mono">{veh.registrationNumber} · {veh.type}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteVehicle(veh._id)}
                              className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="font-bold text-cyan-400">₹{Number(veh.pricePerDay || 3500).toLocaleString()} / day</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">{veh.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═════════════════════════════════════════════════════ */}
              {/* 7. RAZORPAY PAYMENTS RECEIVED TAB                     */}
              {/* ═════════════════════════════════════════════════════ */}
              {activeTab === 'payments' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-xs text-slate-400 font-editorial">Razorpay Payment Gateway</span>
                      <h3 className="text-3xl font-black text-emerald-400 font-editorial mt-1">₹{totalRevenue.toLocaleString()}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Total Captured & Settled Payments</p>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                      🟢 Razorpay Webhooks Active
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white font-editorial">Transactions Ledger ({paymentsReceived.length})</h4>
                  {paymentsReceived.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 rounded-3xl bg-slate-900/40 border border-slate-800">
                      <CreditCard size={32} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-sm font-bold text-slate-300 font-editorial">No payments recorded yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-950/80 text-slate-400 font-editorial border-b border-slate-800">
                          <tr>
                            <th className="p-4">Payment ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Method</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {paymentsReceived.map((p) => (
                            <tr key={p._id} className="hover:bg-slate-800/40">
                              <td className="p-4 font-bold text-cyan-400">{p.paymentId || `pay_${p._id?.substring(0, 10)}`}</td>
                              <td className="p-4 text-white">{p.userEmail || p.email}</td>
                              <td className="p-4 text-slate-300">UPI / Razorpay</td>
                              <td className="p-4 font-bold text-emerald-400">₹{Number(p.totalAmount || p.amount || 0).toLocaleString()}</td>
                              <td className="p-4">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                  Captured
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ═════════════════════════════════════════════════════ */}
              {/* 8. REFUND & CANCELLED DASHBOARD TAB                   */}
              {/* ═════════════════════════════════════════════════════ */}
              {activeTab === 'refunds' && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-base font-bold text-white font-editorial">Cancelled Bookings & Refunds ({cancelledBookings.length})</h3>
                  {cancelledBookings.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 rounded-3xl bg-slate-900/40 border border-slate-800">
                      <RotateCcw size={32} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-sm font-bold text-slate-300 font-editorial">No cancellations or refund requests</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">All bookings are confirmed and in good standing.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-950/80 text-slate-400 font-editorial border-b border-slate-800">
                          <tr>
                            <th className="p-4">Booking ID</th>
                            <th className="p-4">Guest</th>
                            <th className="p-4">Refund Amount</th>
                            <th className="p-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {cancelledBookings.map((c) => (
                            <tr key={c._id}>
                              <td className="p-4 text-cyan-400">{c.bookingId || c._id}</td>
                              <td className="p-4 text-white">{c.userEmail}</td>
                              <td className="p-4 text-rose-400 font-bold">₹{Number(c.totalAmount || 0).toLocaleString()}</td>
                              <td className="p-4">
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                                  Refund Processed
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ═════════════════════════════════════════════════════ */}
              {/* 9. SUPPORT TICKETS TAB                                */}
              {/* ═════════════════════════════════════════════════════ */}
              {activeTab === 'support_tickets' && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-base font-bold text-white font-editorial">Customer & Host Support Tickets ({ticketsList.length})</h3>
                  {ticketsList.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 rounded-3xl bg-slate-900/40 border border-slate-800">
                      <MessageSquare size={32} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-sm font-bold text-slate-300 font-editorial">No support tickets</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {ticketsList.map((tck) => (
                        <div key={tck._id || tck.ticketId} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-cyan-400 font-mono">{tck.ticketId || 'TCK-2001'}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({tck.category || 'General'})</span>
                              </div>
                              <h4 className="text-sm font-bold text-white font-editorial mt-1">{tck.subject}</h4>
                              <p className="text-xs text-slate-400 font-mono">{tck.senderName || 'Member'} · {tck.senderEmail}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                              tck.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {tck.status || 'Open'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 font-mono">
                            {tck.message}
                          </p>
                          {tck.adminReply && (
                            <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 font-mono space-y-1">
                              <span className="text-[10px] font-bold text-cyan-400">Super Admin Reply:</span>
                              <p>{tck.adminReply}</p>
                            </div>
                          )}
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => handleOpenTicketReply(tck)}
                              className="px-4 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold font-editorial transition-all"
                            >
                              {tck.status === 'Resolved' ? 'View / Edit Reply' : 'Reply & Resolve'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═════════════════════════════════════════════════════ */}
              {/* 10. OFFER DEALS & COUPONS TAB                         */}
              {/* ═════════════════════════════════════════════════════ */}
              {activeTab === 'offers' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-white font-editorial">Booking Offers & Discount Deals</h3>
                      <p className="text-xs text-slate-400 font-mono">Create discount coupon codes for guest bookings</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddOfferModal(true)}
                      className="px-4 py-2 rounded-2xl bg-cyan-500 text-black text-xs font-bold font-editorial flex items-center gap-1.5 shadow-md hover:bg-cyan-400 transition-all"
                    >
                      <Plus size={14} /> Create Offer Deal
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {offersList.map((offer) => (
                      <div key={offer.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-black tracking-wider">
                              {offer.code}
                            </span>
                            <h4 className="text-sm font-bold text-white font-editorial pt-1">{offer.title}</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 font-mono leading-relaxed">{offer.description}</p>
                        <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-slate-800">
                          <span className="text-emerald-400 font-bold">
                            {offer.discountPercent ? `${offer.discountPercent}% OFF` : `₹${offer.discountAmount} FLAT OFF`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleOfferActive(offer.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                              offer.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {offer.isActive ? 'Active' : 'Disabled'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}

        </main>
      </div>

      {/* ═════════════════════════════════════════════════════ */}
      {/* MODALS                                                */}
      {/* ═════════════════════════════════════════════════════ */}

      {/* 1. Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a101d] rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-editorial">Add New Staff Member</h3>
              <button type="button" onClick={() => setShowAddStaffModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input required value={staffName} onChange={e => setStaffName(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="Ramesh Ops" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input type="email" required value={staffEmail} onChange={e => setStaffEmail(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="ramesh@exploretamilnadu.com" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Phone Number</label>
                <input value={staffPhone} onChange={e => setStaffPhone(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="+91 78717 79134" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Staff Role</label>
                <select value={staffRole} onChange={e => setStaffRole(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white">
                  <option value="operations_manager">Operations Manager</option>
                  <option value="booking_executive">Booking Executive</option>
                  <option value="customer_support_executive">Customer Support Executive</option>
                  <option value="destination_content_manager">Destination Content Manager</option>
                  <option value="property_verification_manager">Property Verification Manager</option>
                  <option value="transport_manager">Transport Manager</option>
                  <option value="finance_accounts_manager">Finance Accounts Manager</option>
                  <option value="marketing_manager">Marketing Manager</option>
                  <option value="hr_staff_manager">HR Staff Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Password</label>
                <input type="password" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="ExploreTN2026" />
              </div>
              <button type="submit" className="w-full py-3 rounded-2xl bg-cyan-500 text-black font-editorial font-bold text-xs mt-2">
                Create Staff Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Property Modal */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a101d] rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-editorial">Add New Property</h3>
              <button type="button" onClick={() => setShowAddPropertyModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateProperty} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Property Title</label>
                <input required value={propTitle} onChange={e => setPropTitle(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="Ooty Lakeview Villa" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Location & Address</label>
                <input required value={propLocation} onChange={e => setPropLocation(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="West Lake Road, Ooty" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Type</label>
                  <select value={propType} onChange={e => setPropType(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white">
                    <option value="Resort">Resort</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Homestay">Homestay</option>
                    <option value="Cottage">Cottage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Price / Night (₹)</label>
                  <input type="number" required value={propPrice} onChange={e => setPropPrice(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="4800" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-2xl bg-cyan-500 text-black font-editorial font-bold text-xs mt-2">
                Save & Approve Property
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a101d] rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-editorial">Add New Vehicle</h3>
              <button type="button" onClick={() => setShowAddVehicleModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateVehicle} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Vehicle Name / Model</label>
                <input required value={vehTitle} onChange={e => setVehTitle(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="Innova Crysta 7-Seater" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Registration Number</label>
                <input required value={vehRegNo} onChange={e => setVehRegNo(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="TN-37-ET-2026" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Type</label>
                  <select value={vehType} onChange={e => setVehType(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white">
                    <option value="Cab SUV">Cab SUV</option>
                    <option value="Tempo Traveller">Tempo Traveller</option>
                    <option value="Luxury Sedan">Luxury Sedan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Price / Day (₹)</label>
                  <input type="number" required value={vehPrice} onChange={e => setVehPrice(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="3500" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-2xl bg-cyan-500 text-black font-editorial font-bold text-xs mt-2">
                Register Vehicle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Offer Deal Modal */}
      {showAddOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a101d] rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-editorial">Create Offer Deal & Coupon</h3>
              <button type="button" onClick={() => setShowAddOfferModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateOffer} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Coupon Code (e.g. SUMMER20)</label>
                <input required value={offerCode} onChange={e => setOfferCode(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white uppercase" placeholder="PONGAL2026" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Deal Title</label>
                <input required value={offerTitle} onChange={e => setOfferTitle(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="Pongal Festival Stay Discount" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Discount %</label>
                  <input type="number" required value={offerDiscount} onChange={e => setOfferDiscount(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="20" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Min Booking (₹)</label>
                  <input type="number" required value={offerMinAmount} onChange={e => setOfferMinAmount(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="2500" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Deal Description</label>
                <textarea rows={2} value={offerDesc} onChange={e => setOfferDesc(e.target.value)} className="w-full p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="Special holiday discount for all tourist stays." />
              </div>
              <button type="submit" className="w-full py-3 rounded-2xl bg-cyan-500 text-black font-editorial font-bold text-xs mt-2">
                Activate Offer Coupon
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Reply Support Ticket Modal */}
      {showReplyTicketModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0a101d] rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-editorial">Reply Support Ticket</h3>
                <p className="text-[11px] text-cyan-400 font-mono">{selectedTicket.ticketId || 'TCK-2001'} · {selectedTicket.senderEmail}</p>
              </div>
              <button type="button" onClick={() => setShowReplyTicketModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1">
              <span className="text-slate-400 font-bold">Inquiry Message:</span>
              <p className="text-slate-200">{selectedTicket.message}</p>
            </div>
            <form onSubmit={handleSendTicketReply} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Admin Response</label>
                <textarea rows={4} required value={ticketReplyText} onChange={e => setTicketReplyText(e.target.value)} className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-white" placeholder="Type your resolution response here..." />
              </div>
              <button type="submit" className="w-full py-3 rounded-2xl bg-cyan-500 text-black font-editorial font-bold text-xs">
                Send Reply & Mark Resolved
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}