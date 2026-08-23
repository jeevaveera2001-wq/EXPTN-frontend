import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fbf9f6] text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldCheck size={26} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-blue-700 uppercase bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Official Legal Policy
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Privacy & Data Protection Policy
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-mono">
            Last Updated: August 2026 · Under VEERAWEBTECH & Explore Tamil Nadu Platform
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-8 text-sm leading-relaxed text-slate-700">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-mono">01.</span> Information We Collect
            </h2>
            <p>
              When you use <strong>Explore Tamil Nadu</strong> (accessible via website, mobile interface, and customer/vendor portals), we collect information necessary to provide verified tourism reservations, transport bookings, and secure payments:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
              <li><strong>Personal Identity:</strong> Full Name, Email Address, Verified Mobile Number, Government ID proof (required for verified check-in).</li>
              <li><strong>Location & Geolocation Data:</strong> Precise GPS coordinates, interactive map pins, and pickup/drop landmarks used for hotel routing and cab dispatch.</li>
              <li><strong>Vendor & Driver Documentation:</strong> Vehicle RC (Registration Certificate) book images, vehicle exterior & interior photographs, registration number plates, driver licenses, and host property details.</li>
              <li><strong>Payment Records:</strong> Transaction IDs and payment confirmation status processed securely via Razorpay (we do not store credit card CVV or net banking PINs).</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-mono">02.</span> How We Use Your Information
            </h2>
            <p>
              We utilize collected data solely for authentic tourism experiences, passenger safety, and legal compliance:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-600" /> Booking Verification
                </h4>
                <p className="text-xs text-slate-600">Generating valid Stay Passes, Hotel Vouchers, and Cab Trip Slips.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-600" /> Passenger Safety
                </h4>
                <p className="text-xs text-slate-600">Verifying driver licenses, vehicle RC books, and emergency support dispatch.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-600" /> Instant Communications
                </h4>
                <p className="text-xs text-slate-600">Email/SMS confirmation vouchers, trip status updates, and support ticket resolutions.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-600" /> Fraud Prevention
                </h4>
                <p className="text-xs text-slate-600">Preventing fake property listings and ensuring strict host compliance.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-mono">03.</span> Data Security & Storage
            </h2>
            <p>
              All sensitive credentials, booking records, and property images are encrypted in transit via SSL/TLS (HTTPS) and stored in secure cloud databases (MongoDB Atlas) with strict role-based access control. We never sell, rent, or trade your personal information to third-party advertisers.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-mono">04.</span> Contact Privacy Officer
            </h2>
            <p>
              If you have any questions regarding your data privacy or wish to request data erasure:
            </p>
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs font-mono space-y-2 text-slate-800">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-blue-600" />
                <span>Email: <a href="mailto:exploretamizhagam@gmail.com" className="underline font-bold">exploretamizhagam@gmail.com</a></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-blue-600" />
                <span>Helpline: +91 78717 79134</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-blue-600" />
                <span>HQ: VEERAWEBTECH, Tamil Nadu, India</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
