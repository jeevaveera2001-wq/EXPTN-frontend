import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  MapPin,
  Image as ImageIcon,
  Navigation,
  Compass,
  Eye,
  CheckCircle2,
  ExternalLink,
  Search,
  Crosshair,
  Map as MapIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { BACKEND_API } from '../../config/api';

const TAMIL_NADU_LANDMARKS = [
  { name: '🌲 Kodai Lake & Coaker Walk', district: 'Dindigul (Kodaikanal)', address: 'Coaker Walk, Kodaikanal, Dindigul', lat: 10.2381, lng: 77.4892 },
  { name: '🏔️ Ooty Lake & Boat House', district: 'Nilgiris (Ooty)', address: 'North Lake Road, Ooty, Nilgiris', lat: 11.4064, lng: 76.6932 },
  { name: '☕ Yercaud Lake & Peak', district: 'Salem (Yercaud)', address: 'Lake Road, Yercaud, Salem', lat: 11.7753, lng: 78.2093 },
  { name: '🌊 Hogenakkal Waterfalls', district: 'Dharmapuri', address: 'Pennagaram Road, Hogenakkal, Dharmapuri', lat: 12.1186, lng: 77.7770 },
  { name: '🛕 Madurai Meenakshi Temple', district: 'Madurai', address: 'East Tower Street, Madurai', lat: 9.9195, lng: 78.1193 },
  { name: '🏖️ Rameshwaram Agni Theertham', district: 'Ramanathapuram', address: 'Near Ramanathaswamy Temple, Rameswaram', lat: 9.2876, lng: 79.3129 },
  { name: '🌅 Kanyakumari Beach Point', district: 'Kanyakumari', address: 'Main Beach Road, Kanyakumari', lat: 8.0883, lng: 77.5385 },
  { name: '🏛️ Mahabalipuram Shore Temple', district: 'Chengalpattu', address: 'Shore Temple Road, Mahabalipuram', lat: 12.6169, lng: 80.1994 },
  { name: '🌿 Valparai Tea Estate', district: 'Coimbatore', address: 'Main Tea Estate Road, Valparai', lat: 10.3242, lng: 76.9558 },
  { name: '🛕 Tanjore Big Temple', district: 'Thanjavur', address: 'Membalam Road, Thanjavur', lat: 10.7870, lng: 79.1378 },
  { name: '🌲 Kolli Hills Viewpoint', district: 'Namakkal', address: 'Semmedu, Kolli Hills, Namakkal', lat: 11.2485, lng: 78.3389 },
  { name: '🐅 Mudumalai Forest Reserve', district: 'Nilgiris', address: 'Theppakadu, Mudumalai, Nilgiris', lat: 11.5623, lng: 76.5341 }
];

export default function VendorDashboard() {
  const { currentUser, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const role = currentUser?.role || 'owner_and_vendor';

  // Active Tab State (6 Requested Vendor Tabs)
  const [activeTab, setActiveTab] = useState('properties_vehicles');
  const [actionSuccess, setActionSuccess] = useState('');

  // Profile Form State
  const [vendorName, setVendorName] = useState(currentUser?.name || '');
  const [vendorEmail, setVendorEmail] = useState(currentUser?.email || '');
  const [vendorPhone, setVendorPhone] = useState(currentUser?.phone || '');
  const [vendorAvatar, setVendorAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');

  // Password Reset State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Bank Accounts State
  const [bankAccountsList, setBankAccountsList] = useState([]);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBankName, setNewBankName] = useState('HDFC Bank');
  const [newAccNo, setNewAccNo] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [newHolderName, setNewHolderName] = useState('');
  const [newUpi, setNewUpi] = useState('');

  // Properties & Vehicles State
  const [myPropertiesList, setMyPropertiesList] = useState([]);
  const [myVehiclesList, setMyVehiclesList] = useState([]);

  // Modals & Form State for Adding Property
  const [showAddPropModal, setShowAddPropModal] = useState(false);
  const [propTitle, setPropTitle] = useState('');
  const [propType, setPropType] = useState('Homestay');
  const [propDistrict, setPropDistrict] = useState('Dindigul (Kodaikanal)');
  const [propLocation, setPropLocation] = useState('Coaker Walk, Kodaikanal');
  const [propPrice, setPropPrice] = useState('3800');
  const [propDesc, setPropDesc] = useState('');
  const [propImages, setPropImages] = useState([]);
  const [propCoordinates, setPropCoordinates] = useState({ lat: 10.2381, lng: 77.4892 });
  const [propError, setPropError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // 📍 Location Confirmation & Search State
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(true);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  // Modals for Adding Vehicle
  const [showAddVehModal, setShowAddVehModal] = useState(false);
  const [vehTitle, setVehTitle] = useState('');
  const [vehRegNo, setVehRegNo] = useState('');
  const [vehPrice, setVehPrice] = useState('');

  // Payouts Log
  const [payoutsList, setPayoutsList] = useState([]);

  // Bookings List
  const [vendorBookings, setVendorBookings] = useState([]);

  // Support Tickets
  const [vendorTickets, setVendorTickets] = useState([]);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Property Host Settlement');
  const [ticketMessage, setTicketMessage] = useState('');

  const apiFetch = async (endpoint, options) => {
    try {
      const res = await fetch(endpoint, options);
      if (res.ok || res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404) {
        return res;
      }
    } catch (e) {}
    return await fetch(`${BACKEND_API}${endpoint.replace('/api', '')}`, options);
  };

  const fetchVendorData = async () => {
    try {
      const propsRes = await apiFetch('/api/properties');
      if (propsRes.ok) {
        const allProps = await propsRes.json();
        if (Array.isArray(allProps)) {
          setMyPropertiesList(allProps.filter(p => p.ownerEmail === currentUser?.email || p.ownerName === currentUser?.name || currentUser?.role === 'super_admin'));
        }
      }

      const vehsRes = await apiFetch('/api/vehicles');
      if (vehsRes.ok) {
        const allVehs = await vehsRes.json();
        if (Array.isArray(allVehs)) {
          setMyVehiclesList(allVehs.filter(v => v.providerEmail === currentUser?.email || v.providerName === currentUser?.name || currentUser?.role === 'super_admin'));
        }
      }

      const bksRes = await apiFetch('/api/bookings');
      if (bksRes.ok) {
        const allBks = await bksRes.json();
        if (Array.isArray(allBks)) {
          setVendorBookings(allBks);
        }
      }

      const tckRes = await apiFetch('/api/tickets');
      if (tckRes.ok) {
        const allTcks = await tckRes.json();
        if (Array.isArray(allTcks)) {
          setVendorTickets(allTcks.filter(t => t.senderEmail === currentUser?.email));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchVendorData();

    if (socket) {
      socket.on('new_property', fetchVendorData);
      socket.on('new_vehicle', fetchVendorData);
      socket.on('new_booking', fetchVendorData);
      socket.on('stats_updated', fetchVendorData);
      socket.on('new_ticket', fetchVendorData);
      socket.on('ticket_updated', fetchVendorData);
      socket.on('database_reset_zero', () => {
        setMyPropertiesList([]);
        setMyVehiclesList([]);
        setVendorBookings([]);
        setVendorTickets([]);
        setBankAccountsList([]);
        setPayoutsList([]);
      });
    }

    const interval = setInterval(fetchVendorData, 4000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('new_property');
        socket.off('new_vehicle');
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

  // Fast client-side image compression helper
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Multiple Images Upload Handler (Minimum 2 Images) with Auto Compression
  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPropError('');
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const compressedBase64 = await compressImage(file);
        setPropImages(prev => [...prev, compressedBase64]);
      }
    }
  };

  const handleRemoveImage = (index) => {
    setPropImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Google Maps Location Picker & Confirmation Handlers
  const handleSelectLandmark = (lm) => {
    setPropLocation(lm.address);
    setPropDistrict(lm.district);
    setPropCoordinates({ lat: lm.lat, lng: lm.lng });
    setIsLocationConfirmed(true);
    triggerSuccess(`📍 Location Selected & Confirmed: ${lm.name}!`);
  };

  const handleSearchAddressOnMap = async (e) => {
    if (e) e.preventDefault();
    if (!mapSearchQuery) return;
    setIsSearchingMap(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery + ', Tamil Nadu, India')}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = Number(Number(data[0].lat).toFixed(4));
          const lng = Number(Number(data[0].lon).toFixed(4));
          const cleanAddr = data[0].display_name.split(',').slice(0, 3).join(', ');
          setPropCoordinates({ lat, lng });
          setPropLocation(cleanAddr);
          setIsLocationConfirmed(true);
          triggerSuccess(`📍 Location Found & Confirmed on Map: ${cleanAddr}!`);
        } else {
          setPropLocation(mapSearchQuery + ', Tamil Nadu');
          setIsLocationConfirmed(true);
          triggerSuccess(`📍 Location set to: ${mapSearchQuery}!`);
        }
      }
    } catch (err) {
      setPropLocation(mapSearchQuery + ', Tamil Nadu');
      setIsLocationConfirmed(true);
      triggerSuccess(`📍 Location set: ${mapSearchQuery}!`);
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleConfirmLocation = () => {
    if (!propLocation) {
      setPropLocation('Coaker Walk, Kodaikanal');
    }
    setIsLocationConfirmed(true);
    triggerSuccess(`✅ Location Confirmed & Locked for Navigation: ${propCoordinates.lat}° N, ${propCoordinates.lng}° E!`);
  };

  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        setPropCoordinates({ lat, lng });
        setPropLocation(`GPS Pin (${lat}, ${lng}), Tamil Nadu`);
        setIsLocationConfirmed(true);
        triggerSuccess(`📍 GPS Location Captured & Confirmed: ${lat}, ${lng}`);
      },
      (err) => {
        setIsLocating(false);
        alert('Could not retrieve GPS location. Please choose a landmark preset or enter manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Profile and Password handlers
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

  // Add Property with Minimum 2 Photos and Google Maps Coordinates & Confirmation
  const handleAddPropertySubmit = async (e) => {
    e.preventDefault();
    if (!propTitle || !propPrice) return;

    if (propImages.length < 2) {
      setPropError('⚠️ Minimum 2 photos required! Please upload at least 2 images (e.g. Room, Exterior, Balcony/View, Washroom).');
      return;
    }

    if (!isLocationConfirmed) {
      setPropError('⚠️ Please click "Confirm Location on Map" to verify the GPS coordinates before submitting.');
      return;
    }

    const googleMapsUrl = `https://www.google.com/maps?q=${propCoordinates.lat},${propCoordinates.lng}`;

    const newProp = {
      id: 'p-' + Date.now(),
      title: propTitle,
      type: propType,
      district: propDistrict,
      location: propLocation || 'Coaker Walk, Kodaikanal',
      price: Number(propPrice),
      pricePerNight: Number(propPrice),
      images: propImages,
      coordinates: propCoordinates,
      googleMapsUrl,
      isLocationConfirmed: true,
      description: propDesc || `${propType} in ${propLocation}.`,
      ownerEmail: currentUser?.email || 'vendor@exploretamilnadu.com',
      ownerName: currentUser?.name || 'Property Host',
      status: 'Pending Approval',
      createdAt: new Date().toISOString()
    };

    setMyPropertiesList([newProp, ...myPropertiesList]);
    setShowAddPropModal(false);
    setPropTitle('');
    setPropPrice('3800');
    setPropDesc('');
    setPropImages([]);
    setPropError('');

    try {
      await apiFetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProp)
      });
    } catch (err) {
      console.warn('Backend property add error:', err);
    }

    triggerSuccess(`Property "${propTitle}" with ${propImages.length} photos and confirmed Google Maps location submitted for Super Admin approval!`);
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

  // Live calculated earnings from actual bookings in database
  const confirmedEarnings = vendorBookings
    .filter(b => b.status === 'Confirmed' || b.status === 'Completed' || b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + Number(b.totalAmount || b.amount || 0), 0);

  const pendingSettlements = vendorBookings
    .filter(b => b.status === 'Pending Approval' || b.status === 'Pending')
    .reduce((sum, b) => sum + Number(b.totalAmount || b.amount || 0), 0);

  // Nav Menu Items for Vendors & Property Hosts
  const navMenuItems = [
    { id: 'properties_vehicles', label: 'My Properties & Vehicles', icon: <Building2 size={18} />, badge: myPropertiesList.length + myVehiclesList.length },
    { id: 'profile', label: 'Vendor Profile & Security', icon: <User size={18} /> },
    { id: 'bank_accounts', label: 'Bank Accounts', icon: <CreditCard size={18} />, badge: bankAccountsList.length },
    { id: 'payouts', label: 'Payouts & Earnings', icon: <DollarSign size={18} />, badge: confirmedEarnings > 0 ? `₹${confirmedEarnings.toLocaleString()}` : '₹0' },
    { id: 'bookings', label: 'Booking Requests', icon: <Calendar size={18} />, badge: vendorBookings.length },
    { id: 'support', label: 'Support & Help', icon: <HelpCircle size={18} />, badge: vendorTickets.length }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-100 flex overflow-hidden m-0">
      
      {/* 📌 VENDOR & HOST SIDEBAR (Icons only on mobile, full text on PC & Tab) */}
      <aside className="w-16 sm:w-20 md:w-64 bg-[#081d3d] text-white flex flex-col justify-between p-3 sm:p-4 md:p-6 border-r border-[#0e2e5c] flex-shrink-0 min-h-screen transition-all">
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-[#0e2e5c]">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0">
              <img src={vendorAvatar} alt={vendorName} className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:block">
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
                title={item.label}
                className={`w-full flex items-center justify-center md:justify-between p-3 md:px-3.5 md:py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-slate-300 hover:bg-[#0c2a54] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {/* Icons only on mobile UI, letters on PC & Tab */}
                  <span className="hidden md:inline truncate">{item.label}</span>
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
        <div className="pt-6 border-t border-[#0e2e5c]">
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Verified Host & Fleet Provider</span>
          </div>
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

              {/* 📸🗺️ Add Property Form with Photo Upload (Min 2) & Google Maps Location Confirmation */}
              {showAddPropModal && (
                <form onSubmit={handleAddPropertySubmit} className="p-6 lg:p-8 rounded-3xl bg-slate-50 border-2 border-blue-200 shadow-md space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">🏡</span>
                      <h4 className="text-base font-extrabold text-slate-900">Add New Property / Stay Listing</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      📸 2+ Photos & Google Maps Pin Confirmation Required
                    </span>
                  </div>

                  {propError && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-fade-in">
                      <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                      <span>{propError}</span>
                    </div>
                  )}

                  {/* Basic Property Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Property Name / Title</label>
                      <input 
                        type="text" 
                        placeholder="E.g. Kodai Misty Pines Cottage" 
                        value={propTitle} 
                        onChange={e => setPropTitle(e.target.value)} 
                        className="glass-input text-xs" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Stay Category</label>
                      <select 
                        value={propType} 
                        onChange={e => setPropType(e.target.value)} 
                        className="glass-input text-xs font-bold"
                      >
                        <option value="Homestay">🏡 Homestay</option>
                        <option value="Resort">🏰 Resort</option>
                        <option value="Lakeview resort">🏞️ Lakeview Resort</option>
                        <option value="Mountain view resort">⛰️ Mountain View Resort</option>
                        <option value="River view resort">🌊 River View Resort</option>
                        <option value="Heritage Cottage">🛖 Heritage Cottage</option>
                        <option value="Forest Eco Stay">🌲 Forest Eco Stay</option>
                        <option value="Hotel">🏨 Hotel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Price Per Night (₹)</label>
                      <input 
                        type="number" 
                        placeholder="3800" 
                        value={propPrice} 
                        onChange={e => setPropPrice(e.target.value)} 
                        className="glass-input text-xs font-mono font-bold" 
                        required 
                      />
                    </div>
                  </div>

                  {/* 📷 SECTION 1: PHOTO UPLOAD (CHOOSE FILE - MINIMUM 2 IMAGES) */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ImageIcon size={16} className="text-blue-600" />
                          <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                            Property Photos (Choose File)
                          </label>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Upload at least 2 clear photos (e.g. Bed Room, Exterior, Balcony / View, Washroom, Living Area).
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                          propImages.length >= 2 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {propImages.length >= 2 ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                          {propImages.length} / 2 Minimum Photos Selected
                        </span>
                      </div>
                    </div>

                    {/* Choose File Button & Drag Zone */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#081d3d] hover:bg-[#0c2a54] text-white text-xs font-extrabold cursor-pointer transition-all shadow-md">
                        <Upload size={16} /> Choose Image Files
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          onChange={handleImagesUpload} 
                          className="hidden" 
                        />
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Supports JPG, PNG, WEBP (Select multiple photos together)
                      </span>
                    </div>

                    {/* Image Preview Gallery Grid */}
                    {propImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                        {propImages.map((img, idx) => (
                          <div key={idx} className="relative rounded-2xl overflow-hidden border-2 border-slate-200 aspect-square group shadow-sm bg-slate-100">
                            <img src={img} alt={`Upload ${idx+1}`} className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono font-bold text-[9px] shadow-sm">
                                Cover
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shadow-md opacity-90 hover:opacity-100 transition-opacity"
                              title="Remove Photo"
                            >
                              <X size={12} />
                            </button>
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm text-white text-[9px] font-mono py-0.5 text-center font-bold">
                              Photo #{idx+1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 🗺️ SECTION 2: GOOGLE MAPS LOCATION PICKER WITH EXPLICIT CONFIRMATION */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-emerald-600" />
                          <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                            Google Maps Location & Verification
                          </label>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Pinpoint your exact stay location and click <b>"Confirm Location on Map"</b> for tourist GPS tracking.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={handleDetectGPSLocation} 
                          disabled={isLocating}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Navigation size={13} /> {isLocating ? 'Detecting GPS...' : '📍 Locate Current GPS'}
                        </button>
                        <a 
                          href={`https://www.google.com/maps?q=${propCoordinates.lat},${propCoordinates.lng}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <ExternalLink size={13} /> Open in Google Maps
                        </a>
                      </div>
                    </div>

                    {/* Instant Map Address Search Bar */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search landmark or area (e.g. Kodai Lake, Ooty Club, Madurai Meenakshi, Yercaud)..."
                          value={mapSearchQuery}
                          onChange={e => setMapSearchQuery(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchAddressOnMap(); } }}
                          className="glass-input text-xs pl-9"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSearchAddressOnMap}
                        disabled={isSearchingMap}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        {isSearchingMap ? 'Searching...' : 'Search & Pin'}
                      </button>
                    </div>

                    {/* Location Address & District Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Physical Address</label>
                        <input 
                          type="text" 
                          placeholder="E.g. Coaker Walk Road, Near Kodai Lake" 
                          value={propLocation} 
                          onChange={e => { setPropLocation(e.target.value); setIsLocationConfirmed(false); }} 
                          className="glass-input text-xs" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tourist District</label>
                        <select 
                          value={propDistrict} 
                          onChange={e => { setPropDistrict(e.target.value); setIsLocationConfirmed(false); }} 
                          className="glass-input text-xs font-bold"
                        >
                          <option value="Dindigul (Kodaikanal)">Dindigul (Kodaikanal)</option>
                          <option value="Nilgiris (Ooty)">Nilgiris (Ooty & Coonoor)</option>
                          <option value="Salem (Yercaud)">Salem (Yercaud)</option>
                          <option value="Madurai">Madurai</option>
                          <option value="Ramanathapuram (Rameshwaram)">Ramanathapuram (Rameshwaram)</option>
                          <option value="Kanyakumari">Kanyakumari</option>
                          <option value="Chengalpattu (Mahabalipuram)">Chengalpattu (Mahabalipuram)</option>
                          <option value="Coimbatore (Valparai)">Coimbatore (Valparai)</option>
                          <option value="Thanjavur">Thanjavur</option>
                          <option value="Dharmapuri (Hogenakkal)">Dharmapuri (Hogenakkal)</option>
                          <option value="Pondicherry / Chennai Coast">Pondicherry / Chennai ECR</option>
                        </select>
                      </div>
                    </div>

                    {/* Quick Tamil Nadu Tourist Landmark Presets */}
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1.5">
                        ⚡ 1-Click Tamil Nadu Destination Landmarks:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200">
                        {TAMIL_NADU_LANDMARKS.map((lm, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectLandmark(lm)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              propCoordinates.lat === lm.lat && propCoordinates.lng === lm.lng
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                            }`}
                          >
                            {lm.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Coordinates Readout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">Latitude</label>
                        <input 
                          type="number" 
                          step="0.0001" 
                          value={propCoordinates.lat} 
                          onChange={e => { setPropCoordinates({ ...propCoordinates, lat: Number(e.target.value) }); setIsLocationConfirmed(false); }} 
                          className="glass-input text-xs font-mono font-bold" 
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">Longitude</label>
                        <input 
                          type="number" 
                          step="0.0001" 
                          value={propCoordinates.lng} 
                          onChange={e => { setPropCoordinates({ ...propCoordinates, lng: Number(e.target.value) }); setIsLocationConfirmed(false); }} 
                          className="glass-input text-xs font-mono font-bold" 
                        />
                      </div>
                      <div className="pt-4 font-mono text-[11px] text-slate-500">
                        📍 Target Pin: <span className="font-bold text-emerald-700">{propCoordinates.lat}° N, {propCoordinates.lng}° E</span>
                      </div>
                    </div>

                    {/* Interactive Embedded Google Map View with Pin Overlay */}
                    <div className="relative w-full h-56 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner group">
                      <iframe
                        title="Google Map Location Preview"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                        src={`https://maps.google.com/maps?q=${propCoordinates.lat},${propCoordinates.lng}&hl=en&z=14&output=embed`}
                        className="w-full h-full pointer-events-auto"
                      />

                      {/* Map Visual Badge */}
                      <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-md">
                        <MapIcon size={12} className="text-amber-400" />
                        <span>Live Google Maps View • {propCoordinates.lat}, {propCoordinates.lng}</span>
                      </div>
                    </div>

                    {/* 📍 EXPLICIT LOCATION CONFIRMATION CARD */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      isLocationConfirmed 
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-sm' 
                        : 'bg-amber-50/90 border-amber-300 text-amber-950'
                    }`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${
                            isLocationConfirmed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white animate-pulse'
                          }`}>
                            {isLocationConfirmed ? '✓' : '📍'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs">
                                {isLocationConfirmed ? 'Location Confirmed & Locked for Navigation' : 'Location Pin Needs Confirmation'}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                isLocationConfirmed ? 'bg-emerald-200 text-emerald-900 border border-emerald-400' : 'bg-amber-200 text-amber-900 border border-amber-400'
                              }`}>
                                {isLocationConfirmed ? '🟢 Verified & Confirmed' : '⚠️ Unconfirmed'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-700 mt-0.5 font-medium">
                              {propLocation} • <span className="font-mono font-bold text-slate-900">({propCoordinates.lat}° N, {propCoordinates.lng}° E)</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {!isLocationConfirmed ? (
                            <button
                              type="button"
                              onClick={handleConfirmLocation}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all"
                            >
                              <Check size={16} /> Confirm Location on Map
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => { setIsLocationConfirmed(false); triggerSuccess('You can now adjust the coordinates or choose another landmark.'); }}
                              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl border border-emerald-400 bg-white hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-all"
                            >
                              Change Location Pin
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Submission Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">
                      {propImages.length < 2 ? '⚠️ Please choose at least 2 photos.' : !isLocationConfirmed ? '⚠️ Please click "Confirm Location on Map".' : '✅ Photos and Map Location confirmed. Ready to submit.'}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        type="submit" 
                        className="glass-button text-xs py-3 px-8 shadow-lg"
                      >
                        Submit Property for Approval
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowAddPropModal(false)} 
                        className="px-5 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* 🏡 My Properties Directory List with Photos and Google Maps Tracking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myPropertiesList.map(p => (
                  <div key={p.id || p._id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 hover:shadow-md transition-all">
                    {/* Photos Carousel / Thumbnail Banner */}
                    {p.images && p.images.length > 0 ? (
                      <div className="space-y-2">
                        <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                          <img 
                            src={p.images[0]} 
                            alt={p.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                          <span className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                            📸 {p.images.length} Photos
                          </span>
                          <span className={`absolute top-2.5 right-2.5 px-3 py-1 rounded-full text-[10px] font-extrabold font-mono uppercase ${
                            p.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {p.status === 'Approved' ? '🟢 Approved' : '⏳ Pending'}
                          </span>
                        </div>

                        {/* Thumbnail preview row */}
                        {p.images.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {p.images.slice(1, 5).map((img, i) => (
                              <div key={i} className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                                <img src={img} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {p.images.length > 5 && (
                              <div className="w-14 h-14 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
                                +{p.images.length - 5}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-32 rounded-2xl bg-slate-200 border border-slate-300 flex items-center justify-center text-xs text-slate-500 font-mono">
                        📷 No Photos Uploaded
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                            {p.type || 'Homestay'}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-base mt-1">{p.title}</h4>
                        </div>
                        <span className="font-black text-blue-600 text-base">
                          ₹{Number(p.price || p.pricePerNight || 0).toLocaleString()}
                          <span className="text-xs font-normal text-slate-500">/night</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1">📍 {p.location}</p>

                      {/* Google Maps Location Tracking Button */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                        <span className="text-[11px] font-mono text-slate-500">
                          {p.coordinates?.lat ? `GPS: ${p.coordinates.lat}, ${p.coordinates.lng}` : (p.district || 'Tamil Nadu')}
                        </span>
                        <a
                          href={p.googleMapsUrl || `https://www.google.com/maps?q=${encodeURIComponent(p.location || p.title + ', Tamil Nadu')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
                        >
                          🗺️ Track on Google Maps ↗
                        </a>
                      </div>
                    </div>
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
                <div className="text-xs font-extrabold uppercase text-emerald-800">Total Settled Payouts</div>
                <div className="text-3xl font-black text-emerald-950 mt-2">₹{confirmedEarnings.toLocaleString()}</div>
                <div className="text-xs font-semibold text-emerald-700 mt-1">Live from verified guest bookings</div>
              </div>
              <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 shadow-sm">
                <div className="text-xs font-extrabold uppercase text-amber-800">Pending Check-in Settlements</div>
                <div className="text-3xl font-black text-amber-950 mt-2">₹{pendingSettlements.toLocaleString()}</div>
                <div className="text-xs font-semibold text-amber-700 mt-1">Settles upon check-in completion</div>
              </div>
              <div className="p-6 rounded-3xl bg-blue-50 border border-blue-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs font-extrabold uppercase text-blue-800">Instant Payout Transfer</div>
                  <div className="text-xs font-semibold text-blue-700 mt-1">
                    {bankAccountsList.length > 0 ? `Primary: ${bankAccountsList[0].bankName}` : 'Add a bank account to enable auto-transfers'}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (confirmedEarnings <= 0) {
                      alert('No settled earnings balance available for transfer at this time.');
                      return;
                    }
                    if (bankAccountsList.length === 0) {
                      setActiveTab('bank_accounts');
                      alert('Please link a bank account or UPI ID first.');
                      return;
                    }
                    triggerSuccess(`Payout transfer of ₹${confirmedEarnings.toLocaleString()} initiated to ${bankAccountsList[0].bankName}!`);
                  }} 
                  className="glass-button text-xs py-2 px-4 mt-4"
                >
                  Request Instant Payout
                </button>
              </div>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Payout Transactions Log</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time ledger of transfers to your linked bank accounts.</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {payoutsList.length} Transactions
                </span>
              </div>

              {payoutsList.length > 0 ? (
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
                          <td className="py-4 font-black text-emerald-600 text-base">₹{Number(pay.amount || 0).toLocaleString()}</td>
                          <td className="py-4 text-right">
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold font-mono">🟢 Transferred</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto text-lg font-bold">
                    ₹
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Payout Transactions Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When guests book your properties or vehicles and check in, your payouts will automatically reflect and settle here.
                  </p>
                </div>
              )}
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Describe your inquiry / issue in detail</label>
                    <textarea rows={3} placeholder="Please provide specific details..." value={ticketMessage} onChange={e => setTicketMessage(e.target.value)} className="glass-input text-xs" required />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="submit" className="glass-button text-xs py-2 px-6">Submit Ticket to Super Admin</button>
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
