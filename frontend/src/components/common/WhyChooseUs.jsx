import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Compass, 
  Car, 
  Utensils, 
  Building, 
  UserCheck, 
  Headphones, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';

export default function WhyChooseUs({ onOpenAuth }) {
  const featureCards = [
    {
      id: 'student-offers',
      icon: <GraduationCap className="w-6 h-6 text-[#242429]" />,
      title: 'Exclusive Student Offers',
      tagline: 'Travel More, Spend Less.',
      body: 'We provide exclusive discounts, budget-friendly packages, and special offers for students, college tours, educational trips, and group adventures.',
      badge: 'STUDENT SPECIAL',
    },
    {
      id: 'women-safety',
      icon: <ShieldCheck className="w-6 h-6 text-[#242429]" />,
      title: '100% Safety for Women & Children',
      tagline: 'Your Safety Is Our Highest Priority.',
      body: 'Travel with confidence through verified accommodations, trusted drivers, emergency support, secure booking, and carefully planned itineraries.',
      badge: 'SAFE & SECURE',
    },
    {
      id: 'adventure-pkgs',
      icon: <Compass className="w-6 h-6 text-[#242429]" />,
      title: 'Adventure Packages',
      tagline: 'Adventure Begins Beyond the Ordinary.',
      body: 'Choose from trekking, camping, waterfall exploration, off-road jeep rides, cycling, wildlife safaris, kayaking, and rock climbing.',
      badge: 'ADVENTURE READY',
    },
    {
      id: 'transport',
      icon: <Car className="w-6 h-6 text-[#242429]" />,
      title: 'Cab & Transportation Services',
      tagline: 'Travel Comfortably, Anywhere.',
      body: 'We provide reliable transportation including private cabs, tempo travellers, luxury buses, airport transfers, and bike rentals.',
      badge: 'DOORSTEP PICKUP',
    },
    {
      id: 'food-packages',
      icon: <Utensils className="w-6 h-6 text-[#242429]" />,
      title: 'Food Packages',
      tagline: 'Taste Every Journey.',
      body: 'Enjoy hygienic, delicious, and customizable meal plans featuring authentic Tamil cuisine, vegetarian, non-vegetarian, and Jain options.',
      badge: 'MEALS INCLUDED',
    },
    {
      id: 'verified-stays',
      icon: <Building className="w-6 h-6 text-[#242429]" />,
      title: 'Verified Stays',
      tagline: 'Comfort & Quality Guaranteed.',
      body: 'Stay only in carefully verified hotels, resorts, cottages, villas, and homestays that meet our strict quality, hygiene, and safety standards.',
      badge: 'VERIFIED STAYS',
    },
    {
      id: 'local-guides',
      icon: <UserCheck className="w-6 h-6 text-[#242429]" />,
      title: 'Expert Local Guides',
      tagline: 'Discover Untold Stories.',
      body: 'Discover hidden gems and authentic local experiences with experienced guides who know Tamil Nadu inside and out.',
      badge: 'LOCAL EXPERTS',
    },
    {
      id: 'customer-support',
      icon: <Headphones className="w-6 h-6 text-[#242429]" />,
      title: '24×7 Customer Support',
      tagline: 'Peace of Mind, Always.',
      body: 'Our travel assistance team is available around the clock to help before, during, and after your journey.',
      badge: 'ALWAYS AVAILABLE',
    }
  ];

  const trustBannerPoints = [
    'Verified Hotels & Homestays',
    'Safe Travel for Women & Families',
    'Student-Friendly Pricing',
    'Flexible Tour Packages',
    'Comfortable Transport Options',
    'Quality Food Packages',
    'Professional Travel Assistance',
    'Secure Online Payments',
    'Experienced Local Guides',
    '24×7 Customer Support'
  ];

  return (
    <section className="w-full py-16 bg-[#ffffff] border border-[#242429]/20 rounded-3xl my-12 shadow-xl p-6 lg:p-12">
      
      {/* Section Header */}
      <div className="text-center max-w-4xl mx-auto mb-14">
        <div className="museum-badge mx-auto mb-4">
          <Sparkles size={12} className="text-[#242429]" /> TRUSTED TOURISM PLATFORM
        </div>
        
        <h2 className="text-4xl md:text-5xl font-editorial font-bold text-[#000000] mb-4">
          Why Choose Explore Tamil Nadu?
        </h2>

        <p className="text-lg md:text-xl font-editorial text-[#3e3e3e] mb-5 italic">
          "More Than a Trip — We Book Safe, Memorable & Premium Stays Across Tamil Nadu."
        </p>

        <p className="text-sm md:text-base text-[#3e3e3e] leading-relaxed max-w-3xl mx-auto font-editorial">
          Whether you're a solo explorer, a group of friends, a family on vacation, or a college team planning an adventure, we handle every detail—from planning and transportation to accommodation and food.
        </p>
      </div>

      {/* Feature Cards Grid (8 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {featureCards.map((card) => (
          <div 
            key={card.id}
            className="group relative bg-[#f9f5f2] border border-[#242429]/20 hover:border-[#242429] rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Highlight Badge */}
            <div className="flex justify-between items-start mb-5">
              <div className="p-2.5 rounded-xl border border-[#242429]/20 bg-[#ffffff] group-hover:scale-105 transition-transform shadow-sm">
                {card.icon}
              </div>
              <span className="museum-badge text-[9px] px-2 py-0.5">
                {card.badge}
              </span>
            </div>

            {/* Title & Tagline */}
            <h3 className="text-lg font-editorial font-bold text-[#000000] mb-1 group-hover:text-[#242429] transition-colors">
              {card.title}
            </h3>
            <p className="font-fira-mono text-[10px] text-[#919191] uppercase tracking-wider mb-3">
              {card.tagline}
            </p>

            {/* Description Body */}
            <p className="text-xs text-[#3e3e3e] leading-relaxed font-editorial">
              {card.body}
            </p>
          </div>
        ))}
      </div>

      {/* Trust Banner */}
      <div className="bg-[#f9f5f2] border border-[#242429]/20 rounded-2xl p-8 lg:p-10 mb-14 shadow-inner">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="font-fira-mono text-[10px] font-bold text-[#919191] uppercase tracking-[0.18em] block mb-1">100% RELIABLE TRAVEL PARTNER</span>
          <h3 className="text-2xl md:text-3xl font-editorial font-bold text-[#000000]">Why Thousands of Travelers Choose Us</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {trustBannerPoints.map((point, idx) => (
            <div 
              key={`trust-pt-${idx}`}
              className="flex items-center gap-2.5 bg-[#ffffff] border border-[#242429]/20 p-3.5 rounded-xl shadow-sm hover:border-[#242429] transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-[#242429] flex-shrink-0" />
              <span className="font-fira-mono text-[11px] font-medium text-[#242429] leading-snug">{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Final Call-to-Action (CTA) */}
      <div className="bg-[#070707] rounded-2xl p-8 lg:p-12 text-center text-[#f9f5f2] border border-[#242429] shadow-2xl relative overflow-hidden">
        <h3 className="text-3xl md:text-5xl font-editorial font-bold tracking-tight mb-4 text-[#ffffff]">
          "Pack Your Bags. We'll Handle the Rest."
        </h3>
        <p className="text-sm md:text-base text-[#919191] max-w-2xl mx-auto mb-8 leading-relaxed font-editorial">
          Join thousands of happy travelers exploring the beauty of Tamil Nadu with safe, affordable, and premium stays and travel experiences.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => onOpenAuth('register')}
            className="w-full sm:w-auto glass-button text-xs px-8 py-4 flex items-center justify-center gap-2 bg-[#ffffff] text-[#000000] hover:bg-[#f9f5f2]"
          >
            START YOUR JOURNEY <ArrowRight size={16} />
          </button>
          
          <button 
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto glass-button glass-button-secondary text-xs px-8 py-4"
          >
            EXPLORE TOUR PACKAGES
          </button>
        </div>
      </div>

    </section>
  );
}
