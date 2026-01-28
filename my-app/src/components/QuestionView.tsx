"use client";
import { useState } from 'react';
import { QuestionCard } from './QuestionCard';

export type Question = {
  id: string;
  type: 'MCQ' | 'TYPING';
  question: string;
  options?: string[];
  answer: string;
  source_context?: string; // Ensure this is in your type for the feedback phase
};

export function QuestionView({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  return (
    /* MOBILE: 'px-2' to keep cards from hitting the screen edge too hard.
       LAPTOP: 'max-w-4xl' to prevent the questions from becoming awkwardly wide.
       The 'space-y-8' vs 'md:space-y-16' creates a different rhythm for scrolling.
    */
    <div className="w-full max-w-4xl mx-auto px-2 md:px-0 space-y-8 md:space-y-16 pb-20 md:pb-32">
      
      {/* Optional: Section Divider for Desktop */}
      <div className="hidden md:flex items-center gap-4 mb-12">
        <div className="h-[1px] flex-grow bg-slate-200" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
          Analysis Questions
        </span>
        <div className="h-[1px] flex-grow bg-slate-200" />
      </div>

      {questions.map((q, index) => (
        <QuestionCard 
          key={q.id} 
          question={q} 
          index={index} 
          currentValue={answers[q.id] || ""}
          onAnswer={(val: string) => handleAnswer(q.id, val)}
        />
      ))}

      {/* MOBILE ONLY: Progress hint at the bottom */}
      <div className="md:hidden text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          End of questions
        </p>
      </div>
    </div>
  );
}