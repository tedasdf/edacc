# 📘 AI Reading Comprehension Interface

A next-generation reading experience designed to turn passive comprehension exercises into active learning.

This project was built as part of the EdAccelerator technical assessment. The goal was to redesign the reading interface using AI and product thinking to improve engagement, retention, and learning outcomes.

---

## 🎯 Problem Interpretation

The current system is functional but encourages shallow interaction:

- Students guess multiple-choice answers
- They forget the passage immediately
- They skip explanations
- Reading feels like a test, not learning
- Long passages feel overwhelming
- Slower readers struggle with the interface

The challenge is not just to display a passage — it is to design a system that forces meaningful engagement.

My guiding design principle:

> Reading should require thinking, not guessing.

---

## 🧠 Learning Design Philosophy

The interface is built around three learning principles:

### Active Recall
Typing and explaining answers strengthens memory more than selecting options.

### Reflection Before Progress
Users must confront mistakes before continuing.

### Adjustable Cognitive Load
Readers can control chunk size to match their pace.

The experience adapts to different reading speeds without changing passage difficulty.

---

## ✨ Core Features

### 1. Segmented Reading (Adjustable Chunking)

Large passages are broken into digestible chunks.

Users preview the passage and choose chunk size with a slider:

- Smaller chunks → easier focus
- Larger chunks → higher difficulty
- Same passage, different learning experience

Questions are tied directly to each chunk to reduce overload.

This solves:

> “It’s annoying seeing the entire passage all at once.”

---

### 2. Adaptive Question Display

Only questions relevant to the current chunk are shown.

This creates a tight loop:

```
read -> answer -> reflect -> continue
```


Even slower readers never feel overwhelmed.

---

### 3. Short Answer + Forced Explanation

Multiple choice alone is too easy to game.

Enhancements:

- Short answer questions require rewording
- If MCQ is wrong → user must explain reasoning
- Progress is locked until explanation is written

This forces deeper cognitive effort.

It solves:

> “I don’t really learn why I’m wrong.”

Mistakes become learning events.

---

### 4. Memory Reinforcement Phase

After finishing all chunks, users answer global questions about the entire passage.

The text is hidden.

This encourages:

- conceptual recall
- idea synthesis
- long-term retention

It addresses:

> “I immediately forget what I read.”

---

### 5. Flashcard-Style Interaction

The UI behaves like interactive flashcards:

- single focus per screen
- swipe-style progression
- progress bar
- clear milestones

The interface feels like guided study, not an exam.

---

### 6. Highlight Mode + Notebook

Users can highlight text and store notes.

Notebook is accessible from:

- reading page
- homepage

This supports rereading and personal study strategies.

Solves:

> “I want to re-read a specific part but can’t find it.”

---

### 7. Dual Mode Interface

Users toggle between:

- Swipe Mode → navigation
- Highlight Mode → study

Fast readers stay fluid. Deep learners can annotate.

---

### 8. Progress Tracking

Visible progress:

- reduces anxiety
- creates momentum
- encourages completion

Users always know where they are.

---

## 🤖 AI Question Generation Approach

Questions are generated dynamically using AI.

Goals:

- test comprehension, not recall
- vary difficulty
- mix question types
- encourage reasoning

### Question Types

- Multiple choice (conceptual understanding)
- Short answer (rephrasing ideas)
- Explanation prompts (metacognition)
- Global synthesis questions

Each chunk generates contextual questions tied to the text segment.

### Prompt Strategy

The AI is instructed to:

- avoid surface recall
- ask inference-based questions
- require explanation when possible
- vary structure and difficulty

Questions are generated per chunk, not per full passage, to maintain relevance.

This design scales to any passage length.

---

## 🧩 Architecture Overview

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Responsive mobile + desktop UI

**AI Layer**
- OpenAI API
- Chunk-aware prompt pipeline
- Structured JSON output
- Validation before rendering

**Flow**

```
passage -> chunking -> AI generation -> question rendering -> scoring
```


---

## 📊 Scoring System

- Tracks correct / incorrect answers
- Final score displayed at completion
- Reflection required for incorrect responses
- Encourages learning over speed

---

## 📱 Responsive Design

Fully responsive:

- mobile-first layout
- swipe-friendly interface
- keyboard and touch compatible

Works seamlessly on desktop and phone.

---

## 🚀 Future Improvements

- Adaptive difficulty scaling
- Personalized chunk recommendations
- Spaced repetition system
- AI-generated summaries from highlights
- Learning analytics dashboard

---

## 🏁 Conclusion

This interface transforms reading from:

```
scroll -> guess -> forget
```

into

```
read -> think -> explain -> remember
```


The goal is not to test students — it is to train comprehension.

Every feature exists to increase engagement, retention, and learning depth.

---

## 🔗 Live Demo

Vercel deployment:  
https://github.com/tedasdf/edacc

---

## 📂 Repository

GitHub:  
[\[Add your GitHub link here\]](https://github.com/tedasdf/edacc)

---
