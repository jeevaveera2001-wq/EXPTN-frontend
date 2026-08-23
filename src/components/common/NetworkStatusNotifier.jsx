import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function NetworkStatusNotifier() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('offline'); // 'offline' | 'online'
  const [reconnecting, setReconnecting] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(10);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setToastType('online');
      setToastMessage('🟢 Internet connection restored! Syncing live catalog...');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setToastType('offline');
      setToastMessage('⚠️ Connection lost. Explore Tamil Nadu is operating in offline mode.');
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Automatic retry countdown when offline
  useEffect(() => {
    if (!isOnline) {
      const interval = setInterval(() => {
        setRetryCountdown(prev => {
          if (prev <= 1) {
            handleManualRetry();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  const handleManualRetry = async () => {
    setReconnecting(true);
    try {
      const res = await fetch('https://exptn-backend.onrender.com/api/system/maintenance', {
        method: 'GET',
        cache: 'no-store'
      });
      if (res.ok) {
        setIsOnline(true);
        setToastType('online');
        setToastMessage('🟢 Connected to live server!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (e) {
      // still offline
    } finally {
      setTimeout(() => setReconnecting(false), 800);
    }
  };

  return (
    <>
      {/* 1. Animated Floating Connection Toast */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-mono font-bold ${
            toastType === 'online'
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200 backdrop-blur-md'
              : 'bg-rose-950/90 border-rose-500/60 text-rose-200 backdrop-blur-md'
          }`}>
            {toastType === 'online' ? (
              <Wifi size={18} className="text-emerald-400 shrink-0" />
            ) : (
              <WifiOff size={18} className="text-rose-400 shrink-0 animate-pulse" />
            )}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 2. Full-screen Offline Overlay when disconnected */}
      {!isOnline && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0c1e2e] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-500/40 shadow-2xl text-center space-y-5">
            
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40 animate-pulse">
              <WifiOff size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="font-editorial text-xl font-bold text-white">Network Connection Interrupted</h3>
              <p className="text-xs text-slate-300 font-editorial leading-relaxed">
                Unable to reach the Explore Tamil Nadu reservation network. Please check your WiFi or mobile data connection.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#091724] border border-[#1a344d] text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Automatic reconnect in:</span>
              <strong className="text-amber-400 font-bold">{retryCountdown}s</strong>
            </div>

            <button
              type="button"
              onClick={handleManualRetry}
              disabled={reconnecting}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-black text-xs inline-flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={reconnecting ? 'animate-spin' : ''} />
              <span>{reconnecting ? 'Testing Connection...' : '⚡ Reconnect Now'}</span>
            </button>

          </div>
        </div>
      )}
    </>
  );
}
