import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, ChevronRight, Compass } from 'lucide-react';
import { TAMIL_NADU_CATEGORIES, TOURISM_PLACES } from '../data/tamilNaduData';
import WhyChooseUs from '../components/common/WhyChooseUs';

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
    navigate('/explore');
  };

  const filteredPlaces = TOURISM_PLACES.filter(p => {
    if (selectedPlaceCategory === 'all') return true;
    return p.category === selectedPlaceCategory;
  });

  return (
    <div>
      
      {/* 🌲 Kobu Editorial Hero Banner with Glassmorphism */}
      <section className="w-full py-16 sm:py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">

          {/* Fira Mono Printed Tagline Badge */}
          <div className="museum-badge mx-auto mb-5 sm:mb-6 shadow-md text-[10px] sm:text-xs">
            EST. TAMIL NADU • EDITORIAL TRAVEL MAGAZINE
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-editorial font-extrabold tracking-tight leading-tight text-[#070707] drop-shadow-[0_2px_12px_rgba(249,245,242,0.9)] mb-4 sm:mb-6">
            Discover Authentic <br />
            <span className="italic font-serif font-normal text-[#242429]">Stays & Luxury Resorts</span> in Tamil Nadu
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-[#16161a] font-medium mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-editorial drop-shadow-[0_1px_8px_rgba(249,245,242,0.95)]">
            Curated mountain view cottages, serene lakefront villas, and heritage homestays across the Western Ghats and Tamil circuits.
          </p>

          {/* Search Console leading directly to Explore */}
          <form onSubmit={handleSearchNavigate} className="glass-panel p-4 sm:p-6 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-left border border-[#242429]/20 shadow-2xl rounded-3xl">
            <div>
              <label className="block font-fira-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-[#919191] mb-1.5">Destination Circuit</label>
              <select className="glass-input text-xs font-fira-mono" value={district} onChange={e => setDistrict(e.target.value)}>
                {destinationOptions.map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-fira-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-[#919191] mb-1.5">Stay Category</label>
              <select className="glass-input text-xs font-fira-mono" value={stayType} onChange={e => setStayType(e.target.value)}>
                {stayCategories.map(c => <option key={c.name} value={c.name}>{c.label}</option>)}
              </select>
            </div>

            <div className="flex items-end">
              <button type="submit" className="glass-button w-full h-[45px] text-xs font-bold font-editorial flex items-center justify-center gap-2">
                <Search size={14} /> Search Stays
              </button>
            </div>
          </form>

        </div>
      </section>

      {/* Main Content Area: Overview Catalog (NO Verified Properties here - they belong strictly in Explore) */}
      <div className="max-w-7xl mx-auto px-4">

        {/* 🛕 Destinations Catalog Section */}
        <section className="pb-16 pt-4">
          <div className="text-center mb-8 border-b border-[#242429]/15 pb-6">
            <span className="font-fira-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#919191] block mb-1">DISCOVER DESTINATIONS</span>
            <h2 className="text-3xl md:text-4xl font-editorial font-bold text-[#000000]">Explore Tamil Nadu Tourism Circuits</h2>
            <p className="text-sm text-[#3e3e3e] mt-2 font-editorial">Hill stations, waterfalls, ancient temples, wildlife, and heritage circuits.</p>
          </div>

          {/* 10 Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-10 justify-center flex-wrap">
            {TAMIL_NADU_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedPlaceCategory(cat.id)}
                className={`glass-button font-fira-mono text-[11px] px-4 py-2 flex items-center gap-2 ${selectedPlaceCategory === cat.id ? '' : 'glass-button-secondary'}`}
              >
                <span>{cat.icon}</span> {cat.name.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Destination Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPlaces.map(place => (
              <div key={place.id} className="glass-panel glass-panel-hover overflow-hidden rounded-2xl bg-[#ffffff] border border-[#242429]/20 shadow-md">
                <div className="h-44 overflow-hidden relative">
                  <img 
                    src={place.image} 
                    alt={place.name} 
                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                    className="w-full h-full object-cover" 
                  />
                  <span className="museum-badge absolute top-3 right-3 shadow text-[10px]">
                    {place.subCategory || 'DESTINATION'}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-editorial font-bold text-[#000000] mb-1">{place.name}</h3>
                  <div className="font-fira-mono text-[10px] text-[#919191] font-medium mb-2 flex items-center gap-1 uppercase tracking-wider">
                    <MapPin size={12} className="text-[#242429]" /> {place.region}
                  </div>
                  <p className="text-xs text-[#3e3e3e] leading-relaxed line-clamp-3 font-editorial">{place.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🌟 Call to Action to Explore Verified Properties */}
        <section className="my-12 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#242429] to-[#0f1115] text-white text-center space-y-4 shadow-2xl relative overflow-hidden">
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
