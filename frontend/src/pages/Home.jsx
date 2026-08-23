import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, ChevronRight, Compass } from 'lucide-react';
import { TAMIL_NADU_CATEGORIES, TOURISM_PLACES } from '../data/tamilNaduData';
import WhyChooseUs from '../components/common/WhyChooseUs';
import { openGoogleMaps } from '../utils/mapsHelper';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80';

export default function Home({ onOpenAuth }) {
  const navigate = useNavigate();
  const [district, setDistrict] = useState('All Tamil Nadu');
  const [stayType, setStayType] = useState('All');
  const [selectedPlaceCategory, setSelectedPlaceCategory] = useState('top15');

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
    'Thanjavur (Tanjore)'
  ];

  const stayCategories = [
    { name: 'All', label: 'All Stay Options' },
    { name: 'Resort', label: '🏰 Resort' },
    { name: 'Home stay', label: '🏡 Home stay' },
    { name: 'Lakeview resort', label: '🏞️ Lakeview resort' },
    { name: 'River view resort', label: '🌊 River view resort' },
    { name: 'Mountain view resort', label: '⛰️ Mountain view resort' },
    { name: 'Heritage Cottage', label: '🛖 Heritage Cottage' },
    { name: 'Forest Eco Stay', label: '🌲 Forest Eco Stay' }
  ];

  const handleSearchNavigate = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (district && district !== 'All Tamil Nadu') {
      const cleanDest = district.split('(')[0].trim();
      params.set('district', cleanDest);
    }
    if (stayType && stayType !== 'All') {
      params.set('type', stayType);
    }
    navigate(`/explore?${params.toString()}`);
  };

  const handleDestinationClick = (place) => {
    const cleanRegion = place.region || place.name;
    navigate(`/explore?district=${encodeURIComponent(cleanRegion)}&search=${encodeURIComponent(place.name)}`);
  };

  const filteredPlaces = TOURISM_PLACES.filter(p => {
    if (selectedPlaceCategory === 'all') return true;
    return p.category === selectedPlaceCategory;
  });

  return (
    <div className="w-full overflow-x-hidden">
      
      {/* 🌲 Kobu Editorial Hero Banner with Glassmorphism */}
      <section className="w-full py-8 sm:py-20 px-3 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">

          {/* Fira Mono Printed Tagline Badge */}
          <div className="museum-badge mx-auto mb-3 sm:mb-6 shadow-md text-[9px] sm:text-xs py-1 px-3 sm:px-4">
            EST. TAMIL NADU • EDITORIAL TRAVEL MAGAZINE
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-6xl font-editorial font-extrabold tracking-tight leading-snug sm:leading-tight text-[#070707] drop-shadow-[0_2px_12px_rgba(249,245,242,0.9)] mb-2 sm:mb-4">
            Discover Authentic <br className="hidden sm:inline" />
            <span className="italic font-serif font-normal text-[#242429]">Stays & Luxury Resorts</span> in Tamil Nadu
          </h1>

          <p className="text-xs sm:text-base md:text-lg text-[#16161a] font-medium mb-4 sm:mb-8 max-w-2xl mx-auto leading-relaxed font-editorial drop-shadow-[0_1px_8px_rgba(249,245,242,0.95)]">
            Curated mountain view cottages, serene lakefront villas, and heritage homestays across the Western Ghats and Tamil circuits.
          </p>

          {/* Search Console leading directly to Explore with parameters */}
          <form onSubmit={handleSearchNavigate} className="glass-panel p-3 sm:p-6 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4 text-left border border-[#242429]/20 shadow-2xl rounded-2xl sm:rounded-3xl">
            <div>
              <label className="block font-fira-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-[#919191] mb-1">Destination Circuit</label>
              <select className="glass-input text-xs font-fira-mono py-2" value={district} onChange={e => setDistrict(e.target.value)}>
                {destinationOptions.map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-fira-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-[#919191] mb-1">Stay Category</label>
              <select className="glass-input text-xs font-fira-mono py-2" value={stayType} onChange={e => setStayType(e.target.value)}>
                {stayCategories.map(c => <option key={c.name} value={c.name}>{c.label}</option>)}
              </select>
            </div>

            <div className="flex items-end">
              <button type="submit" className="glass-button w-full h-[40px] sm:h-[45px] text-xs font-bold font-editorial flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all">
                <Search size={14} /> Search Stays & Cabs
              </button>
            </div>
          </form>

        </div>
      </section>

      {/* Main Content Area: Overview Catalog */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">

        {/* 🛕 Destinations Catalog Section */}
        <section className="pb-12 sm:pb-16 pt-2 sm:pt-4">
          <div className="text-center mb-6 sm:mb-8 border-b border-[#242429]/15 pb-4 sm:pb-6">
            <span className="font-fira-mono text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#919191] block mb-1">DISCOVER DESTINATIONS</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-editorial font-bold text-[#000000]">Explore Tamil Nadu Tourism Circuits</h2>
            <p className="text-xs sm:text-sm text-[#3e3e3e] mt-1 sm:mt-2 font-editorial">Hill stations, waterfalls, ancient temples, wildlife, and heritage circuits.</p>
          </div>

          {/* 10 Category Tabs: Horizontal scroll on mobile, wrap on desktop */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-3 mb-6 sm:mb-10 sm:justify-center sm:flex-wrap no-scrollbar px-1">
            {TAMIL_NADU_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedPlaceCategory(cat.id)}
                className={`glass-button font-fira-mono text-[10px] sm:text-[11px] px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 shrink-0 whitespace-nowrap rounded-full transition-all cursor-pointer ${
                  selectedPlaceCategory === cat.id ? 'ring-1 ring-[#242429] bg-[#242429] text-white shadow-sm' : 'glass-button-secondary'
                }`}
              >
                <span>{cat.icon}</span> {cat.name.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Destination Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredPlaces.map(place => (
              <div 
                key={place.id} 
                onClick={() => handleDestinationClick(place)}
                className="glass-panel glass-panel-hover overflow-hidden rounded-2xl sm:rounded-3xl bg-[#ffffff] border border-[#242429]/20 shadow-md flex flex-col justify-between cursor-pointer group transition-all"
              >
                <div>
                  <div className="h-44 sm:h-48 overflow-hidden relative">
                    <img 
                      src={place.image} 
                      alt={place.name} 
                      onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <span className="museum-badge absolute top-3 right-3 shadow text-[9px] sm:text-[10px]">
                      {place.subCategory || 'DESTINATION'}
                    </span>
                    <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                      📍 {place.region}
                    </span>
                  </div>
                  
                  <div className="p-4 sm:p-5 space-y-2">
                    <h3 className="text-base sm:text-lg font-editorial font-bold text-[#000000] group-hover:text-blue-700 transition-colors">
                      {place.name}
                    </h3>
                    
                    <p className="text-xs text-[#3e3e3e] leading-relaxed line-clamp-2 font-editorial">
                      {place.desc}
                    </p>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="p-4 pt-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold font-editorial text-blue-700 flex items-center gap-1 group-hover:underline">
                    <span>Explore Stays</span>
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openGoogleMaps({ title: place.name, location: place.region, district: place.region }, e);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition-all"
                  >
                    <MapPin size={11} className="text-emerald-700" />
                    <span>Maps ↗</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🌟 Call to Action to Explore Verified Properties */}
        <section className="my-8 sm:my-12 p-6 sm:p-12 rounded-3xl bg-gradient-to-br from-[#242429] to-[#0f1115] text-white text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold inline-flex items-center gap-1.5">
              <Sparkles size={13} /> VERIFIED LUXURY PORTAL
            </span>
            <h3 className="text-2xl sm:text-4xl font-editorial font-extrabold leading-tight">
              Ready to Book an Authentic Stay in Tamil Nadu?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-editorial leading-relaxed">
              Explore verified lakeview resorts in Ooty, mountain eco-villas in Kodaikanal, and heritage river retreats in Thanjavur.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="px-6 py-3 rounded-full bg-white text-black hover:bg-slate-100 font-editorial font-extrabold text-xs inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
              >
                <Compass size={15} /> Explore Verified Stays & Resorts <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* 🌟 Why Choose Us Premium Section */}
        <WhyChooseUs onOpenAuth={onOpenAuth} />

      </div>
    </div>
  );
}
