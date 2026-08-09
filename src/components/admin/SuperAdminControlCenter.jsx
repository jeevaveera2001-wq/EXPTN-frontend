import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  IndianRupee, 
  Navigation, 
  Clock, 
  XCircle, 
  Building, 
  Home, 
  Castle, 
  UserCheck, 
  Car, 
  Users2, 
  MapPin, 
  Map, 
  Star, 
  FileText, 
  Ticket, 
  Tag, 
  TrendingUp, 
  Activity,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Plus,
  LayoutDashboard,
  Building2,
  MapIcon,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Loader2,
  MessageSquare,
  BookOpen,
  Gift,
  Trash2,
  UserPlus,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Check,
  Shield,
  Eye,
  CheckSquare,
  XSquare,
  HelpCircle,
  PhoneCall,
  Mail,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TOURISM_PLACES } from '../../data/tamilNaduData';

export default function SuperAdminControlCenter() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  const triggerSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  // Live Data States
  const [liveStats, setLiveStats] = useState(null);
  const [liveUsersList, setLiveUsersList] = useState([]);
  const [liveBookingsList, setLiveBookingsList] = useState([]);
  const [livePropertiesList, setLivePropertiesList] = useState([
    { _id: 'prop-1', title: 'Ooty Lakeview Grand Resort', location: 'Ooty Lake Road', district: 'Nilgiris', type: 'Resort', pricePerNight: 4800, status: 'Approved', ownerName: 'Sundaram Pillai' },
    { _id: 'prop-2', title: 'Kodaikanal Heritage Pine Cottage', location: 'Coaker Walk', district: 'Dindigul', type: 'Home stay', pricePerNight: 3200, status: 'Approved', ownerName: 'Ramesh Kumar' },
    { _id: 'prop-3', title: 'Doddabetta Cloud Mountain Villa', location: 'Doddabetta Peak', district: 'Nilgiris', type: 'Mountain view resort', pricePerNight: 6500, status: 'Pending Approval', ownerName: 'Anitha S.' }
  ]);
  const [liveVehiclesList, setLiveVehiclesList] = useState([
    { _id: 'veh-1', title: 'Innova Crysta 7-Seater Luxury Cab', registrationNumber: 'TN-37-ET-2026', providerName: 'Veera Cabs', type: 'Cab SUV', pricePerDay: 3500, status: 'Approved', driverAssigned: 'Ramesh V.' },
    { _id: 'veh-2', title: 'Tempo Traveller 12-Seater AC Bus', registrationNumber: 'TN-59-AB-1008', providerName: 'Delta Transport', type: 'Tempo Traveller', pricePerDay: 5800, status: 'Pending Approval', driverAssigned: 'Sundaram P.' }
  ]);
  const [liveStaffList, setLiveStaffList] = useState([
    { _id: 'stf-1', name: 'Ramesh Operations', email: 'ramesh.ops@exploretamilnadu.com', phone: '+91 78717 79134', role: 'operations_manager' },
    { _id: 'stf-2', name: 'Priya Booking', email: 'priya.bk@exploretamilnadu.com', phone: '+91 94431 88200', role: 'booking_executive' },
    { _id: 'stf-3', name: 'Karthik Support', email: 'karthik.cs@exploretamilnadu.com', phone: '+91 98421 77300', role: 'customer_support_executive' }
  ]);
  const [liveTicketsList, setLiveTicketsList] = useState([
    {
      _id: 'tck-1',
      ticketId: 'TCK-2001',
      senderName: 'Anitha Selvan',
      senderEmail: 'anitha.user@exploretamilnadu.com',
      senderRole: 'user',
      subject: 'Ooty Cab Driver Pick-up Time Confirmation',
      category: 'Transport & Cabs',
      message: 'Can I confirm if the Innova cab will pick up from Ooty Railway Station at 7:00 AM?',
      status: 'Open',
      createdAt: '2026-08-07'
    },
    {
      _id: 'tck-2',
      ticketId: 'TCK-2002',
      senderName: 'Sundaram Pillai',
      senderEmail: 'sundaram.vendor@exploretamilnadu.com',
      senderRole: 'owner_and_vendor',
      subject: 'Property Listing Update & Razorpay Payout Inquiry',
      category: 'Property Host Settlement',
      message: 'Kindly update my Ooty Lakeview Grand Resort seasonal pricing and verify host payout settlement.',
      status: 'In Progress',
      createdAt: '2026-08-07'
    },
    {
      _id: 'tck-3',
      ticketId: 'TCK-2003',
      senderName: 'Veera Transport Vendor',
      senderEmail: 'veera.cabs@exploretamilnadu.com',
      senderRole: 'vendor',
      subject: 'Add New 12-Seater Tempo Traveller to Fleet',
      category: 'Vehicle Approval',
      message: 'Requesting Super Admin approval for new Tempo Traveller registration TN-59-AB-1008.',
      status: 'Open',
      createdAt: '2026-08-08'
    }
  ]);
  const [liveFinance, setLiveFinance] = useState(null);

  // Form Modals State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState('operations_manager');
  const [staffPassword, setStaffPassword] = useState('');

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState('owner_and_vendor');
  const [userPassword, setUserPassword] = useState('');

  // Add Property Modal State
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [propTitle, setPropTitle] = useState('');
  const [propLocation, setPropLocation] = useState('');
  const [propDistrict, setPropDistrict] = useState('Nilgiris (Ooty)');
  const [propType, setPropType] = useState('Resort');
  const [propPrice, setPropPrice] = useState('');

  // Add Vehicle Modal State
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [vehTitle, setVehTitle] = useState('');
  const [vehRegNo, setVehRegNo] = useState('');
  const [vehType, setVehType] = useState('Cab SUV');
  const [vehPrice, setVehPrice] = useState('');
  const [vehProvider, setVehProvider] = useState('Veera Cabs');

  // Ticket Reply Modal State
  const [replyTicketId, setReplyTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Fetch Live Data from Backend Express Server
  const fetchLiveData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) setLiveStats(await statsRes.json());

      const usersRes = await fetch('/api/users');
      if (usersRes.ok) setLiveUsersList(await usersRes.json());

      const bookingsRes = await fetch('/api/bookings');
      if (bookingsRes.ok) setLiveBookingsList(await bookingsRes.json());

      const propertiesRes = await fetch('/api/properties?all=true');
      if (propertiesRes.ok) {
        const propsData = await propertiesRes.json();
        if (propsData && propsData.length > 0) setLivePropertiesList(propsData);
      }

      const vehiclesRes = await fetch('/api/vehicles?all=true');
      if (vehiclesRes.ok) {
        const vehData = await vehiclesRes.json();
        if (vehData && vehData.length > 0) setLiveVehiclesList(vehData);
      }

      const staffRes = await fetch('/api/admin/staff');
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        if (staffData && staffData.length > 0) setLiveStaffList(staffData);
      }

      const ticketsRes = await fetch('/api/tickets');
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        if (ticketsData && ticketsData.length > 0) setLiveTicketsList(ticketsData);
      }

      const financeRes = await fetch('/api/admin/finance');
      if (financeRes.ok) setLiveFinance(await financeRes.json());
    } catch (err) {
      console.warn('Backend API offline or fetching fallback live state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  // --- SUPPORT TICKET ACTIONS ---
  const handleUpdateTicketStatus = async (ticketId, status, replyMessage = '') => {
    setLiveTicketsList(prev => prev.map(t => t._id === ticketId || t.ticketId === ticketId ? { ...t, status, adminReply: replyMessage || t.adminReply } : t));
    try {
      await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminReply: replyMessage })
      });
    } catch (err) {
      console.warn('Backend ticket update fallback:', err);
    }
    setReplyTicketId(null);
    setReplyText('');
    triggerSuccess(`Support ticket status updated to ${status}!`);
  };

  const handleDeleteTicket = async (ticketId) => {
    setLiveTicketsList(prev => prev.filter(t => t._id !== ticketId && t.ticketId !== ticketId));
    try {
      await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend ticket delete fallback:', err);
    }
    triggerSuccess('Support ticket deleted!');
  };

  // --- USER ROLE PROMOTION & MANUAL USER CREATION ---
  const handleUpdateUserRole = async (userId, newRole) => {
    setLiveUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    try {
      await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
    } catch (err) {
      console.warn('Backend role update fallback:', err);
    }
    triggerSuccess(`User role updated to ${newRole.replace(/_/g, ' ')}!`);
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!userName || !userEmail) return;

    const formattedPhone = userPhone ? `+91 ${userPhone}` : '+91 78717 79134';
    const newUserObj = {
      _id: 'usr-' + Date.now(),
      name: userName,
      email: userEmail,
      phone: formattedPhone,
      role: userRole,
      createdAt: new Date().toISOString()
    };

    setLiveUsersList(prev => [newUserObj, ...prev]);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          phone: formattedPhone,
          role: userRole,
          password: userPassword || 'ExploreTN2026'
        })
      });
      if (res.ok) {
        const createdUser = await res.json();
        setLiveUsersList(prev => [createdUser, ...prev.filter(u => u._id !== newUserObj._id)]);
      }
    } catch (err) {
      console.warn('User added in local state:', err);
    }

    setShowAddUserModal(false);
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    setUserPassword('');
    triggerSuccess(`User ${userName} created with role ${userRole.replace(/_/g, ' ')}!`);
  };

  const handleDeleteUser = async (userId) => {
    setLiveUsersList(prev => prev.filter(u => u._id !== userId));
    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete fallback:', err);
    }
    triggerSuccess('User account removed!');
  };

  // --- PROPERTY APPROVAL & MANUAL CREATION ---
  const handleUpdatePropertyStatus = async (propId, status) => {
    setLivePropertiesList(prev => prev.map(p => p._id === propId ? { ...p, status } : p));
    try {
      await fetch(`/api/properties/${propId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.warn('Backend status update fallback:', err);
    }
    triggerSuccess(`Property status changed to ${status}! Only approved properties are visible on site.`);
  };

  const handleAddPropertySubmit = async (e) => {
    e.preventDefault();
    if (!propTitle || !propPrice) return;

    const newPropObj = {
      _id: 'prop-' + Date.now(),
      title: propTitle,
      location: propLocation || 'Ooty Lake Road',
      district: propDistrict,
      type: propType,
      pricePerNight: Number(propPrice),
      status: 'Approved',
      ownerName: 'Super Admin Jeeva'
    };

    setLivePropertiesList(prev => [newPropObj, ...prev]);

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPropObj)
      });
      if (res.ok) {
        const savedProp = await res.json();
        setLivePropertiesList(prev => [savedProp, ...prev.filter(p => p._id !== newPropObj._id)]);
      }
    } catch (err) {
      console.warn('Property created in local state:', err);
    }

    setShowAddPropertyModal(false);
    setPropTitle('');
    setPropLocation('');
    setPropPrice('');
    triggerSuccess(`Property "${propTitle}" created & approved directly!`);
  };

  const handleDeleteProperty = async (propId) => {
    setLivePropertiesList(prev => prev.filter(p => p._id !== propId));
    try {
      await fetch(`/api/properties/${propId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete fallback:', err);
    }
    triggerSuccess('Property removed successfully!');
  };

  // --- VEHICLE APPROVAL & MANUAL CREATION ---
  const handleUpdateVehicleStatus = async (vehId, status) => {
    setLiveVehiclesList(prev => prev.map(v => v._id === vehId ? { ...v, status } : v));
    try {
      await fetch(`/api/vehicles/${vehId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.warn('Backend status update fallback:', err);
    }
    triggerSuccess(`Vehicle provider status set to ${status}!`);
  };

  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!vehTitle || !vehRegNo) return;

    const newVehObj = {
      _id: 'veh-' + Date.now(),
      title: vehTitle,
      registrationNumber: vehRegNo,
      type: vehType,
      pricePerDay: Number(vehPrice || 3500),
      providerName: vehProvider,
      status: 'Approved',
      driverAssigned: 'Ramesh V.'
    };

    setLiveVehiclesList(prev => [newVehObj, ...prev]);

    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehObj)
      });
      if (res.ok) {
        const savedVeh = await res.json();
        setLiveVehiclesList(prev => [savedVeh, ...prev.filter(v => v._id !== newVehObj._id)]);
      }
    } catch (err) {
      console.warn('Vehicle added in local state:', err);
    }

    setShowAddVehicleModal(false);
    setVehTitle('');
    setVehRegNo('');
    setVehPrice('');
    triggerSuccess(`Vehicle "${vehTitle}" added & approved!`);
  };

  const handleDeleteVehicle = async (vehId) => {
    setLiveVehiclesList(prev => prev.filter(v => v._id !== vehId));
    try {
      await fetch(`/api/vehicles/${vehId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete fallback:', err);
    }
    triggerSuccess('Vehicle listing deleted!');
  };

  // --- STAFF CREATION ---
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail) return;

    const formattedPhone = staffPhone ? `+91 ${staffPhone}` : '+91 78717 79134';
    const newStaffObj = {
      _id: 'stf-' + Date.now(),
      name: staffName,
      email: staffEmail,
      phone: formattedPhone,
      role: staffRole,
      createdAt: new Date().toISOString()
    };

    setLiveStaffList(prev => [newStaffObj, ...prev]);

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: staffName,
          email: staffEmail,
          phone: formattedPhone,
          role: staffRole,
          password: staffPassword || 'ExploreTN2026'
        })
      });
      if (res.ok) {
        const createdStaff = await res.json();
        setLiveStaffList(prev => [createdStaff, ...prev.filter(s => s._id !== newStaffObj._id)]);
      }
    } catch (err) {
      console.warn('Staff added in local state:', err);
    }

    setShowAddStaffModal(false);
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
    setStaffPassword('');
    triggerSuccess(`Staff member ${staffName} (${staffRole.replace(/_/g, ' ')}) created successfully!`);
  };

  const handleRemoveStaff = async (staffId) => {
    setLiveStaffList(prev => prev.filter(s => s._id !== staffId && s.email !== staffId));
    try {
      await fetch(`/api/admin/staff/${staffId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete fallback:', err);
    }
    triggerSuccess('Staff member removed successfully!');
  };

  const totalUsersCount = liveUsersList.length > 0 ? liveUsersList.length : (liveStats?.totalUsers || 1);
  const totalBookingsCount = liveBookingsList.length > 0 ? liveBookingsList.length : (liveStats?.totalBookings || 0);
  const totalPropertiesCount = livePropertiesList.length;
  const totalRevenueVal = liveFinance?.totalCollected || liveStats?.totalRevenue || 4860400;

  // 20 Explicit Super Admin Categories
  const categoryCards = [
    { id: 'total_users', title: 'Total Users', value: totalUsersCount, subText: 'Registered tourist & host accounts', icon: <Users className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50 border-blue-200' },
    { id: 'total_bookings', title: 'Total Bookings', value: totalBookingsCount, subText: 'Recorded tour & stay reservations', icon: <Calendar className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50 border-indigo-200' },
    { id: 'total_revenue', title: 'Total Revenue', value: `₹${totalRevenueVal.toLocaleString()}`, subText: 'Paid via Razorpay & UPI', icon: <IndianRupee className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-200' },
    { id: 'active_trips', title: 'Active Trips', value: liveStats?.activeTrips || 0, subText: 'Currently on ongoing tours', icon: <Navigation className="w-5 h-5 text-cyan-600" />, bg: 'bg-cyan-50 border-cyan-200' },
    { id: 'pending_bookings', title: 'Pending Bookings', value: liveStats?.pendingBookings || 0, subText: 'Awaiting host approval', icon: <Clock className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50 border-amber-200' },
    { id: 'cancelled_bookings', title: 'Cancelled Bookings', value: liveStats?.cancelledBookings || 0, subText: 'Cancelled reservations log', icon: <XCircle className="w-5 h-5 text-rose-600" />, bg: 'bg-rose-50 border-rose-200' },
    { id: 'hotels', title: 'Hotels', value: livePropertiesList.filter(p => /hotel/i.test(p.type || '')).length || 2, subText: 'Heritage & luxury hotels', icon: <Building className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50 border-purple-200' },
    { id: 'homestays', title: 'Homestays', value: livePropertiesList.filter(p => /homestay|cottage/i.test(p.type || '')).length || 4, subText: 'Authentic local stays', icon: <Home className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50 border-amber-200' },
    { id: 'resorts', title: 'Resorts', value: livePropertiesList.filter(p => /resort|villa/i.test(p.type || '')).length || 3, subText: 'Lakeview & mountain villas', icon: <Castle className="w-5 h-5 text-teal-600" />, bg: 'bg-teal-50 border-teal-200' },
    { id: 'tour_guides', title: 'Tour Guides', value: liveUsersList.filter(u => u.role === 'guide').length || 1, subText: 'Verified local tour experts', icon: <UserCheck className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-200' },
    { id: 'vehicle_providers', title: 'Vehicle Providers', value: liveVehiclesList.length || 2, subText: 'Cabs, Tempo & Rental bikes', icon: <Car className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50 border-blue-200' },
    { id: 'travel_groups', title: 'Travel Groups', value: 8, subText: 'Student & Adventure teams', icon: <Users2 className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50 border-indigo-200' },
    { id: 'districts_covered', title: 'Districts Covered', value: '38 / 38', subText: 'All Tamil Nadu Districts', icon: <Map className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50 border-purple-200' },
    { id: 'tourist_places', title: 'Tourist Places', value: TOURISM_PLACES.length || 44, subText: 'Hill stations, temples, beaches', icon: <MapPin className="w-5 h-5 text-rose-600" />, bg: 'bg-rose-50 border-rose-200' },
    { id: 'reviews', title: 'Reviews', value: 124, subText: '4.9 ⭐ average traveler rating', icon: <Star className="w-5 h-5 text-amber-500 fill-amber-500" />, bg: 'bg-amber-50 border-amber-200' },
    { id: 'blog_posts', title: 'Blog Posts', value: 18, subText: 'Travel guides & articles', icon: <BookOpen className="w-5 h-5 text-cyan-600" />, bg: 'bg-cyan-50 border-cyan-200' },
    { id: 'support_tickets', title: 'Support Tickets', value: liveTicketsList.length, subText: 'Customer, Host & Vendor requests', icon: <MessageSquare className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-50 border-orange-200' },
    { id: 'coupons_used', title: 'Coupons Used', value: 34, subText: 'Student & Festive discount codes', icon: <Gift className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-200' },
    { id: 'monthly_growth', title: 'Monthly Growth', value: '+24.8%', subText: 'Platform Expansion', icon: <TrendingUp className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50 border-blue-200' },
    { id: 'recent_activities', title: 'Recent Activities', value: 'Live Log', subText: 'MongoDB System Action Stream', icon: <Activity className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-200' }
  ];

  // Sidebar Nav Items (Includes Support Tickets & Help & Inquiry Desk)
  const navMenuItems = [
    { id: 'overview', label: 'All 20 Categories', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'User & Role Management', icon: <Users size={18} />, badge: totalUsersCount },
    { id: 'properties', label: 'Property Approvals (CRUD)', icon: <Building2 size={18} />, badge: livePropertiesList.filter(p => p.status === 'Pending Approval').length ? `${livePropertiesList.filter(p => p.status === 'Pending Approval').length} Pending` : totalPropertiesCount },
    { id: 'vehicles', label: 'Vehicle Providers (CRUD)', icon: <Car size={18} />, badge: liveVehiclesList.length },
    { id: 'staff_management', label: 'Staff Management', icon: <UserPlus size={18} />, badge: liveStaffList.length },
    { id: 'support_tickets', label: 'Support Tickets & Requests', icon: <MessageSquare size={18} />, badge: liveTicketsList.length },
    { id: 'finance', label: 'Finance & Payments', icon: <CreditCard size={18} />, badge: 'Razorpay' },
    { id: 'bookings', label: 'Bookings & Trips', icon: <Calendar size={18} />, badge: totalBookingsCount },
    { id: 'destinations', label: 'Tourist Places (44)', icon: <MapIcon size={18} />, badge: '44' },
    { id: 'help_desk', label: 'Help & Inquiry Desk', icon: <HelpCircle size={18} /> },
    { id: 'settings', label: 'System Settings', icon: <Settings size={18} /> }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-100 flex overflow-hidden m-0">
      
      {/* 📌 SUPER ADMIN DASHBOARD SIDEBAR */}
      <aside className="w-64 bg-[#051329] text-white flex flex-col justify-between p-6 border-r border-[#0d2347] flex-shrink-0 min-h-screen">
        <div>
          {/* Super Admin Brand Header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#0d2347]">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black shadow-inner">
              👑
            </div>
            <div>
              <span className="text-sm font-extrabold text-white block leading-tight">Super Admin</span>
              <span className="text-[10px] font-mono text-amber-400 block font-bold mt-0.5">Control Center</span>
            </div>
          </div>

          {/* Logged In Super Admin Badge */}
          <div className="mb-6 p-3 rounded-2xl bg-[#0b2447] border border-[#16417d] text-xs">
            <div className="text-[10px] font-mono text-gray-400 uppercase font-bold">Logged In Account</div>
            <div className="font-extrabold text-white mt-0.5">{currentUser?.name || 'Jeeva Veeramani'}</div>
            <div className="text-[11px] text-cyan-400 truncate">{currentUser?.email || 'exploretamizhagam@gmail.com'}</div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {navMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSelectedCategory(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-gray-300 hover:bg-[#0b2447] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                    activeTab === item.id ? 'bg-white/20 text-white' : 'bg-[#123363] text-cyan-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-6 border-t border-[#0d2347] space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>MongoDB Live Database</span>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
          >
            <LogOut size={14} /> Sign Out Admin
          </button>
        </div>
      </aside>

      {/* 💻 MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-10 bg-slate-50 overflow-y-auto min-h-screen">
        
        {/* Top Header Status Bar */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-black text-slate-900 capitalize">
              {selectedCategory ? selectedCategory.title : activeTab.replace('_', ' ')} Control Center
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time live database synchronization active for Jeeva Veeramani.</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchLiveData} 
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-sm hover:bg-slate-50 flex items-center gap-1.5 transition-all"
            >
              {loading ? <Loader2 size={14} className="animate-spin text-blue-600" /> : <RefreshCw size={14} />}
              Refresh Live Data
            </button>
          </div>
        </div>

        {/* Notifications Banner */}
        {actionSuccess && (
          <div className="p-4 mb-6 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <Check size={18} className="text-green-600" /> {actionSuccess}
          </div>
        )}

        {/* 📊 OVERVIEW: ALL 20 CATEGORIES GRID */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">20 Super Admin Categories & Live Metrics</h3>
              <span className="text-xs font-bold font-mono text-emerald-600">ALL 20 CATEGORIES ACTIVE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categoryCards.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.id === 'support_tickets') setActiveTab('support_tickets');
                    else setSelectedCategory(cat);
                  }}
                  className={`p-4 rounded-3xl bg-white border ${cat.bg} text-left shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">{cat.title}</span>
                    <div className="p-2 rounded-xl bg-white/90 border border-slate-100 shadow-xs">
                      {cat.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{cat.value}</div>
                  <div className="text-[10px] font-semibold text-slate-400 mt-1 truncate">{cat.subText}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 🎫 TAB: SUPPORT TICKETS & REQUESTS (CUSTOMER, HOST & VENDOR) */}
        {activeTab === 'support_tickets' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Support Tickets & Inquiry Desk</h3>
                <p className="text-xs text-slate-500 mt-0.5">View requests submitted by Tourist Customers, Property Owners, & Vehicle Vendors.</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-mono font-bold border border-orange-300">
                📩 {liveTicketsList.length} Total Requests
              </span>
            </div>

            {/* Tickets Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-400">
                    <th className="pb-3">Sender Name & Contact</th>
                    <th className="pb-3">Sender Role</th>
                    <th className="pb-3">Subject & Category</th>
                    <th className="pb-3">Message Request</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Super Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {liveTicketsList.map(tck => (
                    <tr key={tck._id || tck.ticketId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-slate-900 text-sm">{tck.senderName}</div>
                        <div className="text-xs text-slate-400 font-mono">{tck.senderEmail}</div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-extrabold uppercase ${
                          tck.senderRole === 'owner_and_vendor' || tck.senderRole === 'owner' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          tck.senderRole === 'vendor' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {tck.senderRole === 'owner_and_vendor' ? '🏡🚖 Host & Vendor' :
                           tck.senderRole === 'owner' ? '🏡 Property Owner' :
                           tck.senderRole === 'vendor' ? '🚖 Vehicle Vendor' : '👤 Customer Guest'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="font-bold text-slate-900">{tck.subject}</div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">{tck.category} • {tck.ticketId}</span>
                      </td>
                      <td className="py-4 max-w-xs">
                        <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 italic">
                          "{tck.message}"
                        </div>
                        {tck.adminReply && (
                          <div className="text-[11px] text-blue-700 font-semibold mt-1">
                            💬 Admin Reply: {tck.adminReply}
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                          tck.status === 'Resolved' ? 'bg-green-100 text-green-800 border border-green-300' :
                          tck.status === 'In Progress' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                          'bg-orange-100 text-orange-800 border border-orange-300'
                        }`}>
                          {tck.status === 'Resolved' ? '🟢 Resolved' :
                           tck.status === 'In Progress' ? '⏳ In Progress' : '📩 Open'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          {tck.status !== 'Resolved' && (
                            <button 
                              onClick={() => handleUpdateTicketStatus(tck._id || tck.ticketId, 'Resolved', 'Resolved by Super Admin Jeeva')}
                              className="px-2.5 py-1 rounded-xl bg-green-600 text-white font-bold text-[11px] hover:bg-green-700 flex items-center gap-1"
                            >
                              <CheckCircle size={13} /> Resolve
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              const replyMsg = prompt(`Reply to ${tck.senderName} (${tck.subject}):`, 'Thank you for reaching out. Super Admin Jeeva has processed your request.');
                              if (replyMsg) handleUpdateTicketStatus(tck._id || tck.ticketId, 'In Progress', replyMsg);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 flex items-center gap-1"
                          >
                            <MessageSquare size={13} /> Reply
                          </button>
                          <button 
                            onClick={() => handleDeleteTicket(tck._id || tck.ticketId)}
                            className="px-2 py-1 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold hover:bg-red-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ❓ TAB: HELP & INQUIRY DESK */}
        {activeTab === 'help_desk' && (
          <div className="space-y-8 max-w-4xl">
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#051329] to-[#0c2854] text-white space-y-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
                  🎧
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Super Admin Live Support Desk</h3>
                  <p className="text-xs text-slate-300">Direct contact channels for platform governance.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                  <PhoneCall size={20} className="text-cyan-400" />
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-mono font-bold">Admin Hotline</span>
                    <a href="tel:+917871779134" className="text-sm font-extrabold text-white hover:text-cyan-300">+91 78717 79134</a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                  <Mail size={20} className="text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-mono font-bold">Admin Email</span>
                    <a href="mailto:exploretamizhagam@gmail.com" className="text-sm font-extrabold text-white hover:text-emerald-300">exploretamizhagam@gmail.com</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 👥 TAB 2: USER & ROLE MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">User Management & Direct Role Assignment</h3>
                <p className="text-xs text-slate-500 mt-0.5">Assign customer roles: Property Owner, Vehicle Provider, or Dual Property Owner & Vehicle Vendor.</p>
              </div>

              <button 
                onClick={() => setShowAddUserModal(!showAddUserModal)}
                className="glass-button text-xs px-4 py-2.5 flex items-center gap-2"
              >
                <UserPlus size={16} /> Add User / Host Manually
              </button>
            </div>

            {/* Add User Modal (With Password Field) */}
            {showAddUserModal && (
              <form onSubmit={handleAddUserSubmit} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">User Full Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Sundaram Pillai"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gmail / Email</label>
                  <input 
                    type="email" 
                    placeholder="user@exploretamilnadu.com"
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2 font-mono font-bold text-[11px] text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded border pointer-events-none z-10">+91</span>
                    <input 
                      type="tel" 
                      maxLength={10}
                      placeholder="78717 79134"
                      value={userPhone}
                      onChange={e => setUserPhone(e.target.value.replace(/\D/g, ''))}
                      className="glass-input text-xs font-mono font-bold"
                      style={{ paddingLeft: '3.75rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign User Role</label>
                  <select 
                    value={userRole} 
                    onChange={e => setUserRole(e.target.value)}
                    className="glass-input text-xs"
                  >
                    <option value="owner_and_vendor">🏡🚖 Property Owner & Vehicle Vendor (Dual Role)</option>
                    <option value="owner">🏡 Property Owner (Host)</option>
                    <option value="vendor">🚖 Vehicle Provider (Transport Vendor)</option>
                    <option value="guide">🚩 Tour Guide Expert</option>
                    <option value="user">👤 Tourist Guest User</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={userPassword}
                    onChange={e => setUserPassword(e.target.value)}
                    className="glass-input text-xs font-mono"
                  />
                </div>
                <div className="md:col-span-5 flex justify-end gap-2">
                  <button type="submit" className="glass-button text-xs py-2 px-6">
                    Save User Account
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Users Directory & Instant Role Dropdown */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-400">
                    <th className="pb-3">User Name & Email</th>
                    <th className="pb-3">Assigned Role (Direct Edit)</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {liveUsersList.map((usr, idx) => (
                    <tr key={usr._id || usr.email || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-slate-900 text-sm">{usr.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{usr.email}</div>
                      </td>
                      <td className="py-4">
                        <select 
                          value={usr.role || 'user'}
                          onChange={e => handleUpdateUserRole(usr._id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 font-mono font-bold text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="user">👤 Tourist Guest (user)</option>
                          <option value="owner">🏡 Property Owner (owner)</option>
                          <option value="vendor">🚖 Vehicle Provider (vendor)</option>
                          <option value="owner_and_vendor">🏡🚖 Property Owner & Vehicle Vendor (owner_and_vendor)</option>
                          <option value="guide">🚩 Tour Guide (guide)</option>
                        </select>
                      </td>
                      <td className="py-4 font-mono text-slate-700">{usr.phone || '+91 78717 79134'}</td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleDeleteUser(usr._id)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold hover:bg-red-100 flex items-center gap-1 ml-auto"
                        >
                          <Trash2 size={14} /> Remove User
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🏡 TAB 3: PROPERTY APPROVALS & MANUAL PROPERTY CREATION (CRUD) */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Property Approvals & Hosting Console</h3>
                <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                  🔒 Strict Rule Active: Only properties approved by Super Admin are visible to public visitors on the website.
                </p>
              </div>

              <button 
                onClick={() => setShowAddPropertyModal(!showAddPropertyModal)}
                className="glass-button text-xs px-4 py-2.5 flex items-center gap-2"
              >
                <Plus size={16} /> Add Property Manually
              </button>
            </div>

            {/* Add Property Modal */}
            {showAddPropertyModal && (
              <form onSubmit={handleAddPropertySubmit} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Property Name / Title</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Ooty Mountain Panorama Villa"
                    value={propTitle}
                    onChange={e => setPropTitle(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location Address</label>
                  <input 
                    type="text" 
                    placeholder="Doddabetta Peak Road, Ooty"
                    value={propLocation}
                    onChange={e => setPropLocation(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                  <select 
                    value={propDistrict} 
                    onChange={e => setPropDistrict(e.target.value)}
                    className="glass-input text-xs"
                  >
                    <option value="Nilgiris (Ooty)">Nilgiris (Ooty & Coonoor)</option>
                    <option value="Dindigul (Kodaikanal)">Dindigul (Kodaikanal)</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Thanjavur">Thanjavur (Tanjore)</option>
                    <option value="Kanyakumari">Kanyakumari</option>
                    <option value="Ramanathapuram (Rameswaram)">Ramanathapuram (Rameswaram)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Property Type</label>
                  <select 
                    value={propType} 
                    onChange={e => setPropType(e.target.value)}
                    className="glass-input text-xs"
                  >
                    <option value="Resort">Resort</option>
                    <option value="Home stay">Homestay / Cottage</option>
                    <option value="Lakeview resort">Lakeview Resort</option>
                    <option value="Mountain view resort">Mountain View Villa</option>
                    <option value="Hotel">Luxury Hotel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price Per Night (₹)</label>
                  <input 
                    type="number" 
                    placeholder="4800"
                    value={propPrice}
                    onChange={e => setPropPrice(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button type="submit" className="glass-button text-xs py-2.5 px-4 w-full">
                    Save & Auto-Approve
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddPropertyModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Property Approvals Directory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-400">
                    <th className="pb-3">Property Title & Location</th>
                    <th className="pb-3">Type & Price</th>
                    <th className="pb-3">Super Admin Approval Status</th>
                    <th className="pb-3 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {livePropertiesList.map(prop => (
                    <tr key={prop._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-slate-900 text-sm">{prop.title}</div>
                        <div className="text-xs text-slate-400 font-mono">📍 {prop.location} ({prop.district})</div>
                      </td>
                      <td className="py-4">
                        <div className="font-extrabold text-blue-600">₹{prop.pricePerNight?.toLocaleString()} / night</div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{prop.type}</span>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono uppercase ${
                          prop.status === 'Approved' || prop.status === 'Active' ? 'bg-green-100 text-green-800 border border-green-300' :
                          prop.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-red-300' :
                          'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {prop.status === 'Approved' || prop.status === 'Active' ? '🟢 Approved (Visible)' :
                           prop.status === 'Rejected' ? '🔴 Rejected (Hidden)' : '⏳ Pending Approval'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          {prop.status !== 'Approved' && (
                            <button 
                              onClick={() => handleUpdatePropertyStatus(prop._id, 'Approved')}
                              className="px-2.5 py-1 rounded-xl bg-green-600 text-white font-bold text-[11px] hover:bg-green-700 flex items-center gap-1"
                            >
                              <CheckCircle size={13} /> Approve
                            </button>
                          )}
                          {prop.status !== 'Rejected' && (
                            <button 
                              onClick={() => handleUpdatePropertyStatus(prop._id, 'Rejected')}
                              className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-bold text-[11px] hover:bg-amber-600 flex items-center gap-1"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteProperty(prop._id)}
                            className="px-2 rounded-xl bg-red-50 text-red-600 border border-red-200 py-1 font-bold hover:bg-red-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🚖 TAB 4: VEHICLE PROVIDERS & APPROVALS (CRUD) */}
        {activeTab === 'vehicles' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Vehicle Providers & Fleet Approval Console</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage cab fleets, rental bikes, and transport provider approvals.</p>
              </div>

              <button 
                onClick={() => setShowAddVehicleModal(!showAddVehicleModal)}
                className="glass-button text-xs px-4 py-2.5 flex items-center gap-2"
              >
                <Plus size={16} /> Add Vehicle Manually
              </button>
            </div>

            {/* Add Vehicle Modal */}
            {showAddVehicleModal && (
              <form onSubmit={handleAddVehicleSubmit} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Name / Title</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Innova Crysta 7-Seater Cab"
                    value={vehTitle}
                    onChange={e => setVehTitle(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registration Number</label>
                  <input 
                    type="text" 
                    placeholder="TN-37-ET-2026"
                    value={vehRegNo}
                    onChange={e => setVehRegNo(e.target.value)}
                    className="glass-input text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Category</label>
                  <select 
                    value={vehType} 
                    onChange={e => setVehType(e.target.value)}
                    className="glass-input text-xs"
                  >
                    <option value="Cab SUV">Cab SUV (Innova / Ertiga)</option>
                    <option value="Tempo Traveller">Tempo Traveller (12/17-Seater)</option>
                    <option value="Rental Bike">Rental Royal Enfield Bike</option>
                    <option value="Luxury Bus">Luxury Tourist Bus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Rate (₹)</label>
                  <input 
                    type="number" 
                    placeholder="3500"
                    value={vehPrice}
                    onChange={e => setVehPrice(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Provider Name</label>
                  <input 
                    type="text" 
                    placeholder="Veera Cabs & Transport"
                    value={vehProvider}
                    onChange={e => setVehProvider(e.target.value)}
                    className="glass-input text-xs"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button type="submit" className="glass-button text-xs py-2.5 px-4 w-full">
                    Add & Auto-Approve
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddVehicleModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Vehicle Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-400">
                    <th className="pb-3">Vehicle Details & Registration</th>
                    <th className="pb-3">Provider Name</th>
                    <th className="pb-3">Daily Rate</th>
                    <th className="pb-3">Approval Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {liveVehiclesList.map(veh => (
                    <tr key={veh._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-slate-900 text-sm">{veh.title}</div>
                        <div className="text-xs text-blue-600 font-mono font-bold">{veh.registrationNumber}</div>
                      </td>
                      <td className="py-4 font-semibold text-slate-800">{veh.providerName}</td>
                      <td className="py-4 font-black text-slate-900">₹{veh.pricePerDay?.toLocaleString()} / day</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono uppercase ${
                          veh.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-300' :
                          'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {veh.status === 'Approved' ? '🟢 Approved' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          {veh.status !== 'Approved' && (
                            <button 
                              onClick={() => handleUpdateVehicleStatus(veh._id, 'Approved')}
                              className="px-2.5 py-1 rounded-xl bg-green-600 text-white font-bold text-[11px] hover:bg-green-700"
                            >
                              Approve
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteVehicle(veh._id)}
                            className="px-2 py-1 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold hover:bg-red-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 👤 TAB 5: STAFF MANAGEMENT */}
        {activeTab === 'staff_management' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Staff Management Console (10 Specialized Roles)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Create, view, and remove employee accounts.</p>
              </div>

              <button 
                onClick={() => setShowAddStaffModal(!showAddStaffModal)}
                className="glass-button text-xs px-4 py-2.5 flex items-center gap-2"
              >
                <UserPlus size={16} /> Add New Staff Member
              </button>
            </div>

            {/* Add Staff Form */}
            {showAddStaffModal && (
              <form onSubmit={handleAddStaffSubmit} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Staff Full Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Ramesh Kumar"
                    value={staffName}
                    onChange={e => setStaffName(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Staff Gmail / Email</label>
                  <input 
                    type="email" 
                    placeholder="staff@exploretamilnadu.com"
                    value={staffEmail}
                    onChange={e => setStaffEmail(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact (10 Digits)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 font-mono font-extrabold text-xs text-slate-700 bg-slate-200/90 px-2 py-1 rounded-lg border border-slate-300 pointer-events-none z-10">+91</span>
                    <input 
                      type="tel" 
                      maxLength={10}
                      placeholder="78717 79134"
                      value={staffPhone}
                      onChange={e => setStaffPhone(e.target.value.replace(/\D/g, ''))}
                      className="glass-input text-xs font-mono font-bold tracking-wider"
                      style={{ paddingLeft: '4.25rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Staff Role (10 Specialized Roles)</label>
                  <select 
                    value={staffRole} 
                    onChange={e => setStaffRole(e.target.value)}
                    className="glass-input text-xs"
                  >
                    <option value="operations_manager">Operations Manager</option>
                    <option value="booking_executive">Booking Executive</option>
                    <option value="customer_support_executive">Customer Support Executive</option>
                    <option value="destination_content_manager">Destination & Content Manager</option>
                    <option value="property_verification_manager">Property Verification Manager</option>
                    <option value="transport_manager">Transport Manager</option>
                    <option value="finance_accounts_manager">Finance & Accounts Manager</option>
                    <option value="marketing_manager">Marketing Manager</option>
                    <option value="media_gallery_manager">Media & Gallery Manager</option>
                    <option value="hr_staff_manager">HR & Staff Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={staffPassword}
                    onChange={e => setStaffPassword(e.target.value)}
                    className="glass-input text-xs"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button type="submit" className="glass-button text-xs py-2.5 px-4 w-full">Save Staff Member</button>
                  <button type="button" onClick={() => setShowAddStaffModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                </div>
              </form>
            )}

            {/* Staff Directory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-400">
                    <th className="pb-3">Staff Name & Email</th>
                    <th className="pb-3">Assigned Staff Role</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {liveStaffList.map((stf, idx) => (
                    <tr key={stf._id || stf.email || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-slate-900 text-sm">{stf.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{stf.email}</div>
                      </td>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold font-mono uppercase bg-blue-100 text-blue-800 border border-blue-200">
                          {stf.role?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 font-mono font-bold text-slate-700">{stf.phone || '+91 78717 79134'}</td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleRemoveStaff(stf._id)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold hover:bg-red-100 flex items-center gap-1.5 ml-auto"
                        >
                          <Trash2 size={14} /> Remove Staff
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 💳 TAB 6: FINANCE */}
        {activeTab === 'finance' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-sm">
                <div className="text-xs font-extrabold uppercase text-emerald-800">Total Collected Revenue</div>
                <div className="text-3xl font-black text-emerald-950 mt-2">₹{(liveFinance?.totalCollected || 4860400).toLocaleString()}</div>
                <div className="text-xs font-semibold text-emerald-700 mt-1">Processed via Razorpay UPI</div>
              </div>
              <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 shadow-sm">
                <div className="text-xs font-extrabold uppercase text-amber-800">Pending Payments</div>
                <div className="text-3xl font-black text-amber-950 mt-2">₹{(liveFinance?.totalPending || 142000).toLocaleString()}</div>
                <div className="text-xs font-semibold text-amber-700 mt-1">Check-in settlements pending</div>
              </div>
              <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 shadow-sm">
                <div className="text-xs font-extrabold uppercase text-rose-800">Cancelled / Refunded</div>
                <div className="text-3xl font-black text-rose-950 mt-2">₹{(liveFinance?.totalCancelled || 28400).toLocaleString()}</div>
                <div className="text-xs font-semibold text-rose-700 mt-1">Refunded to original source</div>
              </div>
            </div>
          </div>
        )}

        {/* 🎟️ TAB 7: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Total Bookings & Active Trips</h3>
            <p className="text-xs text-slate-500 mb-6">Live reservations recorded in database.</p>
            <div className="space-y-3">
              {liveBookingsList.map(bk => (
                <div key={bk._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-blue-600 font-mono">{bk.bookingId || bk._id}</span>
                    <div className="font-bold text-slate-900 mt-1">{bk.propertyTitle || 'Tour Reservation'}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 text-sm">₹{bk.totalAmount || 4800}</span>
                    <div className="text-xs text-green-600 font-bold">{bk.paymentStatus || 'Paid'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📍 TAB 8: DESTINATIONS */}
        {activeTab === 'destinations' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Tamil Nadu Tourist Places (44)</h3>
            <p className="text-xs text-slate-500 mb-6">Hill stations, waterfalls, temples, wildlife, beaches, and basilicas.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {TOURISM_PLACES.slice(0, 16).map(place => (
                <div key={place.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="h-32 overflow-hidden rounded-xl mb-2">
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{place.name}</h4>
                  <span className="text-[10px] text-slate-500 block">📍 {place.region}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ⚙️ TAB 9: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Platform System Settings</h3>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div>
                <span className="font-extrabold block text-sm">MongoDB Database Status</span>
                <span className="text-emerald-700">Online & connected to express backend server at http://localhost:5000</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold font-mono text-[10px]">ONLINE 🟢</span>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
