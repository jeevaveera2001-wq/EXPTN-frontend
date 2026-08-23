import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Search, 
  Navigation, 
  ExternalLink, 
  Check, 
  Crosshair, 
  Compass, 
  Map as MapIcon,
  Sparkles,
  Loader2
} from 'lucide-react';

// Custom Pin Icon for Leaflet
const createCustomPinIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab;">
        <div style="
          width: 38px; 
          height: 38px; 
          background: linear-gradient(135deg, #ef4444, #b91c1c); 
          border: 3px solid #ffffff; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          box-shadow: 0 4px 14px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bouncePin 1.5s infinite alternate ease-in-out;
        ">
          <div style="
            width: 12px; 
            height: 12px; 
            background: #ffffff; 
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
        <div style="
          width: 14px; 
          height: 6px; 
          background: rgba(0,0,0,0.35); 
          border-radius: 50%; 
          margin-top: -3px; 
          filter: blur(1px);
        "></div>
      </div>
    `,
    iconSize: [38, 48],
    iconAnchor: [19, 44],
    popupAnchor: [0, -44]
  });
};

const POPULAR_DESTINATIONS = [
  { name: '🌲 Kodai Lake & Coaker Walk', district: 'Dindigul (Kodaikanal)', address: 'Coaker Walk, Kodaikanal, Dindigul', lat: 10.2381, lng: 77.4892 },
  { name: '🏔️ Ooty Lake & Boat House', district: 'Nilgiris (Ooty & Coonoor)', address: 'North Lake Road, Ooty, Nilgiris', lat: 11.4064, lng: 76.6932 },
  { name: '☕ Yercaud Lake & Peak', district: 'Salem (Yercaud)', address: 'Lake Road, Yercaud, Salem', lat: 11.7753, lng: 78.2093 },
  { name: '🌊 Hogenakkal Waterfalls', district: 'Dharmapuri (Hogenakkal Falls)', address: 'Pennagaram Road, Hogenakkal, Dharmapuri', lat: 12.1186, lng: 77.7770 },
  { name: '🛕 Madurai Meenakshi Temple', district: 'Madurai', address: 'East Tower Street, Madurai', lat: 9.9195, lng: 78.1193 },
  { name: '🏖️ Rameshwaram Agni Theertham', district: 'Ramanathapuram (Rameshwaram & Dhanushkodi)', address: 'Near Ramanathaswamy Temple, Rameswaram', lat: 9.2876, lng: 79.3129 },
  { name: '🌅 Kanyakumari Beach Point', district: 'Kanyakumari', address: 'Main Beach Road, Kanyakumari', lat: 8.0883, lng: 77.5385 },
  { name: '🏛️ Mahabalipuram Shore Temple', district: 'Chengalpattu (Mahabalipuram & ECR)', address: 'Shore Temple Road, Mahabalipuram', lat: 12.6169, lng: 80.1994 },
  { name: '🌿 Valparai Tea Estate', district: 'Coimbatore (Valparai & Pollachi)', address: 'Main Tea Estate Road, Valparai', lat: 10.3242, lng: 76.9558 },
  { name: '🛕 Tanjore Big Temple', district: 'Thanjavur & Kumbakonam', address: 'Membalam Road, Thanjavur', lat: 10.7870, lng: 79.1378 },
  { name: '🌲 Kolli Hills Viewpoint', district: 'Namakkal (Kolli Hills)', address: 'Semmedu, Kolli Hills, Namakkal', lat: 11.2485, lng: 78.3389 },
  { name: '⛰️ Meghamalai Highwavys', district: 'Theni (Meghamalai & Suruli)', address: 'Highwavys Tea Estate, Meghamalai, Theni', lat: 9.6833, lng: 77.4000 },
  { name: '🌳 Yelagiri Nature Park', district: 'Tirupathur (Yelagiri Hills)', address: 'Nature Park Road, Yelagiri Hills', lat: 12.5786, lng: 78.6366 }
];

export default function InteractiveLocationMapPicker({
  coordinates = { lat: 10.2381, lng: 77.4892 },
  locationAddress = '',
  district = '',
  onChangeCoordinates,
  onChangeAddress,
  onChangeDistrict,
  onNotify
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const [googleMapsUrlInput, setGoogleMapsUrlInput] = useState('');
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Reverse geocode lat, lng to street address and district
  const reverseGeocode = useCallback(async (lat, lng) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || '';
          const locality = addr.city || addr.town || addr.village || addr.county || '';
          const stateDist = addr.state_district || addr.county || addr.district || '';

          const fullCleanAddress = data.display_name.split(',').slice(0, 4).join(', ');
          
          if (onChangeAddress && fullCleanAddress) {
            onChangeAddress(fullCleanAddress);
          }

          // Match District if available
          if (onChangeDistrict && (stateDist || locality)) {
            const detectedName = `${stateDist} ${locality}`.toLowerCase();
            const matched = POPULAR_DESTINATIONS.find(d => 
              detectedName.includes(d.district.toLowerCase().split(' ')[0])
            );
            if (matched) {
              onChangeDistrict(matched.district);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding notice:', e);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [onChangeAddress, onChangeDistrict]);

  // Update Pin Location Helper
  const setPinLocation = useCallback((lat, lng, shouldFly = true, shouldReverseGeocode = true) => {
    const cleanLat = Number(Number(lat).toFixed(5));
    const cleanLng = Number(Number(lng).toFixed(5));

    if (onChangeCoordinates) {
      onChangeCoordinates({ lat: cleanLat, lng: cleanLng });
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([cleanLat, cleanLng]);
    }

    if (mapInstanceRef.current && shouldFly) {
      mapInstanceRef.current.flyTo([cleanLat, cleanLng], 15, { duration: 1.2 });
    }

    if (shouldReverseGeocode) {
      reverseGeocode(cleanLat, cleanLng);
    }
  }, [onChangeCoordinates, reverseGeocode]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const initialLat = coordinates.lat || 10.2381;
    const initialLng = coordinates.lng || 77.4892;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // Draggable Marker Pin
    const pinIcon = createCustomPinIcon();
    const marker = L.marker([initialLat, initialLng], {
      icon: pinIcon,
      draggable: true,
      autoPan: true
    }).addTo(map);

    // Marker Drag Event
    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      setPinLocation(pos.lat, pos.lng, false, true);
      if (onNotify) onNotify(`📍 Pin placed at: ${pos.lat.toFixed(4)}° N, ${pos.lng.toFixed(4)}° E`);
    });

    // Map Click Event (Click anywhere to drop pin!)
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setPinLocation(lat, lng, true, true);
      if (onNotify) onNotify(`📍 Pin placed at: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Trigger invalidateSize after render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []); // Run once on mount

  // Sync external coordinates if changed outside
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    const currentMarkerPos = markerRef.current.getLatLng();
    if (
      Math.abs(currentMarkerPos.lat - coordinates.lat) > 0.0001 ||
      Math.abs(currentMarkerPos.lng - coordinates.lng) > 0.0001
    ) {
      markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
      mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], mapInstanceRef.current.getZoom());
    }
  }, [coordinates.lat, coordinates.lng]);

  // Live Autocomplete Search using OpenStreetMap Nominatim
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResultsDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const queryWithContext = `${searchQuery}, Tamil Nadu, India`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryWithContext)}&limit=6&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data || []);
          setShowResultsDropdown(true);
        }
      } catch (err) {
        console.warn('Map search query notice:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Search Result Selection
  const handleSelectSearchResult = (result) => {
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    const cleanAddress = result.display_name.split(',').slice(0, 4).join(', ');

    setPinLocation(lat, lng, true, false);
    if (onChangeAddress) onChangeAddress(cleanAddress);

    // Auto-fill district if found
    if (result.address && onChangeDistrict) {
      const distName = result.address.state_district || result.address.county || '';
      const matched = POPULAR_DESTINATIONS.find(d => 
        distName.toLowerCase().includes(d.district.toLowerCase().split(' ')[0])
      );
      if (matched) onChangeDistrict(matched.district);
    }

    setShowResultsDropdown(false);
    setSearchQuery('');
    if (onNotify) onNotify(`📍 Location pinned: ${cleanAddress}`);
  };

  // Parse Google Maps Link or Raw Coordinates Input
  const handleParseGoogleMapsInput = (e) => {
    if (e) e.preventDefault();
    if (!googleMapsUrlInput) return;
    const str = googleMapsUrlInput.trim();

    // 1. Direct coordinates like "10.2381, 77.4892" or "10.2381 77.4892"
    const coordMatch = str.match(/(-?\d+\.\d+)[\s,]+(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = Number(coordMatch[1]);
      const lng = Number(coordMatch[2]);
      setPinLocation(lat, lng, true, true);
      setGoogleMapsUrlInput('');
      if (onNotify) onNotify(`📍 GPS Coordinates Applied: ${lat}° N, ${lng}° E`);
      return;
    }

    // 2. Google Maps URL like ?q=10.2381,77.4892 or @10.2381,77.4892
    const urlMatch = str.match(/(@|\?q=)(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (urlMatch) {
      const lat = Number(urlMatch[2]);
      const lng = Number(urlMatch[3]);
      setPinLocation(lat, lng, true, true);
      setGoogleMapsUrlInput('');
      if (onNotify) onNotify(`📍 Pinned from Google Maps URL: ${lat}° N, ${lng}° E`);
      return;
    }

    // 3. Fallback to searching place name
    setSearchQuery(str);
    setGoogleMapsUrlInput('');
  };

  // GPS Auto-Detect
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGPS(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPinLocation(lat, lng, true, true);
        if (onNotify) onNotify(`📍 GPS Location Captured: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      },
      (err) => {
        setIsLocatingGPS(false);
        alert('Could not retrieve current GPS position. Please click on the map or type your destination.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle Preset Destination Click
  const handleSelectPreset = (dest) => {
    setPinLocation(dest.lat, dest.lng, true, false);
    if (onChangeAddress) onChangeAddress(dest.address);
    if (onChangeDistrict) onChangeDistrict(dest.district);
    if (onNotify) onNotify(`📍 Selected Destination: ${dest.name}`);
  };

  return (
    <div className="space-y-4">
      
      {/* 🧭 TOP ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-red-500 animate-pulse" />
            <label className="text-xs font-black text-slate-900 uppercase tracking-wide">
              Interactive Google Maps & GPS Pin Selector
            </label>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Click anywhere on the map or drag the red pin to set your exact stay location.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isLocatingGPS}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            {isLocatingGPS ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
            <span>{isLocatingGPS ? 'Detecting...' : '📍 Auto-Detect GPS'}</span>
          </button>

          <a
            href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Open in Google Maps in new tab"
          >
            <ExternalLink size={13} />
            <span>Open in Google Maps ↗</span>
          </a>
        </div>
      </div>

      {/* 🔍 LIVE AUTOCOMPLETE SEARCH BAR */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search any destination, town, resort, or landmark in Tamil Nadu (e.g. Dolphin Nose, Kodai Lake, Ooty Club, Shore Temple)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowResultsDropdown(true); }}
              className="glass-input text-xs pl-10 pr-9 py-2.5 w-full font-medium"
            />
            {isSearching && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 animate-spin" />
            )}
          </div>
        </div>

        {/* Live Autocomplete Results Dropdown */}
        {showResultsDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className="w-full text-left p-3 hover:bg-blue-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
              >
                <MapPin size={15} className="text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {item.display_name.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {item.display_name}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-blue-600 font-bold shrink-0">
                  Drop Pin →
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 📌 METHOD B: DIRECT PASTE GOOGLE MAPS LINK OR COORDINATES */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700">
          <span>📌 Or Paste Google Maps Link / GPS Coordinates:</span>
          <span className="text-[10px] text-slate-500 font-mono">e.g. 10.2381, 77.4892 or https://maps.app.goo.gl/...</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste Google Maps URL, Plus Code, or Coordinates here..."
            value={googleMapsUrlInput}
            onChange={e => setGoogleMapsUrlInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleParseGoogleMapsInput(e); }}
            className="glass-input text-xs font-mono"
          />
          <button
            type="button"
            onClick={handleParseGoogleMapsInput}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Check size={14} /> Set Pin
          </button>
        </div>
      </div>

      {/* ⚡ 1-CLICK POPULAR DESTINATION PRESET CHIPS */}
      <div>
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1.5">
          ⚡ 1-Click Popular Tamil Nadu Destinations:
        </span>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200">
          {POPULAR_DESTINATIONS.map((dest, idx) => {
            const isSelected = Math.abs(coordinates.lat - dest.lat) < 0.005 && Math.abs(coordinates.lng - dest.lng) < 0.005;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(dest)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                }`}
              >
                {dest.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🗺️ INTERACTIVE MAP CONTAINER WITH CLICK & DRAGGABLE PIN */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md group">
        {/* Leaflet Map DOM Node */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top Floating Helper Banner */}
        <div className="absolute top-2.5 left-2.5 right-2.5 pointer-events-none flex items-center justify-between z-10">
          <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-[11px] font-mono font-bold flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Click map or drag pin to choose exact location</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-mono font-bold shadow-lg">
            {coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° E
          </div>
        </div>

        {/* Bottom Loading Indicator during reverse geocoding */}
        {isReverseGeocoding && (
          <div className="absolute bottom-2.5 left-2.5 px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-mono font-bold shadow-md flex items-center gap-1.5 z-10">
            <Loader2 size={12} className="animate-spin text-blue-600" />
            <span>Fetching street name & area...</span>
          </div>
        )}
      </div>

      {/* 📍 CONFIRMED PIN READOUT CARD */}
      <div className="p-4 rounded-2xl border bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm bg-emerald-600 text-white">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs">
                  Active GPS Pin Coordinates Locked
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-200 text-emerald-900 border border-emerald-400">
                  🟢 Ready for Guests
                </span>
              </div>
              <p className="text-[11px] text-slate-700 mt-0.5 font-medium">
                {locationAddress || 'Tamil Nadu Destination'} • <span className="font-mono font-bold text-slate-900">({coordinates.lat}° N, {coordinates.lng}° E)</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onNotify) onNotify(`✅ Stay Location Locked: ${coordinates.lat}° N, ${coordinates.lng}° E!`);
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Check size={14} /> Location Verified
          </button>
        </div>
      </div>

    </div>
  );
}
