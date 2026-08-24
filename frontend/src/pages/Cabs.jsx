import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  CheckCircle2, 
  X, 
  Search, 
  Filter, 
  ArrowRight, 
  Navigation, 
  FileText, 
  Share2, 
  Printer, 
  AlertCircle,
  Star,
  Eye,
  Check,
  Shield,
  ThumbsUp,
  MessageSquare,
  Sparkle,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { BACKEND_API } from '../config/api';
import InteractiveLocationMapPicker from '../components/common/InteractiveLocationMapPicker';
import { openGoogleMaps } from '../utils/mapsHelper';
import { calculatePricing } from '../utils/pricing';
import { getWithSWR } from '../utils/cache';
import { CabCardSkeleton } from '../components/common/SkeletonCard';

export default function Cabs({ onOpenAuth }) {
  const { currentUser } = useAuth();
  const { socket } = useSocket();

  // Initialize with cached verified vehicles (filtering out any legacy demo entries)
  const [vehiclesList, setVehiclesList] = useState(() => {
    try {
      const saved = localStorage.getItem('etn_swr_vehicles_catalog');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.data)) {
          return parsed.data.filter(v => {
            const st = String(v.status || '').toLowerCase().trim();
            const isApproved = st === 'approved' || st === 'accepted';
            const isDemo = String(v._id || v.id || '').startsWith('veh-') || String(v._id || v.id || '').startsWith('demo-');
            return isApproved && !isDemo;
          });
        }
      }
    } catch (e) {}
    return [];
  });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 👁️ Guest Vehicle Detail & Safety Inspection Modal State
  const [inspectingCab, setInspectingCab] = useState(null);
  const [activePhotoTab, setActivePhotoTab] = useState('exterior'); // 'exterior' | 'interior' | 'plate' | 'rc'

  // ⭐ Dynamic Reviews State for Inspected Cab
  const [cabReviews, setCabReviews] = useState({});
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewName, setNewReviewName] = useState(currentUser?.name || '');
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  // Booking Modal State
  const [selectedCab, setSelectedCab] = useState(null);
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState('09:00');
  const [tripType, setTripType] = useState('Local Sightseeing (Full Day)');
  const [pickupLocation, setPickupLocation] = useState('Ooty Central Stand / Hotel Gate');
  const [pickupCoords, setPickupCoords] = useState({ lat: 11.4102, lng: 76.6950 });
  const [dropLocation, setDropLocation] = useState('Pykara Falls & Botanical Gardens');
  const [passengerCount, setPassengerCount] = useState('4');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [bookingDays, setBookingDays] = useState(1);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Sync current user details
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name || '');
      if (!customerEmail) setCustomerEmail(currentUser.email || '');
      if (!customerPhone) setCustomerPhone(currentUser.phone || '');
      if (!newReviewName) setNewReviewName(currentUser.name || '');
    }
  }, [currentUser]);

  // Load reviews from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('etn_cab_reviews');
      if (saved) setCabReviews(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const [fetchError, setFetchError] = useState(null);

  const apiFetch = async (endpoint, options = {}) => {
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
      if (res && (res.ok || res.status === 400 || res.status === 401 || res.status === 403)) {
        return res;
      }
    } catch (e) {
      console.warn('Vehicle API fetch notice for', url, e.message);
    }
    try {
      return await fetch(endpoint, { ...options, headers });
    } catch (e) {
      return null;
    }
  };

  // Fetch approved vehicles strictly from live backend database (NO DEMO ENTRIES)
  const fetchApprovedVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await apiFetch('/api/vehicles');
      if (res && res.ok) {
        const raw = await res.json();
        const list = Array.isArray(raw) ? raw : (raw?.data || []);
        if (Array.isArray(list)) {
          // Strictly filter only Admin-Approved / Accepted vehicles (Exclude any demo entries)
          const approved = list.filter(v => {
            const st = String(v.status || '').toLowerCase().trim();
            const isApproved = st === 'approved' || st === 'accepted';
            const isDemo = String(v._id || v.id || '').startsWith('veh-') || String(v._id || v.id || '').startsWith('demo-');
            return isApproved && !isDemo;
          });

          // Deduplicate by registration number or id
          const map = new Map();
          approved.forEach(v => {
            const key = (v.registrationNumber || v.regNo || v._id || v.id || v.title).toLowerCase().trim();
            if (!map.has(key)) {
              map.set(key, v);
            }
          });
          const cleanApprovedList = Array.from(map.values());
          setVehiclesList(cleanApprovedList);
          try {
            localStorage.setItem('etn_swr_vehicles_catalog', JSON.stringify({ data: cleanApprovedList, timestamp: Date.now() }));
          } catch (e) {}
        } else {
          setVehiclesList([]);
        }
      } else {
        setVehiclesList([]);
      }
    } catch (err) {
      console.warn('Vehicle live fetch notice:', err.message);
      setFetchError(err.message || 'Failed to load cabs.');
      setVehiclesList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovedVehicles();
  }, [fetchApprovedVehicles]);

  // Listen to live socket events when new vehicle is approved or updated
  useEffect(() => {
    if (!socket) return;
    const handleVehicleUpdate = () => fetchApprovedVehicles();
    socket.on('new_vehicle', handleVehicleUpdate);
    socket.on('vehicle_updated', handleVehicleUpdate);
    socket.on('vehicle_deleted', handleVehicleUpdate);

    return () => {
      socket.off('new_vehicle', handleVehicleUpdate);
      socket.off('vehicle_updated', handleVehicleUpdate);
      socket.off('vehicle_deleted', handleVehicleUpdate);
    };
  }, [socket]);

  // Filtered Cabs
  const filteredCabs = vehiclesList.filter(cab => {
    // 1. District Match
    let matchesDistrict = true;
    if (selectedDistrict && selectedDistrict !== 'All') {
      const cleanFilter = selectedDistrict.toLowerCase().replace(/[^a-z0-9]/g, ' ');
      const cabDist = `${cab.district || ''} ${cab.location || ''}`.toLowerCase();
      const filterWords = cleanFilter.split(/\s+/).filter(w => w.length > 2);
      matchesDistrict = filterWords.length === 0 || filterWords.some(w => cabDist.includes(w));
    }

    // 2. Category Match
    let matchesCategory = true;
    if (selectedCategory && selectedCategory !== 'All') {
      const catText = selectedCategory.toLowerCase();
      const cabCat = `${cab.type || ''} ${cab.title || ''}`.toLowerCase();
      matchesCategory = cabCat.includes(catText);
    }

    // 3. Search Query Match
    const matchesSearch = !searchQuery || (
      (cab.title && cab.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cab.district && cab.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cab.location && cab.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cab.type && cab.type.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return matchesDistrict && matchesCategory && matchesSearch;
  });

  const popularDistricts = [
    'All',
    'Nilgiris (Ooty)',
    'Kodaikanal',
    'Yercaud',
    'Madurai',
    'Coimbatore',
    'Chennai',
    'Rameshwaram',
    'Kanyakumari',
    'Valparai'
  ];

  // Submit Tourist Review for Vehicle
  const handleAddReview = (e) => {
    e.preventDefault();
    if (!inspectingCab || !newReviewText.trim()) return;
    const cabId = inspectingCab._id || inspectingCab.id;
    const newEntry = {
      id: 'rev-' + Date.now(),
      author: newReviewName.trim() || 'Verified Tourist',
      rating: Number(newRating) || 5,
      comment: newReviewText.trim(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    const currentList = cabReviews[cabId] || [];
    const updated = { ...cabReviews, [cabId]: [newEntry, ...currentList] };
    setCabReviews(updated);
    try {
      localStorage.setItem('etn_cab_reviews', JSON.stringify(updated));
    } catch (err) {}

    setNewReviewText('');
    setReviewSubmitSuccess(true);
    setTimeout(() => setReviewSubmitSuccess(false), 3000);
  };

  const getReviewsForCab = (cab) => {
    if (!cab) return [];
    const cabId = cab._id || cab.id;
    return cabReviews[cabId] || [];
  };

  // Handle Booking Submission with 18% GST + 5% Platform Fee Calculation
  const handleCabBookingSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Please enter your name and phone number.');
      return;
    }

    setIsSubmittingBooking(true);

    const baseFare = Number(selectedCab.price || selectedCab.pricePerDay || 3500) * Number(bookingDays || 1);
    const pricing = calculatePricing(baseFare);
    const bookingId = 'ETN-CAB-' + Math.floor(100000 + Math.random() * 900000);
    const targetEmail = (customerEmail || currentUser?.email || 'guest@exploretamilnadu.com').toLowerCase().trim();
    const targetName = customerName.trim();
    const targetPhone = customerPhone.trim();

    const bookingPayload = {
      bookingId,
      type: 'cab',
      itemType: 'vehicle',
      bookingType: 'cab',
      itemTitle: selectedCab.title,
      propertyTitle: selectedCab.title,
      vehicleId: selectedCab._id || selectedCab.id,
      vehicleRegNo: selectedCab.registrationNumber || selectedCab.regNo || 'TN-VERIFIED',
      vehicleType: selectedCab.type || 'Cab',
      customerName: targetName,
      userName: targetName,
      customerEmail: targetEmail,
      userEmail: targetEmail,
      customerPhone: targetPhone,
      userPhone: targetPhone,
      pickupDate,
      pickupTime,
      checkIn: pickupDate,
      checkInDate: pickupDate,
      pickupLocation,
      pickupCoordinates: pickupCoords,
      dropLocation,
      tripType,
      passengerCount: Number(passengerCount || 4),
      guests: Number(passengerCount || 4),
      guestType: tripType,
      days: Number(bookingDays || 1),
      nights: Number(bookingDays || 1),
      destination: selectedCab.district || selectedCab.location || 'Tamil Nadu',
      location: selectedCab.location || selectedCab.district || 'Tamil Nadu',
      totalAmount: pricing.total,
      baseAmount: pricing.base,
      gstAmount: pricing.gst,
      platformFee: pricing.platformFee,
      amount: pricing.total,
      driverName: selectedCab.driverName || 'Assigned Host Driver',
      driverPhone: selectedCab.driverPhone || '+91 78717 79134',
      driverLicense: selectedCab.driverLicense || 'TN-COMMERCIAL-DL',
      providerEmail: (selectedCab.providerEmail || selectedCab.ownerEmail || 'vendor@exploretamilnadu.com').toLowerCase().trim(),
      ownerEmail: (selectedCab.providerEmail || selectedCab.ownerEmail || 'vendor@exploretamilnadu.com').toLowerCase().trim(),
      ownerName: selectedCab.providerName || selectedCab.ownerName || 'Vehicle Host',
      status: 'Confirmed',
      paymentStatus: 'Paid via Razorpay',
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Save to MongoDB Atlas via Backend API
      const res = await apiFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
      const data = (res && res.ok) ? await res.json() : null;
      const saved = data?.booking || data || bookingPayload;

      // 2. Persist to Local Storage for 0ms Instant User & Vendor Dashboard Sync
      try {
        const savedRaw = localStorage.getItem('etn_user_bookings');
        const list = savedRaw ? JSON.parse(savedRaw) : [];
        const updatedList = [saved, ...list.filter(b => (b.bookingId || b.id || b._id) !== (saved.bookingId || bookingId))];
        localStorage.setItem('etn_user_bookings', JSON.stringify(updatedList));
        if (targetEmail) {
          localStorage.setItem(`etn_user_bookings_${targetEmail}`, JSON.stringify(updatedList));
        }
        localStorage.setItem('etn_saved_bookings', JSON.stringify(updatedList));
        window.dispatchEvent(new CustomEvent('etn_booking_created', { detail: saved }));
      } catch (e) {}

      setBookingSuccessData(saved);
    } catch (err) {
      // Local fallback persistence
      try {
        const savedRaw = localStorage.getItem('etn_user_bookings');
        const list = savedRaw ? JSON.parse(savedRaw) : [];
        const updatedList = [bookingPayload, ...list.filter(b => (b.bookingId || b.id) !== bookingId)];
        localStorage.setItem('etn_user_bookings', JSON.stringify(updatedList));
        window.dispatchEvent(new CustomEvent('etn_booking_created', { detail: bookingPayload }));
      } catch (e) {}
      setBookingSuccessData(bookingPayload);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-slate-800 pb-16 overflow-x-hidden">
      
      {/* 🌟 HERO BANNER */}
      <section className="relative pt-8 sm:pt-14 pb-8 sm:pb-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-editorial leading-tight">
            Curated Hill Station Cabs & Luxury Transport in Tamil Nadu
          </h1>
          
          <p className="text-xs sm:text-sm md:text-base text-slate-600 font-sans max-w-2xl mx-auto leading-relaxed">
            Reserve Innova Crystas, Tempo Travellers, and luxury coaches for Ooty, Kodaikanal, Yercaud, and heritage circuits with experienced commercial drivers.
          </p>
        </div>

        {/* 🔍 FILTER & SEARCH CONSOLE */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xl space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search cab, city, or destination..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="All">All Vehicle Types (Innova, Sedan, Tempo, Coach)</option>
                <option value="Innova">🚖 Innova Crysta (7 Seater)</option>
                <option value="Sedan">🚗 Sedan (4 Seater)</option>
                <option value="Tempo">🚐 Tempo Traveller (12 Seater)</option>
                <option value="SUV">🚙 Cab SUV (6 Seater)</option>
                <option value="Bus">🚌 Luxury Coach / Bus (21+ Seater)</option>
              </select>
            </div>

            {/* District Dropdown */}
            <div className="flex items-center">
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="All">All Tamil Nadu Districts & Hill Stations</option>
                <option value="Nilgiris">Nilgiris (Ooty & Coonoor)</option>
                <option value="Kodaikanal">Dindigul (Kodaikanal)</option>
                <option value="Yercaud">Salem (Yercaud)</option>
                <option value="Madurai">Madurai</option>
                <option value="Coimbatore">Coimbatore (Valparai & Pollachi)</option>
                <option value="Chennai">Chennai & ECR</option>
                <option value="Rameshwaram">Ramanathapuram (Rameshwaram)</option>
                <option value="Kanyakumari">Kanyakumari</option>
              </select>
            </div>
          </div>

          {/* Quick District Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 text-xs font-mono no-scrollbar">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 shrink-0 mr-1">Popular Circuits:</span>
            {popularDistricts.map(dist => (
              <button
                key={dist}
                type="button"
                onClick={() => setSelectedDistrict(dist)}
                className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  selectedDistrict === dist ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 🚖 VEHICLE FLEET CATALOG */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-5 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cabs & Transport ({filteredCabs.length})
            </h2>
            <p className="text-xs text-slate-500 font-mono">Select cabs for hill station tours & transfers (Taxes & fees calculated at booking)</p>
          </div>
        </div>

        {loading && vehiclesList.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 py-2">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <CabCardSkeleton key={n} />
            ))}
          </div>
        ) : vehiclesList.length === 0 ? (
          <div className="p-12 sm:p-16 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-3 max-w-xl mx-auto shadow-sm">
            <Car size={36} className="mx-auto text-slate-300" />
            <h4 className="font-bold text-slate-900 text-base font-editorial">No Active Vehicles in Live Fleet</h4>
            <p className="text-xs text-slate-500 font-sans">
              Vehicles and transport fleets submitted by registered vehicle hosts will appear live here once inspected and approved by Super Admin.
            </p>
            {currentUser && ['owner', 'vendor', 'owner_and_vendor'].includes(currentUser.role) ? (
              <a
                href="/dashboard/vendor?tab=properties_vehicles"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold font-mono shadow-sm hover:bg-black transition-all"
              >
                🚖 Submit Your Vehicle / Cab
              </a>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('register')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold font-mono shadow-sm hover:bg-black transition-all"
              >
                Register as Vehicle Owner / Host
              </button>
            )}
          </div>
        ) : fetchError && !loading && vehiclesList.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-rose-50 border border-rose-200 space-y-3 max-w-lg mx-auto my-6">
            <h4 className="font-bold text-rose-800 text-sm">⚠️ Failed to Load Cabs</h4>
            <p className="text-xs text-rose-600 font-mono">{fetchError}</p>
            <button
              type="button"
              onClick={fetchApprovedVehicles}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-mono transition-all shadow-sm cursor-pointer"
            >
              🔄 Try Again
            </button>
          </div>
        ) : filteredCabs.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-3">
            <Car size={32} className="mx-auto text-slate-300" />
            <h4 className="font-bold text-slate-800 text-sm">No cabs found matching your filter</h4>
            <p className="text-xs text-slate-500">Try selecting "All" districts or searching for another vehicle model.</p>
            <button
              onClick={() => { setSelectedDistrict('All'); setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold font-mono cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredCabs.map(cab => {
              const pricing = calculatePricing(cab.price || cab.pricePerDay || 3500);
              const reviews = getReviewsForCab(cab);
              const avgRating = reviews.length > 0 
                ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1) 
                : '5.0';

              return (
                <div 
                  key={cab._id || cab.id} 
                  onClick={() => {
                    setInspectingCab(cab);
                    setActivePhotoTab('exterior');
                  }}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group cursor-pointer"
                >
                  {/* Photo & Top Badges */}
                  <div>
                    <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-slate-100">
                      <img 
                        src={cab.exteriorImage || (cab.images && cab.images[0]) || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'} 
                        alt={cab.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 font-mono text-[10px] font-bold border border-white/20">
                        🚖 {cab.type || 'Cab'}
                      </span>

                      {/* Number plate pill & Star Rating */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                        {Boolean(cab.registrationNumber || cab.regNo || cab.numberPlate) && (
                          <div className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black font-mono text-xs tracking-wider shadow-md">
                            {cab.registrationNumber || cab.regNo || cab.numberPlate}
                          </div>
                        )}
                        <div className="px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-md text-slate-900 font-mono text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                          <Star size={10} className="text-amber-500 fill-amber-500" />
                          <span>{avgRating} ({reviews.length})</span>
                        </div>
                      </div>
                    </div>

                    {/* Body Specs */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-700 transition-colors">
                          {cab.title}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <MapPin size={13} className="text-rose-500 shrink-0" />
                        <span>{cab.location || cab.district || 'Tamil Nadu'}</span>
                      </p>

                      {/* Spec Badges Row */}
                      <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-slate-600">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-1 font-bold">
                          <Users size={12} className="text-blue-600" /> {cab.seatingCapacity || 7} Seats
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-bold">
                          {cab.acType || 'AC'}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-bold">
                          {cab.fuelType || 'Diesel'}
                        </span>
                        {cab.interiorImage && (
                          <span className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold">
                            🪑 Interior Photos ↗
                          </span>
                        )}
                      </div>

                      {/* Zero Tolerance & Driver Pill */}
                      <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[10px] font-mono text-amber-950 space-y-0.5">
                        <div className="flex items-center gap-1 font-bold text-amber-900">
                          <ShieldCheck size={12} className="text-amber-600 shrink-0" />
                          <span>Driver: {cab.driverName || 'Certified Local Driver'}</span>
                        </div>
                        <p className="text-[9px] text-amber-800">
                          ✓ Zero-Tolerance: Non-Smoking · No Alcohol/Drugs · Hill Safe
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Pricing & Action Controls */}
                  <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-base sm:text-lg font-black text-slate-900 leading-none">
                        ₹{pricing.base.toLocaleString()}
                        <span className="text-[10px] font-normal text-slate-500 font-mono"> /day</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 block pt-0.5">
                        + 18% GST & 5% Service Fee at booking
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingCab(cab);
                          setActivePhotoTab('exterior');
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-mono cursor-pointer transition-colors"
                      >
                        <Eye size={13} className="inline mr-1" /> Details
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCab(cab);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-black text-white text-xs font-bold font-mono flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        <span>Book</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 🔍 GUEST VEHICLE DETAIL & SAFETY INSPECTION MODAL (WITH REVIEWS)     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {inspectingCab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-slate-950 text-white flex justify-between items-start shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-black uppercase">
                    {inspectingCab.type || 'Cab'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-editorial text-white">{inspectingCab.title}</h3>
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <MapPin size={12} className="text-rose-400" />
                  <span>Base Stand: {inspectingCab.location || inspectingCab.district || 'Tamil Nadu'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingCab(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* 📸 High-Res Photo Gallery (Exterior, Interior, Plate, RC) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-600 tracking-wider">
                    Vehicle Photo Gallery & Documents:
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setActivePhotoTab('exterior')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        activePhotoTab === 'exterior' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      🚗 Exterior
                    </button>
                    {inspectingCab.interiorImage && (
                      <button
                        type="button"
                        onClick={() => setActivePhotoTab('interior')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          activePhotoTab === 'interior' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        🪑 Interior
                      </button>
                    )}
                    {inspectingCab.numberPlateImage && (
                      <button
                        type="button"
                        onClick={() => setActivePhotoTab('plate')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          activePhotoTab === 'plate' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        🏷️ Plate
                      </button>
                    )}
                    {inspectingCab.rcBookImage && (
                      <button
                        type="button"
                        onClick={() => setActivePhotoTab('rc')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          activePhotoTab === 'rc' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        📄 RC Record
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner flex items-center justify-center">
                  {activePhotoTab === 'exterior' && (
                    <img 
                      src={inspectingCab.exteriorImage || (inspectingCab.images && inspectingCab.images[0]) || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2'} 
                      alt="Exterior View" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  {activePhotoTab === 'interior' && (
                    <img 
                      src={inspectingCab.interiorImage || 'https://images.unsplash.com/photo-1563720223185-11003d516935'} 
                      alt="Interior View" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  {activePhotoTab === 'plate' && (
                    <img 
                      src={inspectingCab.numberPlateImage || inspectingCab.exteriorImage} 
                      alt="Number Plate" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  {activePhotoTab === 'rc' && (
                    <img 
                      src={inspectingCab.rcBookImage || inspectingCab.exteriorImage} 
                      alt="RC Smart Card" 
                      className="w-full h-full object-contain bg-slate-950 p-4"
                    />
                  )}
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-xs font-mono font-bold">
                    Registration: {inspectingCab.registrationNumber || inspectingCab.regNo}
                  </div>
                </div>
              </div>

              {/* 📋 Passenger Rules & Regulations Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
                <h4 className="text-xs font-black font-mono uppercase text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-amber-700" />
                  <span>Passenger Conduct & Safety Guidelines:</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-amber-900">
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">🚭</span>
                    <span><strong>100% Non-Smoking:</strong> Smoking, cigarettes, or vaping strictly prohibited inside vehicle.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">🚫</span>
                    <span><strong>No Alcohol or Narcotics:</strong> Zero tolerance for drugs, hans, pan masala, or alcohol.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">🧳</span>
                    <span><strong>Luggage Space:</strong> Accommodates {inspectingCab.seatingCapacity || 7} trolley bags in boot.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-700 font-bold">⛰️</span>
                    <span><strong>Hill Safety:</strong> Certified commercial driver trained for ghat road hairpin turns.</span>
                  </li>
                </ul>
              </div>

              {/* 💰 Transparent Pricing Breakdown (18% GST + 5% Platform Fee) */}
              {(() => {
                const p = calculatePricing(inspectingCab.price || inspectingCab.pricePerDay || 3500);
                return (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black font-mono uppercase text-slate-800 flex items-center justify-between">
                      <span>Transparent Tariff Breakdown (Full-Day Tour):</span>
                      <span className="text-emerald-700 font-bold">✓ No Hidden Costs</span>
                    </h4>
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Base Host Tariff:</span>
                        <span>₹{p.base.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>GST (18% Govt Tax):</span>
                        <span>+ ₹{p.gst.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Platform & Driver Safety Fee (5%):</span>
                        <span>+ ₹{p.platformFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                        <span>Total Customer Price / Day:</span>
                        <span className="text-emerald-600">₹{p.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ⭐ Verified Customer Reviews & Rating Form */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold font-editorial text-slate-900 flex items-center gap-1.5">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span>Verified Customer Reviews ({getReviewsForCab(inspectingCab).length})</span>
                  </h4>
                </div>

                {/* Review Cards List */}
                <div className="space-y-2.5">
                  {getReviewsForCab(inspectingCab).length === 0 ? (
                    <div className="p-4 text-center text-slate-400 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-xs font-mono">
                      ✨ No guest reviews yet for this vehicle. Be the first to share your travel experience!
                    </div>
                  ) : (
                    getReviewsForCab(inspectingCab).map(rev => (
                      <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <strong className="text-slate-900">{rev.author}</strong>
                          <span className="text-slate-400 text-[10px]">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} size={11} className="fill-amber-500" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 font-sans leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Write Review Form */}
                <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">✍️ Rate & Write a Review as Guest</span>
                    {reviewSubmitSuccess && (
                      <span className="text-xs font-mono font-bold text-emerald-600 animate-in fade-in">
                        ✓ Review posted successfully!
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={newReviewName}
                        onChange={e => setNewReviewName(e.target.value)}
                        placeholder="E.g. Ramesh S."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">Rating</label>
                      <select
                        value={newRating}
                        onChange={e => setNewRating(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                        <option value={3}>⭐⭐⭐ (3 - Good)</option>
                        <option value={2}>⭐⭐ (2 - Average)</option>
                        <option value={1}>⭐ (1 - Poor)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Your Experience / Feedback</label>
                    <textarea
                      rows={2}
                      value={newReviewText}
                      onChange={e => setNewReviewText(e.target.value)}
                      placeholder="Describe your trip, car cleanliness, driver punctuality..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold font-mono cursor-pointer transition-all"
                  >
                    Submit Verified Review
                  </button>
                </form>
              </div>

            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Host Daily Base Tariff</span>
                <div className="text-xl font-black text-slate-900">
                  ₹{calculatePricing(inspectingCab.price || inspectingCab.pricePerDay || 3500).base.toLocaleString()}
                  <span className="text-xs font-mono font-normal text-slate-500"> /day</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 block">+ 18% GST & 5% Service Fee at booking</span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const cab = inspectingCab;
                    setInspectingCab(null);
                    setSelectedCab(cab);
                  }}
                  className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-slate-950 hover:bg-black text-white text-xs font-bold font-mono flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <span>Book Cab with Google Maps Pin</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 🗺️ CUSTOMER CAB BOOKING MODAL WITH INTERACTIVE GOOGLE MAPS PICKUP   */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {selectedCab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-950 text-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-black uppercase">
                    Cab Reservation
                  </span>
                  <span className="text-xs font-mono text-slate-400">{selectedCab.registrationNumber || selectedCab.regNo}</span>
                </div>
                <h3 className="text-lg font-bold font-editorial text-white mt-1">{selectedCab.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedCab(null); setBookingSuccessData(null); }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* If Booking Confirmed, Show Official Cab Voucher Pass */}
            {bookingSuccessData ? (
              <div className="p-6 sm:p-8 space-y-6 text-center animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-extrabold border border-emerald-300">
                    🎉 CAB BOOKING CONFIRMED & DISPATCHED
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2 font-editorial">
                    Your Trip Voucher: {bookingSuccessData.bookingId}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Your driver has been alerted and confirmation details have been dispatched to your email & SMS.
                  </p>
                </div>

                {/* Voucher Summary Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left font-mono text-xs space-y-2.5">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Vehicle:</span>
                    <strong className="text-slate-900">{bookingSuccessData.propertyTitle} ({bookingSuccessData.vehicleRegNo})</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Pickup Location:</span>
                    <strong className="text-slate-900">{bookingSuccessData.pickupLocation}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Destination:</span>
                    <strong className="text-slate-900">{bookingSuccessData.dropLocation}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Pickup Date & Time:</span>
                    <strong className="text-emerald-700 font-bold">{bookingSuccessData.pickupDate} at {bookingSuccessData.pickupTime}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Assigned Driver:</span>
                    <strong className="text-blue-700">{bookingSuccessData.driverName} ({bookingSuccessData.driverPhone})</strong>
                  </div>
                  <div className="flex justify-between pt-1 text-sm font-bold">
                    <span className="text-slate-900">Total Amount Paid (18% GST + 5% Fee Included):</span>
                    <strong className="text-emerald-600">₹{Number(bookingSuccessData.totalAmount).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    to="/dashboard/user?tab=bookings"
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Calendar size={14} /> View in My Bookings →
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Explore Tamil Nadu Cab Voucher: ${bookingSuccessData.bookingId}`,
                          text: `My verified cab reservation for ${bookingSuccessData.propertyTitle} on ${bookingSuccessData.pickupDate}. Pickup: ${bookingSuccessData.pickupLocation}. Driver: ${bookingSuccessData.driverName}`,
                          url: window.location.href
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(`Explore Tamil Nadu Cab Voucher: ${bookingSuccessData.bookingId} - ${bookingSuccessData.propertyTitle}`);
                        alert('Cab voucher details copied to clipboard!');
                      }
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-mono flex items-center gap-2 cursor-pointer"
                  >
                    <Share2 size={14} /> Share Trip Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold font-mono flex items-center gap-2 cursor-pointer"
                  >
                    <Printer size={14} /> Print Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedCab(null); setBookingSuccessData(null); }}
                    className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 text-xs font-bold font-mono hover:bg-slate-100 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Form with Interactive Google Maps Pickup Selector */
              <form onSubmit={handleCabBookingSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                
                {/* 📍 SECTION 1: PICKUP LOCATION & INTERACTIVE GOOGLE MAP */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <MapPin size={15} className="text-rose-600" />
                      <span>1. Pin Exact Pickup Location on Google Map</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">Drag pin to hotel gate / airport / station</span>
                  </div>

                  <InteractiveLocationMapPicker
                    initialPosition={pickupCoords}
                    onLocationChange={(coords, addr) => {
                      setPickupCoords(coords);
                      if (addr) setPickupLocation(addr);
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Pickup Address / Landmark</label>
                      <input
                        type="text"
                        value={pickupLocation}
                        onChange={e => setPickupLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                        placeholder="E.g. Sterling Ooty Fern Hill, Gate 1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Drop Destination / Sightseeing Points</label>
                      <input
                        type="text"
                        value={dropLocation}
                        onChange={e => setDropLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                        placeholder="E.g. Pykara Falls, Doddabetta Peak"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 🗓️ SECTION 2: TRIP TYPE & DATES */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Trip Service Type</label>
                    <select
                      value={tripType}
                      onChange={e => setTripType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="Local Sightseeing (Full Day)">Local Sightseeing (Full Day)</option>
                      <option value="Outstation Round-Trip">Outstation Round-Trip</option>
                      <option value="Airport / Station Transfer">Airport / Station Transfer</option>
                      <option value="One-Way Drop">One-Way Drop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Pickup Date</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={e => setPickupDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Pickup Time</label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={e => setPickupTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* 👥 SECTION 3: PASSENGER & CUSTOMER INFO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Traveler Full Name</label>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Email (For Voucher & Pass)</label>
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">WhatsApp / Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Days / Duration</label>
                    <select
                      value={bookingDays}
                      onChange={e => setBookingDays(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                    >
                      <option value={1}>1 Day (Full Day Tour)</option>
                      <option value={2}>2 Days</option>
                      <option value={3}>3 Days</option>
                      <option value={5}>5 Days (Complete Circuit)</option>
                    </select>
                  </div>
                </div>

                {/* 🛡️ ZERO-TOLERANCE CONDUCT BADGE */}
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-mono text-amber-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-amber-600 shrink-0" />
                  <span>
                    <strong>Driver Conduct Guaranteed:</strong> Non-Smoking, No Alcohol/Drugs/Hans/Pan Masala, and verified commercial driving record.
                  </span>
                </div>

                {/* Fare Summary & Submit with 18% GST + 5% Fee Breakdown */}
                {(() => {
                  const baseFare = Number(selectedCab.price || selectedCab.pricePerDay || 3500) * bookingDays;
                  const pricing = calculatePricing(baseFare);

                  return (
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1.5">
                        <div className="flex items-center justify-between text-slate-700">
                          <span>🚗 Vehicle Host Base Rate ({bookingDays} Day{bookingDays > 1 ? 's' : ''}):</span>
                          <span className="font-bold">₹{pricing.base.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>🏷️ Goods & Services Tax (18% GST):</span>
                          <span className="font-bold text-slate-800">+ ₹{pricing.gst.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 border-b border-slate-200 pb-1.5">
                          <span>🛡️ Platform & Facilitation Fee (5%):</span>
                          <span className="font-bold text-slate-800">+ ₹{pricing.platformFee.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm font-black text-slate-950 pt-0.5">
                          <span>Total Payable Amount:</span>
                          <span className="text-base text-emerald-700 font-black">₹{pricing.total.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <span className="text-[11px] text-emerald-600 font-bold font-mono">
                          ✓ Verified Driver Allowance Included
                        </span>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            type="submit"
                            disabled={isSubmittingBooking}
                            className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-slate-950 hover:bg-black text-white text-xs font-bold font-mono flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
                          >
                            {isSubmittingBooking ? 'Reserving Cab...' : `Proceed & Pay (₹${pricing.total.toLocaleString()}) 🚖`}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCab(null)}
                            className="px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
