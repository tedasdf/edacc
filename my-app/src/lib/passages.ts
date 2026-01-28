// src/lib/passages.ts
import passageData from "@/src/data/sample-passage.json";
import questionsData from "@/src/data/sample-question.json";
import { FullPassage, PassageBase, Question, PassageEntry } from "@/src/types/reading";


// This is a plain function, NOT a hook. It works everywhere!
export function getPassageById(id: string): FullPassage | null {
  const p = passageData.passage;
  return p.id === id ? (p as FullPassage) : null;
}

export function getAllPassages(): PassageBase[] {
  const p = passageData.passage;
  return [p as PassageBase];
}

export function getQuestionsByPassageId(id: string): Question[] {
  // 1. Resolve the data
  const rawData = (questionsData as any).default || questionsData;
  
  // 2. Case A: The JSON is a single object { id: "...", questions: [...] }
  if (!Array.isArray(rawData)) {
    // Change 'passage_id' to 'id' here to match your log
    if (rawData.id === id) {
      return rawData.questions;
    }
    return [];
  }

  // 3. Case B: The JSON is an array of objects
  // Change 'item.passage_id' to 'item.id' here as well
  const passageEntry = rawData.find((item: any) => item.id === id);

  return passageEntry ? passageEntry.questions : [];
}