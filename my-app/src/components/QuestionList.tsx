"use client";
import { useMemo } from 'react';
import { Question } from '@/src/types/reading';
import { QuestionCard } from './QuestionCard';

interface QuestionListProps {
  questions: Question[];
  currentChunk?: { startIdx: number; endIdx: number };
  allSentencesCount: number;
  isSummaryState: boolean;
  answers: Record<string, string>;
  onAnswer: (id: string | number, val: string) => void; // Make sure 'id' allows both or matches q.id
  isGenerating: boolean;
}

export function QuestionList({
  questions,
  currentChunk,
  allSentencesCount,
  isSummaryState,
  answers,
  onAnswer,
  isGenerating
}: QuestionListProps) {
  
  const filteredQuestions = useMemo(() => {
    // 1. If we are in the Final Summary stage, show ONLY global questions
    if (isSummaryState) {
      return questions.filter(q => 
        q.sentence_index !== undefined && 
        Number(q.sentence_index) >= allSentencesCount
      );
    }

    // 2. If we are reading a specific chunk, show ONLY detail questions for that chunk
    if (!currentChunk) return [];

    return questions.filter(q => 
      q.sentence_index !== undefined &&
      Number(q.sentence_index) >= currentChunk.startIdx && 
      Number(q.sentence_index) <= currentChunk.endIdx &&
      Number(q.sentence_index) < allSentencesCount // Ensure it's not a global question
    );
  }, [questions, currentChunk, allSentencesCount, isSummaryState]);

  // Loading State
  if (isGenerating && filteredQuestions.length === 0) {
    return (
      <div className="w-full py-10 text-center animate-pulse">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Generating questions...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 md:space-y-10 pb-20">
      {filteredQuestions.map((q, i) => {
        // Logic: If there is an entry in the answers object, it's already "submitted"
        const savedAnswer = answers[q.id.toString()];
        const hasBeenAnswered = !!savedAnswer;

        return (
          <QuestionCard 
            key={q.id} 
            question={q} 
            index={i} 
            currentValue={savedAnswer || ""} 
            // Add a prop to QuestionCard to tell it to show the "Submitted/Correct" state immediately
            isLocked={hasBeenAnswered} 
            onAnswer={(val: any) => onAnswer(Number(q.id), val)}
          />
        );
      })}
      
      {/* Empty State: If a chunk happens to have no questions assigned to it */}
      {!isGenerating && filteredQuestions.length === 0 && !isSummaryState && (
        <p className="text-center text-slate-300 text-xs italic">
          Read this section carefully before moving on.
        </p>
      )}
    </div>
  );
}


