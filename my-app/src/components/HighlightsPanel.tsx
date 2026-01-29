"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react'; // Ensure this is imported

interface HighlightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  highlights: string[];
  onDelete: (text: string) => void;
}

export function HighlightsPanel({ isOpen, onClose, highlights, onDelete }: HighlightsPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
          />
          
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[101] p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-2xl font-bold text-slate-800">Notebook</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {highlights.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-slate-400 font-serif italic text-sm">No highlights yet.</p>
                </div>
              ) : (
                highlights.map((text) => (
                  <motion.div 
                    layout
                    key={text}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-start justify-between gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 group"
                  >
                    <p className="text-slate-700 text-sm leading-relaxed font-serif italic">
                      "{text}"
                    </p>
                    <button 
                      onClick={() => onDelete(text)}
                      className="shrink-0 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      aria-label="Delete highlight"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}