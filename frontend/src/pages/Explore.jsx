import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star, 
  Sparkles, 
  Building2, 
  ChevronRight,
  X,
  CreditCard,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  Home as HomeIcon,
  Receipt,
  Info,
  Check,
  ArrowRight,
  Clock,
  Sparkle,
  Download,
  Share2,
  Copy,
  Send,
  FolderDown,
  Smartphone,
  Mail,
  Heart,
  Wifi,
  Coffee,
  Car,
  Flame,
  Tv,
  Bath,
  Shield,
  Award,
  ThumbsUp,
  ChevronLeft,
  Bed,
  Utensils
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { BACKEND_API } from '../config/api';
import { getWithSWR } from '../utils/cache';
import { StayCardSkeleton } from '../components/common/SkeletonCard';
import { downloadBookingReceiptPDF } from '../utils/receiptGenerator';
import { getGoogleMapsUrl, openGoogleMaps } from '../utils/mapsHelper';
import { calculatePricing } from '../utils/pricing';
import { loadRazorpay } from '../utils/razorpay';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80';

// Curated verified stays fallback (Only manual/database entries will be displayed)
const DEFAULT_FEATURED_STAYS = [];

export default function Explore({ onOpenAuth }) {
  const { currentUser } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const districtParam = searchParams.get('district') || searchParams.get('location') || 'All';
  const typeParam = searchParams.get('type') || 'All';
  const searchParam = searchParams.get('search') || '';

  const [district, setDistrict] = useState(districtParam);
  const [stayType, setStayType] = useState(typeParam);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [liveProperties, setLiveProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Sync URL query params if they change
  useEffect(() => {
    if (districtParam && districtParam !== 'All') {
      setDistrict(districtParam);
    }
    if (typeParam && typeParam !== 'All') {
      setStayType(typeParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [districtParam, typeParam, searchParam]);

  // 🎟️ Advanced Booking Modal States
  const [selectedStayForBooking, setSelectedStayForBooking] = useState(null);
  
  // Date selection (Defaults to today & tomorrow)
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);

  // Guest configuration: 'single' | 'couple' | 'family' | 'group'
  const [guestType, setGuestType] = useState('couple');
  const [familyAdults, setFamilyAdults] = useState(2);
  const [familyChildren, setFamilyChildren] = useState(1);
  const [groupAdults, setGroupAdults] = useState(6);
  const [groupChildren, setGroupChildren] = useState(0);

  // Booking process states
  const [bookingGuestName, setBookingGuestName] = useState('');
  const [bookingGuestEmail, setBookingGuestEmail] = useState('');
  const [bookingGuestPhone, setBookingGuestPhone] = useState('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [customUpiId, setCustomUpiId] = useState('jeeva@oksbi');

  // Active Share / Save Stay Pass Modal State
  const [shareModalBooking, setShareModalBooking] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // 🏡 Full Property Details Showcase Modal State
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState(null);
  const [activeGalleryImg, setActiveGalleryImg] = useState(0);

  // ❤️ Wishlist / Favourites State
  const [wishlist, setWishlist] = useState(() => {
    try {
      const email = currentUser?.email?.toLowerCase();
      const saved = email ? localStorage.getItem(`etn_wishlist_${email}`) : localStorage.getItem('etn_saved_properties');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [wishlistNotification, setWishlistNotification] = useState({ show: false, message: '', isAdded: false });

  const isStayWishlisted = (stay) => {
    if (!stay) return false;
    const sId = stay._id || stay.id;
    return wishlist.some(item => (item._id === sId || item.id === sId));
  };

  const toggleWishlist = (stay) => {
    if (!stay) return;
    const sId = stay._id || stay.id;
    let updated;
    const exists = wishlist.some(item => (item._id === sId || item.id === sId));
    if (exists) {
      updated = wishlist.filter(item => item._id !== sId && item.id !== sId);
      setWishlistNotification({ show: true, message: `Removed "${stay.title}" from your Favourites`, isAdded: false });
    } else {
      updated = [stay, ...wishlist];
      setWishlistNotification({ show: true, message: `Added "${stay.title}" to your Favourites!`, isAdded: true });
    }
    setWishlist(updated);
    try {
      const email = currentUser?.email?.toLowerCase();
      if (email) {
        localStorage.setItem(`etn_wishlist_${email}`, JSON.stringify(updated));
      }
      localStorage.setItem('etn_saved_properties', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('etn_wishlist_updated', { detail: updated }));
    } catch (e) {}

    setTimeout(() => setWishlistNotification({ show: false, message: '', isAdded: false }), 3000);
  };

  // 📸 Multi-photo gallery generator
  const getPropertyGallery = (stay) => {
    if (!stay) return [FALLBACK_IMAGE];
    const primary = (stay.images && stay.images[0]) || stay.image || FALLBACK_IMAGE;
    if (stay.images && Array.isArray(stay.images) && stay.images.length > 1) {
      return stay.images;
    }
    return [
      primary,
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
    ];
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
    const guestName = bk.customerName || bk.userName || bookingGuestName || 'Tourist Guest';

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
        alert('Stay pass successfully saved to your File Explorer folder!');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
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
      alert('Stay pass saved to your Downloads/Files folder!');
    } catch (e) {
      alert('Error saving stay pass file.');
    }
  };

  // 📋 Copy Stay Pass to Clipboard
  const handleCopyShareText = (bk) => {
    const text = getShareMessage(bk);
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    });
  };

  const destinationOptions = [
    'All Tamil Nadu',
    'Nilgiris (Ooty & Coonoor)',
    'Kodaikanal (Princess of Hills)',
    'Thanjavur & Chettinad',
    'Mahabalipuram (Mamallapuram / ECR)',
    'Yercaud (Jewel of Shevaroy Hills)',
    'Kanyakumari (Oceanfront)',
    'Rameswaram (Pamban Island)',
    'Valparai & Pollachi (Anamalai)',
    'Madurai (Meenakshi Heritage)'
  ];

  const areaCircuits = [
    { id: 'All', label: 'All Particular Areas', icon: '✨' },
    { id: 'Nilgiris (Ooty & Coonoor)', label: 'Nilgiris (Ooty & Coonoor)', icon: '⛰️' },
    { id: 'Kodaikanal (Princess of Hills)', label: 'Kodaikanal', icon: '🌲' },
    { id: 'Thanjavur & Chettinad', label: 'Thanjavur & Chettinad', icon: '🛕' },
    { id: 'Mahabalipuram (Mamallapuram / ECR)', label: 'Mahabalipuram / ECR', icon: '🏖️' },
    { id: 'Yercaud (Jewel of Shevaroy Hills)', label: 'Yercaud (Shevaroys)', icon: '🏞️' },
    { id: 'Kanyakumari (Oceanfront)', label: 'Kanyakumari', icon: '🌊' },
    { id: 'Rameswaram (Pamban Island)', label: 'Rameswaram Island', icon: '🏝️' },
    { id: 'Valparai & Pollachi (Anamalai)', label: 'Valparai (Anamalai)', icon: '🌿' },
    { id: 'Madurai (Meenakshi Heritage)', label: 'Madurai Heritage', icon: '🏛️' }
  ];

  const stayCategories = [
    { name: 'All', label: 'All Stays & Resorts', icon: '✨' },
    { name: 'Resort', label: 'Luxury Resort', icon: '🏰' },
    { name: 'Lakeview Resort', label: 'Lakeview Resort', icon: '🏞️' },
    { name: 'Mountain View Resort', label: 'Mountain View Resort', icon: '⛰️' },
    { name: 'Beachfront Resort', label: 'Beachfront Resort', icon: '🏖️' },
    { name: 'River View Resort', label: 'River View Resort', icon: '🌊' },
    { name: 'Heritage Palace', label: 'Heritage Palace & Villa', icon: '🏛️' },
    { name: 'Heritage Cottage', label: 'Heritage Cottage', icon: '🛖' },
    { name: 'Packages', label: 'Property Packages', icon: '🎁', isComingSoon: true }
  ];

  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('token') || currentUser?.token || '';
    const headers = new Headers(options.headers || {});
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const cleanPath = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
    const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_API}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    try {
      const res = await fetch(url, { ...options, headers });
      if (res.ok || res.status === 400 || res.status === 401 || res.status === 403) {
        return res;
      }
    } catch (e) {
      console.warn('Direct backend API fetch error:', e.message);
    }
    return await fetch(endpoint, { ...options, headers });
  }, [currentUser?.token]);

  // Filter strictly admitted properties (no demo entries, only approved/accepted)
  const filterAdmittedProperties = (list) => {
    if (!Array.isArray(list)) return [];
    const map = new Map();
    list.forEach(p => {
      if (!p) return;
      const st = String(p.status || '').toLowerCase().trim();
      const isApproved = st === 'approved' || st === 'accepted';
      const isDemo = String(p._id || p.id || '').startsWith('demo-') || String(p._id || p.id || '').startsWith('stay-');
      if (isApproved && !isDemo) {
        const key = `${(p.title || '').toLowerCase().trim()}_${(p.district || p.location || '').toLowerCase().trim()}`;
        if (!map.has(key)) {
          map.set(key, p);
        }
      }
    });
    return Array.from(map.values());
  };

  // Fetch approved properties from MongoDB Atlas with SWR 0ms caching
  const fetchProperties = useCallback(async () => {
    try {
      setFetchError(null);
      const data = await getWithSWR('properties_catalog', async () => {
        const res = await apiFetch('/api/properties?limit=50');
        if (res && res.ok) {
          const raw = await res.json();
          if (Array.isArray(raw)) return raw;
          if (raw && Array.isArray(raw.data)) return raw.data;
        }
        return [];
      }, {
        ttlMs: 30000,
        onUpdate: (freshData) => {
          const list = Array.isArray(freshData) ? freshData : (freshData?.data || []);
          if (Array.isArray(list)) {
            setLiveProperties(filterAdmittedProperties(list));
          }
        }
      });

      const list = Array.isArray(data) ? data : (data?.data || []);
      if (Array.isArray(list) && list.length > 0) {
        setLiveProperties(filterAdmittedProperties(list));
      } else {
        setLiveProperties([]);
      }
    } catch (err) {
      console.warn('Properties fetch notice:', err.message);
      setFetchError(err.message || 'Unable to load stays at this moment.');
      setLiveProperties([]);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchProperties();
    socket.on('new_property', handleUpdate);
    socket.on('property_updated', handleUpdate);
    return () => {
      socket.off('new_property', handleUpdate);
      socket.off('property_updated', handleUpdate);
    };
  }, [socket, fetchProperties]);

  // 🧮 CALCULATE NIGHTS AND LIVE PRICE BREAKDOWN (+18% GST + 5% Service Fee)
  const calculateNights = () => {
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();

  // Compute Total Guests, Adults, Children
  const getGuestDetails = () => {
    if (guestType === 'single') return { adults: 1, children: 0, total: 1, label: 'Single (1 Adult)' };
    if (guestType === 'couple') return { adults: 2, children: 0, total: 2, label: 'Couple (2 Adults)' };
    if (guestType === 'family') {
      const ad = Number(familyAdults) || 2;
      const ch = Number(familyChildren) || 0;
      return { adults: ad, children: ch, total: ad + ch, label: `Family (${ad} Adults, ${ch} Children)` };
    }
    if (guestType === 'group') {
      const ad = Number(groupAdults) || 4;
      const ch = Number(groupChildren) || 0;
      return { adults: ad, children: ch, total: ad + ch, label: `Group (${ad} Adults, ${ch} Children)` };
    }
    return { adults: 2, children: 0, total: 2, label: '2 Guests' };
  };

  const guestDetails = getGuestDetails();

  // Base nightly rate from owner
  const nightlyRate = Number(selectedStayForBooking?.pricePerNight || selectedStayForBooking?.price || 4800);
  const basePriceTotal = nightlyRate * nights;

  // 18% GST & 5% Platform Service Fee
  const gstAmount = Math.round(basePriceTotal * 0.18);
  const serviceFee = Math.round(basePriceTotal * 0.05);
  const grandTotalAmount = basePriceTotal + gstAmount + serviceFee;

  // Handle Opening Booking Modal
  const handleOpenBookingModal = (stay) => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    setSelectedStayForBooking(stay);
    setBookingGuestName(currentUser.name || 'Tourist Traveler');
    setBookingGuestEmail(currentUser.email || '');
    setBookingGuestPhone(currentUser.phone || '+91 78717 79134');
    setConfirmedBookingDetails(null);
    setShowPaymentOptions(false);
    setIsProcessingPayment(false);
    setIsAvailable(true);
  };

  // 💳 Razorpay Official Checkout Gateway SDK Trigger
  const handlePayWithRazorpay = async () => {
    setIsProcessingPayment(true);
    const bookingId = `ETN-BK-${Math.floor(100000 + Math.random() * 900000)}`;

    const targetCustomerEmail = (bookingGuestEmail || currentUser?.email || 'exploretamizhagam@gmail.com').trim().toLowerCase();
    const targetCustomerName = (bookingGuestName || currentUser?.name || 'Tourist Traveler').trim();
    const targetCustomerPhone = (bookingGuestPhone || currentUser?.phone || '+91 78717 79134').trim();

    const finalizeBooking = async (rzpPaymentId) => {
      const paymentId = rzpPaymentId || `pay_rzp_${Date.now().toString().slice(-8)}`;

      const bookingPayload = {
        bookingId,
        userEmail: targetCustomerEmail,
        customerEmail: targetCustomerEmail,
        userName: targetCustomerName,
        customerName: targetCustomerName,
        userPhone: targetCustomerPhone,
        customerPhone: targetCustomerPhone,
        itemTitle: selectedStayForBooking.title,
        propertyTitle: selectedStayForBooking.title,
        propertyId: selectedStayForBooking._id || selectedStayForBooking.id,
        destination: selectedStayForBooking.district || selectedStayForBooking.location || 'Tamil Nadu',
        ownerName: selectedStayForBooking.ownerName || selectedStayForBooking.hostName || 'Property Host',
        ownerEmail: selectedStayForBooking.ownerEmail || 'lastzetas@gmail.com',
        checkIn: checkInDate,
        checkInDate: checkInDate,
        checkOut: checkOutDate,
        checkOutDate: checkOutDate,
        nights: nights,
        guestType: guestType,
        adults: guestDetails.adults,
        children: guestDetails.children,
        guests: guestDetails.total,
        baseRate: basePriceTotal,
        gstAmount: gstAmount,
        serviceFee: serviceFee,
        totalAmount: grandTotalAmount,
        amount: grandTotalAmount,
        paymentId: paymentId,
        paymentMethod: 'Razorpay Payment Gateway (UPI / Cards / NetBanking)',
        paymentStatus: 'Paid',
        status: 'Confirmed',
        bookingType: 'property',
        type: 'stay',
        createdAt: new Date().toISOString()
      };

      try {
        const res = await apiFetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload)
        });
        const data = (res && res.ok) ? await res.json() : null;
        const saved = data?.booking || data || bookingPayload;
        
        try {
          const savedRaw = localStorage.getItem('etn_user_bookings');
          const list = savedRaw ? JSON.parse(savedRaw) : [];
          const updatedList = [saved, ...list.filter(b => (b.bookingId || b.id || b._id) !== (saved.bookingId || bookingId))];
          localStorage.setItem('etn_user_bookings', JSON.stringify(updatedList));
          localStorage.setItem('etn_saved_bookings', JSON.stringify(updatedList));
          window.dispatchEvent(new CustomEvent('etn_booking_created', { detail: saved }));
        } catch (e) {}

        setConfirmedBookingDetails(saved);
      } catch (err) {
        try {
          const savedRaw = localStorage.getItem('etn_user_bookings');
          const list = savedRaw ? JSON.parse(savedRaw) : [];
          const updatedList = [bookingPayload, ...list.filter(b => (b.bookingId || b.id) !== bookingId)];
          localStorage.setItem('etn_user_bookings', JSON.stringify(updatedList));
          window.dispatchEvent(new CustomEvent('etn_booking_created', { detail: bookingPayload }));
        } catch (e) {}
        setConfirmedBookingDetails(bookingPayload);
      } finally {
        setIsProcessingPayment(false);
      }
    };

    // 1. Fetch Razorpay Test Key from Environment or Backend
    let razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TSUXQsWdKXG6jc';
    let rzpOrderId = '';

    try {
      const orderRes = await apiFetch('/api/payment/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotalAmount,
          currency: 'INR',
          receipt: bookingId
        })
      });
      if (orderRes && orderRes.keyId) {
        razorpayKey = orderRes.keyId;
        rzpOrderId = orderRes.orderId;
      }
    } catch (e) {
      console.warn('Razorpay order backend init notice:', e.message);
    }

    // 2. Open Official Razorpay Checkout Modal (Dynamically loaded on demand)
    const isLoaded = await loadRazorpay();
    if (isLoaded && typeof window !== 'undefined' && window.Razorpay) {
      try {
        const options = {
          key: razorpayKey,
          amount: grandTotalAmount * 100, // in paise
          currency: 'INR',
          name: 'Explore Tamil Nadu',
          description: `${selectedStayForBooking.title} - ${nights} Night(s) Stay`,
          image: selectedStayForBooking.image || selectedStayForBooking.images?.[0] || 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=300&q=80',
          order_id: rzpOrderId || undefined,
          handler: async function (response) {
            const capturedId = response.razorpay_payment_id || `pay_rzp_${Date.now().toString().slice(-8)}`;
            await finalizeBooking(capturedId);
          },
          prefill: {
            name: targetCustomerName,
            email: targetCustomerEmail,
            contact: targetCustomerPhone
          },
          notes: {
            bookingId: bookingId,
            property: selectedStayForBooking.title,
            checkIn: checkInDate,
            checkOut: checkOutDate
          },
          theme: {
            color: '#061833'
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          console.warn('Razorpay payment failed callback:', resp.error);
          setIsProcessingPayment(false);
        });
        rzp.open();
        return;
      } catch (err) {
        console.warn('Direct Razorpay modal launch error:', err.message);
      }
    }

    // 3. Fallback direct confirmation if window.Razorpay is blocked
    await finalizeBooking(`pay_rzp_test_${Date.now().toString().slice(-8)}`);
  };

  // Filtered Properties List
  const displayedProperties = liveProperties.filter(stay => {
    const sType = String(stay.type || stay.propertyType || '').toLowerCase();
    const sDistrict = String(stay.district || stay.location || stay.city || '').toLowerCase();
    const sTitle = String(stay.title || stay.name || '').toLowerCase();
    const sDesc = String(stay.desc || stay.description || '').toLowerCase();

    let matchesDistrict = true;
    if (district !== 'All' && district !== 'All Tamil Nadu') {
      const dLower = district.toLowerCase();
      if (dLower.includes('ooty') || dLower.includes('nilgiri') || dLower.includes('coonoor')) {
        matchesDistrict = sDistrict.includes('ooty') || sDistrict.includes('nilgiri') || sDistrict.includes('coonoor') || sTitle.includes('ooty') || sTitle.includes('nilgiri');
      } else if (dLower.includes('kodai')) {
        matchesDistrict = sDistrict.includes('kodai') || sTitle.includes('kodai');
      } else if (dLower.includes('thanjavur') || dLower.includes('tanjore') || dLower.includes('chettinad')) {
        matchesDistrict = sDistrict.includes('thanjavur') || sDistrict.includes('tanjore') || sDistrict.includes('chettinad') || sDistrict.includes('pudukkottai') || sDistrict.includes('cauvery') || sTitle.includes('cauvery') || sTitle.includes('chettinad') || sTitle.includes('thanjavur');
      } else if (dLower.includes('mahabalipuram') || dLower.includes('mamallapuram') || dLower.includes('ecr')) {
        matchesDistrict = sDistrict.includes('mahabalipuram') || sDistrict.includes('mamallapuram') || sDistrict.includes('ecr') || sTitle.includes('mahabalipuram') || sTitle.includes('bay of bengal');
      } else if (dLower.includes('yercaud') || dLower.includes('shevaroy')) {
        matchesDistrict = sDistrict.includes('yercaud') || sDistrict.includes('shevaroy') || sTitle.includes('yercaud') || sTitle.includes('shevaroy');
      } else if (dLower.includes('kanyakumari')) {
        matchesDistrict = sDistrict.includes('kanyakumari') || sTitle.includes('kanyakumari') || sTitle.includes('cape comorin');
      } else if (dLower.includes('rameswaram') || dLower.includes('pamban')) {
        matchesDistrict = sDistrict.includes('rameswaram') || sDistrict.includes('pamban') || sTitle.includes('rameswaram') || sTitle.includes('pamban');
      } else if (dLower.includes('valparai') || dLower.includes('pollachi') || dLower.includes('anamalai')) {
        matchesDistrict = sDistrict.includes('valparai') || sDistrict.includes('anamalai') || sDistrict.includes('pollachi') || sTitle.includes('valparai') || sTitle.includes('anamalai');
      } else if (dLower.includes('madurai') || dLower.includes('pasumalai')) {
        matchesDistrict = sDistrict.includes('madurai') || sDistrict.includes('pasumalai') || sTitle.includes('madurai');
      } else {
        matchesDistrict = sDistrict.includes(district.split(' ')[0].toLowerCase());
      }
    }

    const matchesType = (stayType === 'All' || sType.includes(stayType.toLowerCase()));
    const matchesQuery = !searchQuery || sTitle.includes(searchQuery.toLowerCase()) || sDesc.includes(searchQuery.toLowerCase()) || sDistrict.includes(searchQuery.toLowerCase());

    return matchesDistrict && matchesType && matchesQuery;
  });

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-[#f9f5f2] via-[#f5efe9] to-[#eee8e0]">
      
      {/* 🧭 HEADING & SEARCH CONSOLE SECTION */}
      <section className="pt-6 sm:pt-14 pb-6 sm:pb-8 px-3 sm:px-4 text-center">
        <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#242429] text-white text-[9px] sm:text-xs font-fira-mono font-bold shadow-md">
            <Sparkles size={12} className="text-amber-400" />
            <span>✨ PREMIUM & FEATURED STAYS & LUXURY RESORTS</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-editorial font-extrabold text-[#000000] tracking-tight leading-tight">
            Exclusive Luxury Stays & Resorts
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 font-editorial max-w-2xl mx-auto leading-relaxed">
            Discover verified 5-star mountain villas, lakeview estates, riverfront heritage resorts, and beachfront suites in specific Tamil Nadu circuits.
          </p>

          {/* 🔍 SEARCH CONSOLE: DESTINATION CIRCUIT | STAY OPTIONS | SEARCH STAYS */}
          <div className="mt-4 sm:mt-6 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border border-[#242429]/20 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-left">
            
            {/* 1. Destination Circuit */}
            <div>
              <label className="block font-fira-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1 flex items-center gap-1">
                <MapPin size={11} className="text-rose-600" /> Destination Circuit
              </label>
              <select 
                value={district} 
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-300 text-xs font-fira-mono font-bold text-black focus:ring-2 focus:ring-black outline-hidden cursor-pointer"
              >
                {destinationOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* 2. All Stay Options */}
            <div>
              <label className="block font-fira-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1 flex items-center gap-1">
                <HomeIcon size={11} className="text-cyan-700" /> Stay / Resort Type
              </label>
              <select 
                value={stayType} 
                onChange={(e) => setStayType(e.target.value)}
                className="w-full p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-300 text-xs font-fira-mono font-bold text-black focus:ring-2 focus:ring-black outline-hidden cursor-pointer"
              >
                {stayCategories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>

            {/* 3. Search Stays Button */}
            <div className="flex items-end">
              <button 
                type="button"
                onClick={() => {
                  const el = document.getElementById('verified-properties-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full h-[40px] sm:h-[48px] rounded-xl sm:rounded-2xl bg-[#242429] text-white hover:bg-black text-xs font-bold font-editorial flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Search size={14} /> Search Stays ({displayedProperties.length})
              </button>
            </div>

          </div>

          {/* Quick Stay Option Category Pills */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 pt-2 sm:justify-center sm:flex-wrap no-scrollbar px-1">
            {stayCategories.map(cat => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setStayType(cat.name)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-fira-mono font-bold flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                  stayType === cat.name 
                    ? 'bg-[#242429] text-white ring-2 ring-black/20' 
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {cat.isComingSoon && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[8px] font-mono font-extrabold uppercase">
                    SOON
                  </span>
                )}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 🏡 VERIFIED PROPERTIES: ALL PROPERTIES LISTED UNDER HEADING */}
      <section id="verified-properties-grid" className="max-w-7xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4">
        
        {/* 📍 PARTICULAR AREA CIRCUIT QUICK SELECTOR BAR */}
        <div className="mb-4 sm:mb-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#242429]/15 shadow-sm space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-fira-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <MapPin size={13} className="text-rose-600 shrink-0" /> Click A Particular Area Circuit:
            </span>
            <span className="text-xs font-editorial font-extrabold text-black">
              {district === 'All' || district === 'All Tamil Nadu' ? '✨ Showing Stays Across All Tamil Nadu Areas' : `📍 Exact Stays in ${district} (${displayedProperties.length})`}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar flex-nowrap">
            {areaCircuits.map(circuit => {
              const isSelected = (circuit.id === 'All' && (district === 'All' || district === 'All Tamil Nadu')) || district === circuit.id || district.includes(circuit.id);
              return (
                <button
                  key={circuit.id}
                  type="button"
                  onClick={() => setDistrict(circuit.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-editorial font-bold flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-[#242429] text-white ring-2 ring-black/20 scale-[1.02]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                  }`}
                >
                  <span>{circuit.icon}</span>
                  <span>{circuit.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-[#242429]/15 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-fira-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                ✓ FEATURED & PREMIUM VERIFIED
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                ({displayedProperties.length} Properties in {district === 'All' || district === 'All Tamil Nadu' ? 'Tamil Nadu' : district})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-editorial font-bold text-black mt-1">
              {district === 'All' || district === 'All Tamil Nadu' ? 'Curated Luxury Stays & Resort Catalog' : `Exact Stays & Resorts in ${district}`}
            </h2>
          </div>

          {/* Active Filter Indicators */}
          {((district !== 'All' && district !== 'All Tamil Nadu') || stayType !== 'All') && (
            <button
              type="button"
              onClick={() => { setDistrict('All'); setStayType('All'); }}
              className="text-xs font-mono font-bold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 w-fit cursor-pointer"
            >
              <X size={12} /> Clear Filter ({district !== 'All' && district !== 'All Tamil Nadu' ? district : ''} {stayType !== 'All' ? `· ${stayType}` : ''})
            </button>
          )}
        </div>

        {/* Error State Banner with Retry */}
        {fetchError && !loading && liveProperties.length === 0 && (
          <div className="p-8 my-6 rounded-3xl bg-rose-50 border border-rose-200 text-center max-w-xl mx-auto shadow-sm space-y-3">
            <div className="text-rose-700 font-editorial font-bold text-lg">
              ⚠️ Unable to Load Properties
            </div>
            <p className="text-xs text-rose-600 font-mono">
              {fetchError}
            </p>
            <button
              type="button"
              onClick={() => { setLoading(true); fetchProperties(); }}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-editorial text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Property Packages Coming Soon Card */}
        {stayType === 'Packages' ? (
          <div className="p-8 sm:p-12 my-6 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border border-amber-300 text-center max-w-3xl mx-auto shadow-md space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-[10px] sm:text-xs font-mono font-bold shadow-xs">
              <Sparkles size={13} className="text-amber-700 animate-pulse" />
              <span>🎁 ALL-INCLUSIVE PROPERTY & TOUR PACKAGES · AVAILABLE SOON</span>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-editorial font-bold text-black tracking-tight">
              Curated All-Inclusive Stays, Native Guides & Cabs
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 font-editorial max-w-xl mx-auto leading-relaxed">
              We are handcrafting complete all-inclusive multi-day travel packages combining <strong>verified 5-star stays</strong>, <strong>licensed native tour guides</strong>, and <strong>private chauffeur transport</strong> across all Tamil Nadu circuits.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/packages')}
                className="px-6 py-3 rounded-2xl bg-[#242429] text-white hover:bg-black font-editorial font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Preview Upcoming Packages</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => setStayType('All')}
                className="px-5 py-3 rounded-2xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-editorial font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <span>View Admitted Stays Now</span>
              </button>
            </div>
          </div>
        ) : loading && liveProperties.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <StayCardSkeleton key={n} />
            ))}
          </div>
        ) : displayedProperties.length === 0 ? (
          <div className="p-10 sm:p-14 text-center text-slate-500 rounded-3xl bg-white/90 border border-[#242429]/15 shadow-sm space-y-4 max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
              <Building2 size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 font-editorial">
                {district !== 'All' && district !== 'All Tamil Nadu'
                  ? `No Admitted Stays in ${district} Yet`
                  : 'No Admitted Properties Found'}
              </h3>
              <p className="text-xs text-slate-500 font-mono max-w-md mx-auto leading-relaxed">
                Only authenticated properties reviewed and admitted by Super Admin are showcased here.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setDistrict('All'); setStayType('All'); setSearchQuery(''); }}
                className="px-5 py-2.5 rounded-2xl bg-[#242429] text-white hover:bg-black text-xs font-bold font-editorial transition-all shadow-sm cursor-pointer"
              >
                View All Admitted Stays
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentUser?.role === 'owner' || currentUser?.role === 'vendor' || currentUser?.role === 'super_admin') {
                    navigate('/dashboard/vendor');
                  } else {
                    onOpenAuth ? onOpenAuth('register') : navigate('/register');
                  }
                }}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold font-editorial flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>➕</span>
                <span>List Your Property as Host</span>
              </button>
            </div>
          </div>
        ) : (
          /* Property Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {displayedProperties.map((stay) => {
              const stayPricing = calculatePricing(stay.pricePerNight || stay.price || 4800);
              const stayImg = (stay.images && stay.images[0]) || stay.image || FALLBACK_IMAGE;
              const stayAmenities = stay.amenities || ['Mountain View', 'Free WiFi', 'Private Balcony', 'Organic Dining'];
              
              return (
                <div 
                  key={stay._id || stay.id} 
                  onClick={() => {
                    setSelectedPropertyDetails(stay);
                    setActiveGalleryImg(0);
                  }}
                  className="group rounded-3xl bg-[#ffffff] border border-[#242429]/20 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer hover:border-black/40 hover:-translate-y-1"
                >
                  
                  {/* Top Image Container */}
                  <div className="relative h-56 sm:h-60 overflow-hidden bg-slate-100">
                    <img 
                      src={stayImg} 
                      alt={stay.title} 
                      onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    
                    {/* ❤️ TOP RIGHT: HEART / FAVOURITES BUTTON */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(stay);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border shadow-md transition-all z-10 cursor-pointer ${
                        isStayWishlisted(stay)
                          ? 'bg-rose-500 text-white border-rose-400 scale-110'
                          : 'bg-white/90 hover:bg-white text-slate-700 hover:text-rose-500 border-black/10'
                      }`}
                      title={isStayWishlisted(stay) ? 'Remove from Favourites' : 'Save to Favourites'}
                    >
                      <Heart 
                        size={16} 
                        className={isStayWishlisted(stay) ? 'fill-white text-white' : 'text-slate-700 hover:text-rose-500'} 
                      />
                    </button>

                    {/* Bottom Left: Property Type & Rating */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      <div className="bg-[#242429]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-fira-mono font-bold shadow-md">
                        {stay.type || stay.propertyType || 'RESORT'}
                      </div>
                      <div className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-full border border-black/15 shadow-md flex items-center gap-1 text-[10px] font-mono font-extrabold text-black">
                        <Star size={10} className="text-amber-500 fill-amber-500" />
                        <span>{stay.rating || '4.9'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    
                    <div className="space-y-2">
                      {/* Location with Google Maps Redirect */}
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 uppercase tracking-wider truncate">
                        <button
                          type="button"
                          onClick={(e) => openGoogleMaps(stay, e)}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 hover:underline cursor-pointer group/loc transition-colors truncate max-w-full"
                          title="Click to open exact location in Google Maps ↗"
                        >
                          <MapPin size={13} className="text-rose-600 shrink-0 group-hover/loc:scale-110 transition-transform" />
                          <span className="truncate">{stay.location} · {stay.district}</span>
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-0.5">
                            MAPS ↗
                          </span>
                        </button>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold font-editorial text-black leading-snug group-hover:text-blue-900 transition-colors line-clamp-2">
                        {stay.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 font-editorial line-clamp-2 leading-relaxed">
                        {stay.desc || stay.description || 'Experience authentic Tamil Nadu hospitality with serene hill views and luxury amenities.'}
                      </p>

                      {/* Amenities Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {stayAmenities.slice(0, 3).map((am, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700 font-medium"
                          >
                            ✓ {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pricing & Booking Button */}
                    <div className="pt-3 border-t border-[#242429]/15 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-base sm:text-lg font-black font-fira-mono text-black leading-none">
                          ₹{stayPricing.base.toLocaleString()}
                          <span className="text-[10px] font-mono text-slate-500 font-normal"> / NIGHT</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 block pt-0.5">
                          + 18% GST & 5% Service Fee at booking
                        </span>
                      </div>

                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenBookingModal(stay);
                        }}
                        className="px-3.5 sm:px-4 py-2 rounded-2xl bg-[#242429] text-white hover:bg-black text-xs font-bold font-editorial flex items-center gap-1 shadow-sm transition-all shrink-0 cursor-pointer"
                      >
                        Book Stay <ChevronRight size={13} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* ❤️ WISHLIST FLOATING TOAST NOTIFICATION */}
      {wishlistNotification.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-bold font-editorial backdrop-blur-md ${
            wishlistNotification.isAdded 
              ? 'bg-rose-500 text-white border-rose-400' 
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            <Heart size={16} className={wishlistNotification.isAdded ? 'fill-white' : ''} />
            <span>{wishlistNotification.message}</span>
          </div>
        </div>
      )}

      {/* 🏡 FULL PROPERTY DETAILS SHOWCASE MODAL */}
      {selectedPropertyDetails && (() => {
        const stay = selectedPropertyDetails;
        const gallery = getPropertyGallery(stay);
        const stayPrice = stay.pricePerNight || stay.price || 4800;
        const stayAmenities = stay.amenities || [
          'Panoramic Mountain & Valley View',
          'High-Speed Fiber Wi-Fi',
          'Private Sunrise Balcony Deck',
          'Traditional Tamil & Chettinad Dining',
          '24/7 Hot Water Geyser',
          '100% Power Backup',
          'Free Secure Vehicle Parking',
          'Campfire & Barbecue Setup',
          'King-Size Luxury Bedding',
          'Air Conditioning'
        ];

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-auto">
              
              {/* Header Bar */}
              <div className="bg-[#061833] text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        {stay.type || stay.propertyType || 'VERIFIED RESORT'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-300">
                        ⭐ {stay.reviews && stay.reviews.length > 0 ? `${stay.rating || '4.9'} (${stay.reviews.length} Reviews)` : 'Verified Listing'}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white truncate max-w-md mt-0.5">
                      {stay.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(stay)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isStayWishlisted(stay)
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title="Save to Favourites"
                  >
                    <Heart size={16} className={isStayWishlisted(stay) ? 'fill-white' : ''} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPropertyDetails(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
                
                {/* 1. Interactive Multi-Photo Gallery */}
                <div className="space-y-2">
                  <div className="relative h-60 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                    <img 
                      src={gallery[activeGalleryImg] || gallery[0]} 
                      alt={stay.title} 
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-mono font-bold flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-400" />
                      <span>Photo {activeGalleryImg + 1} of {gallery.length}</span>
                    </div>
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
                    {gallery.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveGalleryImg(idx)}
                        className={`relative h-16 w-20 sm:h-20 sm:w-28 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeGalleryImg === idx ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Key Highlights & Host Profile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <a
                    href={getGoogleMapsUrl(stay)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 hover:border-blue-400 flex items-center justify-between gap-3 transition-all group cursor-pointer"
                    title="Click to open exact location in Google Maps ↗"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        📍
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-blue-700 uppercase block">Location & District</span>
                        <p className="font-bold text-slate-900 text-xs truncate">{stay.location} · {stay.district}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-mono font-bold shrink-0 flex items-center gap-1 shadow-xs group-hover:bg-blue-700">
                      Maps ↗
                    </span>
                  </a>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                      🛡️
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Property Host</span>
                      <p className="font-bold text-slate-900 text-xs">{stay.ownerName || 'Property Host'}</p>
                      <span className="text-[10px] text-emerald-600 font-medium">⚡ Fast Response Rate</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0">
                      ⭐
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Guest Feedback</span>
                      <p className="font-bold text-slate-900 text-xs">
                        {stay.reviews && stay.reviews.length > 0 ? `${stay.rating || '4.9'} / 5.0 Rating` : 'Top Rated Stay'}
                      </p>
                      <span className="text-[10px] text-amber-700 font-medium">
                        {stay.reviews && stay.reviews.length > 0 ? `${stay.reviews.length} Guest Reviews` : 'Authentic Hospitality'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Overview & Editorial Description */}
                <div className="space-y-2">
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>📖</span> About This Property & Experience
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-editorial bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                    {stay.desc || stay.description || 'Nestled in the serene landscapes of Tamil Nadu, this verified stay provides panoramic views, pure mountain air, and luxury comfort. Designed with authentic heritage architecture and modern luxury amenities, guests can unwind on the private deck and experience authentic hospitality.'}
                  </p>
                </div>

                {/* 4. Amenities & Facilities Matrix */}
                <div className="space-y-3">
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>✨</span> What This Stay Offers (Amenities)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {stayAmenities.map((am, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-800 font-semibold">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{am}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. 📜 RULES & REGULATIONS (OWNER DECLARED + PLATFORM MANDATORY) */}
                <div className="space-y-4">
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>📜</span> Rules & Guidelines
                  </h4>

                  {/* A. Host / Owner Declared House Rules */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🏡</span>
                      <h5 className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide">
                        House Rules Declared by Property Host ({stay.ownerName || 'Host'})
                      </h5>
                    </div>
                    
                    <div className="space-y-1.5 pt-1">
                      {(() => {
                        const ownerRules = (stay.ownerRules && stay.ownerRules.length > 0)
                          ? stay.ownerRules
                          : [
                              'Check-In: 12:00 PM onwards | Check-Out: 11:00 AM',
                              'Mandatory valid Government ID proof required for all adult guests',
                              'Strictly non-smoking inside bedrooms (designated outdoor smoking zones available)',
                              'Pets allowed upon prior host approval',
                              'Quiet hours observed after 10:00 PM for peaceful mountain ambiance'
                            ];

                        return ownerRules.map((rule, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-2 text-xs text-amber-900">
                            <span className="text-amber-600 font-bold mt-0.5">•</span>
                            <span>{rule}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* B. Platform Mandatory Code of Conduct & Cleanliness Rules (Our Side Rules) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-sm border border-slate-800">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      <h5 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                        Explore Tamil Nadu Mandatory Guest Conduct & Eco-Rules
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                      <div className="flex items-start gap-2.5 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                        <span className="text-base">🔇</span>
                        <div>
                          <strong className="text-white block mb-0.5">Strict Non-Disturbance Policy:</strong>
                          <span>No shouting, screaming, or loud music that disturbs neighboring guests, local residents, or hill wildlife.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                        <span className="text-base">🗑️</span>
                        <div>
                          <strong className="text-white block mb-0.5">Eco-Cleanliness (Dustbin Rule):</strong>
                          <span>All trash, plastics, and food waste must be discarded in designated dustbins. Strictly zero-tolerance for littering on lawns, grounds, or nature.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                        <span className="text-base">🪪</span>
                        <div>
                          <strong className="text-white block mb-0.5">Mandatory ID Verification:</strong>
                          <span>Physical or digital Government photo ID (Aadhaar / Passport / Voter ID) is mandatory for every adult guest.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                        <span className="text-base">🚭</span>
                        <div>
                          <strong className="text-white block mb-0.5">Fire Safety & Room Care:</strong>
                          <span>Strictly non-smoking inside rooms. Open bonfires only allowed in designated host campfire zones.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Authentic Guest Reviews (No Fake Reviews) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>⭐</span> Verified Guest Reviews ({stay.reviews ? stay.reviews.length : 0})
                    </h4>
                    {stay.reviews && stay.reviews.length > 0 && (
                      <span className="text-xs font-mono font-bold text-amber-600">{stay.rating || '5.0'} Overall Rating</span>
                    )}
                  </div>

                  {stay.reviews && stay.reviews.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {stay.reviews.map((rev, rIndex) => (
                        <div key={rIndex} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center border border-slate-300">
                                {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'G'}
                              </div>
                              <div>
                                <p className="font-bold text-xs text-slate-900">{rev.userName || 'Verified Guest'}</p>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {rev.date ? new Date(rev.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent Stay'} • {rev.tripType || 'Verified Stay'}
                                </span>
                              </div>
                            </div>
                            <div className="flex text-amber-500 text-xs">
                              {'★'.repeat(rev.rating || 5)}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-editorial italic">
                              "{rev.comment}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto font-bold text-base">
                        ⭐
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm">No Guest Reviews Yet</h5>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        This property is verified and ready for bookings. Reviews from verified guests will appear here after their stay.
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Sticky Action Footer */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-fira-mono text-slate-900">
                      ₹{Number(stayPrice).toLocaleString()}
                    </span>
                    <span className="text-xs font-mono text-slate-500"> / NIGHT (Base Tariff)</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-mono font-bold">✓ Best Rate Guarantee · Instant Razorpay Booking</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(stay)}
                    className={`px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      isStayWishlisted(stay)
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Heart size={15} className={isStayWishlisted(stay) ? 'fill-rose-500 text-rose-500' : ''} />
                    <span>{isStayWishlisted(stay) ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPropertyDetails(null);
                      handleOpenBookingModal(stay);
                    }}
                    className="flex-1 sm:flex-none px-7 py-3 rounded-2xl bg-[#242429] text-white font-extrabold text-xs hover:bg-black flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all cursor-pointer font-editorial"
                  >
                    <span>📅 Reserve & Book Stay</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 🎟️ COMPREHENSIVE BOOKING & RAZORPAY PAYMENT MODAL */}
      {selectedStayForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#242429]/20 p-5 sm:p-7 space-y-4 shadow-2xl my-auto animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#242429]/10 pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    ✓ VERIFIED STAY RESERVATION
                  </span>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                    ⚡ RAZORPAY GATEWAY
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-black font-editorial leading-tight">
                  {selectedStayForBooking.title}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-600 font-mono pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => openGoogleMaps(selectedStayForBooking, e)}
                    className="inline-flex items-center gap-1 hover:text-blue-600 hover:underline cursor-pointer group transition-colors"
                    title="Click to open location in Google Maps ↗"
                  >
                    <MapPin size={12} className="text-rose-600 shrink-0" />
                    <span>{selectedStayForBooking.location}</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-md">
                      MAPS ↗
                    </span>
                  </button>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedStayForBooking(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-black transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {confirmedBookingDetails ? (
              /* ⏳ BOOKING PLACED & PENDING VERIFICATION VIEW */
              <div className="py-3 space-y-4 text-center animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border-2 border-amber-300 shadow-md">
                  <Clock size={36} className="animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-extrabold font-editorial text-black">
                    Booking Request Placed!
                  </h4>
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-extrabold">
                    ⏳ STATUS: PENDING PROPERTY AVAILABILITY CONFIRMATION
                  </div>
                  <p className="text-xs text-slate-600 font-editorial pt-1 max-w-sm mx-auto">
                    We have captured your payment via Razorpay. A verification email has been dispatched to <strong>{confirmedBookingDetails.customerEmail}</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#fbf8f5] border border-[#242429]/15 text-left font-mono text-xs space-y-2">
                  <div className="flex justify-between border-b border-[#242429]/10 pb-1.5">
                    <span className="text-slate-500 font-bold">Booking ID:</span>
                    <span className="font-extrabold text-black">{confirmedBookingDetails.bookingId}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#242429]/10 pb-1.5">
                    <span className="text-slate-500 font-bold">Razorpay Payment ID:</span>
                    <span className="font-extrabold text-cyan-700">{confirmedBookingDetails.paymentId}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#242429]/10 pb-1.5">
                    <span className="text-slate-500 font-bold">Check-In / Out:</span>
                    <span className="font-bold text-black">{confirmedBookingDetails.checkIn} → {confirmedBookingDetails.checkOut} ({confirmedBookingDetails.nights} Nights)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#242429]/10 pb-1.5">
                    <span className="text-slate-500 font-bold">Guest(s):</span>
                    <span className="font-bold text-black">{guestDetails.label}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-sm font-black text-emerald-700 font-editorial">
                    <span>Total Paid (Captured):</span>
                    <span className="font-mono">₹{Number(confirmedBookingDetails.totalAmount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-left text-xs font-editorial space-y-1">
                  <span className="font-bold block">ℹ️ What happens next?</span>
                  <p className="text-[11px] text-blue-800 leading-relaxed font-mono">
                    The property host & reservation team are verifying room availability. Once accepted, you will immediately receive an <strong>Official Confirmation Email with your Stay Pass</strong>!
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShareModalBooking(confirmedBookingDetails)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold font-editorial hover:from-blue-700 hover:to-indigo-700 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Share2 size={15} /> Share / Save Stay Pass (WhatsApp, SMS, Files)
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStayForBooking(null);
                        navigate('/dashboard/user');
                      }}
                      className="py-3 rounded-2xl bg-[#242429] text-white text-xs font-bold font-editorial hover:bg-black shadow-sm transition-all"
                    >
                      View My Bookings
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStayForBooking(null)}
                      className="py-3 rounded-2xl bg-white border border-slate-300 text-black text-xs font-bold font-editorial hover:bg-slate-50 shadow-xs transition-all"
                    >
                      Explore More Stays
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* 📝 BOOKING INPUT FORM WITH DATES, GUESTS & AUTO PRICE CALCULATION */
              <div className="space-y-4">
                
                {/* 1. Date Range: Check-In & Check-Out */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 font-editorial mb-1">
                      Check-In Date *
                    </label>
                    <input 
                      type="date" 
                      required
                      min={todayStr}
                      value={checkInDate} 
                      onChange={e => setCheckInDate(e.target.value)} 
                      className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-black outline-hidden focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 font-editorial mb-1">
                      Check-Out Date *
                    </label>
                    <input 
                      type="date" 
                      required
                      min={checkInDate || todayStr}
                      value={checkOutDate} 
                      onChange={e => setCheckOutDate(e.target.value)} 
                      className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-black outline-hidden focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="text-[11px] font-mono text-cyan-800 bg-cyan-50/80 border border-cyan-200 px-3 py-1.5 rounded-xl flex items-center justify-between font-bold">
                  <span>Duration:</span>
                  <span>🗓️ {nights} Night{nights > 1 ? 's' : ''} Stay</span>
                </div>

                {/* 2. Number of Guests Option Dropdown */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 font-editorial">
                    Number of Guests & Group Type *
                  </label>
                  
                  <select
                    value={guestType}
                    onChange={(e) => setGuestType(e.target.value)}
                    className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs font-fira-mono font-bold text-black outline-hidden focus:ring-2 focus:ring-black"
                  >
                    <option value="single">👤 Single Traveler (1 Adult)</option>
                    <option value="couple">👫 Couple (2 Adults)</option>
                    <option value="family">👨‍👩‍👧 Family (Adults & Children)</option>
                    <option value="group">👥 Group Tour (Custom Adults & Children)</option>
                  </select>

                  {/* Dynamic Sub-inputs for Family */}
                  {guestType === 'family' && (
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-600 font-bold mb-1">How many Adults?</label>
                        <select 
                          value={familyAdults} 
                          onChange={e => setFamilyAdults(Number(e.target.value))}
                          className="w-full p-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold"
                        >
                          <option value={2}>2 Adults</option>
                          <option value={3}>3 Adults</option>
                          <option value={4}>4 Adults</option>
                          <option value={5}>5 Adults</option>
                          <option value={6}>6 Adults</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-600 font-bold mb-1">How many Children?</label>
                        <select 
                          value={familyChildren} 
                          onChange={e => setFamilyChildren(Number(e.target.value))}
                          className="w-full p-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold"
                        >
                          <option value={0}>0 Children</option>
                          <option value={1}>1 Child</option>
                          <option value={2}>2 Children</option>
                          <option value={3}>3 Children</option>
                          <option value={4}>4 Children</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Sub-inputs for Group (Manual entry) */}
                  {guestType === 'group' && (
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-600 font-bold mb-1">Adults Count (Manual):</label>
                        <input 
                          type="number" 
                          min={2} 
                          max={50}
                          value={groupAdults} 
                          onChange={e => setGroupAdults(Math.max(1, Number(e.target.value)))}
                          className="w-full p-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold" 
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-600 font-bold mb-1">Children Count (Manual):</label>
                        <input 
                          type="number" 
                          min={0} 
                          max={30}
                          value={groupChildren} 
                          onChange={e => setGroupChildren(Math.max(0, Number(e.target.value)))}
                          className="w-full p-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Guest Contact & Official Voucher Delivery Details */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-300 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 font-editorial flex items-center gap-1.5">
                      <span>📬</span> Official Stay Pass Voucher Recipient
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Instant Email Pass
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 font-editorial mb-1">
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={bookingGuestName} 
                        onChange={e => setBookingGuestName(e.target.value)} 
                        placeholder="e.g. Jeeva Veeramani"
                        className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-editorial font-bold text-black outline-hidden focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 font-editorial mb-1">
                        Voucher Email Address *
                      </label>
                      <input 
                        type="email" 
                        required
                        value={bookingGuestEmail} 
                        onChange={e => setBookingGuestEmail(e.target.value)} 
                        placeholder="e.g. exploretamizhagam@gmail.com"
                        className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-black outline-hidden focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 font-editorial mb-1">
                      Mobile Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={bookingGuestPhone} 
                      onChange={e => setBookingGuestPhone(e.target.value)} 
                      placeholder="+91 78717 79134"
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-black outline-hidden focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                {/* 4. Automatic Price Breakdown Calculation (+18% GST + 5% Service Fees) */}
                <div className="p-4 rounded-2xl bg-[#fbf8f5] border border-[#242429]/15 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-editorial border-b border-[#242429]/10 pb-1.5">
                    <span className="flex items-center gap-1 font-bold">
                      <Receipt size={13} className="text-slate-600" /> Owner Base Rate ({nights} Night{nights > 1 ? 's' : ''}):
                    </span>
                    <span className="font-mono font-bold">₹{basePriceTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 font-editorial">
                    <span className="flex items-center gap-1">
                      <span>🏷️ GST Tax (18%):</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800">+ ₹{gstAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 font-editorial border-b border-[#242429]/10 pb-1.5">
                    <span className="flex items-center gap-1">
                      <span>🛡️ Service & Platform Fees (5%):</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800">+ ₹{serviceFee.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-black text-black font-editorial pt-1">
                    <span>Final Total Price:</span>
                    <span className="font-mono text-base text-emerald-700 font-black">
                      ₹{grandTotalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 4. Availability Status Indicator */}
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2 font-bold">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>✓ Property Available for Selected Dates!</span>
                </div>

                {/* 5. Proceed to Payment Action (Official Razorpay SDK) */}
                <button
                  type="button"
                  onClick={handlePayWithRazorpay}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 rounded-2xl bg-[#242429] text-white hover:bg-black font-editorial font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer"
                >
                  <CreditCard size={16} className="text-cyan-400" />
                  <span>{isProcessingPayment ? 'Opening Razorpay Checkout...' : `Proceed to Payment (₹${grandTotalAmount.toLocaleString()})`}</span>
                </button>

                <p className="text-[10px] text-slate-400 font-mono text-center">
                  🔒 Official Encrypted Razorpay Checkout · Instant Reservation Confirmation
                </p>

              </div>
            )}

          </div>
        </div>
      )}

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
                      onClick={() => {
                        handleCopyShareText(bk);
                        alert('Stay Pass copied! Ready to paste in Instagram DM or Story.');
                      }}
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
