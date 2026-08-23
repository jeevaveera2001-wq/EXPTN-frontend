import React, { useState, useEffect } from 'react';

// 🎬 28 Authentic Travel Memories for Vintage Movie Reel
export const TRAVEL_FILM_MEMORIES = [
  {
    id: 1,
    frameNo: '001',
    title: 'Friends Around a Campfire',
    category: 'Night & Bonfire',
    location: 'Kodaikanal Pine Forest Tents',
    image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80',
    caption: 'A night filled with acoustic guitars, warm sparks, and golden laughter under starry mountain skies.'
  },
  {
    id: 2,
    frameNo: '002',
    title: 'Solo Traveler Watching Sunrise',
    category: 'Sunrise & Solitude',
    location: 'Kanyakumari Sunset & Sunrise Point',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    caption: 'Where three oceans meet in silent awe as the first amber rays ignite the ocean horizon.'
  },
  {
    id: 3,
    frameNo: '003',
    title: 'Misty Mountains',
    category: 'Hill Stations',
    location: 'Nilgiri Hills, Ooty',
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80',
    caption: 'Soft cloud blankets sweeping over eucalyptus peaks and tranquil high-altitude valleys.'
  },
  {
    id: 4,
    frameNo: '004',
    title: 'Tea Plantations',
    category: 'Nature & Spices',
    location: 'Coonoor Tea Estates',
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
    caption: 'Endless emerald green carpeted slopes echoing with the aroma of freshly plucked tea leaves.'
  },
  {
    id: 5,
    frameNo: '005',
    title: 'Cascading Waterfalls',
    category: 'Waterfalls',
    location: 'Hogenakkal & Catherine Falls',
    image: '/assets/waterfalls/catherine_falls.jpg',
    caption: 'Roaring white waters plunging down ancient granite gorges with cool misty spray.'
  },
  {
    id: 6,
    frameNo: '006',
    title: 'Dense Forests',
    category: 'Wilderness',
    location: 'Anamalai Tiger Reserve Forest',
    image: '/assets/wildlife/anamalai_tiger_reserve.jpg',
    caption: 'Sunbeams filtering through dense tropical rainforest canopy teeming with wild flora and fauna.'
  },
  {
    id: 7,
    frameNo: '007',
    title: 'Winding Hill Roads',
    category: 'Drives & Passes',
    location: 'Kolli Hills 70 Hairpin Bends',
    image: 'https://images.unsplash.com/photo-1626014903708-ec4f664a7812?auto=format&fit=crop&w=800&q=80',
    caption: 'An exhilarating ribbon of asphalt twisting through 70 legendary hairpin turns.'
  },
  {
    id: 8,
    frameNo: '008',
    title: 'Motorcycle Road Trips',
    category: 'Road Trips',
    location: 'East Coast Road (ECR) Highway',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
    caption: 'Riding into the ocean wind along coastal highway stretches with sea breeze on your face.'
  },
  {
    id: 9,
    frameNo: '009',
    title: 'Family Vacations',
    category: 'Family Memories',
    location: 'Kodaikanal Lake Boating',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
    caption: 'Pedal boat rides and sweet memories shared across generations on serene lake waters.'
  },
  {
    id: 10,
    frameNo: '010',
    title: 'Luxury Heritage Resorts',
    category: 'Stays & Living',
    location: 'Chettinad Heritage Mansion',
    image: '/assets/heritage/chettinad_heritage.jpg',
    caption: 'Unwinding in royal 19th-century courtyards adorned with Italian marble and Belgian glass.'
  },
  {
    id: 11,
    frameNo: '011',
    title: 'Wooden Cottages',
    category: 'Cozy Living',
    location: 'Ooty Mountain Log Cabins',
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
    caption: 'Warm crackling fireplace, cedar scented rooms, and steaming tea on a misty morning.'
  },
  {
    id: 12,
    frameNo: '012',
    title: 'Riverside Camping',
    category: 'Adventure',
    location: 'Kaveri River Bank Tents',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80',
    caption: 'Falling asleep to the gentle babble of river currents under a canopy of stars.'
  },
  {
    id: 13,
    frameNo: '013',
    title: 'Sunrise Viewpoints',
    category: 'Panoramas',
    location: "Dolphin's Nose Viewpoint, Coonoor",
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    caption: 'Standing on the precipice as clouds roll beneath your feet like a white ocean.'
  },
  {
    id: 14,
    frameNo: '014',
    title: 'Trekking Groups',
    category: 'Trekking & Trails',
    location: 'Velliangiri Hills Peak Trail',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    caption: 'Conquering steep mountain summits side-by-side with fellow adventurous trekkers.'
  },
  {
    id: 15,
    frameNo: '015',
    title: 'Wildlife Safari',
    category: 'Wildlife',
    location: 'Mudumalai National Park Safari',
    image: '/assets/wildlife/mudumalai_national_park.jpg',
    caption: 'Spotting Asian wild elephant herds, spotted deer, and elusive leopards in their natural habitat.'
  },
  {
    id: 16,
    frameNo: '016',
    title: 'Jeep Rides',
    category: 'Off-Roading',
    location: 'Valparai Rainforest Jeep Safari',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    caption: 'Rugged open 4x4 jeep trails traversing muddy jungle tracks and tea estate bends.'
  },
  {
    id: 17,
    frameNo: '017',
    title: 'Temple Visits',
    category: 'Heritage & Sacred',
    location: 'Brihadisvara & Meenakshi Temple',
    image: '/assets/temples/brihadisvara_temple.jpg',
    caption: 'Walking through thousand-year-old carved granite pillars echoing with temple bells.'
  },
  {
    id: 18,
    frameNo: '018',
    title: 'Beach Sunsets',
    category: 'Coastal',
    location: 'Covelong Beach Sunset',
    image: '/assets/beaches/covelong_beach.jpg',
    caption: 'Golden evening light washing over sandy shores as waves whisper along the coast.'
  },
  {
    id: 19,
    frameNo: '019',
    title: 'Coffee Plantations',
    category: 'Agritourism',
    location: 'Yercaud Shevaroy Coffee Hills',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
    caption: 'Inhaling the aromatic perfume of blooming white coffee blossoms and dark red berries.'
  },
  {
    id: 20,
    frameNo: '020',
    title: 'Local Food Experiences',
    category: 'Culinary Journey',
    location: 'Traditional Tamil Banana Leaf Feast',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
    caption: 'Savoring authentic spicy Chettinad curries, crisp dosas, and fragrant filter coffee.'
  },
  {
    id: 21,
    frameNo: '021',
    title: 'Traditional Tamil Culture',
    category: 'Culture & Arts',
    location: 'Madurai & Tanjore Cultural Center',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    caption: 'Witnessing classical Bharatanatyam dance performances and traditional bronze metallurgy.'
  },
  {
    id: 22,
    frameNo: '022',
    title: 'Backpackers on Journey',
    category: 'Wanderlust',
    location: 'Nilgiri Toy Train Ride',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    caption: 'Roaming with a backpack, discovering hidden mountain stops, and meeting travelers worldwide.'
  },
  {
    id: 23,
    frameNo: '023',
    title: 'Couples Travelling',
    category: 'Romance',
    location: 'Kodaikanal Coaker’s Walk',
    image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=800&q=80',
    caption: 'Hand-in-hand strolls along misty cliffside promenades overlooking emerald valleys.'
  },
  {
    id: 24,
    frameNo: '024',
    title: 'Adventure Sports',
    category: 'Thrill & Surf',
    location: 'Covelong Beach Ocean Surfing',
    image: '/assets/activities/covelong_surfing.jpg',
    caption: 'Catching cresting Bay of Bengal waves and paragliding above Yelagiri hills.'
  },
  {
    id: 25,
    frameNo: '025',
    title: 'Rainy Mountain Roads',
    category: 'Monsoon Magic',
    location: 'Megamalai Monsoon Pass',
    image: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=800&q=80',
    caption: 'Fresh rainwater droplets glistening on leaves while driving through monsoon mountain mist.'
  },
  {
    id: 26,
    frameNo: '026',
    title: 'Coracle Rides',
    category: 'River Adventure',
    location: 'Hogenakkal Falls Coracle',
    image: '/assets/activities/hogenakkal_coracle_rides.jpg',
    caption: 'Spinning in circular woven bamboo coracle boats beneath towering river gorge waterfalls.'
  },
  {
    id: 27,
    frameNo: '027',
    title: 'Hidden Villages',
    category: 'Offbeat Discovery',
    location: 'Kanadukathan Heritage Village',
    image: '/assets/heritage/chettinad_heritage.jpg',
    caption: 'Quiet cobblestone village lanes, vintage bicycles, and timeless Tamil countryside charm.'
  },
  {
    id: 28,
    frameNo: '028',
    title: 'Stargazing Under Night Sky',
    category: 'Celestial',
    location: 'Kodaikanal Solar Observatory',
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    caption: 'Marveling at the glittering Milky Way galaxy sparkling above dark silent mountain tops.'
  }
];

export default function FilmReelBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [reelMode, setReelMode] = useState('both'); // 'both', 'left', 'right', 'off'
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    let requestRunning = false;
    const handleScroll = () => {
      if (!requestRunning) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          requestRunning = false;
        });
        requestRunning = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax translation speed calculation
  const reelOffset = scrollY * 0.45;

  return (
    <>
      {/* 📽️ Film Grain & Sepia Vintage Overlay (Fixed) */}
      <div className="pointer-events-none fixed inset-0 z-[1] film-grain-overlay opacity-30" />

      {/* 🎞️ Left Vertical Film Strip */}
      {(reelMode === 'both' || reelMode === 'left') && (
        <div 
          className="fixed left-2 lg:left-6 top-0 bottom-0 z-[2] hidden md:block w-24 lg:w-32 pointer-events-auto select-none transition-opacity duration-500"
          title="Scroll down to advance vintage movie reel"
        >
          <div 
            className="film-strip-track relative flex flex-col items-center gap-6 py-12"
            style={{ transform: `translate3d(0, -${reelOffset % (TRAVEL_FILM_MEMORIES.length * 190)}px, 0)` }}
          >
            {/* Duplicate array 3x for seamless infinite scroll effect */}
            {[...TRAVEL_FILM_MEMORIES, ...TRAVEL_FILM_MEMORIES, ...TRAVEL_FILM_MEMORIES].map((item, idx) => (
              <div 
                key={`left-frame-${item.id}-${idx}`}
                onClick={() => setSelectedFrame(item)}
                className="film-frame-card group relative w-20 lg:w-28 bg-[#121214] border-2 border-[#3a2d1d] hover:border-[#d4af37] rounded-lg p-2 shadow-2xl cursor-pointer transition-all duration-300 transform hover:scale-105"
              >
                {/* Side Sprocket Holes */}
                <div className="absolute -left-3 top-0 bottom-0 flex flex-col justify-around py-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-2 h-3.5 bg-black border border-[#d4af37]/40 rounded-sm shadow-inner" />
                  ))}
                </div>
                <div className="absolute -right-3 top-0 bottom-0 flex flex-col justify-around py-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-2 h-3.5 bg-black border border-[#d4af37]/40 rounded-sm shadow-inner" />
                  ))}
                </div>

                {/* Frame Header Markings */}
                <div className="flex justify-between items-center text-[8px] font-mono text-[#d4af37]/80 tracking-widest px-1 mb-1 border-b border-[#3a2d1d]">
                  <span>35MM</span>
                  <span className="font-bold">#{item.frameNo}</span>
                </div>

                {/* Film Thumbnail */}
                <div className="relative aspect-square overflow-hidden rounded bg-black/80">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute bottom-1 left-1 right-1 text-[9px] font-semibold text-white truncate drop-shadow">
                    {item.title}
                  </div>
                </div>

                {/* Frame Footer Marking */}
                <div className="mt-1 text-[7px] font-mono text-center text-amber-200/50 uppercase tracking-tighter truncate">
                  KODAK TRI-X • ISO 400
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎞️ Right Vertical Film Strip */}
      {(reelMode === 'both' || reelMode === 'right') && (
        <div 
          className="fixed right-2 lg:right-6 top-0 bottom-0 z-[2] hidden md:block w-24 lg:w-32 pointer-events-auto select-none transition-opacity duration-500"
          title="Scroll down to advance vintage movie reel"
        >
          <div 
            className="film-strip-track relative flex flex-col items-center gap-6 py-12"
            style={{ transform: `translate3d(0, -${(reelOffset * 1.1) % (TRAVEL_FILM_MEMORIES.length * 190)}px, 0)` }}
          >
            {/* Reverse or Offset Duplicate array for staggered reel motion */}
            {[...TRAVEL_FILM_MEMORIES.slice().reverse(), ...TRAVEL_FILM_MEMORIES.slice().reverse(), ...TRAVEL_FILM_MEMORIES.slice().reverse()].map((item, idx) => (
              <div 
                key={`right-frame-${item.id}-${idx}`}
                onClick={() => setSelectedFrame(item)}
                className="film-frame-card group relative w-20 lg:w-28 bg-[#121214] border-2 border-[#3a2d1d] hover:border-[#d4af37] rounded-lg p-2 shadow-2xl cursor-pointer transition-all duration-300 transform hover:scale-105"
              >
                {/* Side Sprocket Holes */}
                <div className="absolute -left-3 top-0 bottom-0 flex flex-col justify-around py-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-2 h-3.5 bg-black border border-[#d4af37]/40 rounded-sm shadow-inner" />
                  ))}
                </div>
                <div className="absolute -right-3 top-0 bottom-0 flex flex-col justify-around py-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-2 h-3.5 bg-black border border-[#d4af37]/40 rounded-sm shadow-inner" />
                  ))}
                </div>

                {/* Frame Header Markings */}
                <div className="flex justify-between items-center text-[8px] font-mono text-[#d4af37]/80 tracking-widest px-1 mb-1 border-b border-[#3a2d1d]">
                  <span>REEL 02</span>
                  <span className="font-bold">#{item.frameNo}</span>
                </div>

                {/* Film Thumbnail */}
                <div className="relative aspect-square overflow-hidden rounded bg-black/80">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute bottom-1 left-1 right-1 text-[9px] font-semibold text-white truncate drop-shadow">
                    {item.title}
                  </div>
                </div>

                {/* Frame Footer Marking */}
                <div className="mt-1 text-[7px] font-mono text-center text-amber-200/50 uppercase tracking-tighter truncate">
                  EASTMAN COLOR • 35MM
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎛️ Floating Film Reel Floating Widget Controls */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#1a1714]/90 backdrop-blur-md border border-[#d4af37]/40 text-[#f5e6ca] px-3 py-2 rounded-full shadow-2xl">
        <span className="text-xs font-mono font-bold flex items-center gap-1.5 text-[#d4af37]">
          <span className="animate-spin text-sm">📽️</span> REEL 35MM
        </span>
        <button 
          onClick={() => setReelMode(prev => prev === 'both' ? 'left' : prev === 'left' ? 'off' : 'both')}
          className="text-xs px-2.5 py-1 rounded-full bg-black/60 hover:bg-[#d4af37] hover:text-black transition-colors font-medium"
          title="Toggle side film reel visibility"
        >
          {reelMode === 'both' ? '🎞️ Dual Strip' : reelMode === 'left' ? '🎞️ Single Strip' : '🚫 Hidden'}
        </button>
      </div>

      {/* 🖼️ Cinematic Lightbox Modal when a frame is clicked */}
      {selectedFrame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="relative max-w-2xl w-full bg-[#161412] border-4 border-[#d4af37] rounded-3xl p-6 lg:p-8 shadow-2xl text-[#f5e6ca]">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedFrame(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/70 border border-[#d4af37]/50 text-white text-xl flex items-center justify-center hover:bg-[#d4af37] hover:text-black transition-all"
            >
              ✕
            </button>

            {/* Vintage Film Header */}
            <div className="flex justify-between items-center font-mono text-xs text-[#d4af37] border-b border-[#3a2d1d] pb-3 mb-4">
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                CINEMATIC FRAME #{selectedFrame.frameNo}
              </span>
              <span className="uppercase tracking-widest">{selectedFrame.category}</span>
            </div>

            {/* Photo & Story Content */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-black mb-4 group">
              <img 
                src={selectedFrame.image} 
                alt={selectedFrame.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-xs font-mono text-[#d4af37] bg-black/60 px-2 py-1 rounded-md border border-[#d4af37]/30">
                  📍 {selectedFrame.location}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1 drop-shadow-md">
                  {selectedFrame.title}
                </h3>
              </div>
            </div>

            {/* Caption & Travel Memory Quote */}
            <p className="text-sm lg:text-base text-gray-300 italic leading-relaxed bg-black/40 p-4 rounded-xl border border-[#3a2d1d]">
              "{selectedFrame.caption}"
            </p>

            <div className="mt-6 flex justify-between items-center pt-2">
              <span className="text-xs font-mono text-amber-200/60">
                EXPLORE TAMIL NADU 35MM ARCHIVE
              </span>
              <button 
                onClick={() => setSelectedFrame(null)}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-black font-bold text-sm hover:brightness-110 shadow-lg transition-all"
              >
                Close Frame
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
