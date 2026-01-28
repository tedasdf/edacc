"use server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateQuestions(passageText: string) {
  console.log(
    "AI is generating questions for:",
    passageText.substring(0, 40) + "..."
  );

  const systemPrompt = `
You are an expert educational assessment designer.

Your task is to generate exactly 10 reading comprehension questions
based on a provided passage.

You MUST follow the schema and constraints exactly.
Do not add extra fields.
Do not omit required fields.
Return ONLY valid JSON.
`;

  const userPrompt = `
PASSAGE:
${passageText}

SENTENCE INDEXING:
Assume the passage has been split into sentences indexed from 0 upward.
Use "global" as sentence_index when the question refers to the entire passage.

REQUIREMENTS:

1. Generate exactly 10 questions.

2. Each question MUST contain ALL of the following fields:
- id (number starting from 1)
- sentence_index (number OR "global")
- type ("mcq" or "short-answer")
- category ("detail", "inference", "abstract", "cause-effect", "main-idea")
- question (string)
- answer (string)
- rubric (string)
- source_context (string from or paraphrased from the passage)

3. Distribution constraints:
- At least 3 questions must be of type "mcq"
- At least 4 questions must be of type "short-answer"
- At least 2 questions must have sentence_index = "global"

4. MCQ constraints:
- Each MCQ must include 4 options labeled A, B, C, D inside the question text
- The correct option must be clearly stated in the answer field

5. Cognitive constraints:
- At least 2 questions must assess abstract or main-idea understanding
- Avoid yes/no questions
- Avoid trivial recall-only questions

OUTPUT FORMAT:
Return ONLY a JSON object with a top-level "questions" array.
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

  return JSON.parse(content);
}
