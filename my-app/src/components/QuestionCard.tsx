"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';

export function QuestionCard({ question, index, currentValue, onAnswer }: any) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [needsJustification, setNeedsJustification] = useState(false);
  const [justification, setJustification] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const isCorrect = currentValue.trim().toLowerCase() === question.answer.toLowerCase();

  const handleSubmit = () => {
    if (!currentValue) return;
    if (isCorrect) {
      setShowFeedback(true);
      setIsSubmitted(true);
    } else {
      setNeedsJustification(true);
    }
  };

  const handleConfirmJustification = () => {
    setShowFeedback(true);
    setIsSubmitted(true);
  };

  return (
    /* MOBILE: Reduced padding (p-5) to maximize text area | LAPTOP: (md:p-12) */
    <motion.div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-12 border border-slate-100 shadow-sm mb-6 w-full max-w-4xl mx-auto">
      <span className="text-emerald-500 font-bold text-[10px] md:text-xs uppercase tracking-widest">
        Question {index + 1}
      </span>
      <h3 className="text-base md:text-xl font-serif text-slate-800 mt-2 mb-6 md:mb-8 leading-snug md:leading-relaxed">
        {question.question}
      </h3>

      {/* 1. INPUT PHASE */}
      {!showFeedback && (
        <div className="space-y-4 md:space-y-6">
          {question.type === 'multiple-choice' || question.type === 'MCQ' ? (
            /* MOBILE: Stacked (grid-cols-1) | LAPTOP: Two columns (md:grid-cols-2) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {question.options?.map((option: string) => (
                <button
                  key={option}
                  disabled={needsJustification}
                  onClick={() => onAnswer(option)}
                  /* MOBILE: min-h-[56px] for thumb accuracy | LAPTOP: Hover effects */
                  className={`min-h-[56px] md:min-h-[64px] p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] md:hover:border-emerald-200 ${
                    currentValue === option ? "border-emerald-500 bg-emerald-50" : "border-slate-50 bg-slate-50"
                  } ${needsJustification ? "opacity-50" : ""}`}
                >
                  <span className="text-sm md:text-base font-medium text-slate-700">{option}</span>
                </button>
              ))}
            </div>
          ) : (
            <textarea
              disabled={needsJustification}
              value={currentValue}
              onChange={(e) => onAnswer(e.target.value)}
              /* MOBILE: 16px font size to prevent iOS auto-zoom on focus */
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 min-h-[120px] text-base md:text-lg focus:border-emerald-500 outline-none transition-all"
              placeholder="Your answer..."
            />
          )}

          {!needsJustification && (
            <button 
              onClick={handleSubmit}
              disabled={!currentValue}
              className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-30"
            >
              Submit Answer
            </button>
          )}
        </div>
      )}

      {/* 2. JUSTIFICATION PHASE (If wrong) */}
      {needsJustification && !showFeedback && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 md:mt-6 p-5 md:p-8 bg-amber-50 rounded-[1.5rem] md:rounded-3xl border border-amber-100">
          <p className="text-amber-800 font-medium mb-4 text-xs md:text-sm">
            That's not quite right. Explain your reasoning:
          </p>
          <textarea
            autoFocus /* Helpful for mobile to open keyboard immediately */
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="w-full bg-white border-2 border-amber-200 rounded-xl p-4 min-h-[100px] outline-none focus:border-amber-400 text-base md:text-sm"
            placeholder="Why did you pick that answer?"
          />
          <button 
            onClick={handleConfirmJustification}
            disabled={justification.length < 5}
            className="w-full mt-4 py-3 bg-amber-600 text-white rounded-xl font-bold disabled:opacity-50 active:scale-95 transition-transform"
          >
            Confirm & See Answer
          </button>
        </motion.div>
      )}

      {/* 3. FEEDBACK PHASE */}
      {showFeedback && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 md:mt-8 space-y-4">
          <div className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl ${isCorrect ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
            <h4 className={`font-bold mb-2 text-base md:text-lg ${isCorrect ? 'text-emerald-700' : 'text-slate-700'}`}>
              {isCorrect ? "✅ Correct!" : "💡 Learning Opportunity"}
            </h4>
            <div className="space-y-3">
               <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                 <span className="font-bold opacity-60 uppercase text-[10px] block mb-1">Correct Answer</span> 
                 {question.answer}
               </p>
               <div className="pt-4 border-t border-slate-200/60">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Evidence from Text</p>
                  <p className="text-slate-500 italic text-sm md:text-base leading-relaxed bg-white/50 p-3 rounded-lg">
                    "{question.source_context}"
                  </p>
               </div>
            </div>
          </div>
          
          {justification && (
            <div className="px-4 py-3 bg-white border border-slate-100 rounded-xl text-[10px] md:text-xs text-slate-400 italic">
              Your Reasoning: {justification}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}