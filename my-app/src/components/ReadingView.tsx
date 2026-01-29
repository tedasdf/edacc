"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FullPassage, Question } from '@/src/types/reading';
import { generateQuestions } from '@/src/lib/actions/generate';

// Sub-components
import { SetupStage } from './SetupStage';
import { CardStack } from './CardStack';
import { QuestionList } from './QuestionList';
import { ResultsStage } from './ResultsStage';
import { HighlightsPanel } from './HighlightsPanel';

import { BookOpenCheck } from 'lucide-react';

const SAVE_KEY = (id: string) => `reading-session-${id}`;



export function ReadingView({ passage, initialQuestions }: { passage: FullPassage, initialQuestions: Question[] }) {
  // --- STATE ---
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numChunks, setNumChunks] = useState(2); 
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isSettled, setIsSettled] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  // Inside ReadingView
  const [highlights, setHighlights] = useState<string[]>([]);
  const [isHighlightMode, setIsHighlightMode] = useState(false);

  // 2. Load Highlights (Once on mount)
  useEffect(() => {
    const saved = localStorage.getItem(`highlights-${passage.id}`);
    if (saved) setHighlights(JSON.parse(saved));
  }, [passage.id]);

  // 3. Save Highlights (Whenever they change)
  useEffect(() => {
    if (isLoaded) { // Only save if we've finished loading
      localStorage.setItem(`highlights-${passage.id}`, JSON.stringify(highlights));
    }
  }, [highlights, passage.id, isLoaded]);

  // 4. Simple Save Function (Pass this to CardStack)
  const handleSaveHighlight = (text: string) => {
    setHighlights(prev => prev.includes(text) ? prev : [...prev, text]);
  };

  // --- PERSISTENCE: LOAD ---
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY(passage.id));
    if (saved) {
      const data = JSON.parse(saved);
      setQuestions(data.questions);
      setNumChunks(data.numChunks);
      setCurrentIdx(data.currentIdx);
      setIsSettled(data.isSettled);
      setAnswers(data.answers);
    } else if (questions.length === 0) {
      handleNewSession();
    }
    setIsLoaded(true);
  }, [passage.id]);

  
  // --- PERSISTENCE: SAVE ---
  useEffect(() => {
    if (isLoaded && (isSettled || Object.keys(answers).length > 0)) {
      const sessionData = { questions, numChunks, currentIdx, isSettled, answers };
      localStorage.setItem(SAVE_KEY(passage.id), JSON.stringify(sessionData));
    }
  }, [questions, numChunks, currentIdx, isSettled, answers, isLoaded, passage.id]);

  // Inside ReadingView.tsx
  const handleNewSession = async () => {
    setIsGenerating(true);
    try {
      const res = await generateQuestions(passage.content);
      const newQuestions = res as Question[];
      setQuestions(newQuestions);
      return newQuestions; // Add this return
    } catch (error) {
      console.error("Failed to generate:", error);
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = async () => {
    // 1. Wipe everything
    localStorage.removeItem(SAVE_KEY(passage.id));
    localStorage.removeItem(`reading-progress-${passage.id}`);
    
    // 2. Clear state in one go
    setAnswers({});
    setCurrentIdx(0);
    setIsSettled(false);
    setQuestions([]); 

    // 3. Explicitly wait for the new questions
    const freshQuestions = await handleNewSession();
    
    // 4. Force state update if it hasn't caught up
    if (freshQuestions.length > 0) {
      setQuestions(freshQuestions);
    }
  };

  // --- LOGIC ---
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

  const isSummaryState = currentIdx === chunks.length;
  const isFinishedState = currentIdx > chunks.length;

  const handleNext = () => {
    // If we are on a normal card, move to next card or summary
    if (currentIdx <= chunks.length) {
      setCurrentIdx((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  // const currentQuestions = questions.filter(q => q.sentence_index === chunks[currentIdx]?.startIdx); // or your filtering logic

  // Inside your ReadingView component
  const isSectionComplete = useMemo(() => {
    // If we've already finished everything, just return true
    if (currentIdx > chunks.length) return true;

    // --- LOGIC FOR SUMMARY PAGE ---
    if (isSummaryState) {
      const summaryQuestions = questions.filter(q => 
        q.sentence_index === undefined || 
        q.sentence_index === -1 || 
        q.sentence_index === null ||
        q.sentence_index >= allSentences.length // index out of bounds is usually summary
      );

      // If for some reason no summary questions exist, 
      // we check if ALL questions in the entire session are answered as a safety.
      if (summaryQuestions.length === 0) {
        return questions.length > 0 && questions.every(q => !!answers[q.id.toString()]);
      }

      return summaryQuestions.every(q => !!answers[q.id.toString()]);
    }

    // --- LOGIC FOR NORMAL CHUNKS ---
    const currentChunk = chunks[currentIdx];
    if (!currentChunk) return false;

    const questionsForThisChunk = questions.filter((q) => {
      return (
        q.sentence_index !== undefined && 
        q.sentence_index >= currentChunk.startIdx && 
        q.sentence_index <= currentChunk.endIdx
      );
    });

    if (questionsForThisChunk.length === 0) return true;
    return questionsForThisChunk.every((q) => !!answers[q.id.toString()]);
  }, [questions, answers, chunks, currentIdx]);

  const completionRate = useMemo(() => {
    if (!isSettled) return 0;
    if (isFinishedState) return 100;
    const cardProgress = (currentIdx / chunks.length) * 70;
    const questionProgress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 30 : 0;
    return Math.min(cardProgress + questionProgress, 100);
  }, [currentIdx, chunks.length, answers, questions.length, isSettled, isFinishedState]);

  // Inside ReadingView.tsx
  // --- PERSISTENCE: SAVE (MERGED VERSION) ---
  useEffect(() => {
    // 1. Don't save if we haven't loaded yet
    // 2. Don't save if we are currently regenerating fresh questions
    if (!isLoaded || isGenerating) return;

    // 3. Only save if we have actual questions and the user has started/settled
    if (questions.length > 0 && (isSettled || Object.keys(answers).length > 0)) {
      
      // Save the full session data
      const sessionData = { questions, numChunks, currentIdx, isSettled, answers };
      localStorage.setItem(SAVE_KEY(passage.id), JSON.stringify(sessionData));
      
      // Save the percentage for the Home Page cards
      localStorage.setItem(
        `reading-progress-${passage.id}`, 
        Math.round(completionRate).toString()
      );
    }
  }, [
    questions, 
    numChunks, 
    currentIdx, 
    isSettled, 
    answers, 
    isLoaded, 
    passage.id, 
    completionRate, 
    isGenerating // Keep this list consistent!
  ]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // 2. Add delete function
  const handleDeleteHighlight = (textToDelete: string) => {
    setHighlights(prev => prev.filter(text => text !== textToDelete));
  };

  if (!isLoaded) return null; // Prevent hydration mismatch

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-10 min-h-[100dvh] flex flex-col items-center">

      {/* 1. MOVE THE BUTTON HERE (Outside the header) */}
      <div className="fixed top-6 right-6 z-[100]">
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md border border-slate-200 pl-3 pr-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:border-amber-200 transition-all active:scale-95 group"
        >
          <div className="bg-slate-100 p-1.5 rounded-full group-hover:bg-amber-100 transition-colors">
            <BookOpenCheck 
              size={16} 
              className="text-slate-500 group-hover:text-amber-600 transition-colors" 
              strokeWidth={2.5}
            />
          </div>

          <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em]">
            Notebook
          </span>

          <AnimatePresence>
            {highlights.length > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                key="badge"
                className="bg-amber-500 text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm shadow-amber-200"
              >
                {highlights.length}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* 2. KEEP YOUR HEADER CLEAN */}
      <header className="w-full max-w-2xl mb-6 md:mb-10 text-center">
        <h1 className="font-serif text-sm md:text-lg text-slate-400 truncate uppercase tracking-widest">
          {passage.title}
        </h1>
        <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-600">
          <span>{isFinishedState ? "Complete" : isSummaryState ? "Final Review" : !isSettled ? "Setup" : `Part ${currentIdx + 1}/${chunks.length}`}</span>
          <span className="bg-emerald-50 px-2 py-0.5 rounded-full">{Math.round(completionRate)}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
          <motion.div className="h-full bg-emerald-500" animate={{ width: `${completionRate}%` }} />
        </div>
      </header>

      <div className="relative w-full flex-grow flex flex-col items-center">
        <AnimatePresence mode="popLayout">
          {!isSettled && (
            <SetupStage 
              numChunks={numChunks} 
              setNumChunks={setNumChunks} 
              allSentencesCount={allSentences.length}
              chunks={chunks} 
              onConfirm={() => setIsSettled(true)} 
            />
          )}

          {isSettled && !isFinishedState && (
            <motion.div key="active-session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-3xl flex flex-col items-center">
              {!isSummaryState ? (
                <CardStack 
                  chunks={chunks}
                  currentIdx={currentIdx}
                 canSwipe={isSectionComplete && !isHighlightMode} // Prevent swipe if highlighting
                  onSwipe={handleNext}
                  onSaveHighlight={handleSaveHighlight}
                  isHighlightMode={isHighlightMode}           // Pass the state
                  onToggleHighlight={() => setIsHighlightMode(!isHighlightMode)} // Pass the toggle
                
                />
              ) : (
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-slate-800">Final Summary</h2>
                  <p className="text-slate-500">Big picture review.</p>
                </div>
              )}

              <QuestionList 
                questions={questions}
                currentChunk={chunks[currentIdx]}
                allSentencesCount={allSentences.length}
                isSummaryState={isSummaryState}
                answers={answers}
                onAnswer={(id, val) => setAnswers(p => ({...p, [id]: val}))}
                isGenerating={isGenerating}
              />

              {isSummaryState && (
                <div className="w-full mt-12 mb-20 px-4">
                  <button 
                    disabled={!isSectionComplete}
                    onClick={handleNext} 
                    className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all duration-500 shadow-xl shadow-emerald-900/10 ${
                      isSectionComplete 
                        ? "bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 cursor-pointer opacity-100" 
                        : "bg-slate-100 text-slate-300 cursor-not-allowed opacity-100"
                    }`}
                  >
                    {isSectionComplete ? "Complete Journey →" : "Answer Summary Question to Finish"}
                  </button>
                  
                  {!isSectionComplete && (
                    <p className="text-center text-[10px] font-bold text-slate-300 mt-4 uppercase tracking-widest">
                      The final step is locked
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {isFinishedState && (
            <ResultsStage 
              questions={questions} 
              answers={answers} 
              onReset={handleRetry} // This is the function we just updated
              passageContent={passage.content}
            />
          )}
      </AnimatePresence>
      </div>
      <HighlightsPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        highlights={highlights} 
        onDelete={handleDeleteHighlight}
      />
    </div>
  );
}