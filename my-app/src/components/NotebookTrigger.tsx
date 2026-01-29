"use client";
import { useEffect, useState } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NotebookTrigger({ passageId, onClick }: { passageId: string, onClick: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`highlights-${passageId}`);
    if (saved) {
      setCount(JSON.parse(saved).length);
    }
  }, [passageId]);

  if (count === 0) return null;

  return (
    <button 
      onClick={(e) => {
        e.preventDefault(); // Prevent Link navigation on PassageCard
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200 pl-2 pr-3 py-1.5 rounded-full shadow-sm hover:shadow-md hover:border-amber-200 transition-all active:scale-95 group"
    >
      <div className="bg-slate-50 p-1 rounded-full group-hover:bg-amber-100 transition-colors">
        <BookOpenCheck size={14} className="text-slate-400 group-hover:text-amber-600" strokeWidth={2.5} />
      </div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notebook</span>
      <span className="bg-amber-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
        {count}
      </span>
    </button>
  );
}