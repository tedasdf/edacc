"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Highlighter, MoveHorizontal } from 'lucide-react';

interface Chunk {
  text: string;
  startIdx: number;
  endIdx: number;
}

interface CardStackProps {
  chunks: Chunk[];
  currentIdx: number;
  onSwipe: () => void;
  canSwipe: boolean;
  onSaveHighlight: (selectedText: string) => void;
  isHighlightMode: boolean;
  onToggleHighlight: () => void;
}

export function CardStack({ 
  chunks, 
  currentIdx, 
  onSwipe, 
  canSwipe, 
  onSaveHighlight,
  isHighlightMode,
  onToggleHighlight 
}: CardStackProps) {
  const [showToast, setShowToast] = useState(false);

  // CHANGED: We now only save if the text is long enough and let the user 
  // finish their native selection process.
  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 2) {
      onSaveHighlight(selectedText);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      
      // On mobile, we DON'T clear ranges so the handles stay visible
      // while the user is still adjusting.
      if (window.innerWidth > 768) {
        selection.removeAllRanges();
      }
    }
  };

  // 1. Create a helper to "Finish Highlighting" on mobile
  const finalizeMobileHighlight = () => {
    handleSelection();
    // After saving, we clear the selection so the blue goes away
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="relative w-full h-[450px] md:h-[550px] mb-8 md:mb-12">
      <div className="absolute -top-14 right-0 z-[70]">
        <button 
          onClick={() => {
              if (isHighlightMode) handleSelection(); // Save any active selection before switching
              onToggleHighlight();
            }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all active:scale-95 ${
            isHighlightMode 
              ? "bg-amber-500 border-amber-600 text-white" 
              : "bg-white border-slate-200 text-slate-500"
          }`}
        >
         
          {isHighlightMode ? (
            <Highlighter size={14} className="pointer-events-none" /> 
          ) : (
            <MoveHorizontal size={14} className="pointer-events-none" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isHighlightMode ? "Highlighting" : "Swiping"}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, x: "-50%" }}
            className="absolute -top-4 left-1/2 z-[80] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-xl"
          >
            Saved to Notebook ✨
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {chunks.slice(currentIdx, currentIdx + 2).map((chunk, index) => {
          const isTop = index === 0;

          return (
            <motion.div
              key={currentIdx + index}
              drag={isTop && canSwipe && !isHighlightMode ? "x" : false}
              dragListener={isTop && !isHighlightMode} 
              onPointerDown={(e) => {
                if (isHighlightMode) e.stopPropagation();
              }}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(_, info) => {
                if (info.offset.x < -100) onSwipe();
              }}
              initial={isTop ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0.5, y: 12 }}
              animate={{ 
                scale: isTop ? 1 : 0.95, 
                opacity: isTop ? 1 : 0.5,
                y: isTop ? 0 : 12,
                zIndex: isTop ? 20 : 10,
                backgroundColor: isTop && isHighlightMode ? "#fffdf5" : "#ffffff",
                pointerEvents: isTop ? "auto" : "none" 
              }}
              // Fast transition for mode toggle, slow for swiping
              transition={{ duration: isHighlightMode ? 0.15 : 0.4 }}
              exit={{ x: -500, opacity: 0, rotate: -5 }}
              className={`absolute inset-0 border border-slate-100 rounded-[2.5rem] px-8 py-8 shadow-2xl flex flex-col ${
                isTop && isHighlightMode ? "select-text touch-auto" : "select-none touch-none"
              }`}
              style={{
                touchAction: isHighlightMode ? "text" : "none"
              }}
            >
              <div className="flex-grow flex flex-col justify-center overflow-hidden">
                <div 
                  className={`relative z-30 overflow-y-auto custom-scrollbar p-2 max-h-full ${
                    isTop && isHighlightMode ? "select-text" : "select-none"
                  }`}
                  // Removed onPointerUp here; we handle it on the text or via a button
                >
                  <p 
                    className={`font-serif text-[18px] sm:text-xl md:text-2xl leading-relaxed text-slate-800 text-center ${
                      isHighlightMode ? "select-text" : "select-none"
                    }`}
                    // MOBILE: Double-tap the blue selection to save it
                    onDoubleClick={() => {
                      if (isHighlightMode) {
                        handleSelection();
                        window.getSelection()?.removeAllRanges(); // Clear handles after saving
                      }
                    }}
                    // LAPTOP: Mouse-up saves instantly
                    onMouseUp={() => {
                      if (window.innerWidth > 768 && isHighlightMode) {
                        handleSelection();
                      }
                    }}
                    onPointerDown={(e) => isHighlightMode && e.stopPropagation()}
                  >
                    {chunk.text}
                  </p>
                </div>
              </div>

              {/* Bottom indicator info */}
              <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                  {chunks.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentIdx ? "w-4 bg-emerald-500" : "w-1 bg-slate-200"}`} />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={isHighlightMode ? "h" : "s"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`text-[9px] font-black uppercase tracking-[0.2em] text-center ${
                      isHighlightMode ? "text-amber-600" : canSwipe ? "text-emerald-500" : "text-slate-300"
                    }`}
                  >
                    {isHighlightMode ? "Hold text to select" : canSwipe ? "✓ Swipe left to continue" : "Answer questions to swipe"}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}