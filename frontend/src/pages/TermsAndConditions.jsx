import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertTriangle, CheckCircle2, ArrowLeft, ShieldAlert, Car, Building2, UserCheck } from 'lucide-react';

export default function TermsAndConditions() {
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
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <FileText size={26} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-700 uppercase bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Official User Agreement
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Terms and Conditions & Code of Conduct
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-mono">
            Effective Date: August 2026 · Explore Tamil Nadu & VEERAWEBTECH Platform
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-8 text-sm leading-relaxed text-slate-700">
          
          {/* Section 1: Acceptance */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-amber-600 font-mono">01.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing, registering, logging in, or completing a stay/transport reservation on <strong>Explore Tamil Nadu</strong>, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions in full.
            </p>
          </section>

          {/* Section 2: Vehicle Owners & Driver Code of Conduct (CRITICAL) */}
          <section className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <Car className="text-amber-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">
                <span className="text-amber-600 font-mono">02.</span> Vehicle Owners, Fleet Providers & Driver Conduct Policy
              </h2>
            </div>
            <p>
              All vehicle owners, fleet operators, cab drivers, and transport vendors onboarded to the platform MUST strictly satisfy and adhere to the following mandatory conditions:
            </p>
            
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-green-600" /> Mandatory Documentation & Verification
                </h4>
                <p className="text-xs text-slate-600">
                  Every vehicle owner must submit genuine, high-resolution photographs of the <strong>Registration Certificate (RC Book)</strong>, <strong>Valid Comprehensive Insurance</strong>, <strong>Vehicle Exterior & Interior</strong>, and clearly visible <strong>Registration Number Plates</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-green-600" /> Driver License & Commercial Permit
                </h4>
                <p className="text-xs text-slate-600">
                  The assigned driver must hold an active, valid commercial driving license issued by the Regional Transport Authority (RTO) with zero major traffic violations or criminal records.
                </p>
              </div>

              {/* Strict Substance Warning Box */}
              <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs uppercase tracking-wide">
                  <ShieldAlert size={18} className="text-rose-600" />
                  <span>Strict Zero-Tolerance Substance & Passenger Safety Policy</span>
                </div>
                <p className="text-xs text-rose-900 font-medium leading-relaxed">
                  Drivers and vehicle operators are <strong>strictly prohibited</strong> from smoking cigarettes, consuming alcohol, using narcotics/drugs, chewing pan masala, gutkha, hans, cool lip, or any tobacco substances inside the vehicle or in the presence of passengers at any time during the trip. 
                </p>
                <p className="text-[11px] text-rose-700 font-mono">
                  ⚠️ Violation of this policy results in immediate deactivation of the vehicle listing, forfeiture of pending payouts, and permanent blacklisting from the Explore Tamil Nadu ecosystem.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Property Hosts */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <Building2 className="text-amber-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">
                <span className="text-amber-600 font-mono">03.</span> Property Hosts & Homestay Listings
              </h2>
            </div>
            <p>
              Property hosts declare that they hold lawful rights to list and accommodate guests at the submitted address. Listings must contain authentic, non-misleading photos, accurate pricing, valid Google Maps coordinates, and clearly stated house regulations.
            </p>
          </section>

          {/* Section 4: Tourist Responsibilities */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <UserCheck className="text-amber-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">
                <span className="text-amber-600 font-mono">04.</span> Tourist & Traveler Code of Conduct
              </h2>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
              <li>Guests must provide valid Government ID proof (Aadhaar, Passport, Driving License) at the time of check-in or cab pickup.</li>
              <li>Guests are expected to respect local culture, flora, fauna, and house regulations at hill station resorts and heritage stays.</li>
              <li>Damages caused to property or transport vehicles will be charged directly to the guest.</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
