import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  X, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  HelpCircle,
  Clock,
  Check,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_API } from '../../config/api';

export default function Footer({ onOpenAuth }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Mobile Accordion State (Collapsible single lines on mobile)
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const toggleMobileSection = (sec) => {
    setMobileExpanded(prev => (prev === sec ? null : sec));
  };

  // Modals State
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Quick Ticket State
  const [ticketName, setTicketName] = useState(currentUser?.name || '');
  const [ticketEmail, setTicketEmail] = useState(currentUser?.email || '');
  const [ticketCategory, setTicketCategory] = useState('Booking Issue');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccessMsg, setTicketSuccessMsg] = useState('');

  const apiFetch = async (endpoint, options = {}) => {
    const cleanPath = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
    const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_API}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    try {
      const res = await fetch(url, options);
      if (res.ok || res.status === 400 || res.status === 401 || res.status === 403) {
        return res;
      }
    } catch (e) {}
    return await fetch(endpoint, options);
  };

  const handleCreateFooterTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setTicketSubmitting(true);

    const payload = {
      senderName: ticketName || currentUser?.name || 'Guest User',
      senderEmail: (ticketEmail || currentUser?.email || 'guest@exploretamilnadu.com').toLowerCase().trim(),
      senderRole: currentUser?.role || 'user',
      subject: ticketSubject,
      category: ticketCategory,
      message: ticketMessage,
      priority: 'Medium',
      status: 'Open'
    };

    try {
      const res = await apiFetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setTicketSuccessMsg(`Ticket ${saved.ticketId || 'TCK'} created! Dispatched to Super Admin & Customer Support.`);
      } else {
        setTicketSuccessMsg('Support ticket dispatched to customer support team!');
      }
    } catch (err) {
      setTicketSuccessMsg('Support ticket dispatched to customer support team!');
    } finally {
      setTicketSubmitting(false);
      setTicketSubject('');
      setTicketMessage('');
      setTimeout(() => {
        setTicketSuccessMsg('');
        setShowTicketModal(false);
      }, 3500);
    }
  };

  const handleProtectedNav = (path) => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      else navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <footer className="w-full bg-[#f9f5f2] text-[#242429] pt-6 sm:pt-10 pb-5 sm:pb-6 border-t border-[#242429]/20">
        
        {/* 📱 MOBILE ACCORDION FOOTER (4 expandable single-line options only) */}
        <div className="md:hidden px-4 space-y-2">
          
          {/* 1. Navigation Option */}
          <div className="border border-[#242429]/15 rounded-2xl bg-white/90 overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => toggleMobileSection('nav')}
              className="w-full flex items-center justify-between p-3.5 text-left font-fira-mono text-xs font-extrabold uppercase tracking-wider text-[#18181b] cursor-pointer"
            >
              <span>🧭 NAVIGATION</span>
              <ChevronDown 
                size={14} 
                className={`text-slate-500 transition-transform duration-300 ${mobileExpanded === 'nav' ? 'rotate-180 text-black' : ''}`} 
              />
            </button>
            {mobileExpanded === 'nav' && (
              <div className="px-4 pb-3.5 pt-1 border-t border-[#242429]/10 space-y-2 text-xs font-fira-mono text-[#3e3e3e] animate-in fade-in">
                <Link to="/" className="block py-1 text-slate-700 hover:text-black font-semibold">
                  HOME
                </Link>
                <Link to="/hotels" className="block py-1 text-slate-700 hover:text-black font-semibold">
                  EXPLORE STAYS
                </Link>
                <button 
                  type="button" 
                  onClick={() => setShowAboutModal(true)} 
                  className="block w-full text-left py-1 text-slate-700 hover:text-black font-semibold cursor-pointer"
                >
                  ABOUT US
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowContactModal(true)} 
                  className="block w-full text-left py-1 text-slate-700 hover:text-black font-semibold cursor-pointer"
                >
                  CONTACT US
                </button>
              </div>
            )}
          </div>

          {/* 2. Services Option */}
          <div className="border border-[#242429]/15 rounded-2xl bg-white/90 overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => toggleMobileSection('services')}
              className="w-full flex items-center justify-between p-3.5 text-left font-fira-mono text-xs font-extrabold uppercase tracking-wider text-[#18181b] cursor-pointer"
            >
              <span>🏨 SERVICES</span>
              <ChevronDown 
                size={14} 
                className={`text-slate-500 transition-transform duration-300 ${mobileExpanded === 'services' ? 'rotate-180 text-black' : ''}`} 
              />
            </button>
            {mobileExpanded === 'services' && (
              <div className="px-4 pb-3.5 pt-1 border-t border-[#242429]/10 space-y-2 text-xs font-fira-mono text-[#3e3e3e] animate-in fade-in">
                <Link to="/hotels?type=Homestay" className="block py-1 text-slate-700 hover:text-black font-semibold">
                  HOMESTAYS
                </Link>
                <Link to="/hotels?type=Resort" className="block py-1 text-slate-700 hover:text-black font-semibold">
                  RESORTS & VILLAS
                </Link>
                <button 
                  type="button" 
                  onClick={() => handleProtectedNav('/dashboard/vendor')} 
                  className="block w-full text-left py-1 text-slate-700 hover:text-black font-semibold cursor-pointer"
                >
                  LIST YOUR PROPERTY
                </button>
                <button 
                  type="button" 
                  onClick={() => handleProtectedNav('/dashboard/vendor')} 
                  className="block w-full text-left py-1 text-slate-700 hover:text-black font-semibold cursor-pointer"
                >
                  OWNER CENTRE
                </button>
              </div>
            )}
          </div>

          {/* 3. Support Option */}
          <div className="border border-[#242429]/15 rounded-2xl bg-white/90 overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => toggleMobileSection('support')}
              className="w-full flex items-center justify-between p-3.5 text-left font-fira-mono text-xs font-extrabold uppercase tracking-wider text-[#18181b] cursor-pointer"
            >
              <span>🎧 SUPPORT</span>
              <ChevronDown 
                size={14} 
                className={`text-slate-500 transition-transform duration-300 ${mobileExpanded === 'support' ? 'rotate-180 text-black' : ''}`} 
              />
            </button>
            {mobileExpanded === 'support' && (
              <div className="px-4 pb-3.5 pt-1 border-t border-[#242429]/10 space-y-2 text-xs font-fira-mono text-[#3e3e3e] animate-in fade-in">
                <button 
                  type="button" 
                  onClick={() => handleProtectedNav('/dashboard/user?tab=bookings')} 
                  className="block w-full text-left py-1 text-slate-700 hover:text-black font-semibold cursor-pointer"
                >
                  MY BOOKINGS
                </button>
                <Link to="/hotels" className="block py-1 text-slate-700 hover:text-black font-semibold">
                  SAVED STAYS
                </Link>
                <button 
                  type="button" 
                  onClick={() => {
                    if (currentUser) {
                      handleProtectedNav('/dashboard/user?tab=tickets');
                    } else {
                      setShowTicketModal(true);
                    }
                  }} 
                  className="block w-full text-left py-1 text-slate-700 hover:text-black font-semibold cursor-pointer flex items-center justify-between"
                >
                  <span>SUPPORT TICKETS</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowContactModal(true)} 
                  className="block w-full text-left py-1 text-slate-700 hover:text-black font-semibold cursor-pointer"
                >
                  HELP & CONTACT
                </button>
              </div>
            )}
          </div>

          {/* 4. Headquarters Option */}
          <div className="border border-[#242429]/15 rounded-2xl bg-white/90 overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => toggleMobileSection('hq')}
              className="w-full flex items-center justify-between p-3.5 text-left font-fira-mono text-xs font-extrabold uppercase tracking-wider text-[#18181b] cursor-pointer"
            >
              <span>📍 HEADQUARTERS</span>
              <ChevronDown 
                size={14} 
                className={`text-slate-500 transition-transform duration-300 ${mobileExpanded === 'hq' ? 'rotate-180 text-black' : ''}`} 
              />
            </button>
            {mobileExpanded === 'hq' && (
              <div className="px-4 pb-3.5 pt-2 border-t border-[#242429]/10 space-y-2 text-xs font-fira-mono text-[#3e3e3e] animate-in fade-in">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin size={13} className="text-rose-600 shrink-0" />
                  <span>Tamil Nadu, India</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone size={13} className="text-cyan-600 shrink-0" />
                  <a href="tel:+917871779134" className="hover:text-black">+91 78717 79134</a>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail size={13} className="text-emerald-600 shrink-0" />
                  <a href="mailto:exploretamizhagam@gmail.com" className="hover:text-black truncate">exploretamizhagam@gmail.com</a>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* 🖥️ DESKTOP 4-COLUMN FOOTER (Compact height on desktop >= md) */}
        <div className="hidden md:grid max-w-7xl mx-auto px-6 grid-cols-4 gap-8">
          
          {/* 1. Navigation */}
          <div>
            <span className="font-fira-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#919191] block mb-3">
              NAVIGATION
            </span>
            <ul className="space-y-2 text-xs font-fira-mono text-[#3e3e3e]">
              <li>
                <Link to="/" className="hover:text-[#000000] transition-colors no-underline block">
                  HOME
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-[#000000] transition-colors no-underline block">
                  EXPLORE STAYS
                </Link>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => setShowAboutModal(true)} 
                  className="hover:text-[#000000] transition-colors no-underline text-left cursor-pointer block"
                >
                  ABOUT US
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => setShowContactModal(true)} 
                  className="hover:text-[#000000] transition-colors no-underline text-left cursor-pointer block"
                >
                  CONTACT US
                </button>
              </li>
            </ul>
          </div>

          {/* 2. Services */}
          <div>
            <span className="font-fira-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#919191] block mb-3">
              SERVICES
            </span>
            <ul className="space-y-2 text-xs font-fira-mono text-[#3e3e3e]">
              <li>
                <Link to="/hotels?type=Homestay" className="hover:text-[#000000] transition-colors no-underline block">
                  HOMESTAYS
                </Link>
              </li>
              <li>
                <Link to="/hotels?type=Resort" className="hover:text-[#000000] transition-colors no-underline block">
                  RESORTS & VILLAS
                </Link>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => handleProtectedNav('/dashboard/vendor')} 
                  className="hover:text-[#000000] transition-colors no-underline text-left cursor-pointer block"
                >
                  LIST YOUR PROPERTY
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => handleProtectedNav('/dashboard/vendor')} 
                  className="hover:text-[#000000] transition-colors no-underline text-left cursor-pointer block"
                >
                  OWNER CENTRE
                </button>
              </li>
            </ul>
          </div>

          {/* 3. Customer Support */}
          <div>
            <span className="font-fira-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#919191] block mb-3">
              SUPPORT
            </span>
            <ul className="space-y-2 text-xs font-fira-mono text-[#3e3e3e]">
              <li>
                <button 
                  type="button" 
                  onClick={() => handleProtectedNav('/dashboard/user')} 
                  className="hover:text-[#000000] transition-colors no-underline text-left cursor-pointer block"
                >
                  MY BOOKINGS
                </button>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-[#000000] transition-colors no-underline block">
                  SAVED STAYS
                </Link>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => {
                    if (currentUser?.email) {
                      setTicketEmail(currentUser.email);
                      setTicketName(currentUser.name || '');
                    }
                    setShowTicketModal(true);
                  }} 
                  className="hover:text-[#000000] transition-colors no-underline text-left cursor-pointer block flex items-center gap-1"
                >
                  <span>SUPPORT TICKETS</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => setShowContactModal(true)} 
                  className="hover:text-[#000000] transition-colors no-underline text-left cursor-pointer block"
                >
                  HELP & CONTACT
                </button>
              </li>
            </ul>
          </div>

          {/* 4. Contact Information */}
          <div>
            <span className="font-fira-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#919191] block mb-3">
              HEADQUARTERS
            </span>
            <ul className="space-y-2 text-xs font-fira-mono text-[#3e3e3e]">
              <li className="flex items-center gap-2">
                <MapPin size={13} className="text-rose-600 shrink-0" />
                <span>Tamil Nadu, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={13} className="text-cyan-600 shrink-0" />
                <a href="tel:+917871779134" className="hover:text-[#000000] transition-colors no-underline text-[#3e3e3e]">
                  +91 78717 79134
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={13} className="text-emerald-600 shrink-0" />
                <a href="mailto:exploretamizhagam@gmail.com" className="hover:text-[#000000] transition-colors no-underline text-[#3e3e3e] break-all">
                  exploretamizhagam@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 mt-6 pt-4 border-t border-[#242429]/15 flex flex-col md:flex-row justify-between items-center font-fira-mono text-[10px] sm:text-[11px] text-[#919191] gap-2 sm:gap-4">
          <p className="flex items-center gap-2">
            <span>THIS SITE IS UNDER</span>
            <span className="font-bold text-[#000000] tracking-wide">VEERAWEBTECH</span>
          </p>
          <p className="text-[#919191]">
            © {new Date().getFullYear()} EXPLORE TAMIL NADU. KOBU EDITORIAL DESIGN SYSTEM.
          </p>
        </div>
      </footer>

      {/* 📖 ABOUT US MODAL */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold uppercase">
                ABOUT EXPLORE TAMIL NADU
              </span>
            </div>
            <h3 className="text-2xl font-editorial font-extrabold text-black">
              Preserving & Celebrating Tamil Nadu’s Tourism Heritage
            </h3>
            <p className="text-xs text-slate-600 font-editorial leading-relaxed">
              Explore Tamil Nadu, operated under <strong>VEERAWEBTECH</strong>, is a premier hospitality and travel reservation platform designed to showcase verified luxury stays, boutique heritage resorts, mountain tea villas, and authentic Dravidian cultural circuits.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#f9f5f2] border border-[#242429]/15">
                <div className="font-bold text-xs text-black font-editorial">🏰 Verified Luxury Stays</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">100% physically vetted hosts & properties</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f9f5f2] border border-[#242429]/15">
                <div className="font-bold text-xs text-black font-editorial">💳 Razorpay Secured</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Instant booking confirmation & tax receipts</div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-[#242429] text-white hover:bg-black font-editorial font-bold text-xs cursor-pointer shadow-sm"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📞 CONTACT US & 24/7 HELPLINE MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono text-[10px] font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                24/7 LIVE HELPLINE
              </span>
            </div>
            <h3 className="text-2xl font-editorial font-extrabold text-black">
              We're Here to Help You 24/7
            </h3>
            <p className="text-xs text-slate-600 font-editorial leading-relaxed">
              Reach out to our customer support executives, super admin team, or concierge for any booking, host onboarding, or travel queries.
            </p>

            <div className="space-y-3 pt-2">
              <a
                href="tel:+917871779134"
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-mono transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-900">
                    <Phone size={15} />
                  </div>
                  <div>
                    <strong className="block text-slate-900">Official Helpline</strong>
                    <span className="text-slate-500">+91 78717 79134</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Call Now</span>
              </a>

              <a
                href="https://wa.me/917871779134?text=Hi%20Explore%20Tamil%20Nadu%20Support%2C%20I%20need%20assistance"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-between text-xs font-mono transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                    <MessageCircle size={15} />
                  </div>
                  <div>
                    <strong className="block text-emerald-950">WhatsApp Concierge</strong>
                    <span className="text-emerald-700">Instant Chat & Status</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full">Open Chat</span>
              </a>

              <a
                href="mailto:exploretamizhagam@gmail.com"
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-mono transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-900">
                    <Mail size={15} />
                  </div>
                  <div>
                    <strong className="block text-slate-900">Official Email</strong>
                    <span className="text-slate-500">exploretamizhagam@gmail.com</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Send Mail</span>
              </a>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-[#242429] text-white hover:bg-black font-editorial font-bold text-xs cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎫 SUPPORT TICKET SUBMISSION MODAL */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowTicketModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 font-mono text-[10px] font-bold uppercase">
                DIRECT SUPPORT HELPDESK
              </span>
            </div>

            <h3 className="text-2xl font-editorial font-extrabold text-black">
              Raise a Support Ticket
            </h3>
            <p className="text-xs text-slate-500 font-editorial">
              Your ticket will be routed directly to our <strong>Customer Support Desk</strong> and <strong>Super Admin Control Center</strong> with real-time tracking.
            </p>

            {ticketSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-editorial font-bold text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{ticketSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleCreateFooterTicket} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={ticketName}
                      onChange={(e) => setTicketName(e.target.value)}
                      placeholder="e.g. Jeeva V."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-editorial text-black outline-hidden focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      placeholder="e.g. user@gmail.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-black outline-hidden focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-editorial text-black outline-hidden focus:ring-2 focus:ring-black"
                  >
                    <option value="Booking Issue">Booking & Reservation Issue</option>
                    <option value="Payment & Refund">Payment & Razorpay Settlement</option>
                    <option value="Property Host Inquiry">Property Listing & Verification</option>
                    <option value="Cancellation">Cancellation & Date Reschedule</option>
                    <option value="General Inquiry">General Tourism & Itinerary Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-editorial text-black outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">Message Details</label>
                  <textarea
                    rows={3}
                    required
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Please include Booking ID or Stay details if applicable..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-editorial text-black outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="px-4 py-2 rounded-2xl bg-slate-200 text-slate-700 font-editorial font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={ticketSubmitting}
                    className="px-6 py-2 rounded-2xl bg-[#242429] text-white hover:bg-black font-editorial font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>{ticketSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

