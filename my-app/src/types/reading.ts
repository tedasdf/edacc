export interface PassageBase{
    title: string;
    id: string;
    complete_rate: number; // 0-100
    date: string;
    readTime: string; // e.g., "2 min read"
}

export interface FullPassage extends PassageBase{
    content: string; // Full passage content
}   

export interface Question {
  id: string;
  type: 'MCQ' | 'TYPING' | 'TRUE_FALSE' | 'mcq' | 'typing' | 'true_false' | 'short-answer';
  category: 'literal' | 'abstract';
  question: string;
  options?: string[];
  answer: string;
  rubric?: string;
  source_context: string;
  sentence_index?: number; // The index of the sentence in allSentences
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface PassageEntry {
  id: string;
  questions: Question[];
}


export interface Chunk {
  text: string;
  startIdx: number;
  endIdx: number;
}
