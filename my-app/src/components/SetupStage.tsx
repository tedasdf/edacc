"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { Chunk } from '../types/reading';


interface SetupStageProps {
  numChunks: number;
  setNumChunks: (val: number) => void;
  allSentencesCount: number;
  chunks: Chunk[];
  onConfirm: () => void;
}

export function SetupStage({ 
  numChunks, 
  setNumChunks, 
  allSentencesCount, 
  chunks, 
  onConfirm 
}: SetupStageProps) {
  // We only care about the first chunk for the preview
  const previewChunk = chunks[0];

  return (
    <motion.div 
      key="setup" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white border-2 border-slate-100 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 w-full max-w-2xl text-center shadow-xl"
    >
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Reading Pace</h2>
      <p className="text-slate-500 text-sm mb-10">Adjust the slider to change text density per part.</p>
      
      {/* PREVIEW CARD AREA */}
      <div className="relative w-full aspect-[4/3] md:aspect-video mb-10 group">
        <div className="absolute inset-0 bg-slate-50 rounded-[2rem] -rotate-2 scale-[0.98] border border-slate-100" />
        <div className="absolute inset-0 bg-white rounded-[2rem] border-2 border-emerald-100 shadow-sm flex flex-col p-6 md:p-10 transition-all">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sample Part 1</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
              {previewChunk?.endIdx - previewChunk?.startIdx + 1} Sentences
            </span>
          </div>
          
          <div className="flex-grow flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p 
                key={numChunks}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-sm md:text-lg leading-relaxed text-slate-700 line-clamp-[6]"
              >
                {previewChunk?.text}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* SLIDER CONTROL */}
      <div className="space-y-6 mb-10">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-slate-400">FASTER</span>
          <input 
            type="range" 
            min="1" 
            max={Math.min(allSentencesCount, 12)} 
            value={numChunks} 
            onChange={(e) => setNumChunks(parseInt(e.target.value))}
            className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-[10px] font-black text-slate-400">DEEPER</span>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Breaking into <span className="text-emerald-600">{numChunks}</span> distinct segments
        </p>
      </div>

      <button 
        onClick={onConfirm} 
        className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all md:hover:bg-emerald-700"
      >
        Begin Reading
      </button>
    </motion.div>
  );
}