"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { PassageBase } from "@/src/types/reading";

export function PassageCard({ passage }: { passage: PassageBase }) {
  const [displayRate, setDisplayRate] = useState(passage.complete_rate);

  useEffect(() => {
    const savedProgress = localStorage.getItem(`progress-${passage.id}`);
    if (savedProgress) {
      setDisplayRate(Number(savedProgress));
    }
  }, [passage.id]);

  return (
    <Link href={`/reading/${passage.id}`} className="block">
      {/* TRANSFORMATION FOR MOBILE: 
          - Added 'active:scale-[0.98]' for thumb-press feedback.
          - Added 'active:border-emerald-500' for visual confirmation.
          - Changed padding slightly for tighter mobile screens.
      */}
      <div className="group bg-white rounded-2xl border border-slate-200 p-5 
                      md:hover:border-emerald-500 md:hover:shadow-lg 
                      active:scale-[0.98] active:border-emerald-500 
                      transition-all duration-200 cursor-pointer">
        
        <div className="flex justify-between items-start mb-6 gap-4">
          {/* MOBILE FONT FIX: 
              - 'text-lg' on mobile, 'md:text-xl' on laptop.
              - Added line-clamp to keep the card height consistent.
          */}
          <h2 className="text-lg md:text-xl font-serif font-semibold text-slate-900 
                         group-hover:text-emerald-700 leading-tight line-clamp-2">
            {passage.title}
          </h2>
          
          <span className="flex-shrink-0 text-[10px] md:text-xs font-bold uppercase tracking-wider 
                           bg-slate-50 px-2 py-1 rounded-md text-slate-400 border border-slate-100">
            {passage.readTime}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-end">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
               Progress
             </span>
             <span className="text-xs font-bold text-emerald-600">
               {Math.round(displayRate)}%
             </span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
             <div 
               className="bg-emerald-500 h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
               style={{ width: `${displayRate}%` }}
             />
          </div>
          
          <p className="text-[10px] md:text-xs font-medium text-slate-400 italic">
             Last updated: {passage.date}
          </p>
        </div>
      </div>
    </Link>
  );
}