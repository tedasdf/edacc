"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Question } from '@/src/types/reading';
import { BookText } from 'lucide-react';

interface ResultsStageProps {
  questions: Question[];
  answers: Record<string, string>;
  onReset: () => void;
  passageContent: string; // Add the full text here
}

const normalize = (text: string) => 
  text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();

const checkAnswer = (user: string, correct: string) => {
  if (!user) return false;
  return normalize(user) === normalize(correct);
};

export function ResultsStage({ questions, answers, onReset, passageContent }: ResultsStageProps) {
  const [showReview, setShowReview] = useState(false);
  const score = questions.filter(q => answers[q.id.toString()] === q.rubric).length;

  return (
    <motion.div 
      key="finished" 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl flex flex-col gap-6"
    >
      {/* --- FULL PASSAGE VIEW --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
          <BookText size={16} className="text-slate-400" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Passage Reference</h3>
        </div>
        <div className="p-8 max-h-[300px] overflow-y-auto custom-scrollbar">
          <p className="font-serif text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
            {passageContent}
          </p>
        </div>
      </div>

      {/* --- RESULTS SUMMARY VIEW --- */}
      <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100">
        {!showReview ? (
          <div className="text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Results</h2>
            <p className="text-slate-500 mb-8 font-serif italic text-lg">
              You scored {score} / {questions.length}
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowReview(true)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:shadow-lg active:scale-95 transition-all"
              >
                Review Answers
              </button>
              <button 
                onClick={onReset}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          /* --- DETAILED REVIEW VIEW --- */
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Answer Key</h2>
              <button 
                onClick={() => setShowReview(false)}
                className="text-xs font-black text-emerald-600 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-full"
              >
                ← Back
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {questions.map((q, idx) => {
                const isCorrect = answers[q.id.toString()] === q.rubric;
                return (
                  <div key={q.id} className={`p-5 rounded-[1.5rem] border ${isCorrect ? 'border-emerald-100 bg-emerald-50/20' : 'border-red-100 bg-red-50/20'}`}>
                    <div className="flex gap-3 mb-2">
                      <span className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[9px] font-black ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                        {idx + 1}
                      </span>
                      <p className="font-serif font-bold text-slate-800 text-sm">{q.question}</p>
                    </div>
                    <div className="text-xs space-y-1 ml-8">
                      <p className={isCorrect ? "text-emerald-700" : "text-red-700"}>
                        <span className="font-black uppercase text-[9px] opacity-50 mr-2">Yours:</span> 
                        {answers[q.id.toString()] || "No answer"}
                      </p>
                      {!isCorrect && (
                        <p className="text-emerald-700">
                          <span className="font-black uppercase text-[9px] opacity-50 mr-2">Correct:</span> 
                          {q.rubric}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}