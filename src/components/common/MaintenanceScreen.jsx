import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  PhoneCall, 
  Mail, 
  Lock, 
  ArrowRight,
  Server,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function MaintenanceScreen({ 
  onAdminLogin, 
  maintenanceInfo = {
    message: 'Explore Tamil Nadu is undergoing scheduled system upgrades for high-speed performance, live database caching, and enhanced reservation security.',
    estimatedTime: '30 Minutes',
    upgradeTitle: 'Platform Upgrade & Performance Optimization in Progress'
  }
}) {
  const [checking, setChecking] = useState(false);
  const [checkStatusText, setCheckStatusText] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 minutes countdown
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Admin login form states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setCheckStatusText('Connecting to Explore Tamil Nadu live cluster...');
    try {
      const res = await fetch('https://exptn-backend.onrender.com/api/system/maintenance');
      if (res.ok) {
        const data = await res.json();
        if (data.isMaintenance) {
          setCheckStatusText('⚡ Upgrade still in progress. Checking again shortly.');
        } else {
          setCheckStatusText('🟢 Upgrade complete! Reloading platform...');
          setTimeout(() => window.location.reload(), 1200);
        }
      } else {
        setCheckStatusText('⚡ Upgrade still active on server cluster.');
      }
    } catch (e) {
      setCheckStatusText('⚡ Cluster optimization in progress. Auto-reconnecting...');
    } finally {
      setTimeout(() => setChecking(false), 800);
    }
  };

  const handleAdminBypassSubmit = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoggingIn(true);
    try {
      const res = await fetch('https://exptn-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail.trim(), password: adminPassword })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        if (['super_admin', 'admin'].includes(data.user.role)) {
          localStorage.setItem('ETN_USER', JSON.stringify(data.user));
          if (data.token) localStorage.setItem('token', data.token);
          if (onAdminLogin) onAdminLogin(data.user);
          window.location.href = '/dashboard/super-admin';
        } else {
          setAdminError('Access restricted: Only Super Administrators can bypass maintenance mode.');
        }
      } else {
        setAdminError(data.message || 'Invalid administrator credentials');
      }
    } catch (err) {
      setAdminError('Could not reach authentication server: ' + err.message);
    } finally {
      setAdminLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f18] text-white flex flex-col justify-between relative overflow-hidden font-sans select-none">
      
      {/* Background Animated Glow Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '3s' }} />

      {/* Top Header */}
      <header className="p-6 lg:p-8 flex items-center justify-between border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            🌴
          </div>
          <div>
            <h1 className="font-editorial text-lg font-bold tracking-tight text-white">Explore Tamil Nadu</h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400">Tourism & Reservations Portal</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdminModal(true)}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Lock size={13} className="text-amber-400" />
          <span>Admin Access</span>
        </button>
      </header>

      {/* Center Main Maintenance Showcase */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="max-w-2xl w-full text-center space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Animated Upgrade Radar Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute w-24 h-24 rounded-full bg-amber-400/20 animate-ping duration-1000" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-400/60 shadow-2xl flex items-center justify-center text-amber-400">
              <Wrench size={34} className="animate-spin duration-3000" style={{ animationDuration: '8s' }} />
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>SYSTEM UPGRADE & SPEED OPTIMIZATION</span>
          </div>

          {/* Main Title & Description */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-editorial font-extrabold tracking-tight text-white leading-tight">
              We'll Be Right Back! <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 font-serif font-normal italic">
                Upgrading Platform Experience
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-editorial leading-relaxed">
              {maintenanceInfo.message}
            </p>
          </div>

          {/* Upgrade Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono">
                <Zap size={14} /> 0ms Instant Load
              </div>
              <p className="text-[11px] text-slate-400">Deploying high-speed SWR client caching engine.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold font-mono">
                <Server size={14} /> Atlas Sync v2
              </div>
              <p className="text-[11px] text-slate-400">Upgrading live MongoDB cluster with zero latency.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-mono">
                <ShieldCheck size={14} /> Razorpay Gateway
              </div>
              <p className="text-[11px] text-slate-400">Strengthening SSL encryption & verified passes.</p>
            </div>
          </div>

          {/* Live Countdown & Check Button */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/15 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-400">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">Estimated Remaining Time</span>
                <span className="font-mono text-base font-black text-amber-300">{formatCountdown(secondsRemaining)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs font-mono inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
              <span>{checking ? 'Checking Status...' : 'Check Live Status'}</span>
            </button>
          </div>

          {checkStatusText && (
            <p className="text-xs font-mono text-cyan-300 animate-in fade-in">
              {checkStatusText}
            </p>
          )}

        </div>
      </main>

      {/* Bottom Emergency Help Contacts */}
      <footer className="p-6 lg:p-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400 relative z-10">
        <div>
          <span>Need immediate assistance? Reach our 24/7 Tourism Desk:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-slate-300">
          <a href="tel:+917871779134" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <PhoneCall size={13} className="text-emerald-400" /> +91 78717 79134
          </a>
          <a href="mailto:exploretamizhagam@gmail.com" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <Mail size={13} className="text-cyan-400" /> exploretamizhagam@gmail.com
          </a>
        </div>
      </footer>

      {/* Super Admin Bypass Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0c1e2e] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#1a344d] shadow-2xl space-y-4 relative">
            <div className="flex justify-between items-center border-b border-[#1a344d] pb-3">
              <h3 className="text-base font-bold text-white font-editorial flex items-center gap-2">
                <Lock size={16} className="text-amber-400" /> Super Admin Direct Bypass
              </h3>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Authorized administrators can log in to manage upgrades, review listings, or deactivate maintenance mode.
            </p>

            {adminError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono">
                {adminError}
              </div>
            )}

            <form onSubmit={handleAdminBypassSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="exploretamizhagam@gmail.com"
                  className="w-full p-3 rounded-xl bg-[#091724] border border-[#1a344d] text-white outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Admin Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl bg-[#091724] border border-[#1a344d] text-white outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#132c42] text-slate-300 hover:bg-[#1a3b59] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminLoggingIn}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black cursor-pointer shadow-md disabled:opacity-50"
                >
                  {adminLoggingIn ? 'Verifying...' : 'Bypass & Enter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
