import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Clock, ArrowLeft, CheckCircle2, AlertCircle, CreditCard, Mail, Phone } from 'lucide-react';

export default function CancellationRefundPolicy() {
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <RefreshCw size={26} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Official Booking Rules
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Cancellation & 100% Transparent Refund Policy
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-mono">
            Clear timelines and guaranteed refunds for Stays, Resorts, and Cab bookings.
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-8 text-sm leading-relaxed text-slate-700">
          
          {/* Section 1: Stays & Resorts Cancellation */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-emerald-600 font-mono">01.</span> Stays, Homestays & Resort Bookings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                <span className="text-xs font-bold text-emerald-800 font-mono">48+ Hours Before Check-in</span>
                <div className="text-xl font-extrabold text-emerald-700">100% REFUND</div>
                <p className="text-[11px] text-emerald-900">Full refund processed back to your original payment method (minus minimal payment gateway fee if applicable).</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                <span className="text-xs font-bold text-amber-800 font-mono">24 to 48 Hours Before</span>
                <div className="text-xl font-extrabold text-amber-700">50% REFUND</div>
                <p className="text-[11px] text-amber-900">50% of the total booking value refunded, and remaining allocated to host reservation holding cost.</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1">
                <span className="text-xs font-bold text-rose-800 font-mono">&lt; 24 Hours or No-Show</span>
                <div className="text-xl font-extrabold text-rose-700">NO REFUND</div>
                <p className="text-[11px] text-rose-900">Non-refundable due to property reservation lock-in and last-minute room hold.</p>
              </div>
            </div>
          </section>

          {/* Section 2: Cab & Transport Fleet Cancellation */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-emerald-600 font-mono">02.</span> Cabs, Hill Transfers & Rental Vehicles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Cancelled &gt; 12 Hours Before Pickup
                </h4>
                <p className="text-xs text-slate-600"><strong>100% Full Refund</strong> guaranteed with immediate automated settlement.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-amber-600" /> Cancelled &lt; 12 Hours or Driver Dispatched
                </h4>
                <p className="text-xs text-slate-600">Nominal driver mobilization fee (₹500 for cabs / ₹1,200 for Tempo Travellers) deducted.</p>
              </div>
            </div>
          </section>

          {/* Section 3: Refund Timelines & Mode */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="text-emerald-600" size={20} />
              <span className="text-emerald-600 font-mono">03.</span> Refund Processing & Razorpay Settlement
            </h2>
            <p>
              All approved refunds are initiated instantly and credited back directly to the source bank account, UPI ID, or credit/debit card via <strong>Razorpay Payment Gateway</strong> within <strong>3 to 5 business days</strong>.
            </p>
          </section>

          {/* Section 4: Assistance */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-emerald-600 font-mono">04.</span> 24/7 Cancellation Helpline
            </h2>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2 text-slate-800">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-emerald-600" />
                <span>Support Email: <a href="mailto:exploretamizhagam@gmail.com" className="underline font-bold">exploretamizhagam@gmail.com</a></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-600" />
                <span>Customer Care: +91 78717 79134 (24/7 Response)</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
