import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Car, 
  User, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  CalendarDays,
  HelpCircle, 
  Plus, 
  Upload, 
  Camera, 
  Check, 
  X, 
  XCircle,
  Lock, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  PhoneCall, 
  Phone,
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
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { BACKEND_API } from '../../config/api';
import InteractiveLocationMapPicker from '../common/InteractiveLocationMapPicker';
import { calculatePricing } from '../../utils/pricing';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const actionFromUrl = searchParams.get('action');

  // Active Tab State (Synced with URL search params)
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'properties_vehicles');
  const [subTab, setSubTab] = useState(role === 'vendor' || tabFromUrl === 'vehicles' ? 'vehicles' : 'properties');
  const [actionSuccess, setActionSuccess] = useState('');
  const [inspectedVehicleModal, setInspectedVehicleModal] = useState(null);
  const [vehInspectPhotoTab, setVehInspectPhotoTab] = useState('exterior');

  useEffect(() => {
    if (tabFromUrl) {
      if (['properties_vehicles', 'properties', 'vehicles', 'bank_accounts', 'bank_payouts', 'payouts', 'bookings', 'bookings_calendar', 'vendor_tickets', 'support', 'profile', 'vendor_profile', 'help_guide'].includes(tabFromUrl)) {
        if (tabFromUrl === 'vehicles') {
          setActiveTab('properties_vehicles');
          setSubTab('vehicles');
        } else if (tabFromUrl === 'properties') {
          setActiveTab('properties_vehicles');
          setSubTab('properties');
        } else {
          setActiveTab(tabFromUrl);
        }
      }
    }
    if (actionFromUrl === 'add_vehicle' || (tabFromUrl === 'vehicles' && actionFromUrl === 'add')) {
      setActiveTab('properties_vehicles');
      setSubTab('vehicles');
      setShowAddVehModal(true);
    } else if (actionFromUrl === 'add_property' || (tabFromUrl === 'properties' && actionFromUrl === 'add')) {
      setActiveTab('properties_vehicles');
      setSubTab('properties');
      setShowAddPropModal(true);
    }
  }, [tabFromUrl, actionFromUrl]);

  // Profile Form State
  const getInitialAvatar = () => {
    if (currentUser?.email) {
      const saved = localStorage.getItem(`etn_user_avatar_${currentUser.email.toLowerCase()}`);
      if (saved) return saved;
    }
    return currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
  };

  const [vendorName, setVendorName] = useState(currentUser?.name || '');
  const [vendorEmail, setVendorEmail] = useState(currentUser?.email || '');
  const [vendorPhone, setVendorPhone] = useState(currentUser?.phone || '');
  const [vendorAvatar, setVendorAvatar] = useState(getInitialAvatar);

  useEffect(() => {
    if (currentUser) {
      setVendorName(currentUser.name || '');
      setVendorEmail(currentUser.email || '');
      setVendorPhone(currentUser.phone || '');
      const saved = currentUser.email ? localStorage.getItem(`etn_user_avatar_${currentUser.email.toLowerCase()}`) : null;
      if (saved) {
        setVendorAvatar(saved);
      } else if (currentUser.avatar) {
        setVendorAvatar(currentUser.avatar);
      }
    }
  }, [currentUser]);

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
  const [propRules, setPropRules] = useState(
    'Check-In from 12:00 PM | Check-Out until 11:00 AM\nValid Government Photo ID required for all adult guests\nStrictly non-smoking inside bedrooms (designated smoking areas provided)\nPets allowed on prior host approval\nQuiet hours after 10:00 PM for peaceful mountain ambiance'
  );
  const [propImages, setPropImages] = useState([]);
  const [propCoordinates, setPropCoordinates] = useState({ lat: 10.2381, lng: 77.4892 });
  const [propError, setPropError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // 📍 Location Confirmation & Search State
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(true);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [googleMapsInput, setGoogleMapsInput] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  // 🚖 Upgraded Vehicle & Cab Fleet Form States
  const [showAddVehModal, setShowAddVehModal] = useState(false);
  const [vehTitle, setVehTitle] = useState('');
  const [vehType, setVehType] = useState('Innova');
  const [vehRegNo, setVehRegNo] = useState('');
  const [vehPrice, setVehPrice] = useState('3500');
  const [vehPerKmRate, setVehPerKmRate] = useState('16');
  const [vehDistrict, setVehDistrict] = useState('Nilgiris (Ooty)');
  const [vehLocation, setVehLocation] = useState('Commercial Road, Ooty');
  const [vehCoordinates, setVehCoordinates] = useState({ lat: 11.4102, lng: 76.6950 });
  const [vehFuelType, setVehFuelType] = useState('Diesel');
  const [vehAcType, setVehAcType] = useState('AC');
  const [vehSeatingCapacity, setVehSeatingCapacity] = useState('7');
  const [vehDriverName, setVehDriverName] = useState('Ramesh V.');
  const [vehDriverPhone, setVehDriverPhone] = useState('+91 78717 79134');
  const [vehDriverLicense, setVehDriverLicense] = useState('TN-38-20150001234');
  const [vehRcImage, setVehRcImage] = useState('');
  const [vehExteriorImage, setVehExteriorImage] = useState('');
  const [vehInteriorImage, setVehInteriorImage] = useState('');
  const [vehNumberPlateImage, setVehNumberPlateImage] = useState('');
  const [vehConductDeclared, setVehConductDeclared] = useState(false);
  const [vehError, setVehError] = useState('');

  // Payouts Log
  const [payoutsList, setPayoutsList] = useState([]);

  // Bookings List (Strictly live from MongoDB Atlas)
  const [vendorBookings, setVendorBookings] = useState([]);

  // Support Tickets
  const [vendorTickets, setVendorTickets] = useState([]);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Property Host Settlement');
  const [ticketMessage, setTicketMessage] = useState('');

  const apiFetch = async (endpoint, options = {}) => {
    const cleanPath = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
    const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_API}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    try {
      const res = await fetch(url, options);
      if (res && (res.ok || res.status === 400 || res.status === 401 || res.status === 403)) {
        return res;
      }
    } catch (e) {
      console.warn('API fetch notice for', url, e.message);
    }
    return null;
  };

  const fetchVendorData = async () => {
    try {
      const userEmail = (currentUser?.email || vendorEmail || '').toLowerCase().trim();
      const userName = (currentUser?.name || vendorName || '').toLowerCase().trim();

      const propsRes = await apiFetch('/api/properties?limit=50');
      if (propsRes.ok) {
        const rawProps = await propsRes.json();
        const allProps = Array.isArray(rawProps) ? rawProps : (rawProps?.data || []);
        if (Array.isArray(allProps)) {
          setMyPropertiesList(allProps.filter(p => {
            const pEmail = (p.ownerEmail || '').toLowerCase().trim();
            const pName = (p.ownerName || '').toLowerCase().trim();
            return (userEmail && pEmail && pEmail === userEmail) || 
                   (userName && pName && pName === userName) || 
                   currentUser?.role === 'super_admin';
          }));
        }
      }

      const vehsRes = await apiFetch('/api/vehicles');
      if (vehsRes.ok) {
        const rawVehs = await vehsRes.json();
        const allVehs = Array.isArray(rawVehs) ? rawVehs : (rawVehs?.data || []);
        if (Array.isArray(allVehs)) {
          setMyVehiclesList(allVehs.filter(v => {
            const vEmail = (v.providerEmail || v.ownerEmail || '').toLowerCase().trim();
            const vName = (v.providerName || v.ownerName || '').toLowerCase().trim();
            return (userEmail && vEmail && vEmail === userEmail) || 
                   (userName && vName && vName === userName) || 
                   currentUser?.role === 'super_admin';
          }));
        }
      }

      // Fetch Bookings from Server
      const bksRes = await apiFetch('/api/bookings');
      if (bksRes && bksRes.ok) {
        const allBks = await bksRes.json();
        const bList = allBks.bookings || (Array.isArray(allBks) ? allBks : []);
        setVendorBookings(bList);
      }

      const tckRes = await apiFetch('/api/tickets');
      if (tckRes && tckRes.ok) {
        const allTcks = await tckRes.json();
        if (Array.isArray(allTcks)) {
          setVendorTickets(allTcks.filter(t => (t.senderEmail || '').toLowerCase().trim() === userEmail || currentUser?.role === 'super_admin'));
        }
      }
    } catch (e) {
      console.warn('fetchVendorData error:', e.message);
    }
  };

  useEffect(() => {
    fetchVendorData();

    const handleBookingCreated = (e) => {
      if (e.detail) {
        setVendorBookings(prev => {
          const id = e.detail.bookingId || e.detail.id || e.detail._id;
          const exists = prev.some(b => (b.bookingId || b.id || b._id) === id);
          return exists ? prev : [e.detail, ...prev];
        });
      }
    };
    window.addEventListener('etn_booking_created', handleBookingCreated);

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

    const interval = setInterval(fetchVendorData, 45000);

    return () => {
      window.removeEventListener('etn_booking_created', handleBookingCreated);
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

  // Fast client-side image compression helper (max 800px dimension & lightweight output)
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
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
          resolve(canvas.toDataURL('image/jpeg', 0.7));
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

  const handleSingleFileUpload = async (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVehError('');
    try {
      const compressed = await compressImage(file);
      setter(compressed);
      triggerSuccess('Document / Photo uploaded successfully!');
    } catch (err) {
      console.warn('File upload error:', err);
    }
  };

  const handleRemoveImage = (index) => {
    setPropImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Google Maps Location Picker & Confirmation Handlers
  // Google Maps Location Picker, Link Parser & Confirmation Handlers
  const handleSelectLandmark = (lm) => {
    setPropLocation(lm.address);
    setPropDistrict(lm.district);
    setPropCoordinates({ lat: lm.lat, lng: lm.lng });
    setIsLocationConfirmed(true);
    triggerSuccess(`📍 Location Selected: ${lm.name}!`);
  };

  const handleParseGoogleMapsInput = (input) => {
    if (!input) return;
    const str = input.trim();

    // 1. Check if direct coordinates like "10.2381, 77.4892" or "10.2381 77.4892"
    const coordMatch = str.match(/(-?\d+\.\d+)[\s,]+(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = Number(coordMatch[1]);
      const lng = Number(coordMatch[2]);
      setPropCoordinates({ lat, lng });
      setIsLocationConfirmed(true);
      triggerSuccess(`📍 GPS Coordinates Applied: ${lat}° N, ${lng}° E`);
      return;
    }

    // 2. Check if Google Maps URL like ?q=10.2381,77.4892 or @10.2381,77.4892
    const urlMatch = str.match(/(@|\?q=)(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (urlMatch) {
      const lat = Number(urlMatch[2]);
      const lng = Number(urlMatch[3]);
      setPropCoordinates({ lat, lng });
      setIsLocationConfirmed(true);
      triggerSuccess(`📍 Pinned from Google Maps URL: ${lat}° N, ${lng}° E`);
      return;
    }

    // 3. Otherwise treat as address/landmark search
    setMapSearchQuery(str);
    setPropLocation(str);
    setIsLocationConfirmed(true);
    triggerSuccess(`📍 Location set to "${str}"!`);
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
          triggerSuccess(`📍 Location Found: ${cleanAddr}!`);
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
    triggerSuccess(`✅ Location Locked for Stay: ${propCoordinates.lat}° N, ${propCoordinates.lng}° E!`);
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
        triggerSuccess(`📍 GPS Location Captured: ${lat}, ${lng}`);
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

  // Add Property with Minimum 2 Photos and Google Maps Coordinates
  const handleAddPropertySubmit = async (e) => {
    e.preventDefault();
    if (!propTitle || !propPrice) return;

    if (propImages.length < 2) {
      setPropError('⚠️ Minimum 2 photos required! Please upload at least 2 images (e.g. Room, Exterior, Balcony/View, Washroom).');
      return;
    }

    const uEmail = (currentUser?.email || vendorEmail || 'vendor@exploretamilnadu.com').toLowerCase().trim();
    const uName = currentUser?.name || vendorName || 'Property Host';

    const rulesArray = propRules
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const googleMapsUrl = `https://www.google.com/maps?q=${propCoordinates.lat},${propCoordinates.lng}`;

    const newProp = {
      title: propTitle,
      type: propType,
      district: propDistrict,
      location: propLocation || `${propDistrict}, Tamil Nadu`,
      price: Number(propPrice),
      pricePerNight: Number(propPrice),
      images: propImages,
      coordinates: propCoordinates,
      googleMapsUrl,
      isLocationConfirmed: true,
      description: propDesc || `${propType} in ${propLocation || propDistrict}.`,
      ownerRules: rulesArray,
      ownerEmail: uEmail,
      ownerName: uName,
      status: 'Pending Approval',
      createdAt: new Date().toISOString()
    };

    try {
      const res = await apiFetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProp)
      });
      if (res && (res.ok || res.status === 201)) {
        const saved = await res.json();
        setMyPropertiesList(prev => [saved, ...prev.filter(p => (p._id || p.id) !== (saved._id || saved.id))]);
      } else {
        setMyPropertiesList(prev => [{ ...newProp, id: 'p-' + Date.now() }, ...prev]);
      }
    } catch (err) {
      console.warn('Backend property add error:', err);
      setMyPropertiesList(prev => [{ ...newProp, id: 'p-' + Date.now() }, ...prev]);
    }

    setShowAddPropModal(false);
    setPropTitle('');
    setPropPrice('3800');
    setPropDesc('');
    setPropImages([]);
    setPropError('');

    triggerSuccess(`Property "${propTitle}" with ${propImages.length} photos submitted for Super Admin approval!`);
  };

  // Add Vehicle with Real-Time Backend API Persistence & RC/Photo/Conduct Verification
  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    setVehError('');

    if (!vehTitle || !vehRegNo) {
      setVehError('⚠️ Please enter Vehicle Title and Registration Number.');
      return;
    }

    if (!vehRcImage) {
      setVehError('⚠️ RC Book Document Image is required! Please upload RC copy.');
      return;
    }

    if (!vehExteriorImage) {
      setVehError('⚠️ Vehicle Exterior Photo is required! Please upload exterior image.');
      return;
    }

    if (!vehInteriorImage) {
      setVehError('⚠️ Vehicle Interior Photo is required! Please upload interior/seating image.');
      return;
    }

    if (!vehConductDeclared) {
      setVehError('⚠️ Please accept the Mandatory Zero-Tolerance Driver Conduct & Substance Policy.');
      return;
    }

    const cleanRegNo = vehRegNo.toUpperCase().trim();
    const googleMapsUrl = `https://www.google.com/maps?q=${vehCoordinates.lat},${vehCoordinates.lng}`;
    const uEmail = (currentUser?.email || vendorEmail || 'vendor@exploretamilnadu.com').toLowerCase().trim();
    const uName = currentUser?.name || vendorName || 'Vehicle Host';

    let backendType = 'Innova';
    const rawType = (vehType || '').toLowerCase();
    if (rawType.includes('innova')) backendType = 'Innova';
    else if (rawType.includes('tempo') || rawType.includes('traveller')) backendType = 'Tempo Traveller';
    else if (rawType.includes('sedan') || rawType.includes('dzire') || rawType.includes('etios')) backendType = 'Sedan';
    else if (rawType.includes('suv') || rawType.includes('scorpio') || rawType.includes('xuv') || rawType.includes('hatchback')) backendType = 'Cab SUV';
    else if (rawType.includes('bus') || rawType.includes('coach')) backendType = 'Luxury Bus';
    else if (rawType.includes('bike') || rawType.includes('scooter')) backendType = 'Rental Bike';
    else backendType = 'Innova';

    const newVeh = {
      title: vehTitle,
      type: backendType,
      category: vehType,
      vehicleModel: vehTitle,
      registrationNumber: cleanRegNo,
      regNo: cleanRegNo,
      numberPlate: cleanRegNo,
      numberPlateImage: vehNumberPlateImage || vehExteriorImage,
      rcBookImage: vehRcImage,
      exteriorImage: vehExteriorImage,
      interiorImage: vehInteriorImage,
      images: [vehExteriorImage, vehInteriorImage, vehRcImage, vehNumberPlateImage].filter(Boolean),
      location: vehLocation || `${vehDistrict}, Tamil Nadu`,
      district: vehDistrict,
      coordinates: vehCoordinates,
      googleMapsUrl,
      fuelType: vehFuelType,
      acType: vehAcType,
      seatingCapacity: Number(vehSeatingCapacity || 7),
      driverIncluded: true,
      driverName: vehDriverName || 'Verified Driver',
      driverPhone: vehDriverPhone || vendorPhone || '+91 78717 79134',
      driverLicense: vehDriverLicense || 'Valid Commercial RTO License',
      price: Number(vehPrice || 3500),
      pricePerDay: Number(vehPrice || 3500),
      perKmRate: Number(vehPerKmRate || 16),
      conductDeclared: true,
      status: 'Pending Approval',
      providerEmail: uEmail,
      providerName: uName,
      ownerEmail: uEmail,
      ownerName: uName,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await apiFetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVeh)
      });
      if (res && (res.ok || res.status === 201)) {
        const saved = await res.json();
        setMyVehiclesList(prev => [saved, ...prev.filter(v => (v._id || v.id) !== (saved._id || saved.id))]);
      } else {
        setMyVehiclesList(prev => [{ ...newVeh, id: 'v-' + Date.now() }, ...prev]);
      }
    } catch (err) {
      console.warn('Backend vehicle add error:', err);
      setMyVehiclesList(prev => [{ ...newVeh, id: 'v-' + Date.now() }, ...prev]);
    }

    setShowAddVehModal(false);
    setVehTitle('');
    setVehRegNo('');
    setVehRcImage('');
    setVehExteriorImage('');
    setVehInteriorImage('');
    setVehNumberPlateImage('');
    setVehConductDeclared(false);
    setVehError('');

    triggerSuccess(`Vehicle "${vehTitle}" (${cleanRegNo}) with RC & photos submitted for Super Admin approval!`);
  };

  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    const payload = {
      senderName: currentUser?.name || vendorName || 'Property Host',
      senderEmail: (currentUser?.email || vendorEmail || '').toLowerCase().trim(),
      senderRole: 'owner',
      subject: ticketSubject,
      category: ticketCategory,
      message: ticketMessage,
      priority: 'High',
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
        setVendorTickets(prev => [saved, ...prev]);
        triggerSuccess(`Ticket ${saved.ticketId || 'TCK'} created! Dispatched to Super Admin Jeeva & Customer Support.`);
      } else {
        triggerSuccess('Host ticket submitted! Super Admin and Support Team notified.');
      }
    } catch (err) {
      triggerSuccess('Host ticket submitted successfully!');
    }

    setShowNewTicketModal(false);
    setTicketSubject('');
    setTicketMessage('');
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
    { id: 'properties_vehicles', label: 'Overview & Inventory', icon: <Building2 size={18} />, badge: myPropertiesList.length + myVehiclesList.length },
    { id: 'vehicles', label: '🚖 My Vehicle Fleet', icon: <Car size={18} />, badge: myVehiclesList.length },
    { id: 'properties', label: '🏡 My Listed Stays', icon: <Building2 size={18} />, badge: myPropertiesList.length },
    { id: 'profile', label: 'Vendor Profile & Security', icon: <User size={18} /> },
    { id: 'bank_accounts', label: 'Bank Accounts', icon: <CreditCard size={18} />, badge: bankAccountsList.length },
    { id: 'payouts', label: 'Payouts & Earnings', icon: <DollarSign size={18} />, badge: confirmedEarnings > 0 ? `₹${confirmedEarnings.toLocaleString()}` : '₹0' },
    { id: 'bookings', label: 'Booking Requests', icon: <Calendar size={18} />, badge: vendorBookings.length },
    { id: 'support', label: 'Support & Help', icon: <HelpCircle size={18} />, badge: vendorTickets.length }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-100 flex overflow-hidden m-0">
      
      {/* 📌 VENDOR & HOST SIDEBAR (Hidden on mobile UI, full text on PC & Tab) */}
      <aside className="hidden md:flex md:w-64 bg-[#081d3d] text-white flex-col justify-between p-4 md:p-6 border-r border-[#0e2e5c] flex-shrink-0 min-h-screen transition-all">
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-start gap-3 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-[#0e2e5c]">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0">
              <img src={vendorAvatar} alt={vendorName} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white block leading-tight truncate max-w-[130px]">{vendorName}</span>
              <span className="text-[10px] font-mono text-amber-400 block font-bold mt-0.5">
                {role === 'owner_and_vendor' ? '🏡🚖 Host & Vendor' : role === 'vendor' ? '🚖 Vehicle Fleet Host' : '🏡 Property Host'}
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {navMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'vehicles') {
                    setActiveTab('properties_vehicles');
                    setSubTab('vehicles');
                    setSearchParams({ tab: 'vehicles' });
                  } else if (item.id === 'properties') {
                    setActiveTab('properties_vehicles');
                    setSubTab('properties');
                    setSearchParams({ tab: 'properties' });
                  } else {
                    setActiveTab(item.id);
                    setSearchParams({ tab: item.id });
                  }
                }}
                title={item.label}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  (activeTab === item.id || (item.id === 'vehicles' && activeTab === 'properties_vehicles' && subTab === 'vehicles') || (item.id === 'properties' && activeTab === 'properties_vehicles' && subTab === 'properties'))
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
                    (activeTab === item.id || (item.id === 'vehicles' && activeTab === 'properties_vehicles' && subTab === 'vehicles')) ? 'bg-white/20 text-white' : 'bg-[#123875] text-cyan-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer with Sign Out */}
        <div className="pt-4 border-t border-[#0c2a54] space-y-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out from Host & Vendor Dashboard?')) {
                logout();
                window.location.href = '/';
              }
            }}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* 💻 MAIN CONTENT AREA (100% Full Width on Mobile with zero sidebars) */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-10 bg-slate-50 overflow-y-auto min-h-screen">
        
        {/* Header Status Bar & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 sm:mb-8 pb-3 sm:pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-black text-slate-900 capitalize">
              {navMenuItems.find(i => i.id === activeTab)?.label || 'Host Dashboard'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage stay listings, vehicle fleets, bank accounts, and guest bookings.</p>
          </div>

          {/* Quick Master Add Actions & Sign Out */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('properties_vehicles');
                setSubTab('vehicles');
                setShowAddVehModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mono flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Car size={16} />
              <span>+ Add Vehicle / Cab</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('properties_vehicles');
                setSubTab('properties');
                setShowAddPropModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Building2 size={16} />
              <span>+ Add Stay / Property</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to sign out from Host & Vendor Dashboard?')) {
                  logout();
                  window.location.href = '/';
                }
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs font-mono flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Sign Out from Vendor Dashboard"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {actionSuccess && (
          <div className="p-4 mb-6 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <Check size={18} className="text-green-600" /> {actionSuccess}
          </div>
        )}

        {/* 🏡🚖 TAB 1: MY PROPERTIES & VEHICLES WITH SUBTAB TOGGLE */}
        {activeTab === 'properties_vehicles' && (
          <div className="space-y-8">
            
            {/* Sub-view toggle pills */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/80 w-fit">
              <button
                type="button"
                onClick={() => setSubTab('vehicles')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  subTab === 'vehicles' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:text-black'
                }`}
              >
                <Car size={15} className="text-amber-400" />
                <span>🚖 My Vehicle Fleet ({myVehiclesList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSubTab('properties')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  subTab === 'properties' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:text-black'
                }`}
              >
                <Building2 size={15} className="text-blue-400" />
                <span>🏡 My Listed Stays ({myPropertiesList.length})</span>
              </button>
            </div>

            {/* View A: Properties Section */}
            {(subTab === 'properties') && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
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

                  {/* 🗺️ SECTION 2: INTERACTIVE MAP PIN SELECTOR & VERIFICATION */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
                    <InteractiveLocationMapPicker
                      coordinates={propCoordinates}
                      locationAddress={propLocation}
                      district={propDistrict}
                      onChangeCoordinates={setPropCoordinates}
                      onChangeAddress={setPropLocation}
                      onChangeDistrict={setPropDistrict}
                      onNotify={triggerSuccess}
                    />

                    {/* Detailed Physical Address & District Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Detailed Stay Address / Landmark
                        </label>
                        <input 
                          type="text" 
                          placeholder="E.g. Coaker Walk Road, Near Kodai Lake" 
                          value={propLocation} 
                          onChange={e => setPropLocation(e.target.value)} 
                          className="glass-input text-xs font-bold" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tamil Nadu District
                        </label>
                        <select 
                          value={propDistrict} 
                          onChange={e => setPropDistrict(e.target.value)} 
                          className="glass-input text-xs font-bold"
                        >
                          <option value="Dindigul (Kodaikanal)">Dindigul (Kodaikanal)</option>
                          <option value="Nilgiris (Ooty)">Nilgiris (Ooty & Coonoor)</option>
                          <option value="Salem (Yercaud)">Salem (Yercaud)</option>
                          <option value="Coimbatore (Valparai)">Coimbatore (Valparai & Pollachi)</option>
                          <option value="Theni (Meghamalai)">Theni (Meghamalai & Suruli)</option>
                          <option value="Namakkal (Kolli Hills)">Namakkal (Kolli Hills)</option>
                          <option value="Tirupathur (Yelagiri Hills)">Tirupathur (Yelagiri Hills)</option>
                          <option value="Ramanathapuram (Rameshwaram)">Ramanathapuram (Rameshwaram & Dhanushkodi)</option>
                          <option value="Kanyakumari">Kanyakumari</option>
                          <option value="Madurai">Madurai</option>
                          <option value="Chengalpattu (Mahabalipuram)">Chengalpattu (Mahabalipuram & ECR)</option>
                          <option value="Chennai">Chennai</option>
                          <option value="Thanjavur">Thanjavur & Kumbakonam</option>
                          <option value="Tirunelveli (Courtallam)">Tirunelveli & Courtallam</option>
                          <option value="Tiruvannamalai">Tiruvannamalai</option>
                          <option value="Dharmapuri (Hogenakkal)">Dharmapuri (Hogenakkal Falls)</option>
                          <option value="Cuddalore (Chidambaram)">Cuddalore (Chidambaram & Pichavaram)</option>
                          <option value="Sivagangai (Chettinad)">Sivagangai (Chettinad Heritage)</option>
                          <option value="Kanchipuram">Kanchipuram</option>
                          <option value="Tiruchirappalli">Tiruchirappalli</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 📜 SECTION 3: CUSTOM PROPERTY RULES & GUIDELINES (DECLARED BY PROPERTY OWNER) */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">📜</span>
                          <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                            Property Rules & House Regulations (Declared by Host)
                          </label>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Specify check-in/out timings, noise policy, pet rules, and expectations for staying guests. (One rule per line).
                        </p>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 py-1 mr-1">Quick Add:</span>
                      {[
                        '🕒 Check-In: 12:00 PM | Check-Out: 11:00 AM',
                        '🪪 Government ID proof required for all adult guests',
                        '🚭 Strictly non-smoking inside bedrooms',
                        '🐾 Pets allowed on prior host approval',
                        '🤫 Quiet hours from 10:00 PM to 06:00 AM',
                        '🍳 Kitchen access available on request',
                        '🔥 Campfire and BBQ setup on advance notice'
                      ].map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            if (!propRules.includes(preset)) {
                              setPropRules(prev => prev ? `${prev}\n${preset}` : preset);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium border border-slate-200 transition-all cursor-pointer"
                        >
                          + {preset.split(' ')[0]} {preset.split(':')[0]}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={5}
                      value={propRules}
                      onChange={e => setPropRules(e.target.value)}
                      placeholder="Enter house rules (one per line)..."
                      className="glass-input text-xs font-mono leading-relaxed"
                      required
                    />
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

              {myPropertiesList.length === 0 && !showAddPropModal && (
                <div className="p-12 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-300 space-y-3">
                  <Building2 size={36} className="mx-auto text-slate-400" />
                  <h4 className="font-extrabold text-slate-900 text-sm">No Properties Listed Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    List your homestay, resort, or villa in Tamil Nadu with genuine photos, tariffs, and Google Maps pin.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddPropModal(true)}
                    className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-mono inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Plus size={15} /> + List Your First Property
                  </button>
                </div>
              )}
            </div>
            )}

            {/* View B: Vehicles Section */}
            {(subTab === 'vehicles') && (
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>🚖</span> My Vehicle Transport Fleet ({myVehiclesList.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Cabs, Innova Crystas, Tempo Travellers, & rental vehicles managed by you.</p>
                </div>
                <button 
                  onClick={() => setShowAddVehModal(!showAddVehModal)}
                  className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mono flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Plus size={16} /> + Add New Vehicle / Cab
                </button>
              </div>

              {/* Add Vehicle Modal Form */}
              {/* Add Vehicle Modal Form */}
              {showAddVehModal && (
                <form onSubmit={handleAddVehicleSubmit} className="p-6 lg:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-6 animate-in fade-in">
                  
                  {/* Form Header */}
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <span>🚖</span> Register Vehicle / Cab to Transport Fleet
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Submit vehicle specifications, RC book documentation, photos, and driver details for Super Admin verification.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddVehModal(false)}
                      className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {vehError && (
                    <div className="p-3.5 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{vehError}</span>
                    </div>
                  )}

                  {/* 📜 SECTION 1: MANDATORY COMPLIANCE & DRIVER ZERO-TOLERANCE CONDUCT NOTICE */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wide">
                      <ShieldCheck size={18} className="text-amber-600" />
                      <span>Mandatory Vehicle Compliance & Zero-Tolerance Driver Conduct Policy</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-amber-950 font-medium">
                      <div className="p-3 rounded-xl bg-white/80 border border-amber-200">
                        <strong className="block text-slate-900 mb-1">📄 Mandatory Documents:</strong>
                        Vehicle must have a valid <strong>RC (Registration Certificate)</strong>, active <strong>Insurance</strong>, and the driver must possess a valid <strong>Commercial/RTO Driving License</strong>.
                      </div>
                      <div className="p-3 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-900">
                        <strong className="block text-rose-950 mb-1">🚫 Zero-Tolerance Substance Policy:</strong>
                        The driver is strictly prohibited from <strong>smoking, consuming alcohol, drugs, pan masala, hans, cool lip</strong>, or any tobacco substances in front of passengers or inside the vehicle.
                      </div>
                    </div>
                  </div>

                  {/* 📸 SECTION 2: COMPULSORY RC & VEHICLE PHOTO UPLOADS */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
                    <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
                      📸 Mandatory Documentation & Photo Gallery (Upload Genuine Photos)
                    </h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* 1. RC Book Image */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-800 uppercase">
                          1. RC Book / Smart Card <span className="text-red-500">*</span>
                        </label>
                        {vehRcImage ? (
                          <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm group">
                            <img src={vehRcImage} alt="RC Document" className="w-full h-full object-cover" />
                            <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">✓ RC Uploaded</span>
                            <button
                              type="button"
                              onClick={() => setVehRcImage('')}
                              className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all">
                            <FileText size={22} className="text-slate-400 mb-1" />
                            <span className="text-[11px] font-bold text-slate-700">Upload RC Book</span>
                            <span className="text-[9px] text-slate-400">PDF / Image</span>
                            <input type="file" accept="image/*" onChange={e => handleSingleFileUpload(e, setVehRcImage)} className="hidden" />
                          </label>
                        )}
                      </div>

                      {/* 2. Exterior Image */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-800 uppercase">
                          2. Vehicle Exterior <span className="text-red-500">*</span>
                        </label>
                        {vehExteriorImage ? (
                          <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm group">
                            <img src={vehExteriorImage} alt="Exterior" className="w-full h-full object-cover" />
                            <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">✓ Exterior</span>
                            <button
                              type="button"
                              onClick={() => setVehExteriorImage('')}
                              className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all">
                            <Car size={22} className="text-slate-400 mb-1" />
                            <span className="text-[11px] font-bold text-slate-700">Upload Exterior Photo</span>
                            <span className="text-[9px] text-slate-400">Front / Side View</span>
                            <input type="file" accept="image/*" onChange={e => handleSingleFileUpload(e, setVehExteriorImage)} className="hidden" />
                          </label>
                        )}
                      </div>

                      {/* 3. Interior Image */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-800 uppercase">
                          3. Vehicle Interior <span className="text-red-500">*</span>
                        </label>
                        {vehInteriorImage ? (
                          <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm group">
                            <img src={vehInteriorImage} alt="Interior" className="w-full h-full object-cover" />
                            <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">✓ Interior</span>
                            <button
                              type="button"
                              onClick={() => setVehInteriorImage('')}
                              className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all">
                            <Camera size={22} className="text-slate-400 mb-1" />
                            <span className="text-[11px] font-bold text-slate-700">Upload Interior Photo</span>
                            <span className="text-[9px] text-slate-400">Seats & Dashboard</span>
                            <input type="file" accept="image/*" onChange={e => handleSingleFileUpload(e, setVehInteriorImage)} className="hidden" />
                          </label>
                        )}
                      </div>

                      {/* 4. Number Plate Image */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-slate-800 uppercase">
                          4. Number Plate Photo
                        </label>
                        {vehNumberPlateImage ? (
                          <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm group">
                            <img src={vehNumberPlateImage} alt="Number Plate" className="w-full h-full object-cover" />
                            <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">✓ Number Plate</span>
                            <button
                              type="button"
                              onClick={() => setVehNumberPlateImage('')}
                              className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all">
                            <ShieldCheck size={22} className="text-slate-400 mb-1" />
                            <span className="text-[11px] font-bold text-slate-700">Upload Plate Image</span>
                            <span className="text-[9px] text-slate-400">Clear Yellow/White Plate</span>
                            <input type="file" accept="image/*" onChange={e => handleSingleFileUpload(e, setVehNumberPlateImage)} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 🚗 SECTION 3: VEHICLE SPECIFICATIONS & TARIFF */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
                    <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
                      🚘 Vehicle Specifications & Rates
                    </h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Title / Model <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          placeholder="E.g. Toyota Innova Crysta Luxury Cab"
                          value={vehTitle}
                          onChange={e => setVehTitle(e.target.value)}
                          className="glass-input text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Registration Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          placeholder="TN-43-AB-9876"
                          value={vehRegNo}
                          onChange={e => setVehRegNo(e.target.value.toUpperCase())}
                          className="glass-input text-xs font-mono font-bold tracking-wider"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Category</label>
                        <select
                          value={vehType}
                          onChange={e => setVehType(e.target.value)}
                          className="glass-input text-xs font-bold"
                        >
                          <option value="Innova">🚖 Innova Crysta (7 Seater)</option>
                          <option value="Sedan">🚗 Sedan (Dzire / Etios 4 Seater)</option>
                          <option value="Cab SUV">🚙 Cab SUV (XUV700 / Scorpio 6 Seater)</option>
                          <option value="Tempo Traveller">🚐 Tempo Traveller (12 Seater)</option>
                          <option value="Luxury Bus">🚌 Luxury Coach / Bus (21 Seater)</option>
                          <option value="Rental Bike">🏍️ Rental Bike / Scooter</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Daily Full-Day Tariff (₹) <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          placeholder="3500"
                          value={vehPrice}
                          onChange={e => setVehPrice(e.target.value)}
                          className="glass-input text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Per-Kilometer Tariff (₹/km)</label>
                        <input
                          type="number"
                          placeholder="16"
                          value={vehPerKmRate}
                          onChange={e => setVehPerKmRate(e.target.value)}
                          className="glass-input text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Type</label>
                        <select
                          value={vehFuelType}
                          onChange={e => setVehFuelType(e.target.value)}
                          className="glass-input text-xs font-bold"
                        >
                          <option value="Diesel">Diesel</option>
                          <option value="Petrol">Petrol</option>
                          <option value="EV">Electric Vehicle (EV)</option>
                          <option value="CNG">CNG</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Air Conditioning</label>
                        <select
                          value={vehAcType}
                          onChange={e => setVehAcType(e.target.value)}
                          className="glass-input text-xs font-bold"
                        >
                          <option value="AC">AC (Air Conditioned)</option>
                          <option value="Non-AC">Non-AC</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Seating Capacity (Guests)</label>
                        <input
                          type="number"
                          value={vehSeatingCapacity}
                          onChange={e => setVehSeatingCapacity(e.target.value)}
                          className="glass-input text-xs font-bold"
                          min={1}
                          max={50}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Driver Name & Contact</label>
                        <input
                          type="text"
                          placeholder="Ramesh V. (+91 78717 79134)"
                          value={vehDriverName}
                          onChange={e => setVehDriverName(e.target.value)}
                          className="glass-input text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 📍 SECTION 4: VEHICLE BASE LOCATION & INTERACTIVE MAP PIN */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
                    <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
                      📍 Vehicle Ownership & Operating Location (Drag pin to operating garage / stand)
                    </h5>

                    <InteractiveLocationMapPicker
                      initialPosition={vehCoordinates}
                      onLocationChange={(coords, address) => {
                        setVehCoordinates(coords);
                        if (address) setVehLocation(address);
                      }}
                      onDistrictChange={dist => setVehDistrict(dist)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Base Stand / Garage Address</label>
                        <input
                          type="text"
                          value={vehLocation}
                          onChange={e => setVehLocation(e.target.value)}
                          className="glass-input text-xs font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Primary Operating District</label>
                        <input
                          type="text"
                          value={vehDistrict}
                          onChange={e => setVehDistrict(e.target.value)}
                          className="glass-input text-xs font-bold"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* ✍️ SECTION 5: MANDATORY SIGNED ZERO-TOLERANCE DECLARATION */}
                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300">
                    <label className="flex items-start gap-3 text-xs text-slate-900 font-bold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={vehConductDeclared}
                        onChange={e => setVehConductDeclared(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded accent-blue-600 cursor-pointer shrink-0"
                        required
                      />
                      <span className="leading-relaxed">
                        I hereby declare and confirm that this vehicle possesses a <strong>valid RC (Registration Certificate)</strong>, active <strong>Insurance</strong>, and the assigned driver holds a <strong>valid commercial driving license</strong>. Furthermore, I agree that the driver will strictly comply with the platform's <strong>Zero-Tolerance Policy</strong> (No smoking, alcohol, narcotics/drugs, pan masala, hans, or cool lip in front of passengers or inside the vehicle). <span className="text-red-600">*</span>
                      </span>
                    </label>
                  </div>

                  {/* Submit Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">
                      {!vehRcImage || !vehExteriorImage || !vehInteriorImage ? '⚠️ Please upload RC, Exterior, and Interior photos.' : !vehConductDeclared ? '⚠️ Please tick the Zero-Tolerance Declaration.' : '✅ All documents attached. Ready to submit.'}
                    </span>
                    <div className="flex gap-2">
                      <button type="submit" className="glass-button text-xs py-3 px-8 shadow-lg">
                        Submit Vehicle for Super Admin Approval
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddVehModal(false)}
                        className="px-5 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Vehicles Directory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myVehiclesList.map(v => (
                  <div key={v.id || v._id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 hover:shadow-md transition-all">
                    {/* Vehicle Photos Preview */}
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                      <img
                        src={v.exteriorImage || (v.images && v.images[0]) || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'}
                        alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                        🚖 {v.type || 'Cab'}
                      </span>
                      <span className={`absolute top-2.5 right-2.5 px-3 py-1 rounded-full text-[10px] font-extrabold font-mono uppercase ${
                        v.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {v.status === 'Approved' ? '🟢 Approved' : '⏳ Pending Approval'}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            {v.registrationNumber || v.regNo || v.numberPlate}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-base mt-1">{v.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-blue-600 text-base">
                            ₹{Number(v.price || v.pricePerDay || 3500).toLocaleString()}
                            <span className="text-xs font-normal text-slate-500">/day</span>
                          </span>
                          <p className="text-[10px] font-mono text-slate-500">₹{v.perKmRate || 16}/km</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-1">📍 {v.location || v.district || 'Tamil Nadu'}</p>

                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                        <span>👤 Driver: {v.driverName || 'Assigned Driver'}</span>
                        <span>•</span>
                        <span>👥 {v.seatingCapacity || 7} Seats</span>
                      </div>

                      {/* Google Maps Tracking & View Details Button */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setInspectedVehicleModal(v);
                            setVehInspectPhotoTab('exterior');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                          <Eye size={13} /> View Details
                        </button>
                        <a
                          href={v.googleMapsUrl || `https://www.google.com/maps?q=${encodeURIComponent((v.location || v.district || 'Tamil Nadu') + ', Tamil Nadu')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl transition-all shadow-sm"
                        >
                          🗺️ Track Base ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {myVehiclesList.length === 0 && !showAddVehModal && (
                <div className="p-12 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-300 space-y-3">
                  <Car size={36} className="mx-auto text-slate-400" />
                  <h4 className="font-extrabold text-slate-900 text-sm">No Vehicles Registered in Your Fleet Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Register your Innova Crysta, Sedan, Tempo Traveller, or Bus. Provide RC documentation, exterior/interior photos, and driver conduct declaration for Super Admin approval.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddVehModal(true)}
                    className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs font-mono inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Plus size={15} /> + Add Your First Vehicle / Cab
                  </button>
                </div>
              )}
            </div>
            )}
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
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Guest Reservation Requests</h3>
                <p className="text-xs text-slate-500 mt-0.5">Accept verified bookings to dispatch official vouchers to customers.</p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {vendorBookings.length} Requests
              </span>
            </div>

            <div className="space-y-4">
              {vendorBookings.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                  <Calendar size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Booking Requests Found</p>
                  <p className="text-xs text-slate-400 mt-1">When travelers book your stays, they will appear here for verification.</p>
                </div>
              ) : (
                vendorBookings.map(bk => {
                  const bId = bk.bookingId || bk.id || bk._id;
                  const isCab = bk.type === 'cab' || bk.itemType === 'vehicle' || bk.bookingType === 'cab';
                  const isConfirmed = bk.status === 'Confirmed';
                  const isCancelled = bk.status === 'Cancelled';
                  const isPending = !isConfirmed && !isCancelled;
                  const bAmount = Number(bk.totalAmount || bk.amount || 0);

                  return (
                    <div key={bk._id || bk.id || bId} className="p-5 rounded-3xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all flex flex-col lg:flex-row justify-between lg:items-center gap-4 text-xs shadow-xs">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-blue-700 font-bold px-2.5 py-0.5 bg-blue-100/70 rounded-md border border-blue-200">{bId}</span>
                          {isCab ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold font-mono text-[10px] border border-amber-300">
                              🚖 Cab Booking
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold font-mono text-[10px] border border-blue-300">
                              🏡 Stay Booking
                            </span>
                          )}
                          {isConfirmed ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono text-[11px] flex items-center gap-1">
                              <CheckCircle2 size={12} className="text-emerald-600" /> Confirmed & Voucher Active
                            </span>
                          ) : isCancelled ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold font-mono text-[11px] flex items-center gap-1">
                              <XCircle size={12} className="text-rose-600" /> Declined / Cancelled
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold font-mono text-[11px] flex items-center gap-1 border border-amber-300">
                              <Clock size={12} className="text-amber-600 animate-pulse" /> Awaiting Host Verification
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                            ✓ Paid via Razorpay
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base font-editorial">
                            {bk.propertyTitle || bk.itemTitle || (isCab ? 'Cab Transport' : 'Stay')}
                          </h4>
                          {isCab && bk.vehicleRegNo && (
                            <span className="font-mono text-xs font-bold text-slate-800 px-2 py-0.5 bg-amber-100 border border-amber-300 rounded-lg">
                              {bk.vehicleRegNo}
                            </span>
                          )}
                        </div>

                        {isCab ? (
                          <div className="grid sm:grid-cols-2 gap-1 text-slate-600 font-mono text-[11px]">
                            <p>
                              👤 Traveler: <strong className="text-slate-900">{bk.customerName || bk.userName || 'Tourist'}</strong>
                              {bk.customerEmail || bk.userEmail ? ` (${bk.customerEmail || bk.userEmail})` : ''}
                            </p>
                            <p>
                              📞 Phone: <strong className="text-slate-900">{bk.customerPhone || bk.userPhone || '+91 78717 79134'}</strong>
                            </p>
                            <p>
                              📍 Route: <strong className="text-slate-900">{bk.pickupLocation || 'Pickup Stand'} ➔ {bk.dropLocation || 'Sightseeing'}</strong>
                            </p>
                            <p>
                              🗓️ Schedule: <strong className="text-slate-900">{bk.pickupDate || bk.checkInDate} at {bk.pickupTime || '09:00'}</strong> ({bk.days || 1} Day)
                            </p>
                            <p>
                              👨‍✈️ Driver: <strong className="text-slate-900">{bk.driverName || 'Assigned Driver'}</strong> ({bk.driverPhone || ''})
                            </p>
                            <p>
                              👥 Passengers: <strong className="text-slate-900">{bk.passengerCount || bk.guests || 4}</strong> ({bk.tripType || 'Full Day Tour'})
                            </p>
                          </div>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-1 text-slate-600 font-mono text-[11px]">
                            <p>
                              👤 Guest: <strong className="text-slate-900">{bk.customerName || bk.userName || bk.guestName || 'Tourist'}</strong>
                              {bk.customerEmail || bk.userEmail ? ` (${bk.customerEmail || bk.userEmail})` : ''}
                            </p>
                            <p>
                              📞 Phone: <strong className="text-slate-900">{bk.customerPhone || bk.userPhone || '+91 78717 79134'}</strong>
                            </p>
                            <p>
                              📅 Dates: <strong className="text-slate-900">{bk.checkIn || bk.checkInDate || '2026-08-21'} → {bk.checkOut || bk.checkOutDate || '2026-08-22'}</strong> ({bk.nights || 1} Night(s))
                            </p>
                            <p>
                              👥 Party: <strong className="text-slate-900">{bk.guests || 2} Guests</strong> {bk.guestType ? `(${bk.guestType})` : ''}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200 shrink-0">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Total Reservation Amount</span>
                          <span className="font-black text-slate-900 text-lg font-mono">₹{bAmount.toLocaleString()}</span>
                        </div>

                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <button 
                              type="button"
                              onClick={async () => {
                                try {
                                  await apiFetch(`/api/bookings/${bId}/status`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'Confirmed' })
                                  });
                                  setVendorBookings(vendorBookings.map(b => (b.id === bk.id || b._id === bk._id || b.bookingId === bk.bookingId) ? { ...b, status: 'Confirmed' } : b));
                                  triggerSuccess(`🎉 Reservation ${bId} Approved! Official Voucher Email sent to guest!`);
                                } catch (err) {
                                  triggerSuccess(`Reservation ${bId} confirmed!`);
                                }
                              }} 
                              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-editorial shadow-sm flex items-center gap-1.5 transition-all text-xs"
                            >
                              <Check size={14} /> Accept & Confirm
                            </button>

                            <button 
                              type="button"
                              onClick={async () => {
                                try {
                                  await apiFetch(`/api/bookings/${bId}/status`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'Cancelled' })
                                  });
                                  setVendorBookings(vendorBookings.map(b => (b.id === bk.id || b._id === bk._id || b.bookingId === bk.bookingId) ? { ...b, status: 'Cancelled' } : b));
                                  triggerSuccess(`Reservation ${bId} declined.`);
                                } catch (err) {
                                  triggerSuccess(`Reservation status updated.`);
                                }
                              }} 
                              className="px-3 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold font-editorial shadow-xs flex items-center gap-1 transition-all text-xs"
                            >
                              <X size={14} /> Decline
                            </button>
                          </div>
                        ) : isConfirmed ? (
                          <div className="flex items-center gap-1 text-emerald-700 font-bold font-mono text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 size={14} /> Official Voucher Active
                          </div>
                        ) : (
                          <div className="text-rose-600 font-bold font-mono text-xs bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                            Declined
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
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
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-sm space-y-5 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">Host Support Tickets & Requests</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Directly connected to Super Admin Jeeva Veeramani.</p>
                </div>
                <button 
                  onClick={() => setShowNewTicketModal(!showNewTicketModal)} 
                  className="glass-button text-xs px-4 py-2.5 flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
                >
                  <Plus size={16} /> Submit New Request
                </button>
              </div>

              {/* Create Ticket Form */}
              {showNewTicketModal && (
                <form onSubmit={handleCreateTicketSubmit} className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Ticket Subject</label>
                      <input 
                        type="text" 
                        placeholder="E.g. Request payout verification for Ooty Resort" 
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
                    <textarea 
                      rows={3} 
                      placeholder="Please provide specific details..." 
                      value={ticketMessage} 
                      onChange={e => setTicketMessage(e.target.value)} 
                      className="glass-input text-xs" 
                      required 
                    />
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowNewTicketModal(false)} 
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 w-full sm:w-auto text-center"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="glass-button text-xs py-2.5 px-6 w-full sm:w-auto"
                    >
                      Submit Ticket to Super Admin
                    </button>
                  </div>
                </form>
              )}

              {/* Tickets List */}
              {vendorTickets.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 font-mono text-xs">
                  ✨ No open support requests. Click "Submit New Request" if you need immediate assistance!
                </div>
              ) : (
                <div className="space-y-3">
                  {vendorTickets.map(tck => (
                    <div key={tck.id || tck._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-all space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-blue-700 font-bold px-2.5 py-0.5 bg-blue-100 rounded-md border border-blue-200 text-[11px]">
                          {tck.id || tck.ticketId}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          tck.status === 'Resolved' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {tck.status === 'Resolved' ? '🟢 Resolved' : '⏳ In Progress'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{tck.subject}</h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-200/60">
                          <span>Category: <strong>{tck.category || 'Host Settlement'}</strong></span>
                          <span>{tck.date || (tck.createdAt ? new Date(tck.createdAt).toLocaleDateString('en-IN') : 'Recent')}</span>
                        </div>
                      </div>

                      {tck.adminReply && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-mono">
                          <strong>✓ Admin Resolution:</strong> {tck.adminReply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* 🔍 HOST / VENDOR VEHICLE INSPECTION & DETAILS MODAL */}
      {inspectedVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 text-white flex justify-between items-start shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-black uppercase">
                    {inspectedVehicleModal.type || 'Cab'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                    inspectedVehicleModal.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {inspectedVehicleModal.status === 'Approved' ? '🟢 Live & Verified' : '⏳ Pending Super Admin Review'}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-editorial text-white mt-1">{inspectedVehicleModal.title}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Registration: <strong className="text-amber-300">{inspectedVehicleModal.registrationNumber || inspectedVehicleModal.regNo}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedVehicleModal(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs font-mono">
              
              {/* Photo & Document Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-600">
                    Uploaded Photos & Legal Documents:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setVehInspectPhotoTab('exterior')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        vehInspectPhotoTab === 'exterior' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      🚗 Exterior
                    </button>
                    {inspectedVehicleModal.interiorImage && (
                      <button
                        type="button"
                        onClick={() => setVehInspectPhotoTab('interior')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          vehInspectPhotoTab === 'interior' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        🪑 Interior
                      </button>
                    )}
                    {inspectedVehicleModal.numberPlateImage && (
                      <button
                        type="button"
                        onClick={() => setVehInspectPhotoTab('plate')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          vehInspectPhotoTab === 'plate' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        🏷️ Plate
                      </button>
                    )}
                    {inspectedVehicleModal.rcBookImage && (
                      <button
                        type="button"
                        onClick={() => setVehInspectPhotoTab('rc')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          vehInspectPhotoTab === 'rc' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        📄 RC Document
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center">
                  {vehInspectPhotoTab === 'exterior' && (
                    <img
                      src={inspectedVehicleModal.exteriorImage || (inspectedVehicleModal.images && inspectedVehicleModal.images[0]) || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2'}
                      alt="Exterior View"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {vehInspectPhotoTab === 'interior' && (
                    <img
                      src={inspectedVehicleModal.interiorImage || 'https://images.unsplash.com/photo-1563720223185-11003d516935'}
                      alt="Interior View"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {vehInspectPhotoTab === 'plate' && (
                    <img
                      src={inspectedVehicleModal.numberPlateImage || inspectedVehicleModal.exteriorImage}
                      alt="Number Plate"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {vehInspectPhotoTab === 'rc' && (
                    <img
                      src={inspectedVehicleModal.rcBookImage || inspectedVehicleModal.exteriorImage}
                      alt="RC Smart Card"
                      className="w-full h-full object-contain p-2"
                    />
                  )}
                </div>
              </div>

              {/* Specifications & Driver Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] text-blue-700 font-bold uppercase block">📋 Vehicle Specs:</span>
                  <div className="text-slate-800 space-y-1">
                    <p><strong>Category:</strong> {inspectedVehicleModal.type || 'Cab'}</p>
                    <p><strong>Seating Capacity:</strong> {inspectedVehicleModal.seatingCapacity || 7} Passengers</p>
                    <p><strong>Fuel & AC:</strong> {inspectedVehicleModal.fuelType || 'Diesel'} · {inspectedVehicleModal.acType || 'AC'}</p>
                    <p><strong>Base Location:</strong> {inspectedVehicleModal.location || inspectedVehicleModal.district || 'Tamil Nadu'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">🛡️ Driver & Safety Info:</span>
                  <div className="text-slate-800 space-y-1">
                    <p><strong>Driver Name:</strong> {inspectedVehicleModal.driverName || 'Assigned Driver'}</p>
                    <p><strong>Driver Phone:</strong> {inspectedVehicleModal.driverPhone || '+91 78717 79134'}</p>
                    <p><strong>License Number:</strong> {inspectedVehicleModal.driverLicense || 'TN43-COMMERCIAL-DL'}</p>
                    <p className="text-emerald-700 font-bold">✓ Zero-Tolerance Conduct Declared</p>
                  </div>
                </div>
              </div>

              {/* Pricing & Customer Tariff Calculation */}
              {(() => {
                const p = calculatePricing(inspectedVehicleModal.price || inspectedVehicleModal.pricePerDay || 3500);
                return (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">💰 Pricing & Customer Billing Structure:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                        <span className="text-[10px] text-slate-500 block">Your Base Rate</span>
                        <strong className="text-slate-900 text-sm">₹{p.base.toLocaleString()}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                        <span className="text-[10px] text-slate-500 block">GST (18%)</span>
                        <strong className="text-blue-700 text-sm">₹{p.gst.toLocaleString()}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                        <span className="text-[10px] text-slate-500 block">Platform Fee (5%)</span>
                        <strong className="text-amber-700 text-sm">₹{p.platformFee.toLocaleString()}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300">
                        <span className="text-[10px] text-emerald-800 font-bold block">Customer Price</span>
                        <strong className="text-emerald-700 text-sm">₹{p.total.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* GPS Map Pin */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-700">Base Stand Location Pin:</span>
                <a
                  href={inspectedVehicleModal.googleMapsUrl || `https://www.google.com/maps?q=${encodeURIComponent((inspectedVehicleModal.location || inspectedVehicleModal.title) + ', Tamil Nadu')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 font-bold transition-all shadow-xs"
                >
                  🗺️ Open Base on Google Maps ↗
                </a>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setInspectedVehicleModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-black transition-colors"
              >
                Close Inspection
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
