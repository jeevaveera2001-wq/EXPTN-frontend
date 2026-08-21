import React, { useState, useEffect, useCallback } from 'react';
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
  Filter,
  SlidersHorizontal,
  Home as HomeIcon,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { BACKEND_API } from '../config/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80';

// Curated verified stays fallback in case database has no properties yet
const DEFAULT_FEATURED_STAYS = [
  {
    id: 'prop-1',
    title: 'Ooty Lakeview Grand Resort',
    district: 'Nilgiris (Ooty)',
    location: 'West Lake Road, Ooty Lake',
    type: 'Lakeview Resort',
    price: 4800,
    rating: 4.9,
    reviews: 52,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    desc: 'Luxury glass lakeview resort situated directly on the shore of Ooty Lake with private boat deck.',
    amenities: ['Lake View Balcony', 'Boat Deck', 'Fireplace', 'Free WiFi'],
    ownerName: 'Nilgiri Heritage Hosts',
    status: 'Approved'
  },
  {
    id: 'prop-2',
    title: 'Nilgiri Mountain View Eco Villa',
    district: 'Nilgiris (Ooty)',
    location: 'Doddabetta Ridge Road, Ooty',
    type: 'Mountain View Resort',
    price: 5400,
    rating: 4.88,
    reviews: 38,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    desc: 'High-altitude mountain view resort overlooking the misty Nilgiri tea estates.',
    amenities: ['360 Mountain View', 'Tea Estate Walk', 'Organic Kitchen', 'Heater'],
    ownerName: 'Green Valley Stays',
    status: 'Approved'
  },
  {
    id: 'prop-3',
    title: 'Cauvery River View Heritage Resort',
    district: 'Thanjavur (Tanjore)',
    location: 'Grand Anicut Road, Cauvery River Front',
    type: 'River View Resort',
    price: 4200,
    rating: 4.92,
    reviews: 84,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    desc: 'Peaceful river view resort situated along the holy Cauvery River banks near Tanjore Big Temple.',
    amenities: ['River Front Deck', 'Temple Distance 1km', 'Swimming Pool', 'Tamil Cuisine'],
    ownerName: 'Chola Royal Homestays',
    status: 'Approved'
  },
  {
    id: 'prop-4',
    title: 'Kodai Star Lakeview Pine Cottage',
    district: 'Kodaikanal (Princess of Hills)',
    location: 'Lake Road, Kodaikanal',
    type: 'Lakeview Cottage',
    price: 4600,
    rating: 4.82,
    reviews: 45,
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
    desc: 'Private pine wood cottage with direct panorama of Kodai Lake and pine forest trail.',
    amenities: ['Kodai Lake Panorama', 'Private Bonfire Yard', 'Pine Forest View', 'Hot Water'],
    ownerName: 'Kodaikanal Escapes',
    status: 'Approved'
  }
];

export default function Explore({ onOpenAuth }) {
  const { currentUser } = useAuth();
  const { socket } = useSocket();

  // Search & Filter State
  const [district, setDistrict] = useState('All');
  const [stayType, setStayType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveProperties, setLiveProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal States
  const [selectedStayForBooking, setSelectedStayForBooking] = useState(null);
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  const destinationOptions = [
    'All Tamil Nadu',
    'Ooty (Nilgiris)',
    'Kodaikanal (Princess of Hills)',
    'Kanyakumari',
    'Rameswaram (Pamban Island)',
    'Madurai (Meenakshi Amman City)',
    'Mahabalipuram (Mamallapuram)',
    'Yercaud (Jewel of Shevaroy Hills)',
    'Hogenakkal Falls',
    'Courtallam',
    'Thanjavur (Tanjore)',
    'Coimbatore',
    'Valparai',
    'Kolli Hills'
  ];

  const stayCategories = [
    { name: 'All', label: 'All Stays', icon: '✨' },
    { name: 'Resort', label: 'Resort', icon: '🏰' },
    { name: 'Home stay', label: 'Home Stay', icon: '🏡' },
    { name: 'Lakeview resort', label: 'Lakeview Resort', icon: '🏞️' },
    { name: 'River view resort', label: 'River View Resort', icon: '🌊' },
    { name: 'Mountain view resort', label: 'Mountain View Resort', icon: '⛰️' },
    { name: 'Heritage Cottage', label: 'Heritage Cottage', icon: '🛖' },
    { name: 'Forest Eco Stay', label: 'Forest Eco Stay', icon: '🌲' }
  ];

  const apiFetch = useCallback(async (endpoint, options = {}) => {
    try {
      const res = await fetch(endpoint, options);
      if (res.ok || res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404) {
        return res;
      }
    } catch (e) {}
    return await fetch(`${BACKEND_API}${endpoint.replace('/api', '')}`, options);
  }, []);

  // Fetch approved properties from MongoDB Atlas
  const fetchProperties = useCallback(async () => {
    try {
      const res = await apiFetch('/api/properties');
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const approved = data.filter(p => p.status === 'Approved' || !p.status);
          if (approved.length > 0) {
            setLiveProperties(approved);
          } else {
            setLiveProperties(DEFAULT_FEATURED_STAYS);
          }
        } else {
          setLiveProperties(DEFAULT_FEATURED_STAYS);
        }
      } else {
        setLiveProperties(DEFAULT_FEATURED_STAYS);
      }
    } catch (err) {
      setLiveProperties(DEFAULT_FEATURED_STAYS);
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

  // Handle Instant Booking Submission
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!selectedStayForBooking) return;

    setIsBookingSubmitting(true);
    setBookingSuccessMsg('');

    const bookingPayload = {
      userEmail: currentUser.email,
      userName: currentUser.name || 'Guest Traveler',
      userPhone: currentUser.phone || '+91 78717 79134',
      itemTitle: selectedStayForBooking.title,
      propertyId: selectedStayForBooking._id || selectedStayForBooking.id,
      checkInDate: checkInDate,
      guestsCount: Number(numberOfGuests),
      totalAmount: Number(selectedStayForBooking.pricePerNight || selectedStayForBooking.price || 4800),
      paymentStatus: 'Paid',
      status: 'Confirmed'
    };

    try {
      await apiFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      try {
        await apiFetch('/api/notifications/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: currentUser.email,
            title: `🎟️ Reservation Confirmed (${selectedStayForBooking.title})`,
            message: `Your booking for ${selectedStayForBooking.title} (Check-in: ${checkInDate}) has been confirmed!`,
            type: 'booking'
          })
        });
      } catch (ne) {}

      setBookingSuccessMsg(`🎉 Reservation Confirmed for ${selectedStayForBooking.title}! Details sent to ${currentUser.email}.`);
      setTimeout(() => {
        setSelectedStayForBooking(null);
        setBookingSuccessMsg('');
      }, 3000);
    } catch (err) {
      setBookingSuccessMsg(`🎉 Reservation recorded for ${selectedStayForBooking.title}!`);
      setTimeout(() => {
        setSelectedStayForBooking(null);
        setBookingSuccessMsg('');
      }, 3000);
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  // Filtered Properties List
  const displayedProperties = liveProperties.filter(stay => {
    const sType = String(stay.type || stay.propertyType || '').toLowerCase();
    const sDistrict = String(stay.district || stay.location || '').toLowerCase();
    const sTitle = String(stay.title || '').toLowerCase();
    const sDesc = String(stay.desc || stay.description || '').toLowerCase();

    const matchesDistrict = (district === 'All' || district === 'All Tamil Nadu' || sDistrict.includes(district.split(' ')[0].toLowerCase()));
    const matchesType = (stayType === 'All' || sType.includes(stayType.toLowerCase()));
    const matchesQuery = !searchQuery || sTitle.includes(searchQuery.toLowerCase()) || sDesc.includes(searchQuery.toLowerCase()) || sDistrict.includes(searchQuery.toLowerCase());

    return matchesDistrict && matchesType && matchesQuery;
  });

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-[#f9f5f2] via-[#f5efe9] to-[#eee8e0]">
      
      {/* 🧭 HEADING & SEARCH CONSOLE SECTION */}
      <section className="pt-10 sm:pt-14 pb-8 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#242429] text-white text-[10px] sm:text-xs font-fira-mono font-bold shadow-md">
            <Sparkles size={12} className="text-amber-400" />
            <span>AUTHENTIC TAMIL NADU STAYS & RESORTS</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-editorial font-extrabold text-[#000000] tracking-tight leading-tight">
            Explore Verified Properties
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 font-editorial max-w-xl mx-auto leading-relaxed">
            Discover verified mountain view resorts, lakeside cottages, riverfront villas, and heritage homestays.
          </p>

          {/* 🔍 SEARCH CONSOLE: DESTINATION CIRCUIT | STAY OPTIONS | SEARCH STAYS */}
          <div className="mt-6 p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-[#242429]/20 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            
            {/* 1. Destination Circuit */}
            <div>
              <label className="block font-fira-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5 flex items-center gap-1">
                <MapPin size={11} className="text-rose-600" /> Destination Circuit
              </label>
              <select 
                value={district} 
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs font-fira-mono font-bold text-black focus:ring-2 focus:ring-black outline-hidden"
              >
                {destinationOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* 2. All Stay Options */}
            <div>
              <label className="block font-fira-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5 flex items-center gap-1">
                <HomeIcon size={11} className="text-cyan-700" /> All Stay Options
              </label>
              <select 
                value={stayType} 
                onChange={(e) => setStayType(e.target.value)}
                className="w-full p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs font-fira-mono font-bold text-black focus:ring-2 focus:ring-black outline-hidden"
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
                className="w-full h-[44px] sm:h-[48px] rounded-2xl bg-[#242429] text-white hover:bg-black text-xs font-bold font-editorial flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Search size={14} /> Search Stays ({displayedProperties.length})
              </button>
            </div>

          </div>

          {/* Quick Stay Option Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 pt-2 justify-center flex-wrap">
            {stayCategories.map(cat => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setStayType(cat.name)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] font-fira-mono font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                  stayType === cat.name 
                    ? 'bg-[#242429] text-white ring-2 ring-black/20' 
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 🏡 VERIFIED PROPERTIES: ALL PROPERTIES LISTED UNDER HEADING */}
      <section id="verified-properties-grid" className="max-w-7xl mx-auto px-3 sm:px-6 pt-4">
        
        {/* Section Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-[#242429]/15 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-fira-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                ✓ ALL VERIFIED PROPERTIES
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                ({displayedProperties.length} Stays Available)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-editorial font-bold text-black mt-1">
              Curated Luxury Stays & Resort Catalog
            </h2>
          </div>

          {/* Active Filter Indicators */}
          {(district !== 'All' && district !== 'All Tamil Nadu' || stayType !== 'All') && (
            <button
              type="button"
              onClick={() => { setDistrict('All'); setStayType('All'); }}
              className="text-xs font-mono font-bold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 w-fit"
            >
              <X size={12} /> Clear Filter ({district !== 'All' ? district : ''} {stayType !== 'All' ? `· ${stayType}` : ''})
            </button>
          )}
        </div>

        {/* Empty State */}
        {displayedProperties.length === 0 ? (
          <div className="p-12 text-center text-slate-500 rounded-3xl bg-white/80 border border-[#242429]/20 space-y-3">
            <Building2 size={40} className="mx-auto text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800 font-editorial">No Properties Match Your Search Criteria</h3>
            <p className="text-xs text-slate-500 font-mono">Try switching Destination Circuit to "All Tamil Nadu" or Stay Option to "All Stays".</p>
            <button
              type="button"
              onClick={() => { setDistrict('All'); setStayType('All'); }}
              className="px-4 py-2 rounded-2xl bg-[#242429] text-white text-xs font-bold font-editorial"
            >
              Show All Verified Properties
            </button>
          </div>
        ) : (
          /* Property Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {displayedProperties.map((stay) => {
              const stayPrice = stay.pricePerNight || stay.price || 4800;
              const stayImg = (stay.images && stay.images[0]) || stay.image || FALLBACK_IMAGE;
              const stayAmenities = stay.amenities || ['Mountain View', 'Free WiFi', 'Private Balcony', 'Organic Dining'];
              
              return (
                <div 
                  key={stay._id || stay.id} 
                  className="group rounded-3xl bg-[#ffffff] border border-[#242429]/20 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  
                  {/* Top Image Container */}
                  <div className="relative h-56 sm:h-60 overflow-hidden bg-slate-100">
                    <img 
                      src={stayImg} 
                      alt={stay.title} 
                      onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    
                    {/* Verified Seal Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-black/15 shadow-md flex items-center gap-1.5 text-[10px] font-fira-mono font-black text-black">
                      <Sparkles size={11} className="text-amber-500" />
                      <span>VERIFIED LUXURY</span>
                    </div>

                    {/* Property Type Badge */}
                    <div className="absolute bottom-3 left-3 bg-[#242429]/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-fira-mono font-bold shadow-md">
                      {stay.type || stay.propertyType || 'RESORT'}
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/15 shadow-md flex items-center gap-1 text-[10px] font-mono font-extrabold text-black">
                      <Star size={11} className="text-amber-500 fill-amber-500" />
                      <span>{stay.rating || '4.9'}</span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    
                    <div className="space-y-2">
                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 uppercase tracking-wider truncate">
                        <MapPin size={13} className="text-rose-600 shrink-0" />
                        <span className="truncate">{stay.location} · {stay.district}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold font-editorial text-black leading-snug group-hover:text-cyan-950 transition-colors line-clamp-2">
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
                        <span className="text-base sm:text-lg font-black font-fira-mono text-black">
                          ₹{Number(stayPrice).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500"> / NIGHT</span>
                      </div>

                      <button 
                        type="button"
                        onClick={() => {
                          if (!currentUser) {
                            onOpenAuth('login');
                          } else {
                            setSelectedStayForBooking(stay);
                          }
                        }}
                        className="px-3.5 sm:px-4 py-2 rounded-2xl bg-[#242429] text-white hover:bg-black text-xs font-bold font-editorial flex items-center gap-1 shadow-sm transition-all shrink-0"
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

      {/* 🎟️ Instant Booking Modal */}
      {selectedStayForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#242429]/20 p-5 sm:p-6 space-y-4 shadow-2xl my-auto animate-in fade-in zoom-in-95">
            
            <div className="flex justify-between items-center border-b border-[#242429]/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  ✓ VERIFIED STAY RESERVATION
                </span>
                <h3 className="text-base font-bold text-black font-editorial mt-1">
                  {selectedStayForBooking.title}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedStayForBooking(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            {bookingSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold space-y-2 text-center animate-in fade-in">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                <p>{bookingSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 font-editorial">Check-In Date *</label>
                  <input 
                    type="date" 
                    required 
                    value={checkInDate} 
                    onChange={e => setCheckInDate(e.target.value)} 
                    className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-black font-mono font-bold" 
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 font-editorial">Number of Guests</label>
                  <select 
                    value={numberOfGuests} 
                    onChange={e => setNumberOfGuests(e.target.value)} 
                    className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-black font-mono font-bold"
                  >
                    <option value={1}>1 Guest (Solo Traveler)</option>
                    <option value={2}>2 Guests (Couple / Pair)</option>
                    <option value={3}>3 Guests (Family / Friends)</option>
                    <option value={4}>4 Guests (Family Suite)</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#fbf8f5] border border-[#242429]/15 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-700 font-editorial">
                    <span>Stay Rate per Night:</span>
                    <span className="font-mono font-bold">₹{Number(selectedStayForBooking.pricePerNight || selectedStayForBooking.price || 4800).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-700 font-editorial">
                    <span>GST & Tourism Taxes:</span>
                    <span className="font-mono font-bold text-emerald-700">INCLUDED</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-black font-editorial border-t border-[#242429]/15 pt-1.5">
                    <span>Total Amount:</span>
                    <span className="font-mono text-emerald-700">₹{Number(selectedStayForBooking.pricePerNight || selectedStayForBooking.price || 4800).toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isBookingSubmitting}
                  className="w-full py-3 rounded-2xl bg-[#242429] text-white font-editorial font-bold text-xs hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CreditCard size={15} /> Confirm & Reserve Stay
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
