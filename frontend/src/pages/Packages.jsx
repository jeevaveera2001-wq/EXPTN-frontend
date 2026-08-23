import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Car, 
  ShieldCheck, 
  Bell, 
  Check, 
  ArrowRight,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Packages({ onOpenAuth }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifyEmail, setNotifyEmail] = useState(currentUser?.email || '');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (!notifyEmail) return;
    try {
      const existing = JSON.parse(localStorage.getItem('etn_package_subscribers') || '[]');
      existing.push({ email: notifyEmail, date: new Date().toISOString() });
      localStorage.setItem('etn_package_subscribers', JSON.stringify(existing));
    } catch (err) {}
    setIsSubscribed(true);
  };

  const upcomingPackages = [
    {
      title: 'Nilgiri Misty Cloud & Tea Estate Trail',
      duration: '4 Days / 3 Nights',
      circuit: 'Ooty · Coonoor · Doddabetta',
      icon: '⛰️',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      highlights: ['Heritage Planter Bungalow Stay', 'UNESCO Toy Train Ride', 'Tea Tasting Tour', 'Private AC SUV & Driver']
    },
    {
      title: 'Chola Royal Heritage & Chettinad Palace Circuit',
      duration: '5 Days / 4 Nights',
      circuit: 'Thanjavur · Kumbakonam · Chettinad',
      icon: '🛕',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      highlights: ['Tanjore Big Temple VIP Entry', '110-Yr Mansion Stay', 'Authentic Chettinad Feast', 'Archaeologist Guide']
    },
    {
      title: 'Princess of Hills Kodai Escape',
      duration: '3 Days / 2 Nights',
      circuit: 'Kodaikanal · Berijam · Pillar Rocks',
      icon: '🌲',
      image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
      highlights: ['Pine Forest Lakeside Villa', 'Boating & Horse Riding', 'Bonfire & Star Gazing', 'Certified Local Guide']
    },
    {
      title: 'Southern Tip Spiritual & Ocean Odyssey',
      duration: '4 Days / 3 Nights',
      circuit: 'Madurai · Rameswaram · Kanyakumari',
      icon: '🌊',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      highlights: ['Meenakshi Amman VIP Darshan', 'Pamban Sea Bridge Drive', 'Triveni Sangam Sunrise', 'Beachfront Luxury Resort']
    }
  ];

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-[#f9f5f2] via-[#f5efe9] to-[#eee8e0]">
      
      {/* Hero Section */}
      <section className="pt-8 sm:pt-16 pb-6 sm:pb-10 px-3 sm:px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-[9px] sm:text-xs font-mono font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>🚀 ALL-INCLUSIVE TOUR PACKAGES · AVAILABLE SOON</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-editorial font-extrabold text-black tracking-tight leading-tight">
            Curated Tamil Nadu Expeditions
          </h1>

          <p className="text-xs sm:text-base md:text-lg text-slate-600 font-editorial max-w-2xl mx-auto leading-relaxed">
            We are handcrafting complete all-inclusive multi-day travel packages combining <strong>verified 5-star stays</strong>, <strong>licensed native tour guides</strong>, and <strong>private chauffeur transport</strong>.
          </p>

          {/* Early Access Notification Form */}
          <div className="pt-2 sm:pt-4 max-w-xl mx-auto">
            {!isSubscribed ? (
              <form onSubmit={handleNotifySubmit} className="p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border border-[#242429]/20 shadow-xl flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="Enter your email for early package access..."
                  className="flex-1 px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-black outline-hidden focus:ring-2 focus:ring-black"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#242429] text-white hover:bg-black font-editorial font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Bell size={14} className="text-amber-400" />
                  <span>Notify Me at Launch</span>
                </button>
              </form>
            ) : (
              <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-editorial font-bold text-xs flex items-center justify-center gap-2 shadow-sm animate-in fade-in">
                <Check size={16} className="text-emerald-600" />
                <span>You're on the priority early-access list! We'll notify you the moment packages launch.</span>
              </div>
            )}
          </div>

          {/* Direct CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/hotels')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[#242429]/25 text-black hover:bg-slate-50 font-editorial font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <span>Explore Stays & Resorts (Now Live)</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </section>

      {/* Package Sneak Peek Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="flex items-center justify-between border-b border-[#242429]/15 pb-4 mb-6">
          <div>
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Sneak Peek
            </span>
            <h2 className="text-xl sm:text-2xl font-editorial font-bold text-black">
              Upcoming Signature Itineraries
            </h2>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full">
            Launching Soon
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcomingPackages.map((pkg, idx) => (
            <div 
              key={idx}
              className="rounded-3xl bg-white/95 border border-[#242429]/15 shadow-md overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={pkg.image} 
                  alt={pkg.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                  {pkg.duration}
                </span>
                <span className="absolute top-3 right-3 text-lg">
                  {pkg.icon}
                </span>
                <span className="absolute bottom-3 left-3 text-white text-xs font-mono font-bold flex items-center gap-1">
                  <MapPin size={11} className="text-rose-400" /> {pkg.circuit}
                </span>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-editorial font-bold text-black leading-snug">
                    {pkg.title}
                  </h3>
                  <div className="mt-3 space-y-1.5">
                    {pkg.highlights.map((h, i) => (
                      <div key={i} className="text-[11px] text-slate-600 font-editorial flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Status</span>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Available Soon
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="max-w-5xl mx-auto px-4 pt-16 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white/80 border border-[#242429]/15 shadow-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto">
              <ShieldCheck size={22} />
            </div>
            <h4 className="text-sm font-editorial font-bold text-black">100% Verified Providers</h4>
            <p className="text-xs text-slate-500 font-editorial leading-relaxed">
              Every hotel, car, and guide is physically verified by the Explore Tamil Nadu team.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white/80 border border-[#242429]/15 shadow-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <Users size={22} />
            </div>
            <h4 className="text-sm font-editorial font-bold text-black">Native Certified Guides</h4>
            <p className="text-xs text-slate-500 font-editorial leading-relaxed">
              Experience the soul of Tamil culture with local historians, naturalists, and storytellers.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white/80 border border-[#242429]/15 shadow-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <Car size={22} />
            </div>
            <h4 className="text-sm font-editorial font-bold text-black">Private Chauffeur Fleet</h4>
            <p className="text-xs text-slate-500 font-editorial leading-relaxed">
              Enjoy door-to-door comfort with experienced drivers who know every mountain hairpin bend.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
