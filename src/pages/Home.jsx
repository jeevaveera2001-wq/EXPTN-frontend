import React, { useState } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import { TAMIL_NADU_CATEGORIES, TOURISM_PLACES } from '../data/tamilNaduData';
import WhyChooseUs from '../components/common/WhyChooseUs';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80';

export default function Home({ onOpenAuth }) {
  const [stayType, setStayType] = useState('All');
  const [district, setDistrict] = useState('All');
  const [selectedPlaceCategory, setSelectedPlaceCategory] = useState('top15');

  const stayCategories = [
    { name: 'Resort', icon: '🏰' },
    { name: 'Home stay', icon: '🏡' },
    { name: 'Lakeview resort', icon: '🏞️' },
    { name: 'River view resort', icon: '🌊' },
    { name: 'Mountain view resort', icon: '⛰️' },
    { name: 'Heritage Cottage', icon: '🛖' },
    { name: 'Forest Eco Stay', icon: '🌲' }
  ];

  const featuredStays = [
    {
      id: 'prop-1',
      title: 'Ooty Lakeview Grand Resort',
      district: 'Nilgiris',
      location: 'West Lake Road, Ooty Lake',
      type: 'LAKEVIEW RESORT',
      price: 4800,
      rating: 4.9,
      reviews: 52,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      desc: 'Luxury glass lakeview resort situated directly on the shore of Ooty Lake with private boat deck.',
      amenities: ['Lake View Balcony', 'Boat Deck', 'Fireplace']
    },
    {
      id: 'prop-2',
      title: 'Nilgiri Mountain View Eco Villa',
      district: 'Nilgiris',
      location: 'Doddabetta Ridge Road, Ooty',
      type: 'MOUNTAIN VIEW RESORT',
      price: 5400,
      rating: 4.88,
      reviews: 38,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      desc: 'High-altitude mountain view resort overlooking the misty Nilgiri tea estates.',
      amenities: ['360 Mountain View', 'Tea Estate Walk', 'Organic Kitchen']
    },
    {
      id: 'prop-3',
      title: 'Cauvery River View Heritage Resort',
      district: 'Thanjavur',
      location: 'Grand Anicut Road, Cauvery River Front',
      type: 'RIVER VIEW RESORT',
      price: 4200,
      rating: 4.92,
      reviews: 84,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      desc: 'Peaceful river view resort situated along the holy Cauvery River banks near Tanjore Big Temple.',
      amenities: ['River Front Deck', 'Temple Distance 1km', 'Swimming Pool']
    },
    {
      id: 'prop-4',
      title: 'Kodai Star Lakeview Pine Cottage',
      district: 'Dindigul',
      location: 'Lake Road, Kodaikanal',
      type: 'LAKEVIEW COTTAGE',
      price: 4600,
      rating: 4.82,
      reviews: 45,
      image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
      desc: 'Private pine wood cottage with direct panorama of Kodai Lake and pine forest trail.',
      amenities: ['Kodai Lake Panorama', 'Private Bonfire Yard', 'Pine Forest View']
    }
  ];

  const filteredPlaces = TOURISM_PLACES.filter(p => {
    if (selectedPlaceCategory === 'all') return true;
    return p.category === selectedPlaceCategory;
  });

  return (
    <div>
      
      {/* 🌲 Kobu Editorial Hero Banner with Glassmorphism */}
      <section className="w-full py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">

          {/* Fira Mono Printed Tagline Badge */}
          <div className="museum-badge mx-auto mb-6 shadow-md">
            EST. TAMIL NADU • EDITORIAL TRAVEL MAGAZINE
          </div>

          <h1 className="text-5xl md:text-7xl font-editorial font-extrabold tracking-tight leading-tight text-[#070707] drop-shadow-[0_2px_12px_rgba(249,245,242,0.9)] mb-6">
            Discover Authentic <br />
            <span className="italic font-serif font-normal text-[#242429]">Stays & Luxury Resorts</span> in Tamil Nadu
          </h1>

          <p className="text-lg md:text-xl text-[#16161a] font-medium mb-10 max-w-2xl mx-auto leading-relaxed font-editorial drop-shadow-[0_1px_8px_rgba(249,245,242,0.95)]">
            Curated mountain view cottages, serene lakefront villas, and heritage homestays across the Western Ghats and Tamil circuits.
          </p>

          {/* Glossy Search Console in Parchment Canvas */}
          <div className="glass-panel p-6 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 text-left border border-[#242429]/20 shadow-2xl">
            <div>
              <label className="block font-fira-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#919191] mb-1.5">Destination Circuit</label>
              <select className="glass-input text-xs font-fira-mono" value={district} onChange={e => setDistrict(e.target.value)}>
                <option value="All">All Tamil Nadu</option>
                <option value="Nilgiris">Nilgiris (Ooty)</option>
                <option value="Dindigul">Dindigul (Kodaikanal)</option>
                <option value="Thanjavur">Thanjavur (Cauvery River)</option>
                <option value="Madurai">Madurai (Vaigai River)</option>
              </select>
            </div>

            <div>
              <label className="block font-fira-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#919191] mb-1.5">Stay Category</label>
              <select className="glass-input text-xs font-fira-mono" value={stayType} onChange={e => setStayType(e.target.value)}>
                <option value="All">All Stay Options</option>
                {stayCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex items-end">
              <button onClick={() => onOpenAuth('login')} className="glass-button w-full h-[45px]">
                <Search size={14} /> Search Stays
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4">

        {/* 🏡 Stay Options Filter Bar */}
        <section className="py-10">
          <div className="text-center mb-8">
            <span className="font-fira-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#919191] block mb-2">CURATED STAYS CATALOG</span>
            <h2 className="text-3xl md:text-4xl font-editorial font-bold text-[#000000]">Select Stay Category</h2>
            <p className="text-sm text-[#3e3e3e] mt-1 font-editorial">Explore lakeview resorts, mountain view stays, river retreats, heritage cottages & homestays.</p>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-4 justify-center flex-wrap">
            <button 
              onClick={() => setStayType('All')}
              className={`glass-button font-fira-mono text-xs px-5 py-2.5 ${stayType === 'All' ? '' : 'glass-button-secondary'}`}
            >
              ALL STAYS ({featuredStays.length})
            </button>

            {stayCategories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setStayType(cat.name)}
                className={`glass-button font-fira-mono text-xs px-5 py-2.5 flex items-center gap-1.5 ${stayType === cat.name ? '' : 'glass-button-secondary'}`}
              >
                <span>{cat.icon}</span> {cat.name.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        {/* 🖼️ Gallery White Surface Cards Section */}
        <section className="pb-16">
          <div className="flex justify-between items-end mb-8 border-b border-[#242429]/15 pb-4">
            <div>
              <span className="font-fira-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#919191] block mb-1">FEATURED RETREATS</span>
              <h2 className="text-3xl md:text-4xl font-editorial font-bold text-[#000000]">Mountain Views & Lakeview Stays</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStays
              .filter(s => (stayType === 'All' || s.type.toLowerCase().includes(stayType.toLowerCase())) && (district === 'All' || s.district === district))
              .map(stay => (
                <div key={stay.id} className="glass-panel glass-panel-hover overflow-hidden rounded-2xl bg-[#ffffff] border border-[#242429]/20 shadow-md">
                  <div className="h-52 overflow-hidden relative">
                    <img 
                      src={stay.image} 
                      alt={stay.title} 
                      onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                      className="w-full h-full object-cover" 
                    />
                    <span className="museum-badge absolute top-3 left-3 shadow">
                      {stay.type}
                    </span>
                    <span className="museum-badge absolute bottom-3 right-3 shadow flex items-center gap-1 text-[10px]">
                      <Star size={10} className="text-[#242429] fill-[#242429]" /> {stay.rating}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="font-fira-mono text-[11px] text-[#919191] font-medium mb-1 flex items-center gap-1 tracking-wider uppercase">
                      <MapPin size={12} className="text-[#242429]" /> {stay.location}
                    </div>
                    <h3 className="text-lg font-editorial font-bold text-[#000000] mb-2 leading-snug">{stay.title}</h3>
                    <p className="text-xs text-[#3e3e3e] mb-4 line-clamp-2 leading-relaxed font-editorial">{stay.desc}</p>

                    <div className="flex justify-between items-center pt-3 border-t border-[#242429]/15">
                      <div>
                        <span className="font-fira-mono text-base font-bold text-[#000000]">₹{stay.price.toLocaleString()}</span>
                        <span className="font-fira-mono text-[10px] text-[#919191]"> / NIGHT</span>
                      </div>
                      <button onClick={() => onOpenAuth('login')} className="glass-button text-[10px] px-3.5 py-2">
                        BOOK STAY
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* 🛕 Destinations Catalog Section */}
        <section className="pb-24">
          <div className="text-center mb-10 border-b border-[#242429]/15 pb-6">
            <span className="font-fira-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#919191] block mb-1">DISCOVER DESTINATIONS</span>
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

        {/* 🌟 Why Choose Us Premium Section */}
        <WhyChooseUs onOpenAuth={onOpenAuth} />

      </div>
    </div>
  );
}
