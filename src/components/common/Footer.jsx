import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#f9f5f2] text-[#242429] pt-16 pb-8 border-t border-[#242429]/20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Quick Links */}
        <div>
          <span className="font-fira-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#919191] block mb-4">NAVIGATION</span>
          <ul className="space-y-2.5 text-xs font-fira-mono text-[#3e3e3e]">
            <li><Link to="/" className="hover:text-[#000000] transition-colors no-underline">HOME</Link></li>
            <li><Link to="/hotels" className="hover:text-[#000000] transition-colors no-underline">EXPLORE STAYS</Link></li>
            <li><a href="#about" className="hover:text-[#000000] transition-colors no-underline">ABOUT US</a></li>
            <li><a href="#contact" className="hover:text-[#000000] transition-colors no-underline">CONTACT US</a></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <span className="font-fira-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#919191] block mb-4">SERVICES</span>
          <ul className="space-y-2.5 text-xs font-fira-mono text-[#3e3e3e]">
            <li><Link to="/hotels" className="hover:text-[#000000] transition-colors no-underline">HOMESTAYS</Link></li>
            <li><Link to="/hotels" className="hover:text-[#000000] transition-colors no-underline">RESORTS & VILLAS</Link></li>
            <li><Link to="/dashboard" className="hover:text-[#000000] transition-colors no-underline">LIST YOUR PROPERTY</Link></li>
            <li><Link to="/dashboard" className="hover:text-[#000000] transition-colors no-underline">OWNER CENTRE</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <span className="font-fira-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#919191] block mb-4">SUPPORT</span>
          <ul className="space-y-2.5 text-xs font-fira-mono text-[#3e3e3e]">
            <li><Link to="/dashboard" className="hover:text-[#000000] transition-colors no-underline">MY BOOKINGS</Link></li>
            <li><Link to="/hotels" className="hover:text-[#000000] transition-colors no-underline">SAVED STAYS</Link></li>
            <li><a href="#support" className="hover:text-[#000000] transition-colors no-underline">SUPPORT TICKETS</a></li>
            <li><a href="#help" className="hover:text-[#000000] transition-colors no-underline">HELP & CONTACT</a></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <span className="font-fira-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#919191] block mb-4">HEADQUARTERS</span>
          <ul className="space-y-3.5 text-xs font-fira-mono text-[#3e3e3e]">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ffffff] border border-[#242429]/20 flex items-center justify-center text-[#242429] flex-shrink-0 shadow-sm">
                <MapPin size={15} />
              </div>
              <span>Tamil Nadu, India</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ffffff] border border-[#242429]/20 flex items-center justify-center text-[#242429] flex-shrink-0 shadow-sm">
                <Phone size={15} />
              </div>
              <a href="tel:+917871779134" className="hover:text-[#000000] transition-colors no-underline text-[#3e3e3e]">
                +91 78717 79134
              </a>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ffffff] border border-[#242429]/20 flex items-center justify-center text-[#242429] flex-shrink-0 shadow-sm">
                <Mail size={15} />
              </div>
              <a href="mailto:exploretamizhagam@gmail.com" className="hover:text-[#000000] transition-colors no-underline text-[#3e3e3e] break-all">
                exploretamizhagam@gmail.com
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-[#242429]/15 flex flex-col md:flex-row justify-between items-center font-fira-mono text-[11px] text-[#919191] gap-4">
        <p className="flex items-center gap-2">
          <span>THIS SITE IS UNDER</span>
          <span className="font-bold text-[#000000] tracking-wide">VEERAWEBTECH</span>
        </p>
        <p className="text-[#919191]">
          © {new Date().getFullYear()} EXPLORE TAMIL NADU. KOBU EDITORIAL DESIGN SYSTEM.
        </p>
      </div>
    </footer>
  );
}
