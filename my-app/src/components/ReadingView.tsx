"use client";
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FullPassage, Question } from '@/src/types/reading';
import { QuestionCard } from './QuestionCard';

export function ReadingView({ passage, questions = [] }: { passage: FullPassage, questions: Question[] }) {
  const [numChunks, setNumChunks] = useState(2); 
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isSettled, setIsSettled] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showReview, setShowReview] = useState(false);

  
  const allSentences = useMemo(() => {
    return passage.content.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [passage.content];
  }, [passage.content]);

  const chunks = useMemo(() => {
    const totalSentences = allSentences.length;
    const result = [];
    const baseSize = Math.floor(totalSentences / numChunks);
    const extras = totalSentences % numChunks;
    let start = 0;
    for (let i = 0; i < numChunks; i++) {
      const size = baseSize + (i < extras ? 1 : 0);
      if (size > 0) {
        result.push({
          text: allSentences.slice(start, start + size).join(" "),
          startIdx: start,
          endIdx: start + size - 1
        });
        start += size;
      }
    }
    return result;
  }, [allSentences, numChunks]);

  // 1. Detail Questions (linked to specific sentences)
  const activeQuestions = useMemo(() => {
    if (!isSettled || currentIdx >= chunks.length) return [];
    const currentChunk = chunks[currentIdx];
    return questions.filter(q => 
      q.sentence_index !== undefined &&
      q.sentence_index >= currentChunk.startIdx && 
      q.sentence_index <= currentChunk.endIdx &&
      q.sentence_index < allSentences.length
    );
  }, [currentIdx, chunks, questions, isSettled, allSentences.length]);

  // 2. Summary Questions (higher index than passage length)
  const globalQuestions = useMemo(() => {
    return questions.filter(q => 
      q.sentence_index !== undefined && 
      q.sentence_index >= allSentences.length
    );
  }, [questions, allSentences.length]);

  const isSummaryState = currentIdx === chunks.length;
  const isFinishedState = currentIdx > chunks.length;



  // Calculate how many total questions are answered
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  // Calculate the visual progress percentage
  const completionRate = useMemo(() => {
    if (!isSettled) return 0;
    
    // If we are at the very end celebration
    if (isFinishedState) return 100;

    // Weighted progress: 
    // 70% of the bar is based on cards swiped
    // 30% of the bar is based on questions answered
    const cardProgress = (currentIdx / chunks.length) * 70;
    const questionProgress = questions.length > 0 
      ? (answeredCount / questions.length) * 30 
      : 30;

    return Math.min(cardProgress + questionProgress, 100);
  }, [currentIdx, chunks.length, answeredCount, questions.length, isSettled, isFinishedState]);

  useEffect(() => {
    // Only save if the user has actually started or made progress
    if (isSettled && completionRate > 0) {
      localStorage.setItem(`progress-${passage.id}`, completionRate.toString());
    }
  }, [completionRate, passage.id, isSettled]);
return (
    /* MOBILE: Full width, min padding | LAPTOP: Max-width 5xl, more padding */
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-10 min-h-[100dvh] flex flex-col items-center">
      
      {/* RESPONSIVE HEADER */}
      <header className="w-full max-w-2xl mb-6 md:mb-10 text-center">
        <h1 className="font-serif text-sm md:text-lg text-slate-400 truncate uppercase tracking-widest">{passage.title}</h1>
        <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-600">
          <span>{isSettled ? (isSummaryState ? "Final Review" : `Part ${currentIdx + 1}/${chunks.length}`) : "Setup"}</span>
          <span className="bg-emerald-50 px-2 py-0.5 rounded-full">{Math.round(completionRate)}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2 overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
            animate={{ width: `${completionRate}%` }} 
            transition={{ type: "spring", stiffness: 40 }}
          />
        </div>
      </header>

      <div className="relative w-full flex-grow flex flex-col items-center">
        <AnimatePresence mode="popLayout">
          
          {/* SETUP MODE: Larger click areas for slider */}
          {!isSettled && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border-2 border-slate-100 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 w-full max-w-2xl text-center shadow-xl"
            >
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Reading Pace</h2>
              <p className="text-slate-500 text-sm mb-8">How many parts should we break this into?</p>
              
              <div className="flex items-center gap-4 mb-10">
                <span className="text-xs font-bold text-slate-400">FASTER</span>
                <input 
                  type="range" min="1" max={Math.min(allSentences.length, 12)} value={numChunks} 
                  onChange={(e) => setNumChunks(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-xs font-bold text-slate-400">DEEPER</span>
              </div>

              <button onClick={() => setIsSettled(true)} 
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 md:hover:bg-emerald-700 transition-all">
                Start Journey
              </button>
            </motion.div>
          )}

          {/* READING MODE: Responsive Card Height */}
          {isSettled && !isSummaryState && !isFinishedState && (
            <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="w-full max-w-3xl flex flex-col items-center">
              
              <div className="relative w-full h-[350px] md:h-[450px] mb-8 md:mb-12">
                {chunks.slice(currentIdx, currentIdx + 2).map((chunk, index) => {
                  const isTop = index === 0;
                  return (
                    <motion.div
                      key={currentIdx + index}
                      style={{ zIndex: 50 - index }}
                      initial={{ scale: 0.9, y: 20, opacity: 0 }}
                      animate={{ scale: 1 - index * 0.05, y: index * 12, opacity: 1 - index * 0.4 }}
                      exit={{ x: -1000, opacity: 0, rotate: -20, transition: { duration: 0.4 } }}
                      drag={isTop ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => { if (info.offset.x < -100) setCurrentIdx(prev => prev + 1); }}
                      className={`absolute inset-0 bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 shadow-2xl flex items-center justify-center text-center ${isTop ? "cursor-grab active:cursor-grabbing touch-none" : "pointer-events-none"}`}
                    >
                      <p className="font-serif text-lg md:text-2xl leading-relaxed text-slate-800 select-none">
                        {chunk.text}
                      </p>
                      {isTop && (
                         <div className="absolute bottom-6 text-[10px] font-bold text-slate-300 animate-pulse md:hidden">
                            ← Swipe left when finished reading
                         </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* QUESTIONS LIST */}
              <div className="w-full space-y-6 md:space-y-10 pb-20">
                {activeQuestions.map((q, i) => (
                  <QuestionCard key={q.id} question={q} index={i} currentValue={answers[q.id] || ""} onAnswer={(val: any) => setAnswers(p => ({...p, [q.id]: val}))} />
                ))}
              </div>
            </motion.div>
          )}

          {/* SUMMARY QUESTIONS MODE (sentence_index >= allSentences.length) */}
          {isSummaryState && (
            <motion.div key="summary" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl space-y-8 p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Final Summary</h2>
                <p className="text-slate-500">Big picture questions for the whole passage.</p>
              </div>
              {globalQuestions.map((q, i) => (
                <QuestionCard key={q.id} question={q} index={i} currentValue={answers[q.id] || ""} onAnswer={(val: any) => setAnswers(p => ({...p, [q.id]: val}))} />
              ))}
              <button onClick={() => setCurrentIdx(prev => prev + 1)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl">Complete Reading</button>
            </motion.div>
          )}

          {/* FINISHED CELEBRATION */}
          {isFinishedState && (
            <motion.div key="finished" className="w-full max-w-2xl bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100">
              {!showReview ? (
                /* --- RESULTS SUMMARY VIEW --- */
                <div className="text-center">
                  <div className="text-5xl mb-4">🏆</div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Results</h2>
                  <p className="text-slate-500 mb-8">
                    You scored {questions.filter(q => answers[q.id] === q.rubric).length} / {questions.length}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setShowReview(true)}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                    >
                      Review Answers
                    </button>
                    <button 
                      onClick={() => { setIsSettled(false); setCurrentIdx(0); setAnswers({}); }}
                      className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                /* --- DETAILED REVIEW VIEW --- */
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Review</h2>
                    <button 
                      onClick={() => setShowReview(false)}
                      className="text-xs font-bold text-emerald-600 uppercase tracking-widest"
                    >
                      Back to Summary
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {questions.map((q, idx) => {
                      const isCorrect = answers[q.id] === q.rubric;
                      return (
                        <div key={q.id} className={`p-6 rounded-[2rem] border-2 ${isCorrect ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30'}`}>
                          <div className="flex gap-3 mb-3">
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                              {idx + 1}
                            </span>
                            <p className="font-bold text-slate-800 text-sm">{q.question}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4">
                            <div className="p-3 rounded-xl bg-white border border-slate-100">
                              <span className="block text-slate-400 mb-1 uppercase font-black">Your Answer</span>
                              <span className={isCorrect ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                                {answers[q.id] || "No answer"}
                              </span>
                            </div>
                            {!isCorrect && (
                              <div className="p-3 rounded-xl bg-white border border-slate-100">
                                <span className="block text-slate-400 mb-1 uppercase font-black">Correct Answer</span>
                                <span className="text-emerald-600 font-bold">{q.rubric}</span>
                              </div>
                            )}
                          </div>

                          {/* Explanation / Summary */}
                          <div className="p-4 bg-slate-800 rounded-2xl">
                            <p className="text-[11px] leading-relaxed text-slate-300">
                              <span className="text-emerald-400 font-bold uppercase mr-2">Key takeaway:</span>
                              {q.explanation || `The correct answer is "${q.rubric}" based on the context provided in the passage.`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}