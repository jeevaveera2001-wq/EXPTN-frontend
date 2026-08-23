import React from 'react';

export function StayCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-4 space-y-3 shadow-xs animate-pulse">
      {/* Photo Placeholder with Shimmer */}
      <div className="w-full h-48 rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse relative overflow-hidden">
        <div className="absolute top-3 left-3 w-16 h-5 rounded-full bg-slate-300" />
        <div className="absolute top-3 right-3 w-20 h-5 rounded-full bg-slate-300" />
      </div>

      {/* Content lines */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-start">
          <div className="w-3/5 h-5 rounded-lg bg-slate-200" />
          <div className="w-1/4 h-5 rounded-lg bg-slate-200" />
        </div>

        <div className="w-2/5 h-3.5 rounded bg-slate-200" />

        <div className="flex gap-2 pt-2">
          <div className="w-16 h-5 rounded-md bg-slate-200" />
          <div className="w-16 h-5 rounded-md bg-slate-200" />
          <div className="w-16 h-5 rounded-md bg-slate-200" />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="w-24 h-4 rounded bg-slate-200" />
        <div className="w-28 h-8 rounded-xl bg-slate-300" />
      </div>
    </div>
  );
}

export function CabCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-xs animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-1.5 w-2/3">
          <div className="w-24 h-5 rounded-full bg-slate-200" />
          <div className="w-48 h-6 rounded-lg bg-slate-200" />
          <div className="w-32 h-4 rounded bg-slate-200" />
        </div>
        <div className="w-20 h-7 rounded-xl bg-slate-200" />
      </div>

      <div className="w-full h-44 rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />

      <div className="grid grid-cols-3 gap-2 py-1">
        <div className="h-10 rounded-xl bg-slate-100" />
        <div className="h-10 rounded-xl bg-slate-100" />
        <div className="h-10 rounded-xl bg-slate-100" />
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="w-28 h-4 rounded bg-slate-200" />
        <div className="w-32 h-9 rounded-2xl bg-slate-300" />
      </div>
    </div>
  );
}
