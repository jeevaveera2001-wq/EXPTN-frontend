import React, { useState, useEffect } from 'react';
import { Compass, Sparkles } from 'lucide-react';

const TRAVEL_QUOTES = [
  'Curating authentic mountain view villas in Ooty & Kodaikanal...',
  'Connecting to verified commercial chauffeurs & hill station fleets...',
  'Synchronizing real-time reservation availability across Tamil Nadu...',
  'Fetching verified heritage homestays and lakeview estates...',
  'Loading the Land of Temples, Waterfalls, and Western Ghats...'
];

export default function PageLoader({ text, fullScreen = false }) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % TRAVEL_QUOTES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in duration-300">
      
      {/* Animated Glowing Compass Loader */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-amber-400/20 border-t-amber-500 animate-spin duration-1000" />
        <div className="absolute inset-0 flex items-center justify-center text-amber-600">
          <Compass size={24} className="animate-pulse" />
        </div>
      </div>

      {/* Progress Bar Shimmer */}
      <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden relative">
        <div className="absolute inset-y-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 w-full animate-pulse" />
      </div>

      {/* Primary & Rotating Message */}
      <div className="space-y-1 max-w-sm">
        <h4 className="font-editorial text-sm font-bold text-slate-800 flex items-center justify-center gap-1.5">
          <Sparkles size={13} className="text-amber-500" />
          <span>{text || 'Explore Tamil Nadu'}</span>
        </h4>
        <p className="font-editorial text-xs text-slate-500 italic transition-opacity duration-300 min-h-[32px]">
          "{TRAVEL_QUOTES[quoteIndex]}"
        </p>
      </div>

    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f9f5f2]/90 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
