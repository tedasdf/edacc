"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { PassageBase } from "@/src/types/reading";
import { BookOpenCheck } from "lucide-react"; // Import Lucide
import { HighlightsPanel } from "./HighlightsPanel"; // Import your panel

export function PassageCard({ passage }: { passage: PassageBase }) {
  const [displayRate, setDisplayRate] = useState(passage.complete_rate);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);

  useEffect(() => {
    const savedProgress = localStorage.getItem(`reading-progress-${passage.id}`);
    const savedHighlights = localStorage.getItem(`highlights-${passage.id}`);
    
    if (savedProgress) setDisplayRate(Number(savedProgress));
    if (savedHighlights) setHighlights(JSON.parse(savedHighlights));
  }, [passage.id]);

  // Handle Deletion inside the Dashboard Card
  const handleDeleteHighlight = (textToDelete: string) => {
    const updated = highlights.filter(h => h !== textToDelete);
    setHighlights(updated);
    localStorage.setItem(`highlights-${passage.id}`, JSON.stringify(updated));
  };

  return (
    <div className="relative">
      <Link href={`/reading/${passage.id}`} className="block">
        <div className="group bg-white rounded-2xl border border-slate-200 p-5 
                        md:hover:border-emerald-500 md:hover:shadow-lg 
                        active:scale-[0.98] active:border-emerald-500 
                        transition-all duration-200 cursor-pointer">
          
          <div className="flex justify-between items-start mb-6 gap-4">
            <h2 className="text-lg md:text-xl font-serif font-semibold text-slate-900 
                           group-hover:text-emerald-700 leading-tight line-clamp-2">
              {passage.title}
            </h2>
            
            {/* NOTEBOOK BUTTON - Inside the Card */}
            {highlights.length > 0 && (
              <button 
                onClick={(e) => {
                  e.preventDefault(); // Stop Link navigation
                  e.stopPropagation();
                  setIsPanelOpen(true);
                }}
                className="flex items-center gap-2 bg-amber-50 border border-amber-100 pl-2 pr-3 py-1.5 rounded-full shadow-sm hover:bg-amber-100 transition-all active:scale-90"
              >
                <BookOpenCheck size={14} className="text-amber-600" strokeWidth={2.5} />
                <span className="bg-amber-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {highlights.length}
                </span>
              </button>
            )}

            {!highlights.length && (
              <span className="flex-shrink-0 text-[10px] md:text-xs font-bold uppercase tracking-wider 
                               bg-slate-50 px-2 py-1 rounded-md text-slate-400 border border-slate-100">
                {passage.readTime}
              </span>
            )}
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

      {/* RENDER PANEL AT ROOT OF CARD */}
      <HighlightsPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        highlights={highlights} 
        onDelete={handleDeleteHighlight}
      />
    </div>
  );
}