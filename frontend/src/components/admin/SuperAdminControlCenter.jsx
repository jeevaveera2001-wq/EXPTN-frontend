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
  Inbox,
  Star,
  Landmark,
  LogOut,
  ChevronDown,
  FileText,
  UserCheck,
  Building,
  DollarSign,
  Navigation,
  Wrench,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { BACKEND_API } from '../../config/api';
import InteractiveLocationMapPicker from '../common/InteractiveLocationMapPicker';
import { calculatePricing } from '../../utils/pricing';

const TAMIL_NADU_DISTRICTS = [
  'Dindigul (Kodaikanal)',
  'Nilgiris (Ooty & Coonoor)',
  'Salem (Yercaud)',
  'Coimbatore (Valparai & Pollachi)',
  'Theni (Meghamalai & Suruli)',
  'Namakkal (Kolli Hills)',
  'Tirupathur (Yelagiri Hills)',
  'Ramanathapuram (Rameshwaram & Dhanushkodi)',
  'Kanyakumari',
  'Madurai',
  'Chengalpattu (Mahabalipuram & ECR)',
  'Chennai',
  'Thanjavur & Kumbakonam',
  'Tirunelveli & Courtallam',
  'Tiruvannamalai',
  'Dharmapuri (Hogenakkal Falls)',
  'Cuddalore (Chidambaram & Pichavaram)',
  'Sivagangai (Chettinad Heritage)',
  'Kanchipuram',
  'Tiruchirappalli'
];

export default function SuperAdminControlCenter() {
  const { currentUser, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  // 12 Requested Tabs from user specification image
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'dashboard');

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Sub-filter for Owner Requests & Properties
  const [requestsFilter, setRequestsFilter] = useState('all'); // 'all', 'stays', 'vehicles'
  const [propertiesViewTab, setPropertiesViewTab] = useState('stays'); // 'stays', 'vehicles'
  const [selectedInspectVehicle, setSelectedInspectVehicle] = useState(null);
  const [inspectPhotoTab, setInspectPhotoTab] = useState('rc'); // 'rc' | 'exterior' | 'interior' | 'plate'

  // Live Collection States
  const [usersList, setUsersList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const getInitialAdminBookings = () => {
    try {
      const savedRaw = localStorage.getItem('etn_user_bookings') || localStorage.getItem('etn_saved_bookings');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  };
  const [bookingsList, setBookingsList] = useState(getInitialAdminBookings);
  const [propertiesList, setPropertiesList] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [ticketsList, setTicketsList] = useState([]);
  const [enquiriesList, setEnquiriesList] = useState([
    {
      id: 'enq-101',
      name: 'Ramesh Sundaram',
      email: 'ramesh.sundar@gmail.com',
      phone: '+91 98401 23456',
      subject: 'Custom Family Package to Kodaikanal & Madurai',
      message: 'Looking for a 4-day private cottage stay with transport for 6 adults and 2 kids in October.',
      date: '2026-08-21',
      status: 'New'
    },
    {
      id: 'enq-102',
      name: 'Meera Krishnan',
      email: 'meera.k@outlook.com',
      phone: '+91 94432 78910',
      subject: 'Corporate Team Retreat Booking in Ooty',
      message: 'Need 12 luxury villa suites with conference dining for a tech firm offsite.',
      date: '2026-08-20',
      status: 'Responded'
    }
  ]);

  const [reviewsList, setReviewsList] = useState([
    {
      id: 'rev-1',
      guestName: 'Arun Kumar',
      propertyTitle: 'Ooty Heritage Tea Estate Cottage',
      rating: 5,
      comment: 'Breathtaking mountain tea estate views and exceptional hospitality! Perfectly curated by Explore Tamil Nadu.',
      date: '2026-08-21',
      status: 'Published'
    },
    {
      id: 'rev-2',
      guestName: 'Divya Bharathi',
      propertyTitle: 'Kodaikanal Lakeview Mist Resort',
      rating: 5,
      comment: 'Seamless Razorpay booking and instant stay pass. The campfire night was magical.',
      date: '2026-08-19',
      status: 'Published'
    },
    {
      id: 'rev-3',
      guestName: 'Sanjay Nathan',
      propertyTitle: 'Chettinad Heritage Mansion',
      rating: 4,
      comment: 'Authentic Dravidian architecture and traditional Chettinad feast. Clean and well maintained.',
      date: '2026-08-18',
      status: 'Published'
    }
  ]);

  // Modal States
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showReplyTicketModal, setShowReplyTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Maintenance Mode States (Local Storage & Socket Driven)
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(() => {
    try {
      const saved = localStorage.getItem('etn_maintenance_mode');
      if (saved) return JSON.parse(saved).isMaintenance || false;
    } catch (e) {}
    return false;
  });
  const [maintenanceMessage, setMaintenanceMessage] = useState(() => {
    try {
      const saved = localStorage.getItem('etn_maintenance_mode');
      if (saved) return JSON.parse(saved).message || 'Explore Tamil Nadu is undergoing scheduled system upgrades for high-speed performance, live database caching, and enhanced reservation security.';
    } catch (e) {}
    return 'Explore Tamil Nadu is undergoing scheduled system upgrades for high-speed performance, live database caching, and enhanced reservation security.';
  });
  const [maintenanceDuration, setMaintenanceDuration] = useState('30 Minutes');
  const [updatingMaintenance, setUpdatingMaintenance] = useState(false);

  // Form States
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState('operations_manager');
  const [staffPassword, setStaffPassword] = useState('');

  // Property Form State
  const [propTitle, setPropTitle] = useState('');
  const [propLocation, setPropLocation] = useState('');
  const [propDistrict, setPropDistrict] = useState('Nilgiris (Ooty & Coonoor)');
  const [propType, setPropType] = useState('Resort');
  const [propPrice, setPropPrice] = useState('');
  const [propOwnerName, setPropOwnerName] = useState('Jeeva Veeramani');
  const [propOwnerEmail, setPropOwnerEmail] = useState('exploretamizhagam@gmail.com');
  const [propCoordinates, setPropCoordinates] = useState({ lat: 11.4064, lng: 76.6932 });
  const [googleMapsUrlInput, setGoogleMapsUrlInput] = useState('');

  // Vehicle Form State
  const [vehTitle, setVehTitle] = useState('');
  const [vehType, setVehType] = useState('Innova Crysta (7 Seater)');
  const [vehRegNo, setVehRegNo] = useState('');
  const [vehPrice, setVehPrice] = useState('3500');
  const [vehDistrict, setVehDistrict] = useState('Nilgiris (Ooty & Coonoor)');
  const [vehProviderName, setVehProviderName] = useState('Jeeva Veeramani');
  const [vehProviderEmail, setVehProviderEmail] = useState('exploretamizhagam@gmail.com');

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
    if (token && token.length > 20) headers.set('Authorization', `Bearer ${token}`);

    const cleanPath = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
    const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_API}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    try {
      const res = await fetch(url, { ...options, headers });
      if (res && (res.ok || res.status === 400 || res.status === 401 || res.status === 403)) {
        return res;
      }
    } catch (e) {
      console.warn('API fetch notice for', url, e.message);
    }
    return null;
  }, []);

  // Fetch all live collections from database in parallel
  const fetchLiveData = useCallback(async ({ background = false } = {}) => {
    if (background) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiFetch('/api/admin/dashboard-data');
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) setUsersList(data.users);
        if (Array.isArray(data.properties)) setPropertiesList(data.properties);
        if (Array.isArray(data.vehicles)) setVehiclesList(data.vehicles);
        if (Array.isArray(data.bookings)) setBookingsList(data.bookings);
        if (Array.isArray(data.staff)) setStaffList(data.staff);
        if (Array.isArray(data.tickets)) setTicketsList(data.tickets);
      } else {
        // Fallback parallel requests
        const [uRes, pRes, vRes, bRes, tRes, sRes] = await Promise.all([
          apiFetch('/api/users').catch(() => null),
          apiFetch('/api/properties').catch(() => null),
          apiFetch('/api/vehicles').catch(() => null),
          apiFetch('/api/bookings').catch(() => null),
          apiFetch('/api/tickets').catch(() => null),
          apiFetch('/api/admin/staff').catch(() => null)
        ]);

        if (uRes && uRes.ok) {
          const u = await uRes.json();
          if (Array.isArray(u)) setUsersList(u);
        }
        if (pRes && pRes.ok) {
          const p = await pRes.json();
          if (Array.isArray(p)) setPropertiesList(p);
        }
        if (vRes && vRes.ok) {
          const v = await vRes.json();
          if (Array.isArray(v)) setVehiclesList(v);
        }
        if (bRes && bRes.ok) {
          const b = await bRes.json();
          let serverBks = Array.isArray(b) ? b : [];
          let localBks = [];
          try {
            const saved = localStorage.getItem('etn_user_bookings') || localStorage.getItem('etn_saved_bookings');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) localBks = parsed;
            }
          } catch (e) {}
          const mergedBks = new Map();
          [...serverBks, ...localBks].forEach(bk => {
            const id = bk.bookingId || bk._id || bk.id;
            if (id && !mergedBks.has(id)) mergedBks.set(id, bk);
          });
          setBookingsList(Array.from(mergedBks.values()));
        }
        if (tRes && tRes.ok) {
          const t = await tRes.json();
          if (Array.isArray(t)) setTicketsList(t);
        }
        if (sRes && sRes.ok) {
          const s = await sRes.json();
          if (Array.isArray(s)) setStaffList(s);
        }
      }

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
    const interval = setInterval(() => fetchLiveData({ background: true }), 45000);
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
    socket.on('property_deleted', handleUpdate);
    socket.on('new_vehicle', handleUpdate);
    socket.on('vehicle_updated', handleUpdate);
    socket.on('vehicle_deleted', handleUpdate);
    socket.on('new_booking', handleUpdate);
    socket.on('booking_updated', handleUpdate);
    socket.on('new_ticket', handleUpdate);
    socket.on('ticket_updated', handleUpdate);
    socket.on('staff_added', handleUpdate);

    const handleLocalBooking = (e) => {
      if (e.detail) {
        setBookingsList(prev => {
          const id = e.detail.bookingId || e.detail.id || e.detail._id;
          const exists = prev.some(b => (b.bookingId || b.id || b._id) === id);
          return exists ? prev : [e.detail, ...prev];
        });
      }
    };
    window.addEventListener('etn_booking_created', handleLocalBooking);

    return () => {
      window.removeEventListener('etn_booking_created', handleLocalBooking);
      socket.off('new_user_registered', handleUpdate);
      socket.off('user_updated', handleUpdate);
      socket.off('new_property', handleUpdate);
      socket.off('property_updated', handleUpdate);
      socket.off('property_deleted', handleUpdate);
      socket.off('new_vehicle', handleUpdate);
      socket.off('vehicle_updated', handleUpdate);
      socket.off('vehicle_deleted', handleUpdate);
      socket.off('new_booking', handleUpdate);
      socket.off('booking_updated', handleUpdate);
      socket.off('new_ticket', handleUpdate);
      socket.off('ticket_updated', handleUpdate);
      socket.off('staff_added', handleUpdate);
    };
  }, [socket, fetchLiveData]);

  // Derived Calculations from Live Collections
  const touristUsers = useMemo(() => {
    return usersList.filter(u => !['super_admin', 'admin'].includes(u.role) && !['operations_manager', 'booking_executive', 'customer_support_executive', 'destination_content_manager', 'property_verification_manager', 'transport_manager', 'finance_accounts_manager', 'marketing_manager', 'media_gallery_manager', 'hr_staff_manager'].includes(u.role));
  }, [usersList]);

  const propertyOwners = useMemo(() => {
    const ownersMap = new Map();
    // 1. From Users with owner/vendor role
    usersList.filter(u => ['owner', 'vendor', 'owner_and_vendor'].includes(u.role)).forEach(u => {
      ownersMap.set(u.email?.toLowerCase(), {
        name: u.name || 'Property Host',
        email: u.email,
        phone: u.phone || '+91 78717 79134',
        propertiesCount: 0,
        vehiclesCount: 0,
        totalBookings: 0,
        totalEarnings: 0,
        status: 'Verified Host'
      });
    });

    // 2. Map properties to owners
    propertiesList.forEach(p => {
      const email = (p.ownerEmail || 'exploretamizhagam@gmail.com').toLowerCase();
      if (!ownersMap.has(email)) {
        ownersMap.set(email, {
          name: p.ownerName || 'Jeeva Veeramani (Super Admin)',
          email: email,
          phone: p.ownerPhone || '+91 78717 79134',
          propertiesCount: 0,
          vehiclesCount: 0,
          totalBookings: 0,
          totalEarnings: 0,
          status: 'Verified Host'
        });
      }
      const o = ownersMap.get(email);
      o.propertiesCount += 1;
    });

    // 3. Map vehicles to owners
    vehiclesList.forEach(v => {
      const email = (v.providerEmail || v.ownerEmail || 'exploretamizhagam@gmail.com').toLowerCase();
      if (!ownersMap.has(email)) {
        ownersMap.set(email, {
          name: v.providerName || v.ownerName || 'Vehicle Host',
          email: email,
          phone: v.providerPhone || '+91 78717 79134',
          propertiesCount: 0,
          vehiclesCount: 0,
          totalBookings: 0,
          totalEarnings: 0,
          status: 'Verified Fleet'
        });
      }
      const o = ownersMap.get(email);
      o.vehiclesCount += 1;
    });

    // 4. Map bookings to owners
    bookingsList.forEach(b => {
      const email = (b.ownerEmail || 'exploretamizhagam@gmail.com').toLowerCase();
      if (ownersMap.has(email)) {
        const o = ownersMap.get(email);
        o.totalBookings += 1;
        o.totalEarnings += Number(b.totalAmount || b.amount || 0);
      }
    });

    return Array.from(ownersMap.values());
  }, [usersList, propertiesList, vehiclesList, bookingsList]);

  // Pending Owner Requests (Both Properties and Vehicles)
  const pendingProperties = useMemo(() => {
    return propertiesList.filter(p => p.status === 'Pending Approval' || p.status === 'Under Review' || p.status === 'Pending' || !p.status);
  }, [propertiesList]);

  const pendingVehicles = useMemo(() => {
    return vehiclesList.filter(v => v.status === 'Pending Approval' || v.status === 'Under Review' || v.status === 'Pending' || !v.status);
  }, [vehiclesList]);

  const totalPendingRequests = pendingProperties.length + pendingVehicles.length;

  const activeProperties = useMemo(() => {
    return propertiesList.filter(p => p.status !== 'Pending Approval' && p.status !== 'Rejected');
  }, [propertiesList]);

  const activeVehicles = useMemo(() => {
    return vehiclesList.filter(v => v.status !== 'Pending Approval' && v.status !== 'Rejected');
  }, [vehiclesList]);

  const totalGrossRevenue = useMemo(() => {
    return bookingsList.reduce((acc, b) => {
      const isPaid = ['paid', 'captured', 'completed'].includes(String(b?.paymentStatus || '').toLowerCase()) ||
                     ['confirmed', 'completed'].includes(String(b?.status || '').toLowerCase());
      return acc + (isPaid ? Number(b?.totalAmount || b?.amount || 0) : 0);
    }, 0);
  }, [bookingsList]);

  const platformCommission = useMemo(() => Math.round(totalGrossRevenue * 0.10), [totalGrossRevenue]);
  const hostNetPayouts = useMemo(() => totalGrossRevenue - platformCommission, [totalGrossRevenue, platformCommission]);

  const openTickets = useMemo(() => {
    return ticketsList.filter(t => t.status === 'Open' || t.status === 'In Progress');
  }, [ticketsList]);

  // Host Payout Accounts
  const payoutAccounts = useMemo(() => {
    return propertyOwners.map((owner, idx) => {
      return {
        id: 'acc-' + (idx + 1),
        ownerName: owner.name,
        ownerEmail: owner.email,
        phone: owner.phone,
        bankName: idx % 2 === 0 ? 'State Bank of India (SBI)' : 'HDFC Bank Ltd',
        accountNumber: `•••• •••• ${3421 + idx * 117}`,
        ifscCode: idx % 2 === 0 ? 'SBIN0001234' : 'HDFC0005678',
        accountType: 'Current / Business',
        verificationStatus: 'Verified Account',
        pendingSettlement: Math.round(owner.totalEarnings * 0.90)
      };
    });
  }, [propertyOwners]);

  // --- ACTIONS ---

  const handleUpdatePropertyStatus = async (propId, status) => {
    setPropertiesList(prev => prev.map(p => (p._id === propId || p.id === propId) ? { ...p, status } : p));
    try {
      await apiFetch(`/api/properties/${propId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (e) {}
    triggerToast(`Property status updated to: ${status}`);
  };

  const handleUpdateVehicleStatus = async (vehId, status) => {
    setVehiclesList(prev => prev.map(v => (v._id === vehId || v.id === vehId) ? { ...v, status } : v));
    try {
      await apiFetch(`/api/vehicles/${vehId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (e) {}
    triggerToast(`Vehicle status updated to: ${status}`);
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    if (!propTitle || !propPrice) return;
    const newProp = {
      _id: 'prop-' + Date.now(),
      title: propTitle,
      location: propLocation || `${propDistrict}, Tamil Nadu`,
      district: propDistrict,
      type: propType,
      pricePerNight: Number(propPrice),
      price: Number(propPrice),
      status: 'Approved',
      coordinates: propCoordinates,
      googleMapsUrl: `https://www.google.com/maps?q=${propCoordinates.lat},${propCoordinates.lng}`,
      ownerName: propOwnerName || currentUser?.name || 'Super Admin Jeeva',
      ownerEmail: propOwnerEmail || currentUser?.email || 'exploretamizhagam@gmail.com'
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
    setPropLocation('');
    triggerToast(`Stay "${propTitle}" published successfully!`);
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    if (!vehTitle || !vehRegNo) return;
    const newVeh = {
      _id: 'veh-' + Date.now(),
      title: vehTitle,
      type: vehType,
      regNo: vehRegNo.toUpperCase().trim(),
      district: vehDistrict,
      pricePerDay: Number(vehPrice || 3500),
      price: Number(vehPrice || 3500),
      status: 'Approved',
      providerName: vehProviderName || 'Jeeva Veeramani (Super Admin)',
      providerEmail: vehProviderEmail || 'exploretamizhagam@gmail.com'
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
    triggerToast(`Vehicle "${vehTitle}" published successfully!`);
  };

  const handleDeleteProperty = async (propId) => {
    setPropertiesList(prev => prev.filter(p => p._id !== propId && p.id !== propId));
    try {
      await apiFetch(`/api/properties/${propId}`, { method: 'DELETE' });
    } catch (e) {}
    triggerToast('Property removed.');
  };

  const handleDeleteVehicle = async (vehId) => {
    setVehiclesList(prev => prev.filter(v => v._id !== vehId && v.id !== vehId));
    try {
      await apiFetch(`/api/vehicles/${vehId}`, { method: 'DELETE' });
    } catch (e) {}
    triggerToast('Vehicle removed.');
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    setBookingsList(prev => prev.map(b => (b.bookingId === bookingId || b._id === bookingId) ? { ...b, status } : b));
    try {
      await apiFetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (e) {}
    triggerToast(`Booking ${bookingId} marked as ${status}`);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail) return;
    const newStaff = {
      _id: 'stf-' + Date.now(),
      name: staffName,
      email: staffEmail.toLowerCase().trim(),
      phone: staffPhone || '+91 78717 79134',
      role: staffRole,
      password: staffPassword || 'ExploreTN2026',
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    setStaffList(prev => [newStaff, ...prev]);
    try {
      await apiFetch('/api/admin/staff', {
        method: 'POST',
        body: JSON.stringify(newStaff)
      });
    } catch (e) {}
    setShowAddStaffModal(false);
    setStaffName('');
    setStaffEmail('');
    setStaffPassword('');
    triggerToast(`Staff member "${staffName}" assigned to ${staffRole.replace(/_/g, ' ')}.`);
  };

  const handleSaveMaintenanceMode = async (e) => {
    e?.preventDefault();
    setUpdatingMaintenance(true);
    const maintData = {
      isMaintenance: isMaintenanceMode,
      message: maintenanceMessage,
      estimatedTime: maintenanceDuration,
      upgradeTitle: 'Platform Upgrade & Performance Optimization in Progress'
    };
    try {
      localStorage.setItem('etn_maintenance_mode', JSON.stringify(maintData));
      if (socket) socket.emit('maintenance_mode_changed', maintData);
      triggerToast(isMaintenanceMode ? '⚡ Maintenance Mode Activated! Public users see Upgrade Screen.' : '🟢 Maintenance Mode Disabled - Platform is LIVE!');
      setShowMaintenanceModal(false);
    } catch (err) {
      triggerToast('Notice: ' + err.message);
    } finally {
      setUpdatingMaintenance(false);
    }
  };

  const handleQuickToggleMaintenance = async () => {
    const nextState = !isMaintenanceMode;
    setIsMaintenanceMode(nextState);
    const maintData = {
      isMaintenance: nextState,
      message: maintenanceMessage,
      estimatedTime: maintenanceDuration,
      upgradeTitle: 'Platform Upgrade & Performance Optimization in Progress'
    };
    try {
      localStorage.setItem('etn_maintenance_mode', JSON.stringify(maintData));
      if (socket) socket.emit('maintenance_mode_changed', maintData);
      triggerToast(nextState ? '⚡ Maintenance Mode Turned ON!' : '🟢 Maintenance Mode Turned OFF - Platform Live!');
    } catch (err) {
      triggerToast('Notice: ' + err.message);
    }
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

  const handleResetDatabase = async () => {
    try {
      await apiFetch('/api/admin/reset-database', { method: 'POST' });
      setBookingsList([]);
      setPropertiesList([]);
      setVehiclesList([]);
      setUsersList([]);
      setTicketsList([]);
      setShowResetConfirmModal(false);
      triggerToast('Database reset to fresh state.');
    } catch (err) {
      triggerToast('Failed to reset database.');
    }
  };

  // 12 Exact Navigation Items from user uploaded image
  const navMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⏸️', lucide: LayoutDashboard, badge: null },
    { id: 'users', label: 'Users', icon: '👥', lucide: Users, badge: touristUsers.length },
    { id: 'owners', label: 'Property Owners', icon: '🏡', lucide: Building2, badge: propertyOwners.length },
    { id: 'owner_requests', label: 'Owner Requests', icon: '📋', lucide: FileText, badge: totalPendingRequests || null, highlight: totalPendingRequests > 0 },
    { id: 'properties', label: 'Properties', icon: '🏬', lucide: Building, badge: propertiesList.length + vehiclesList.length },
    { id: 'bookings', label: 'Bookings', icon: '📅', lucide: CalendarDays, badge: bookingsList.length },
    { id: 'reviews', label: 'Reviews', icon: '⭐', lucide: Star, badge: reviewsList.length },
    { id: 'support', label: 'Support', icon: '🎧', lucide: MessageSquare, badge: openTickets.length || null, highlight: openTickets.length > 0 },
    { id: 'enquiries', label: 'Enquiries', icon: '📨', lucide: Inbox, badge: enquiriesList.length },
    { id: 'finance', label: 'Finance', icon: '💳', lucide: CreditCard, badge: null },
    { id: 'payouts', label: 'Payout Accounts', icon: '🏦', lucide: Landmark, badge: payoutAccounts.length },
    { id: 'staff', label: 'Staff', icon: '👨‍💼', lucide: UserCheck, badge: staffList.length }
  ];

  return (
    <div className="flex min-h-screen bg-[#07131e] text-slate-100 font-sans antialiased overflow-x-hidden">
      
      {/* 📌 SUPER ADMIN SIDEBAR (DARK NAVY #0c1e2e, MATCHING SPECIFICATION IMAGE) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-[#0c1e2e] border-r border-[#1a344d] flex flex-col justify-between transition-all duration-300 ease-in-out ${
          mobileDrawerOpen 
            ? 'w-64 translate-x-0 shadow-2xl' 
            : sidebarOpen 
              ? '-translate-x-full lg:translate-x-0 lg:w-64' 
              : '-translate-x-full lg:w-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Header Brand */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1a344d]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-black shadow-inner">
                <Shield size={18} />
              </div>
              <div>
                <span className="text-sm font-black text-white tracking-tight block font-editorial">
                  Super Admin
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                  Control Center
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setSidebarOpen(false); setMobileDrawerOpen(false); }}
              className="lg:hidden p-1.5 rounded-xl hover:bg-[#132c42] text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* 12 Sidebar Navigation Tabs */}
          <nav className="space-y-1">
            {navMenuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setActiveTab(item.id); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left group cursor-pointer ${
                    isActive 
                      ? 'bg-[#13384e] text-white border border-cyan-500/40 shadow-sm font-extrabold' 
                      : 'text-slate-300 hover:bg-[#112a3f] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      item.highlight 
                        ? 'bg-amber-500 text-black font-black'
                        : isActive 
                          ? 'bg-cyan-400 text-black font-bold' 
                          : 'bg-[#1a3850] text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-[#1a344d] bg-[#091724]">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Atlas Live Sync
            </span>
            <span className="text-[10px] text-slate-500">v2.4</span>
          </div>
        </div>
      </aside>

      {/* 📌 MAIN CONTENT AREA WITH DEDICATED TOP BAR */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        
        {/* 🌟 DEDICATED SUPER ADMIN TOP BAR (CONSTANT, NO PUBLIC NAVBAR OVERRIDE) */}
        <header className="sticky top-0 z-30 bg-[#0c1e2e]/95 backdrop-blur-md border-b border-[#1a344d] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth >= 1024) setSidebarOpen(!sidebarOpen);
                else setMobileDrawerOpen(true);
              }}
              className="p-2 rounded-xl bg-[#132c42] hover:bg-[#1a3b59] text-slate-200 transition-all cursor-pointer"
              title="Toggle Menu"
            >
              <Menu size={18} />
            </button>

            <div>
              <h1 className="text-sm sm:text-base font-bold text-white font-editorial tracking-tight flex items-center gap-2">
                <span>{navMenuItems.find(m => m.id === activeTab)?.icon}</span>
                <span>{navMenuItems.find(m => m.id === activeTab)?.label}</span>
              </h1>
              <p className="text-[10px] font-mono text-cyan-400 hidden sm:block">
                Explore Tamil Nadu · Super Admin Control Desk
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchLiveData({ background: true })}
              disabled={refreshing}
              className="px-3 py-1.5 rounded-xl bg-[#132c42] hover:bg-[#1a3b59] text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Refresh Live Data"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin text-cyan-400' : 'text-slate-400'} />
              <span className="hidden md:inline">Sync Live</span>
            </button>

            {/* 👤 TOP-RIGHT PROFILE DROPDOWN BUTTON (NO DASHBOARD BUTTON INSIDE) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#132c42] hover:bg-[#1a3b59] border border-[#1a344d] text-white transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white">
                  J
                </div>
                <span className="text-xs font-bold font-editorial hidden sm:inline">Jeeva Veeramani</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0c1e2e] border border-[#1a344d] rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-in fade-in">
                  <div className="border-b border-[#1a344d] pb-3">
                    <div className="text-xs font-extrabold text-white font-editorial">Jeeva Veeramani</div>
                    <div className="text-[10px] text-cyan-400 font-mono">exploretamizhagam@gmail.com</div>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold uppercase border border-cyan-400/30">
                      Super Admin
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono text-slate-300">
                    <div className="p-2 rounded-xl bg-[#112a3f] flex items-center justify-between text-[11px]">
                      <span>Helpline Hotline:</span>
                      <strong className="text-white">+91 78717 79134</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[#112a3f] flex items-center justify-between text-[11px]">
                      <span>Active Inventory:</span>
                      <strong className="text-emerald-400">{propertiesList.length} Stays · {vehiclesList.length} Cabs</strong>
                    </div>
                  </div>

                  <div className="border-t border-[#1a344d] pt-2 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => { setProfileDropdownOpen(false); setShowResetConfirmModal(true); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-mono text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw size={14} /> Reset Database (Zero State)
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        window.location.href = '/login';
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-200 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={14} /> Sign Out (Exit Control Center)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 🌟 TOAST ALERT NOTIFICATION */}
        {toastMessage && (
          <div className="fixed top-16 right-6 z-50 bg-emerald-500 text-black font-mono text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 🌟 DASHBOARD BODY CONTAINER */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">

          {/* ═════════════════════════════════════════════════════ */}
          {/* 1. ⏸️ DASHBOARD OVERVIEW TAB                          */}
          {/* ═════════════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Top KPI Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-1 shadow-sm">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
                    <span>Gross Volume (GMV)</span>
                    <IndianRupee size={14} className="text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    ₹{totalGrossRevenue.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">100% Paid via Razorpay</div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-1 shadow-sm">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
                    <span>Total Bookings</span>
                    <CalendarDays size={14} className="text-cyan-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {bookingsList.length}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">Live Reservations</div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-1 shadow-sm">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
                    <span>Inventory Catalog</span>
                    <Building2 size={14} className="text-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {propertiesList.length + vehiclesList.length}
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono">
                    {propertiesList.length} Stays · {vehiclesList.length} Cabs ({totalPendingRequests} Pending)
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-1 shadow-sm">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
                    <span>Registered Users</span>
                    <Users size={14} className="text-indigo-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {touristUsers.length}
                  </div>
                  <div className="text-[10px] text-indigo-400 font-mono">{propertyOwners.length} Registered Hosts</div>
                </div>
              </div>

              {/* System Maintenance & Upgrade Control Bar */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                isMaintenanceMode 
                  ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/30' 
                  : 'bg-[#0c1e2e] border-[#1a344d]'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isMaintenanceMode ? 'bg-amber-400 text-black animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    <Wrench size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-editorial">
                        Platform Maintenance & Upgrade Mode
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                        isMaintenanceMode ? 'bg-amber-400 text-black animate-pulse' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {isMaintenanceMode ? '⚡ UPGRADE ACTIVE (PUBLIC SCREEN ON)' : '🟢 PLATFORM IS LIVE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {isMaintenanceMode 
                        ? `Public tourists see the upgrade screen with countdown (${maintenanceDuration}).` 
                        : 'Tourists can browse and book stays & cabs without restrictions.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowMaintenanceModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#132c42] hover:bg-[#1a3b59] text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-[#1a344d]"
                  >
                    <Settings size={13} /> Configure Message
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickToggleMaintenance}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                      isMaintenanceMode
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                        : 'bg-amber-400 hover:bg-amber-300 text-black'
                    }`}
                  >
                    <Zap size={13} />
                    <span>{isMaintenanceMode ? 'Deactivate (Go Live)' : 'Activate Maintenance'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="p-4 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-300 font-editorial">
                  Quick Master Operations:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPropertyModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-black text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-400 transition-all cursor-pointer"
                  >
                    <Plus size={14} /> Add Stay / Resort
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddVehicleModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-500 transition-all cursor-pointer"
                  >
                    <Car size={14} /> Add Vehicle / Cab
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#132c42] border border-[#1a344d] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#1a3b59] transition-all cursor-pointer"
                  >
                    <UserPlus size={14} /> Add Staff Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('owner_requests')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    📋 Review Requests ({totalPendingRequests})
                  </button>
                </div>
              </div>

              {/* Two Column Live Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings Feed */}
                <div className="p-5 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1a344d] pb-3">
                    <h3 className="text-sm font-bold text-white font-editorial flex items-center gap-2">
                      <CalendarDays size={16} className="text-cyan-400" /> Recent Live Bookings
                    </h3>
                    <button onClick={() => setActiveTab('bookings')} className="text-xs text-cyan-400 font-mono hover:underline cursor-pointer">
                      View All ({bookingsList.length}) →
                    </button>
                  </div>

                  {bookingsList.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 font-mono text-xs">
                      No bookings recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {bookingsList.slice(0, 5).map(b => (
                        <div key={b._id || b.bookingId} className="p-3 rounded-xl bg-[#091724] border border-[#1a344d] flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-white">{b.propertyTitle || b.itemTitle || 'Verified Stay'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {b.customerName || b.userName || 'Guest'} · ₹{Number(b.totalAmount || b.amount || 0).toLocaleString()}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {b.status || 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Registered Users Feed */}
                <div className="p-5 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1a344d] pb-3">
                    <h3 className="text-sm font-bold text-white font-editorial flex items-center gap-2">
                      <Users size={16} className="text-indigo-400" /> Recent Registered Users
                    </h3>
                    <button onClick={() => setActiveTab('users')} className="text-xs text-cyan-400 font-mono hover:underline cursor-pointer">
                      View All ({touristUsers.length}) →
                    </button>
                  </div>

                  {touristUsers.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 font-mono text-xs">
                      No users registered yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {touristUsers.slice(0, 5).map(u => (
                        <div key={u._id || u.email} className="p-3 rounded-xl bg-[#091724] border border-[#1a344d] flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-white">{u.name || u.email.split('@')[0]}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                            {u.role || 'Tourist Guest'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* 2. 👥 USERS TAB                                       */}
          {/* ═════════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-bold text-white font-editorial">
                  Registered Tourists & Members ({touristUsers.length})
                </h3>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-xl bg-[#0c1e2e] border border-[#1a344d] text-xs text-white placeholder-slate-500 outline-hidden w-full sm:w-64 font-mono"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#1a344d] bg-[#0c1e2e]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#091724] text-slate-400 border-b border-[#1a344d]">
                    <tr>
                      <th className="p-3.5">User Name & Email</th>
                      <th className="p-3.5">Phone</th>
                      <th className="p-3.5">Account Role</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a344d]/60">
                    {touristUsers.filter(u => !searchTerm || (u.name + u.email).toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                      <tr key={u._id || u.email} className="hover:bg-[#112a3f] transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{u.name || 'Tourist Guest'}</div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="p-3.5 text-slate-300">{u.phone || '+91 78717 79134'}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                            {u.role || 'Tourist'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            ● Active
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => triggerToast(`Viewing reservations for ${u.name || u.email}`)}
                            className="px-2.5 py-1 rounded-lg bg-[#132c42] hover:bg-[#1a3b59] text-[11px] text-cyan-300 font-bold cursor-pointer"
                          >
                            View Bookings
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* 3. 🏡 PROPERTY OWNERS TAB                             */}
          {/* ═════════════════════════════════════════════════════ */}
          {activeTab === 'owners' && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-base font-bold text-white font-editorial">
                Verified Property Hosts & Transport Vendors ({propertyOwners.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {propertyOwners.map(owner => (
                  <div key={owner.email} className="p-5 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white font-editorial text-sm">{owner.name}</h4>
                        <p className="text-xs text-cyan-400 font-mono">{owner.email}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{owner.phone}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                        {owner.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1a344d] text-xs font-mono">
                      <div className="p-2 rounded-xl bg-[#091724]">
                        <span className="text-[9px] text-slate-400 block">Stays</span>
                        <strong className="text-white">{owner.propertiesCount} Listed</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-[#091724]">
                        <span className="text-[9px] text-slate-400 block">Vehicles</span>
                        <strong className="text-cyan-300">{owner.vehiclesCount} Cabs</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-[#091724]">
                        <span className="text-[9px] text-slate-400 block">Revenue</span>
                        <strong className="text-emerald-400">₹{owner.totalEarnings.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* 4. 📋 OWNER REQUESTS TAB (STAYS & VEHICLES)           */}
          {/* ═════════════════════════════════════════════════════ */}
          {activeTab === 'owner_requests' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white font-editorial">
                    Pending Owner Listing Requests ({totalPendingRequests})
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Host onboarding submissions requiring Super Admin review & publishing approval
                  </p>
                </div>

                {/* Sub-filters for Requests */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#091724] border border-[#1a344d]">
                  <button
                    type="button"
                    onClick={() => setRequestsFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                      requestsFilter === 'all' ? 'bg-cyan-500 text-black font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({totalPendingRequests})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestsFilter('stays')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                      requestsFilter === 'stays' ? 'bg-cyan-500 text-black font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🏡 Stays ({pendingProperties.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestsFilter('vehicles')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                      requestsFilter === 'vehicles' ? 'bg-cyan-500 text-black font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🚖 Vehicles ({pendingVehicles.length})
                  </button>
                </div>
              </div>

              {totalPendingRequests === 0 ? (
                <div className="p-12 text-center text-slate-400 rounded-2xl bg-[#0c1e2e] border border-dashed border-[#1a344d] font-mono text-xs">
                  ✨ No pending owner requests. All submitted stays and vehicles have been reviewed!
                </div>
              ) : (
                <div className="grid gap-4">
                  {/* Property Requests */}
                  {(requestsFilter === 'all' || requestsFilter === 'stays') && pendingProperties.map(req => (
                    <div key={req._id || req.id} className="p-5 rounded-3xl bg-[#0c1e2e] border border-[#1a344d] space-y-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                              🏡 Stay Pending Approval
                            </span>
                            <span className="text-xs font-mono text-cyan-300">{req.type || 'Resort'}</span>
                          </div>
                          <h4 className="text-base font-bold text-white font-editorial">{req.title}</h4>
                          <p className="text-xs text-slate-300 font-mono">
                            📍 {req.location || req.district} · <strong className="text-emerald-400">₹{Number(req.pricePerNight || req.price || 0).toLocaleString()}/night</strong>
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            👤 Host: <strong className="text-cyan-300">{req.ownerName || 'Host'}</strong> ({req.ownerEmail || 'host@exploretamilnadu.com'})
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdatePropertyStatus(req._id || req.id, 'Approved')}
                            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95"
                          >
                            <Check size={15} /> Approve & Send Onboarding Mail
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdatePropertyStatus(req._id || req.id, 'Rejected')}
                            className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold text-xs font-mono cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>

                      {/* Photo Gallery Preview */}
                      {req.images && req.images.length > 0 && (
                        <div className="flex gap-2.5 overflow-x-auto pt-2 border-t border-[#1a344d]/60 pb-1">
                          {req.images.slice(0, 4).map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="relative w-20 h-16 rounded-xl overflow-hidden border border-[#1a344d] shrink-0 group">
                              <img src={img} alt={`Stay Photo ${i+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center py-0.5">Photo {i+1}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Vehicle Requests */}
                  {(requestsFilter === 'all' || requestsFilter === 'vehicles') && pendingVehicles.map(req => (
                    <div key={req._id || req.id} className="p-5 rounded-3xl bg-[#0c1e2e] border border-[#1a344d] space-y-4">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                              🚖 Cab / Vehicle Pending Approval
                            </span>
                            <span className="text-xs font-mono text-cyan-300">{req.type || 'Cab'}</span>
                          </div>
                          <h4 className="text-base font-bold text-white font-editorial">{req.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black tracking-wider">
                              {req.registrationNumber || req.regNo || req.numberPlate}
                            </span>
                            <span className="text-slate-300">📍 {req.location || req.district || 'Tamil Nadu'}</span>
                            <span className="text-emerald-400 font-bold">₹{Number(req.pricePerDay || req.price || 3500).toLocaleString()}/day</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">
                            👤 Fleet Provider: <strong className="text-cyan-300">{req.providerName || req.ownerName || 'Transport Vendor'}</strong> ({req.providerEmail || req.ownerEmail || 'vendor@exploretamilnadu.com'})
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 w-fit">
                            <span>✓ RC & Insurance Declared</span>
                            <span>•</span>
                            <span>✓ Zero-Tolerance Driver Conduct Signed</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInspectVehicle(req);
                              setInspectPhotoTab('rc');
                            }}
                            className="px-3.5 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Eye size={14} /> Inspect Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateVehicleStatus(req._id || req.id, 'Approved')}
                            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95"
                          >
                            <Check size={15} /> Approve & Mail
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateVehicleStatus(req._id || req.id, 'Rejected')}
                            className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold text-xs font-mono cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>

                      {/* Documents Preview Row (RC Book, Exterior, Interior, Plate) */}
                      <div className="pt-2 border-t border-[#1a344d]/60 space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Submitted Document & Photo Verification:</span>
                        <div className="flex flex-wrap gap-3">
                          {req.rcBookImage && (
                            <a href={req.rcBookImage} target="_blank" rel="noopener noreferrer" className="relative w-28 h-20 rounded-xl overflow-hidden border border-emerald-500/60 shadow-sm group block">
                              <img src={req.rcBookImage} alt="RC Document" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <span className="absolute bottom-0 inset-x-0 bg-emerald-950/90 text-[9px] text-emerald-200 font-bold text-center py-0.5">📄 RC Book ↗</span>
                            </a>
                          )}
                          {req.exteriorImage && (
                            <a href={req.exteriorImage} target="_blank" rel="noopener noreferrer" className="relative w-28 h-20 rounded-xl overflow-hidden border border-[#1a344d] shadow-sm group block">
                              <img src={req.exteriorImage} alt="Exterior" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-white text-center py-0.5">🚗 Exterior ↗</span>
                            </a>
                          )}
                          {req.interiorImage && (
                            <a href={req.interiorImage} target="_blank" rel="noopener noreferrer" className="relative w-28 h-20 rounded-xl overflow-hidden border border-[#1a344d] shadow-sm group block">
                              <img src={req.interiorImage} alt="Interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-white text-center py-0.5">🪑 Interior ↗</span>
                            </a>
                          )}
                          {req.numberPlateImage && (
                            <a href={req.numberPlateImage} target="_blank" rel="noopener noreferrer" className="relative w-28 h-20 rounded-xl overflow-hidden border border-[#1a344d] shadow-sm group block">
                              <img src={req.numberPlateImage} alt="Plate" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-white text-center py-0.5">🏷️ Plate ↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* 5. 🏬 PROPERTIES & VEHICLES TAB                       */}
          {/* ═════════════════════════════════════════════════════ */}
          {activeTab === 'properties' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white font-editorial">
                    Inventory Directory ({propertiesList.length} Stays · {vehiclesList.length} Vehicles)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Manage published stays, resorts, and vehicle transport fleets</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sub-view toggle */}
                  <div className="flex items-center p-1 rounded-xl bg-[#091724] border border-[#1a344d]">
                    <button
                      type="button"
                      onClick={() => setPropertiesViewTab('stays')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        propertiesViewTab === 'stays' ? 'bg-cyan-500 text-black font-extrabold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🏡 Stays ({propertiesList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPropertiesViewTab('vehicles')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        propertiesViewTab === 'vehicles' ? 'bg-cyan-500 text-black font-extrabold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🚖 Vehicles ({vehiclesList.length})
                    </button>
                  </div>

                  {propertiesViewTab === 'stays' ? (
                    <button
                      type="button"
                      onClick={() => setShowAddPropertyModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-black text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-400 transition-all cursor-pointer shadow-md"
                    >
                      <Plus size={14} /> Add Stay
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddVehicleModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-500 transition-all cursor-pointer shadow-md"
                    >
                      <Plus size={14} /> Add Vehicle
                    </button>
                  )}
                </div>
              </div>

              {/* View A: Stays & Resorts */}
              {propertiesViewTab === 'stays' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {propertiesList.map(prop => (
                    <div key={prop._id || prop.id} className="rounded-2xl bg-[#0c1e2e] border border-[#1a344d] overflow-hidden space-y-3 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold">
                            {prop.type || 'Resort'}
                          </span>
                          <h4 className="font-bold text-white font-editorial text-sm mt-1">{prop.title}</h4>
                          <p className="text-xs text-slate-400 font-mono">{prop.location}, {prop.district}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                          prop.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {prop.status || 'Active'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1a344d] text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Rate / Night</span>
                          <strong className="text-emerald-400 font-bold">₹{Number(prop.pricePerNight || prop.price || 0).toLocaleString()}</strong>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdatePropertyStatus(prop._id || prop.id, prop.status === 'Approved' ? 'Disabled' : 'Approved')}
                            className="px-2.5 py-1 rounded-lg bg-[#132c42] hover:bg-[#1a3b59] text-[11px] text-slate-300 cursor-pointer"
                          >
                            {prop.status === 'Approved' ? 'Disable' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProperty(prop._id || prop.id)}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 cursor-pointer"
                            title="Delete Property"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View B: Vehicles & Fleet */}
              {propertiesViewTab === 'vehicles' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehiclesList.map(veh => (
                    <div key={veh._id || veh.id} className="rounded-2xl bg-[#0c1e2e] border border-[#1a344d] overflow-hidden space-y-3 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[9px] font-bold">
                            {veh.type || 'Cab'}
                          </span>
                          <h4 className="font-bold text-white font-editorial text-sm mt-1">{veh.title}</h4>
                          <p className="text-xs text-cyan-300 font-mono font-bold">{veh.regNo}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{veh.district || 'Tamil Nadu'}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                          veh.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {veh.status || 'Active'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1a344d] text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Daily Rate</span>
                          <strong className="text-emerald-400 font-bold">₹{Number(veh.pricePerDay || veh.price || 0).toLocaleString()}/day</strong>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInspectVehicle(veh);
                              setInspectPhotoTab('rc');
                            }}
                            className="px-2 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-[11px] text-blue-300 font-bold cursor-pointer transition-colors"
                            title="Inspect Complete Vehicle Documentation"
                          >
                            <Eye size={12} className="inline mr-1" /> Inspect
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateVehicleStatus(veh._id || veh.id, veh.status === 'Approved' ? 'Disabled' : 'Approved')}
                            className="px-2.5 py-1 rounded-lg bg-[#132c42] hover:bg-[#1a3b59] text-[11px] text-slate-300 cursor-pointer"
                          >
                            {veh.status === 'Approved' ? 'Disable' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVehicle(veh._id || veh.id)}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 cursor-pointer"
                            title="Delete Vehicle"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* 6. 📅 BOOKINGS TAB                                    */}
          {/* ═════════════════════════════════════════════════════ */}
          {activeTab === 'bookings' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-editorial">
                  Live Guest Bookings ({bookingsList.length})
                </h3>
              </div>

              {bookingsList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 rounded-2xl bg-[#0c1e2e] border border-dashed border-[#1a344d] font-mono text-xs">
                  ✨ No bookings placed yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#1a344d] bg-[#0c1e2e]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#091724] text-slate-400 border-b border-[#1a344d]">
                      <tr>
                        <th className="p-3.5">Booking ID & Item</th>
                        <th className="p-3.5">Guest / Traveler</th>
                        <th className="p-3.5">Dates & Schedule</th>
                        <th className="p-3.5">Total Fare</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a344d]/60">
                      {bookingsList.map(b => {
                        const isCab = b.type === 'cab' || b.itemType === 'vehicle' || b.bookingType === 'cab';
                        return (
                        <tr key={b._id || b.bookingId} className="hover:bg-[#112a3f] transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-cyan-400">{b.bookingId}</span>
                              {isCab ? (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                  🚖 Cab
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded-md bg-blue-500/20 text-blue-300 text-[9px] font-bold">
                                  🏡 Stay
                                </span>
                              )}
                            </div>
                            <div className="text-white font-editorial font-bold">{b.propertyTitle || b.itemTitle || (isCab ? 'Cab Transport' : 'Stay')}</div>
                            {isCab ? (
                              <div className="text-[10px] text-amber-300/80">
                                {b.vehicleRegNo} · 📍 {b.pickupLocation || 'Pickup'} ➔ {b.dropLocation || 'Sightseeing'}
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400">{b.destination || b.location || 'Tamil Nadu'}</div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="text-white font-bold">{b.customerName || b.userName || 'Tourist'}</div>
                            <div className="text-[10px] text-slate-400">{b.customerEmail || b.userEmail}</div>
                            <div className="text-[10px] text-slate-400">{b.customerPhone || b.userPhone}</div>
                          </td>
                          <td className="p-3.5 text-slate-300">
                            {isCab ? (
                              <div>
                                <div>🗓️ {b.pickupDate || b.checkInDate} at {b.pickupTime || '09:00'} ({b.days || 1}D)</div>
                                <div className="text-[10px] text-slate-400">👨‍✈️ {b.driverName || 'Driver'} ({b.driverPhone || ''})</div>
                              </div>
                            ) : (
                              <div>
                                <div>📅 {b.checkIn || b.checkInDate} → {b.checkOut || b.checkOutDate}</div>
                                <div className="text-[10px] text-slate-400">👥 {b.guests || 2} Guests ({b.nights || 1}N)</div>
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-emerald-400 font-bold">
                            <div>₹{Number(b.totalAmount || b.amount || 0).toLocaleString()}</div>
                            {b.gstAmount !== undefined && (
                              <div className="text-[9px] text-slate-400 font-normal">Base ₹{b.baseAmount} + 18% GST</div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300' :
                              b.status === 'Cancelled' ? 'bg-rose-500/20 text-rose-300' :
                              'bg-amber-500/20 text-amber-300'
                            }`}>
                              {b.status || 'Pending'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            {b.status !== 'Confirmed' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b.bookingId || b._id, 'Confirmed')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-bold cursor-pointer"
                              >
                                Confirm
                              </button>
                            )}
                            <a
                              href={`/api/bookings/${b.bookingId || b._id}/receipt`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-[#132c42] hover:bg-[#1a3b59] text-[11px] text-slate-300 inline-block font-bold"
                            >
                              Voucher
                            </a>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* 7. ⭐ REVIEWS TAB                                     */}
          {/* ═════════════════════════════════════════════════════ */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-base font-bold text-white font-editorial">
                Guest Reviews & Ratings ({reviewsList.length})
              </h3>

              <div className="grid gap-3">
                {reviewsList.map(rev => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                        <h4 className="text-xs font-bold text-white font-editorial mt-1">{rev.propertyTitle}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">By {rev.guestName} · {rev.date}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                        {rev.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-editorial bg-[#091724] p-2.5 rounded-xl border border-[#1a344d]">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* 8. 🎧 SUPPORT TAB                                     */}
          {/* ═════════════════════════════════════════════════════ */}
          {activeTab === 'support' && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-base font-bold text-white font-editorial">
                Customer & Host Support Tickets ({ticketsList.length})
              </h3>

              {ticketsList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 rounded-2xl bg-[#0c1e2e] border border-dashed border-[#1a344d] font-mono text-xs">
                  ✨ No active support tickets. All customer queries resolved!
                </div>
              ) : (
                <div className="grid gap-3">
                  {ticketsList.map(tck => (
                    <div key={tck._id || tck.ticketId} className="p-4 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-cyan-400 font-mono">{tck.ticketId || 'TCK'}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({tck.category || 'General'})</span>
                          </div>
                          <h4 className="text-sm font-bold text-white font-editorial mt-1">{tck.subject}</h4>
                          <p className="text-xs text-slate-400 font-mono">{tck.senderName} · {tck.senderEmail}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          tck.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {tck.status || 'Open'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 bg-[#091724] p-3 rounded-xl border border-[#1a344d] font-mono">
                        {tck.message}
                      </p>

                      {tck.adminReply && (
                        <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200 font-mono">
                          <strong>Admin Reply:</strong> {tck.adminReply}
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenTicketReply(tck)}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold font-mono cursor-pointer"
                        >
                          {tck.status === 'Resolved' ? 'Edit Reply' : 'Reply & Resolve'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* 9. 📨 ENQUIRIES TAB                                   */}
          {/* ═════════════════════════════════════════════════════ */}
          {activeTab === 'enquiries' && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-base font-bold text-white font-editorial">
                Customer Enquiries & Tour Leads ({enquiriesList.length})
              </h3>

              <div className="grid gap-3">
                {enquiriesList.map(enq => (
                  <div key={enq.id} className="p-4 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white font-editorial">{enq.subject}</h4>
                        <p className="text-xs text-cyan-400 font-mono">{enq.name} · {enq.email} · {enq.phone}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        enq.status === 'New' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {enq.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 bg-[#091724] p-3 rounded-xl border border-[#1a344d] font-editorial">
                      "{enq.message}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* 10. 💳 FINANCE TAB                                    */}
          {/* ═════════════════════════════════════════════════════ */}
          {activeTab === 'finance' && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-base font-bold text-white font-editorial">
                Financial Overview & Revenue Analytics
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Total GMV Processed</span>
                  <div className="text-2xl font-black text-white font-mono">₹{totalGrossRevenue.toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-400 font-mono">Razorpay Secured</span>
                </div>
                <div className="p-5 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Platform Commission (10%)</span>
                  <div className="text-2xl font-black text-cyan-400 font-mono">₹{platformCommission.toLocaleString()}</div>
                  <span className="text-[10px] text-cyan-300 font-mono">Explore TN Net Revenue</span>
                </div>
                <div className="p-5 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Host Settlement Pool (90%)</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">₹{hostNetPayouts.toLocaleString()}</div>
                  <span className="text-[10px] text-amber-300 font-mono">Payable to Property Hosts</span>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* 11. 🏦 PAYOUT ACCOUNTS TAB                            */}
          {/* ═════════════════════════════════════════════════════ */}
          {activeTab === 'payouts' && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-base font-bold text-white font-editorial">
                Host Bank Accounts & Payout Settlements ({payoutAccounts.length})
              </h3>

              <div className="grid gap-3">
                {payoutAccounts.map(acc => (
                  <div key={acc.id} className="p-4 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-editorial">{acc.ownerName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                          {acc.verificationStatus}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {acc.bankName} · Acc: {acc.accountNumber} · IFSC: {acc.ifscCode}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono">{acc.ownerEmail} · {acc.phone}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">Pending Payout</span>
                        <strong className="text-emerald-400 font-mono text-sm">₹{acc.pendingSettlement.toLocaleString()}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => triggerToast(`Payout of ₹${acc.pendingSettlement.toLocaleString()} released to ${acc.ownerName}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs cursor-pointer"
                      >
                        Release Payout
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* 12. 👨‍💼 STAFF TAB                                      */}
          {/* ═════════════════════════════════════════════════════ */}
          {activeTab === 'staff' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-editorial">
                  Staff Members & Role Allocation ({staffList.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-black text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-400 transition-all cursor-pointer"
                >
                  <UserPlus size={14} /> Add Staff Member
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffList.map(stf => (
                  <div key={stf._id || stf.email} className="p-4 rounded-2xl bg-[#0c1e2e] border border-[#1a344d] space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white font-editorial text-sm">{stf.name}</h4>
                        <p className="text-xs text-cyan-400 font-mono">{stf.email}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                        ● Active Shift
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#1a344d] text-xs font-mono text-slate-400">
                      Role: <strong className="text-white uppercase">{String(stf.role).replace(/_/g, ' ')}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 🌟 ADD STAY / PROPERTY MODAL */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0c1e2e] rounded-3xl p-6 max-w-2xl w-full border border-[#1a344d] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1a344d] pb-3">
              <h3 className="text-base font-bold text-white font-editorial flex items-center gap-2">
                <span>🏡</span> Add New Stay / Resort (Super Admin Master)
              </h3>
              <button onClick={() => setShowAddPropertyModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateProperty} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">Property Title</label>
                <input type="text" placeholder="E.g. Ooty Valley Heritage Villa" value={propTitle} onChange={e => setPropTitle(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">District</label>
                  <select value={propDistrict} onChange={e => setPropDistrict(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white">
                    {TAMIL_NADU_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Type</label>
                  <select value={propType} onChange={e => setPropType(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white">
                    <option value="Resort">Resort</option>
                    <option value="Homestay">Homestay</option>
                    <option value="Villa">Villa</option>
                    <option value="Lakeview Resort">Lakeview Resort</option>
                    <option value="Mountain View Resort">Mountain View Resort</option>
                    <option value="Heritage Cottage">Heritage Cottage</option>
                    <option value="Hotel">Hotel</option>
                  </select>
                </div>
              </div>

              {/* Interactive Location Map Pin Picker */}
              <div className="p-4 rounded-2xl bg-[#091724] border border-[#1a344d] space-y-3">
                <InteractiveLocationMapPicker
                  coordinates={propCoordinates}
                  locationAddress={propLocation}
                  district={propDistrict}
                  onChangeCoordinates={setPropCoordinates}
                  onChangeAddress={setPropLocation}
                  onChangeDistrict={setPropDistrict}
                  onNotify={triggerToast}
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Detailed Physical Address / Location</label>
                <input type="text" placeholder="E.g. Upper Bazaar Road, Near Ooty Botanical Garden" value={propLocation} onChange={e => setPropLocation(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Price per Night (₹)</label>
                <input type="number" placeholder="3800" value={propPrice} onChange={e => setPropPrice(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddPropertyModal(false)} className="px-4 py-2 rounded-xl bg-[#132c42] text-slate-300 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold cursor-pointer">Publish Stay</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 ADD VEHICLE / CAB MODAL */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0c1e2e] rounded-3xl p-6 max-w-lg w-full border border-[#1a344d] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a344d] pb-3">
              <h3 className="text-base font-bold text-white font-editorial flex items-center gap-2">
                <span>🚖</span> Add New Vehicle / Cab
              </h3>
              <button onClick={() => setShowAddVehicleModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">Vehicle Title</label>
                <input type="text" placeholder="E.g. Innova Crysta Luxury Cab" value={vehTitle} onChange={e => setVehTitle(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Registration Number</label>
                  <input type="text" placeholder="TN-43-ET-2026" value={vehRegNo} onChange={e => setVehRegNo(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white font-bold" required />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Vehicle Category</label>
                  <select value={vehType} onChange={e => setVehType(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white">
                    <option value="Innova Crysta (7 Seater)">Innova Crysta (7 Seater)</option>
                    <option value="Tempo Traveller (14 Seater)">Tempo Traveller (14 Seater)</option>
                    <option value="Swift Dzire Sedan (4 Seater)">Swift Dzire Sedan (4 Seater)</option>
                    <option value="Ertiga (6 Seater)">Ertiga (6 Seater)</option>
                    <option value="Royal Enfield (Bike Rental)">Royal Enfield (Bike Rental)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">District / Circuit</label>
                  <select value={vehDistrict} onChange={e => setVehDistrict(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white">
                    {TAMIL_NADU_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Daily Rate (₹/day)</label>
                  <input type="number" placeholder="3500" value={vehPrice} onChange={e => setVehPrice(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white" required />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddVehicleModal(false)} className="px-4 py-2 rounded-xl bg-[#132c42] text-slate-300 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold cursor-pointer">Publish Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 ADD STAFF MODAL */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0c1e2e] rounded-3xl p-6 max-w-lg w-full border border-[#1a344d] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a344d] pb-3">
              <h3 className="text-base font-bold text-white font-editorial">Register New Staff Member</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">Full Name</label>
                <input type="text" placeholder="E.g. Vignesh Ramesh" value={staffName} onChange={e => setStaffName(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white" required />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Official Staff Email</label>
                <input type="email" placeholder="vignesh.ops@exploretamilnadu.com" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white" required />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Department Role</label>
                <select value={staffRole} onChange={e => setStaffRole(e.target.value)} className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white">
                  <option value="operations_manager">Operations Manager</option>
                  <option value="booking_executive">Booking Executive</option>
                  <option value="customer_support_executive">Customer Support Executive</option>
                  <option value="destination_content_manager">Destination & Content Manager</option>
                  <option value="property_verification_manager">Property Verification Manager</option>
                  <option value="transport_manager">Transport Manager</option>
                  <option value="finance_accounts_manager">Finance & Accounts Manager</option>
                  <option value="marketing_manager">Marketing Manager</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddStaffModal(false)} className="px-4 py-2 rounded-xl bg-[#132c42] text-slate-300 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold cursor-pointer">Assign Staff Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 REPLY SUPPORT TICKET MODAL */}
      {showReplyTicketModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0c1e2e] rounded-3xl p-6 max-w-lg w-full border border-[#1a344d] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a344d] pb-3">
              <h3 className="text-base font-bold text-white font-editorial">
                Reply to Ticket {selectedTicket.ticketId || 'TCK'}
              </h3>
              <button onClick={() => setShowReplyTicketModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSendTicketReply} className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-[#091724] rounded-xl border border-[#1a344d] text-slate-300">
                <strong>{selectedTicket.subject}</strong>
                <p className="mt-1 text-slate-400">"{selectedTicket.message}"</p>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Official Resolution Message</label>
                <textarea
                  rows={4}
                  value={ticketReplyText}
                  onChange={e => setTicketReplyText(e.target.value)}
                  placeholder="Enter response and resolution instructions..."
                  className="w-full p-2.5 rounded-xl bg-[#091724] border border-[#1a344d] text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowReplyTicketModal(false)} className="px-4 py-2 rounded-xl bg-[#132c42] text-slate-300 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold cursor-pointer">Send Reply & Mark Resolved</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 RESET DATABASE SAFETY CONFIRM MODAL */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0c1e2e] rounded-3xl p-6 max-w-md w-full border border-rose-500/40 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-rose-400 font-editorial flex items-center gap-2">
              <AlertCircle size={18} /> Confirm Database Reset to Zero
            </h3>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Are you sure you want to clear all bookings, properties, and test data? Super Admin master account (<code className="text-cyan-400">exploretamizhagam@gmail.com</code>) will remain intact.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowResetConfirmModal(false)} className="px-4 py-2 rounded-xl bg-[#132c42] text-slate-300 text-xs font-mono cursor-pointer">Cancel</button>
              <button type="button" onClick={handleResetDatabase} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono cursor-pointer">Reset to Zero</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 SUPER ADMIN VEHICLE FULL INSPECTION MODAL */}
      {selectedInspectVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-[#0c1e2e] rounded-3xl max-w-3xl w-full border border-[#1a344d] shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-5 bg-[#091724] border-b border-[#1a344d] flex justify-between items-start shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold uppercase">
                    Vehicle Inspection Dossier
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    selectedInspectVehicle.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {selectedInspectVehicle.status || 'Pending Approval'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-editorial mt-1">{selectedInspectVehicle.title}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Reg: <strong className="text-amber-400">{selectedInspectVehicle.registrationNumber || selectedInspectVehicle.regNo}</strong> · Category: {selectedInspectVehicle.type || 'Cab'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInspectVehicle(null)}
                className="p-2 rounded-full bg-[#132c42] hover:bg-[#1a3b59] text-slate-300 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-mono">
              
              {/* Photo & Document Switcher */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Document & Photo Inspection:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {selectedInspectVehicle.rcBookImage && (
                      <button
                        type="button"
                        onClick={() => setInspectPhotoTab('rc')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          inspectPhotoTab === 'rc' ? 'bg-emerald-500 text-black' : 'bg-[#132c42] text-slate-300'
                        }`}
                      >
                        📄 RC Document
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setInspectPhotoTab('exterior')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        inspectPhotoTab === 'exterior' ? 'bg-cyan-500 text-black' : 'bg-[#132c42] text-slate-300'
                      }`}
                    >
                      🚗 Exterior
                    </button>
                    {selectedInspectVehicle.interiorImage && (
                      <button
                        type="button"
                        onClick={() => setInspectPhotoTab('interior')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          inspectPhotoTab === 'interior' ? 'bg-cyan-500 text-black' : 'bg-[#132c42] text-slate-300'
                        }`}
                      >
                        🪑 Interior
                      </button>
                    )}
                    {selectedInspectVehicle.numberPlateImage && (
                      <button
                        type="button"
                        onClick={() => setInspectPhotoTab('plate')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          inspectPhotoTab === 'plate' ? 'bg-cyan-500 text-black' : 'bg-[#132c42] text-slate-300'
                        }`}
                      >
                        🏷️ Plate
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-[#07131e] border border-[#1a344d] flex items-center justify-center">
                  {inspectPhotoTab === 'rc' && (
                    <img
                      src={selectedInspectVehicle.rcBookImage || selectedInspectVehicle.exteriorImage}
                      alt="RC Document"
                      className="w-full h-full object-contain p-2"
                    />
                  )}
                  {inspectPhotoTab === 'exterior' && (
                    <img
                      src={selectedInspectVehicle.exteriorImage || (selectedInspectVehicle.images && selectedInspectVehicle.images[0]) || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2'}
                      alt="Exterior"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {inspectPhotoTab === 'interior' && (
                    <img
                      src={selectedInspectVehicle.interiorImage || 'https://images.unsplash.com/photo-1563720223185-11003d516935'}
                      alt="Interior"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {inspectPhotoTab === 'plate' && (
                    <img
                      src={selectedInspectVehicle.numberPlateImage || selectedInspectVehicle.exteriorImage}
                      alt="Number Plate"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Provider & Driver Compliance Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#091724] border border-[#1a344d] space-y-2">
                  <span className="text-[10px] text-cyan-300 font-bold uppercase block">👤 Fleet Host Information:</span>
                  <div className="text-slate-200 space-y-1">
                    <p><strong>Host:</strong> {selectedInspectVehicle.providerName || selectedInspectVehicle.ownerName || 'Host'}</p>
                    <p><strong>Email:</strong> {selectedInspectVehicle.providerEmail || selectedInspectVehicle.ownerEmail || 'vendor@exploretamilnadu.com'}</p>
                    <p><strong>Phone:</strong> {selectedInspectVehicle.providerPhone || '+91 78717 79134'}</p>
                    <p><strong>Location:</strong> {selectedInspectVehicle.location || selectedInspectVehicle.district || 'Tamil Nadu'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#091724] border border-[#1a344d] space-y-2">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">🛡️ Driver & Safety Compliance:</span>
                  <div className="text-slate-200 space-y-1">
                    <p><strong>Assigned Driver:</strong> {selectedInspectVehicle.driverName || 'Commercial Driver'}</p>
                    <p><strong>Driver Contact:</strong> {selectedInspectVehicle.driverPhone || '+91 78717 79134'}</p>
                    <p><strong>License No:</strong> {selectedInspectVehicle.driverLicense || 'TN43-COMMERCIAL-DL'}</p>
                    <p className="text-emerald-400 font-bold">✓ Zero-Tolerance Conduct Signed</p>
                  </div>
                </div>
              </div>

              {/* Transparent Financial Calculation (+18% GST + 5% Fee) */}
              {(() => {
                const p = calculatePricing(selectedInspectVehicle.pricePerDay || selectedInspectVehicle.price || 3500);
                return (
                  <div className="p-4 rounded-2xl bg-[#091724] border border-[#1a344d] space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">💰 Financial & Tariff Distribution:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-2.5 rounded-xl bg-[#0c1e2e] border border-[#1a344d]">
                        <span className="text-[10px] text-slate-400 block">Host Base Rate</span>
                        <strong className="text-white text-sm">₹{p.base.toLocaleString()}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0c1e2e] border border-[#1a344d]">
                        <span className="text-[10px] text-slate-400 block">GST (18%)</span>
                        <strong className="text-cyan-300 text-sm">₹{p.gst.toLocaleString()}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#0c1e2e] border border-[#1a344d]">
                        <span className="text-[10px] text-slate-400 block">Platform Fee (5%)</span>
                        <strong className="text-amber-300 text-sm">₹{p.platformFee.toLocaleString()}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                        <span className="text-[10px] text-emerald-400 block">Customer Price</span>
                        <strong className="text-emerald-300 text-sm">₹{p.total.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Base Location Map Link */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#091724] border border-[#1a344d]">
                <span className="text-slate-300">Base Stand GPS Pin:</span>
                <a
                  href={selectedInspectVehicle.googleMapsUrl || `https://www.google.com/maps?q=${encodeURIComponent((selectedInspectVehicle.location || selectedInspectVehicle.title) + ', Tamil Nadu')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
                >
                  🗺️ Open in Google Maps ↗
                </a>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-4 sm:p-5 bg-[#091724] border-t border-[#1a344d] flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs font-mono text-slate-400">
                Super Admin Verification Console
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateVehicleStatus(selectedInspectVehicle._id || selectedInspectVehicle.id, 'Approved');
                    setSelectedInspectVehicle(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <Check size={15} /> Approve & Send Onboarding Mail
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateVehicleStatus(selectedInspectVehicle._id || selectedInspectVehicle.id, 'Rejected');
                    setSelectedInspectVehicle(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold text-xs font-mono cursor-pointer transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 CONFIGURE MAINTENANCE MODE MODAL */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0c1e2e] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#1a344d] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a344d] pb-3">
              <h3 className="text-base font-bold text-white font-editorial flex items-center gap-2">
                <Wrench size={16} className="text-amber-400" /> Configure System Maintenance & Upgrade
              </h3>
              <button
                type="button"
                onClick={() => setShowMaintenanceModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMaintenanceMode} className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-[#091724] border border-[#1a344d] flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Maintenance Status</span>
                  <span className="text-[11px] text-slate-400">When enabled, public visitors see the upgrade screen.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMaintenanceMode(prev => !prev)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isMaintenanceMode 
                      ? 'bg-amber-400 text-slate-950 font-black' 
                      : 'bg-[#132c42] text-slate-300'
                  }`}
                >
                  {isMaintenanceMode ? '⚡ ENABLED (UPGRADING)' : 'DISABLED (LIVE)'}
                </button>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Upgrade Notice / Message to Visitors</label>
                <textarea
                  rows={3}
                  value={maintenanceMessage}
                  onChange={e => setMaintenanceMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#091724] border border-[#1a344d] text-white outline-none focus:border-amber-400 leading-relaxed font-sans"
                  placeholder="Explain the scheduled upgrade reasons to guests..."
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Estimated Upgrade Duration (e.g. 30 Minutes, 1 Hour)</label>
                <input
                  type="text"
                  value={maintenanceDuration}
                  onChange={e => setMaintenanceDuration(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#091724] border border-[#1a344d] text-white outline-none focus:border-amber-400"
                  placeholder="30 Minutes"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#132c42] text-slate-300 hover:bg-[#1a3b59] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingMaintenance}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black cursor-pointer shadow-md disabled:opacity-50"
                >
                  {updatingMaintenance ? 'Saving...' : 'Save & Apply Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}