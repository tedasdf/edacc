"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Question } from '@/src/types/reading';

interface QuestionCardProps {
  question: Question;
  index: number;
  currentValue: string;
  isLocked: boolean; 
  onAnswer: (val: any) => void;
}

export function QuestionCard({ question, index, currentValue, isLocked, onAnswer }: QuestionCardProps) {
  // 1. Local state for the "typing/selecting" phase
  // This prevents the parent 'answers' state from updating until we hit Submit
  const [draftValue, setDraftValue] = useState(currentValue);
  const [submitted, setSubmitted] = useState(isLocked);
  const [needsJustification, setNeedsJustification] = useState(false);
  const [justification, setJustification] = useState("");
  const [showFeedback, setShowFeedback] = useState(isLocked);

  // Sync internal state if parent pushes a value (e.g., page refresh or Reset)
  useEffect(() => {
    setDraftValue(currentValue);
    setSubmitted(isLocked);
    setShowFeedback(isLocked);
  }, [currentValue, isLocked]);

  const isCorrect = draftValue.trim().toLowerCase() === question.answer.toLowerCase();

  const handleSubmit = () => {
    if (!draftValue) return;

    if (isCorrect || question.type === 'short-answer') {
      // 2. Only call the parent handler when the answer is FINAL
      onAnswer(draftValue); 
      setShowFeedback(true);
      setSubmitted(true);
    } else {
      // Trigger the justification phase for wrong MCQs
      setNeedsJustification(true);
    }
  };

  const handleConfirmJustification = () => {
    // 3. Final submission after user explains their wrong choice
    onAnswer(draftValue); 
    setShowFeedback(true);
    setSubmitted(true);
  };

  return (
    <motion.div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 border border-slate-100 shadow-sm mb-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-start">
        <span className="text-emerald-500 font-bold text-[10px] md:text-xs uppercase tracking-widest">
          Question {index + 1} • {question.category}
        </span>
      </div>
      
      <h3 className="text-base md:text-xl font-serif text-slate-800 mt-2 mb-6 md:mb-8 leading-relaxed">
        {question.question}
      </h3>

      {/* 1. INPUT PHASE (Uses draftValue) */}
      {!showFeedback && !needsJustification && (
        <div className="space-y-4">
          {question.type === 'MCQ' ? (
            <div className="grid grid-cols-1 gap-3">
              {question.options?.map((option: string) => (
                <button
                  key={option}
                  // UPDATE LOCAL DRAFT ONLY
                  onClick={() => setDraftValue(option)}
                  disabled={submitted}
                  className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                    draftValue === option ? "border-emerald-500 bg-emerald-50" : "border-slate-50 bg-slate-50"
                  }`}
                >
                  <span className="text-sm md:text-base font-medium text-slate-700">{option}</span>
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={draftValue}
              // UPDATE LOCAL DRAFT ONLY
              onChange={(e) => setDraftValue(e.target.value)}
              disabled={submitted}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 min-h-[120px] text-base focus:border-emerald-500 outline-none transition-all"
              placeholder="Type your detailed answer here..."
            />
          )}

          <button 
            onClick={handleSubmit}
            disabled={!draftValue || submitted}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-30"
          >
            {question.type === 'MCQ' ? "Submit Answer" : "Finalize Response"}
          </button>
        </div>
      )}

      {/* 2. JUSTIFICATION PHASE */}
      {needsJustification && !showFeedback && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-6 bg-amber-50 rounded-3xl border border-amber-100">
          <p className="text-amber-800 font-medium mb-4 text-sm">
            That's not quite right. Explain your reasoning before seeing the answer:
          </p>
          <textarea
            autoFocus 
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="w-full bg-white border-2 border-amber-200 rounded-xl p-4 min-h-[100px] outline-none focus:border-amber-400 text-sm"
            placeholder="Write a brief explanation..."
          />
          <button 
            onClick={handleConfirmJustification}
            disabled={justification.length < 5}
            className="w-full mt-4 py-3 bg-amber-600 text-white rounded-xl font-bold active:scale-95 transition-transform"
          >
            Show Reference Answer
          </button>
        </motion.div>
      )}

      {/* 3. FEEDBACK PHASE (Same as your original) */}
      {showFeedback && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
          <div className={`p-6 md:p-8 rounded-3xl ${isCorrect || question.type === 'short-answer' ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
            <h4 className="font-bold mb-2 text-slate-800">
              {question.type === 'MCQ' ? (isCorrect ? "✅ Correct" : "💡 Review") : "🎯 Reference Answer"}
            </h4>
            
            <div className="space-y-4">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">The Answer</p>
                 <p className="text-slate-700 text-sm md:text-base leading-relaxed font-medium">{question.answer}</p>
               </div>

               {question.rubric && (
                 <div className="bg-white/60 p-4 rounded-xl border border-emerald-200/50">
                   <p className="text-[10px] font-black text-emerald-600 uppercase mb-1 tracking-widest">Grading Rubric</p>
                   <p className="text-slate-600 text-xs italic">{question.rubric}</p>
                 </div>
               )}

               <div className="pt-4 border-t border-slate-200/60">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Evidence from Text</p>
                  <p className="text-slate-500 italic text-sm leading-relaxed">"{question.source_context}"</p>
               </div>
            </div>
          </div>
          
          {justification && (
            <div className="px-4 py-3 bg-slate-50 rounded-xl text-xs text-slate-400 italic">
              Your Reasoning: {justification}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}