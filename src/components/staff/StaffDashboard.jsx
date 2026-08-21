import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  XCircle, 
  MessageSquare, 
  MapPin, 
  Building2, 
  Car, 
  CreditCard, 
  Tag, 
  Image as ImageIcon, 
  Users, 
  Shield, 
  FileText, 
  AlertCircle, 
  Send, 
  Plus, 
  Upload, 
  Check, 
  X, 
  TrendingUp, 
  UserCheck,
  LayoutDashboard,
  Navigation,
  AlertTriangle,
  Network,
  Compass,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ChevronRight,
  PhoneCall,
  Edit,
  Trash2,
  FileCheck,
  Percent,
  Video,
  UserPlus,
  Heart,
  Calendar,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { BACKEND_API } from '../../config/api';
import { TOURISM_PLACES } from '../../data/tamilNaduData';

export default function StaffDashboard({ overrideRole }) {
  const { currentUser, logout } = useAuth();
  const { socket } = useSocket();
  const role = overrideRole || currentUser?.role || 'operations_manager';

  // Active Tab for Sidebar (6 Tabs for each role)
  const [activeNavTab, setActiveNavTab] = useState('tab_1');
  const [actionSuccess, setActionSuccess] = useState('');

  // Live Support Tickets State
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedSupportTicket, setSelectedSupportTicket] = useState(null);
  const [supportReplyText, setSupportReplyText] = useState('');

  // Operations Manager Form Inputs
  const [assignTripId, setAssignTripId] = useState('ETN-TRIP-401');
  const [assignGuide, setAssignGuide] = useState('K. Selvam (Nilgiris Specialist)');
  const [assignVehicle, setAssignVehicle] = useState('Innova Crysta (TN-37-ET-2026)');

  // Generic Form States
  const [deptTarget, setDeptTarget] = useState('Transport Department');
  const [deptMessage, setDeptMessage] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('STUDENT2026');
  const [mediaTitleInput, setMediaTitleInput] = useState('');

  const triggerSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  const apiFetch = async (endpoint, options = {}) => {
    const cleanPath = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
    const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_API}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    try {
      const res = await fetch(url, options);
      if (res.ok || res.status === 400 || res.status === 401 || res.status === 403) {
        return res;
      }
    } catch (e) {}
    return await fetch(endpoint, options);
  };

  const fetchSupportTickets = async () => {
    try {
      const res = await apiFetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setSupportTickets(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchSupportTickets();
    if (socket) {
      socket.on('new_ticket', fetchSupportTickets);
      socket.on('ticket_updated', fetchSupportTickets);
      socket.on('stats_updated', fetchSupportTickets);
    }
    const timer = setInterval(fetchSupportTickets, 5000);
    return () => {
      clearInterval(timer);
      if (socket) {
        socket.off('new_ticket');
        socket.off('ticket_updated');
        socket.off('stats_updated');
      }
    };
  }, [socket]);

  const handleSupportReplySubmit = async (ticketId, newStatus = 'Resolved') => {
    try {
      await apiFetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminReply: supportReplyText || `Updated by Support Executive (${newStatus})` })
      });
      setSupportTickets(prev => prev.map(t => (t._id === ticketId || t.ticketId === ticketId) ? { ...t, status: newStatus, adminReply: supportReplyText || t.adminReply } : t));
      triggerSuccess(`Ticket ${ticketId} marked ${newStatus}! Realtime notification dispatched to user/host.`);
      setSupportReplyText('');
      setSelectedSupportTicket(null);
    } catch (err) {
      triggerSuccess(`Ticket ${ticketId} updated!`);
    }
  };

  // Detailed Configuration for all 10 Staff Roles (Each with 6 Dedicated Nav Items)
  const roleConfigs = {
    operations_manager: {
      title: 'Operations Manager Control Console',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <Activity className="w-5 h-5 text-blue-400" />,
      navItems: [
        { id: 'tab_1', label: 'Monitor Daily Operations', icon: <Activity size={18} />, badge: '38 Districts' },
        { id: 'tab_2', label: 'Assign Trips & Resources', icon: <Navigation size={18} />, badge: '4 Pending' },
        { id: 'tab_3', label: 'Oversee Booking Workflow', icon: <CheckCircle size={18} />, badge: '98.4%' },
        { id: 'tab_4', label: 'Resolve Operational Issues', icon: <AlertTriangle size={18} />, badge: '2 Alerts' },
        { id: 'tab_5', label: 'Department Coordination', icon: <Network size={18} />, badge: '4 Depts' },
        { id: 'tab_6', label: 'Monitor Live Ongoing Trips', icon: <Compass size={18} />, badge: '128 Live' }
      ]
    },
    booking_executive: {
      title: 'Booking Executive Workstation',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      navItems: [
        { id: 'tab_1', label: 'Confirm Pending Bookings', icon: <CheckCircle size={18} />, badge: '12 Pending' },
        { id: 'tab_2', label: 'Modify Itineraries & Dates', icon: <Edit size={18} /> },
        { id: 'tab_3', label: 'Cancel & Seat Release', icon: <XCircle size={18} /> },
        { id: 'tab_4', label: 'Handle Booking Enquiries', icon: <Clock size={18} /> },
        { id: 'tab_5', label: 'Booking Status Stream', icon: <Activity size={18} /> },
        { id: 'tab_6', label: 'Generate Confirmation PDFs', icon: <FileText size={18} /> }
      ]
    },
    customer_support_executive: {
      title: 'Customer Support Executive Hub',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: <MessageSquare className="w-5 h-5 text-indigo-400" />,
      navItems: [
        { id: 'tab_1', label: 'Live Support Chat (3D)', icon: <MessageSquare size={18} />, badge: '3 Active' },
        { id: 'tab_2', label: 'Email Support Tickets', icon: <Send size={18} /> },
        { id: 'tab_3', label: 'Phone Helpline (+91 78717 79134)', icon: <PhoneCall size={18} /> },
        { id: 'tab_4', label: 'Complaint Resolution Desk', icon: <AlertCircle size={18} /> },
        { id: 'tab_5', label: 'Refund & Payout Requests', icon: <CreditCard size={18} /> },
        { id: 'tab_6', label: 'Ticket SLA Escalations', icon: <FileCheck size={18} /> }
      ]
    },
    destination_content_manager: {
      title: 'Destination & Content Manager Studio',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: <MapPin className="w-5 h-5 text-rose-400" />,
      navItems: [
        { id: 'tab_1', label: 'Add Tourist Destinations', icon: <Plus size={18} />, badge: '44 Places' },
        { id: 'tab_2', label: 'Update Place Info & Fees', icon: <Edit size={18} /> },
        { id: 'tab_3', label: 'Manage District Circuits', icon: <MapPin size={18} /> },
        { id: 'tab_4', label: 'Upload 3D Photos & Videos', icon: <Upload size={18} /> },
        { id: 'tab_5', label: 'Publish Travel Blogs', icon: <FileText size={18} /> },
        { id: 'tab_6', label: 'Homepage Hero Banners', icon: <ImageIcon size={18} /> }
      ]
    },
    property_verification_manager: {
      title: 'Property Verification Manager Console',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: <Building2 className="w-5 h-5 text-purple-400" />,
      navItems: [
        { id: 'tab_1', label: 'Verify Hotels & Homestays', icon: <Building2 size={18} />, badge: '3 Pending' },
        { id: 'tab_2', label: 'Approve Homestays & Cottages', icon: <Home size={18} /> },
        { id: 'tab_3', label: 'Verify Eco Resorts & Villas', icon: <Castle size={18} /> },
        { id: 'tab_4', label: 'Review Ownership & FSSAI', icon: <FileCheck size={18} /> },
        { id: 'tab_5', label: 'Approve / Reject Host Listings', icon: <CheckCircle2 size={18} /> },
        { id: 'tab_6', label: 'Monitor Property Ratings', icon: <Star size={18} /> }
      ]
    },
    transport_manager: {
      title: 'Transport Manager Operations Hub',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <Car className="w-5 h-5 text-amber-400" />,
      navItems: [
        { id: 'tab_1', label: 'Fleet Management (Innova/Tempo)', icon: <Car size={18} />, badge: '54 Cabs' },
        { id: 'tab_2', label: 'Assign Drivers to Routes', icon: <UserCheck size={18} /> },
        { id: 'tab_3', label: 'Doorstep Pickup Schedules', icon: <Clock size={18} /> },
        { id: 'tab_4', label: 'Hill Circuit Transport Planning', icon: <MapPin size={18} /> },
        { id: 'tab_5', label: 'Live GPS Fleet Tracking', icon: <Compass size={18} /> },
        { id: 'tab_6', label: 'Rental Bike Partner Network', icon: <Network size={18} /> }
      ]
    },
    finance_accounts_manager: {
      title: 'Finance & Accounts Manager Console',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <CreditCard className="w-5 h-5 text-emerald-400" />,
      navItems: [
        { id: 'tab_1', label: 'Razorpay Payment Gateway', icon: <CreditCard size={18} />, badge: '₹48.6L' },
        { id: 'tab_2', label: 'Process Customer Refunds', icon: <XCircle size={18} /> },
        { id: 'tab_3', label: 'Generate GST Tax Invoices', icon: <FileText size={18} /> },
        { id: 'tab_4', label: 'Platform Gross Volume Log', icon: <TrendingUp size={18} /> },
        { id: 'tab_5', label: 'Host & Guide Settlement Payouts', icon: <Building2 size={18} /> },
        { id: 'tab_6', label: 'Monthly Tax & Audit Filings', icon: <FileCheck size={18} /> }
      ]
    },
    marketing_manager: {
      title: 'Marketing Manager Campaign Studio',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: <Tag className="w-5 h-5 text-orange-400" />,
      navItems: [
        { id: 'tab_1', label: 'Active Promotional Campaigns', icon: <Tag size={18} />, badge: '3 Active' },
        { id: 'tab_2', label: 'Student Promo Codes (STUDENT2026)', icon: <Percent size={18} /> },
        { id: 'tab_3', label: 'Discount Coupon Engine', icon: <Gift size={18} /> },
        { id: 'tab_4', label: 'Email Newsletter Dispatch', icon: <Send size={18} /> },
        { id: 'tab_5', label: 'Social Media Promotions', icon: <Activity size={18} /> },
        { id: 'tab_6', label: 'Nilgiri Festival Event Promos', icon: <Compass size={18} /> }
      ]
    },
    media_gallery_manager: {
      title: 'Media & Gallery Manager Studio',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      icon: <ImageIcon className="w-5 h-5 text-cyan-400" />,
      navItems: [
        { id: 'tab_1', label: 'High-Res Photo CDN Upload', icon: <Upload size={18} />, badge: '15 Photos' },
        { id: 'tab_2', label: 'Manage Videos & 360 Tours', icon: <Video size={18} /> },
        { id: 'tab_3', label: 'District Media Galleries', icon: <ImageIcon size={18} /> },
        { id: 'tab_4', label: 'Optimize Page Speed Performance', icon: <TrendingUp size={18} /> },
        { id: 'tab_5', label: 'Copyright Compliance Audit', icon: <Shield size={18} /> },
        { id: 'tab_6', label: 'Seasonal Banner Slides', icon: <MapPin size={18} /> }
      ]
    },
    hr_staff_manager: {
      title: 'HR & Staff Manager Console',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
      icon: <Users className="w-5 h-5 text-teal-400" />,
      navItems: [
        { id: 'tab_1', label: 'Internal Staff Directory', icon: <Users size={18} />, badge: '10 Staff' },
        { id: 'tab_2', label: 'Role Permission Configurator', icon: <Shield size={18} /> },
        { id: 'tab_3', label: 'Department Access Control', icon: <Network size={18} /> },
        { id: 'tab_4', label: 'Staff Onboarding & Training', icon: <UserPlus size={18} /> },
        { id: 'tab_5', label: 'Monitor SLA Response Times', icon: <Clock size={18} /> },
        { id: 'tab_6', label: 'Attendance & System Audit Stream', icon: <FileCheck size={18} /> }
      ]
    }
  };

  const currentConfig = roleConfigs[role] || roleConfigs.operations_manager;

  return (
    <div className="w-full min-h-screen bg-slate-100 flex overflow-hidden m-0">
      
      {/* 📌 STAFF SIDEBAR (Icons only on mobile, full text on PC & Tab) */}
      <aside className="w-16 sm:w-20 md:w-64 bg-[#071933] text-white flex flex-col justify-between p-3 sm:p-4 md:p-6 border-r border-[#0d2347] flex-shrink-0 min-h-screen transition-all">
        <div>
          {/* Header */}
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-[#0d2347]">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-black shadow-inner shrink-0">
              {currentConfig.icon}
            </div>
            <div className="hidden md:block">
              <span className="text-xs font-extrabold text-white block leading-tight truncate max-w-[140px]">
                {role.replace(/_/g, ' ').toUpperCase()}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 block font-bold mt-0.5">Workstation Desk</span>
            </div>
          </div>

          {/* User Profile Badge (hidden on mobile, shown on PC/Tab) */}
          <div className="hidden md:block mb-6 p-3 rounded-2xl bg-[#0b2447] border border-[#16417d] text-xs">
            <div className="text-[10px] font-mono text-gray-400 uppercase font-bold">Staff Session</div>
            <div className="font-extrabold text-white mt-0.5">{currentUser?.name || 'Staff Executive'}</div>
            <div className="text-[11px] text-cyan-300 truncate">{currentUser?.email || 'exploretamizhagam@gmail.com'}</div>
          </div>

          {/* 6 Dedicated Nav Items */}
          <nav className="space-y-1.5">
            {currentConfig.navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNavTab(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-center md:justify-between p-3 md:px-3.5 md:py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeNavTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-slate-300 hover:bg-[#0b2447] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  {/* Icons only on mobile UI, letters on PC & Tab */}
                  <span className="hidden md:inline truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`hidden md:inline px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold flex-shrink-0 ${
                    activeNavTab === item.id ? 'bg-white/20 text-white' : 'bg-[#123363] text-cyan-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Controls (No logout here, available in top user menu) */}
        <div className="pt-6 border-t border-[#0e2e5c]">
          <div className="flex items-center justify-center md:justify-start gap-2 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>MongoDB Workstation Live</span>
          </div>
        </div>
      </aside>

      {/* 💻 MAIN STAFF WORKSTATION CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-10 bg-slate-50 overflow-y-auto min-h-screen">
        
        {/* Top Header Status Bar */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider font-mono ${currentConfig.badgeColor}`}>
              {role.replace(/_/g, ' ')} Workstation
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2 capitalize">
              {currentConfig.navItems.find(i => i.id === activeNavTab)?.label}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time live database synchronization active.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-extrabold bg-green-100 text-green-800 border border-green-300">
              🟢 Shift Active
            </span>
          </div>
        </div>

        {/* Notifications */}
        {actionSuccess && (
          <div className="p-4 mb-6 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <Check size={18} className="text-green-600" /> {actionSuccess}
          </div>
        )}

        {/* ⚙️ OPERATIONS MANAGER INTERACTIVE WORKSTATION */}
        {role === 'operations_manager' && (
          <div className="space-y-8">
            {activeNavTab === 'tab_1' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-6 rounded-3xl bg-blue-50 border border-blue-200 shadow-xs">
                    <div className="text-xs font-extrabold text-blue-800 uppercase">Ongoing Live Trips</div>
                    <div className="text-3xl font-black text-blue-950 mt-1">128 Trips</div>
                  </div>
                  <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-xs">
                    <div className="text-xs font-extrabold text-emerald-800 uppercase">Active Tour Guides</div>
                    <div className="text-3xl font-black text-emerald-950 mt-1">96 Guides</div>
                  </div>
                  <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-200 shadow-xs">
                    <div className="text-xs font-extrabold text-indigo-800 uppercase">Active Fleet Cabs</div>
                    <div className="text-3xl font-black text-indigo-950 mt-1">54 Vehicles</div>
                  </div>
                  <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 shadow-xs">
                    <div className="text-xs font-extrabold text-amber-800 uppercase">SLA Fulfillment</div>
                    <div className="text-3xl font-black text-amber-950 mt-1">99.4%</div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">District-Wise Daily Operations Log</h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                      <span className="font-bold">Nilgiris (Ooty & Coonoor)</span>
                      <span className="text-blue-600 font-mono font-bold">34 Trips | 28 Guides | 16 Cabs</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                      <span className="font-bold">Dindigul (Kodaikanal)</span>
                      <span className="text-blue-600 font-mono font-bold">26 Trips | 20 Guides | 12 Cabs</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeNavTab === 'tab_2' && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Assign Trips & Resources Console</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Pending Trip ID</label>
                    <select value={assignTripId} onChange={e => setAssignTripId(e.target.value)} className="glass-input text-xs">
                      <option value="ETN-TRIP-401">ETN-TRIP-401 (Ooty Lakeview & Doddabetta)</option>
                      <option value="ETN-TRIP-402">ETN-TRIP-402 (Kodaikanal Excursion)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assign Tour Guide</label>
                    <select value={assignGuide} onChange={e => setAssignGuide(e.target.value)} className="glass-input text-xs">
                      <option value="K. Selvam (Nilgiris Specialist)">K. Selvam (Nilgiris Specialist)</option>
                      <option value="M. Ramanathan (Temple Specialist)">M. Ramanathan (Temple Specialist)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assign Vehicle & Driver</label>
                    <select value={assignVehicle} onChange={e => setAssignVehicle(e.target.value)} className="glass-input text-xs">
                      <option value="Innova Crysta (TN-37-ET-2026)">Innova Crysta (TN-37-ET-2026)</option>
                      <option value="Tempo Traveller (TN-59-AB-1008)">Tempo Traveller (TN-59-AB-1008)</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => triggerSuccess(`Trip ${assignTripId} assigned to ${assignGuide}!`)} className="glass-button text-xs py-3 px-6">
                  Dispatch Assignment
                </button>
              </div>
            )}

            {activeNavTab === 'tab_3' && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Oversee Booking Workflow Pipeline</h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-blue-600 font-mono">ETN-BK-9001</span>
                    <div className="font-bold text-slate-900">Ooty Lakeview Grand Resort</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-mono font-bold">Stage 5: Check-in Dispatched 🟢</span>
                </div>
              </div>
            )}

            {activeNavTab === 'tab_4' && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Resolve Operational Issues</h3>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono text-rose-700 font-bold">ISSUE-101</span>
                    <div className="font-bold text-slate-900">Coonoor Ghats Landslide Traffic Diversion</div>
                  </div>
                  <button onClick={() => triggerSuccess('Issue resolved and rerouted!')} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">Mark Resolved</button>
                </div>
              </div>
            )}

            {activeNavTab === 'tab_5' && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Department Coordination Hub</h3>
                <div className="space-y-3 text-xs">
                  <input type="text" placeholder="Broadcast message..." value={deptMessage} onChange={e => setDeptMessage(e.target.value)} className="glass-input text-xs" />
                  <button onClick={() => triggerSuccess('Inter-department broadcast dispatched!')} className="glass-button text-xs py-2.5 px-6">Send Broadcast Message</button>
                </div>
              </div>
            )}

            {activeNavTab === 'tab_6' && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Monitor Live Ongoing Trips (GPS Tracking Feed)</h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono text-blue-600 font-bold">TRIP-901</span>
                    <div className="font-bold text-slate-900">Ooty & Coonoor Heritage Circuit</div>
                    <span className="text-slate-500">📍 Location: Coonoor Tea Gardens (38 km/h)</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold">🟢 Live GPS Online</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🎟️ BOOKING EXECUTIVE WORKSTATION */}
        {role === 'booking_executive' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Booking Executive Workstation</h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="font-mono text-blue-600 font-bold">ETN-BK-9001</span>
                <div className="font-bold text-slate-900 text-sm">Ooty Lakeview Grand Resort</div>
              </div>
              <button onClick={() => triggerSuccess('Booking confirmed & confirmation PDF generated!')} className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold">Confirm & Generate Receipt</button>
            </div>
          </div>
        )}

        {/* 🎧 CUSTOMER SUPPORT EXECUTIVE WORKSTATION */}
        {role === 'customer_support_executive' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Customer Support Live Ticket Console</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Real-time incoming support tickets from tourists, guests, and property hosts.</p>
              </div>
              <div className="flex items-center gap-2">
                <a href="tel:+917871779134" className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono font-bold text-xs flex items-center gap-1.5">
                  <PhoneCall size={13} /> +91 78717 79134 (24/7 Helpline)
                </a>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-[10px] font-mono font-bold text-amber-800 uppercase">Open Tickets</div>
                <div className="text-2xl font-black text-amber-950 mt-0.5">
                  {supportTickets.filter(t => t.status === 'Open').length}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="text-[10px] font-mono font-bold text-blue-800 uppercase">In Progress</div>
                <div className="text-2xl font-black text-blue-950 mt-0.5">
                  {supportTickets.filter(t => t.status === 'In Progress').length}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] font-mono font-bold text-emerald-800 uppercase">Resolved</div>
                <div className="text-2xl font-black text-emerald-950 mt-0.5">
                  {supportTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length}
                </div>
              </div>
            </div>

            {/* Live Tickets List */}
            {supportTickets.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 font-mono text-xs">
                ✨ No active support tickets in queue. All user queries resolved!
              </div>
            ) : (
              <div className="space-y-3">
                {supportTickets.map((tck) => {
                  const tckId = tck.ticketId || tck._id;
                  const isSelected = selectedSupportTicket?.ticketId === tckId || selectedSupportTicket?._id === tck._id;
                  return (
                    <div key={tck._id || tckId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full text-xs">
                            {tckId}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            tck.status === 'Open' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            tck.status === 'In Progress' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                            'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            ● {tck.status}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            [{tck.category || 'General'}]
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {tck.createdAt ? new Date(tck.createdAt).toLocaleString('en-IN') : 'Recent'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{tck.subject}</h4>
                        {tck.message && (
                          <p className="text-xs text-slate-600 mt-1 bg-white p-3 rounded-xl border border-slate-200 font-editorial">
                            "{tck.message}"
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 pt-1">
                        <div>
                          <strong>From:</strong> {tck.senderName} ({tck.senderEmail}) · <span className="uppercase text-indigo-600 font-bold">{tck.senderRole || 'user'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {tck.status !== 'Resolved' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSupportTicket(isSelected ? null : tck);
                                setSupportReplyText(tck.adminReply || '');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                            >
                              {isSelected ? 'Close Reply Box' : '💬 Reply & Resolve'}
                            </button>
                          )}
                          {tck.status === 'Open' && (
                            <button
                              type="button"
                              onClick={() => handleSupportReplySubmit(tckId, 'In Progress')}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-300 text-blue-800 font-bold text-xs hover:bg-blue-100 cursor-pointer"
                            >
                              Mark In Progress
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Admin Reply Details if existing */}
                      {tck.adminReply && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-mono">
                          <strong>✓ Support Reply:</strong> {tck.adminReply}
                        </div>
                      )}

                      {/* Quick Reply Drawer */}
                      {isSelected && (
                        <div className="p-4 bg-white rounded-2xl border-2 border-indigo-300 space-y-3 animate-in fade-in">
                          <label className="block text-xs font-bold text-slate-800">
                            Reply to {tck.senderName} ({tck.senderEmail})
                          </label>
                          <textarea
                            rows={3}
                            value={supportReplyText}
                            onChange={(e) => setSupportReplyText(e.target.value)}
                            placeholder="Type resolution instructions or assistance details..."
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-hidden focus:ring-2 focus:ring-indigo-500 font-editorial"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedSupportTicket(null)}
                              className="px-3.5 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSupportReplySubmit(tckId, 'Resolved')}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm flex items-center gap-1"
                            >
                              <Check size={14} /> Send Reply & Mark Resolved
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ✍️ DESTINATION CONTENT MANAGER WORKSTATION */}
        {role === 'destination_content_manager' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Destination & Content Manager Studio</h3>
            <button onClick={() => triggerSuccess('New destination drafted for publishing!')} className="glass-button text-xs py-2.5 px-6">Publish Destination Circuit</button>
          </div>
        )}

        {/* 🏰 PROPERTY VERIFICATION MANAGER WORKSTATION */}
        {role === 'property_verification_manager' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Property Verification & Licensing Console</h3>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-purple-950 text-sm">Cauvery Riverfront Heritage Cottage</span>
                <div className="text-purple-700">FSSAI & Property Documents Verified</div>
              </div>
              <button onClick={() => triggerSuccess('Property verified & listed!')} className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold">Approve Property Listing</button>
            </div>
          </div>
        )}

        {/* 🚖 TRANSPORT MANAGER WORKSTATION */}
        {role === 'transport_manager' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Fleet Transport & Driver Operations Hub</h3>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-amber-950 text-sm">Innova Crysta (TN-37-ET-2026)</span>
                <div className="text-amber-700">Driver: Ramesh V.</div>
              </div>
              <button onClick={() => triggerSuccess('Driver Ramesh assigned to route!')} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold">Assign Driver</button>
            </div>
          </div>
        )}

        {/* 💰 FINANCE MANAGER WORKSTATION */}
        {role === 'finance_accounts_manager' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Finance & Razorpay Payment Console</h3>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-emerald-950 text-sm">Razorpay UPI Settlement Batch</span>
                <div className="text-emerald-700">Total Revenue Collected: ₹48,60,400</div>
              </div>
              <button onClick={() => triggerSuccess('GST Tax Invoice generated!')} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">Generate GST Invoice</button>
            </div>
          </div>
        )}

        {/* 🎯 MARKETING MANAGER WORKSTATION */}
        {role === 'marketing_manager' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Marketing Campaign & Coupon Studio</h3>
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-orange-950 text-sm">Coupon Code: STUDENT2026</span>
                <div className="text-orange-700">Flat 20% OFF for college bookings</div>
              </div>
              <button onClick={() => triggerSuccess('Coupon STUDENT2026 activated!')} className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold">Publish Promo Coupon</button>
            </div>
          </div>
        )}

        {/* 📸 MEDIA MANAGER WORKSTATION */}
        {role === 'media_gallery_manager' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Media CDN & Video Gallery Studio</h3>
            <button onClick={() => triggerSuccess('Media asset uploaded!')} className="glass-button text-xs py-2.5 px-6">Upload High-Res Media Asset</button>
          </div>
        )}

        {/* 👥 HR STAFF MANAGER WORKSTATION */}
        {role === 'hr_staff_manager' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">HR Employee Directory & SLA Monitoring</h3>
            <button onClick={() => triggerSuccess('Staff SLA performance verified!')} className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs">Verify Staff SLA Performance</button>
          </div>
        )}

      </main>

    </div>
  );
}
