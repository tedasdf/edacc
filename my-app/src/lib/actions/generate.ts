"use server";
import { Question } from "@/src/types/reading";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function splitIntoSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [text];
}

function normalizeQuestions(questions: any[], sentenceCount: number): Question[] {
  return questions.map(q => {
    // 1. Handle Index: "global" or strings to Numbers
    let index = q.sentence_index === "global" ? sentenceCount : Number(q.sentence_index);

    // 2. Normalize Options: Ensure it is ALWAYS string[]
    let normalizedOptions: string[] = [];
    if (q.type === 'mcq' || q.type === 'MCQ') {
      if (Array.isArray(q.options)) {
        normalizedOptions = q.options;
      } else if (typeof q.options === 'object' && q.options !== null) {
        // Handles { A: 'Text', B: 'Text' }
        normalizedOptions = Object.values(q.options);
      }
    }

    // 3. Normalize Answer: Convert 'A'/'B'/'C'/'D' to the actual text string
    let finalAnswer = q.answer;
    const isLetterAnswer = /^[A-D]$/i.test(q.answer.trim());

    if ((q.type === 'mcq' || q.type === 'MCQ') && isLetterAnswer) {
      const letterToIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
      const idx = letterToIndex[q.answer.toUpperCase()];

      if (Array.isArray(q.options)) {
        // If options was already ['Opt1', 'Opt2']
        finalAnswer = q.options[idx] || q.answer;
      } else if (typeof q.options === 'object' && q.options !== null) {
        // If options was { A: 'Opt1', B: 'Opt2' }
        const entries = Object.entries(q.options);
        const match = entries.find(([key]) => key.toUpperCase() === q.answer.toUpperCase());
        finalAnswer = match ? match[1] : q.answer;
      }
    }

    return {
      ...q,
      id: Number(q.id),
      type: q.type.toLowerCase() === 'mcq' ? 'MCQ' : 'short-answer',
      sentence_index: index,
      options: normalizedOptions.length > 0 ? normalizedOptions : undefined,
      answer: finalAnswer.trim(),
    };
  });
}

function validateSentenceIndices(
  questions: any[],
  sentenceCount: number
) {
  for (const q of questions) {
    if (
      typeof q.sentence_index !== "number" ||
      q.sentence_index < 0 ||
      q.sentence_index > sentenceCount
    ) {
      throw new Error(
        `Invalid sentence_index: ${q.sentence_index}`
      );
    }
  }
}

export async function generateQuestions(passageText: string): Promise<Question[]> {
  const sentences = splitIntoSentences(passageText);
  const sentenceCount = sentences.length;
  
  const systemPrompt = `
    You are an expert educational assessment designer.

    Your task is to generate exactly 10 high-quality reading comprehension questions
    based on a provided passage.

    You MUST strictly follow all constraints.
    Do NOT add extra fields.
    Do NOT omit required fields.
    Return ONLY valid JSON.
  `;


  const userPrompt = `
    PASSAGE:
    ${passageText}

    SENTENCE INDEXING:
    Assume the passage has been split into individual sentences,
    indexed from 0 to N-1 in order.
    Use "global" as sentence_index ONLY when the question requires
    information from multiple non-adjacent parts of the passage.

    ────────────────────────────
    COVERAGE CONSTRAINTS:
    The questions MUST be distributed across the entire passage.

    Divide the passage into 4 segments:
    - Segment 1: sentences 0 to ⌊N/4⌋
    - Segment 2: sentences ⌊N/4⌋+1 to ⌊N/2⌋
    - Segment 3: sentences ⌊N/2⌋+1 to ⌊3N/4⌋
    - Segment 4: sentences ⌊3N/4⌋+1 to N-1

    REQUIRED DISTRIBUTION:
    - At least 2 questions from Segment 1
    - At least 2 questions from Segment 2
    - At least 2 questions from Segment 3
    - At least 2 questions from Segment 4
    - Remaining questions may come from any segment

    Do NOT reuse the same sentence_index more than twice.
    ────────────────────────────

    QUESTION REQUIREMENTS:

    1. Generate EXACTLY 10 questions.

    2. Each question MUST include ALL fields below:
    - id (number starting from 1)
    - sentence_index (number OR "global")
    - type ("mcq" or "short-answer")
    - category ("detail", "inference", "abstract", "cause-effect", "main-idea")
    - question (string)
    - answer (string)
    - rubric (string explaining what a correct answer must include)
    - source_context (quoted or paraphrased text from the passage)

    3. Type distribution:
    - At least 3 questions MUST be "mcq"
    - At least 4 questions MUST be "short-answer"

    4. MCQ rules:
    - Each MCQ must include exactly 4 options labeled A, B, C, D
    - The correct option MUST be clearly stated in the answer field

    5. Cognitive requirements:
    - At least 2 questions MUST assess "abstract" or "main-idea" understanding
    - Questions with sentence_index = "global":
      - MUST be category "abstract" or "main-idea"
      - MUST synthesize information from multiple parts of the passage
      - Maximum of 3 global questions total

    6. Quality rules:
    - Avoid yes/no questions
    - Avoid trivial recall-only questions
    - Questions must be appropriate for academic reading assessment

    OUTPUT FORMAT:
    Return ONLY a JSON object with this structure:

    {
      "questions": [ ... ]
    }
    `;


  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned empty response");
  }

  const parsed = JSON.parse(content);

  

  // Normalize "global" → sentenceCount
  const normalizedQuestions = normalizeQuestions(
    parsed.questions,
    sentenceCount
  );

  // Validate indices (0 → sentenceCount)
  validateSentenceIndices(normalizedQuestions, sentenceCount);

  return normalizedQuestions as Question[];

}
