# AI-Powered Adaptive Reader

A mobile-first reading comprehension app built for the EdAccelerator technical assessment.
**Stack:** Next.js 16.1.6, React 19, TypeScript, Tailwind CSS 4, and Groq (Llama 3.3 70B).
[Live Demo](https://edacc-yggg.vercel.app/) | [GitHub](https://github.com/tedasdf/edacc)

## Overview

AI-Powered Adaptive Reader turns passive reading exercises into a guided cycle of reading, answering, reflecting, and recalling. It breaks a passage into adjustable chunks, generates questions for each section, and requires learners to engage with mistakes before moving on.

The included library contains three reading experiences: an informational honeybee passage, a fictional clockmaker narrative, and a community garden case study.

The guiding principle is simple:

> Reading should require thinking, not guessing.

## Features

- **Adjustable reading chunks:** Learners choose how much text to view at once without changing the passage difficulty.
- **Multiple passages:** The library includes informational, narrative, and case-study reading styles.
- **Chunk-aware questions:** Questions appear alongside the relevant part of the passage to keep the task focused.
- **Works without AI:** Every passage includes a predefined set of multiple-choice and short-answer questions.
- **Optional AI generation:** With a Groq key, restarting a session can generate a fresh question set at varied difficulty levels.
- **Visible question source:** The interface labels questions as predefined, AI-generated, or restored from a saved session.
- **Reflection before progress:** Incorrect multiple-choice answers trigger an explanation step before the learner can continue.
- **Final recall:** Two global questions test understanding across the full passage after the reading phase.
- **Honest results:** Multiple-choice answers are scored objectively, while written responses are tracked separately and reviewed against reference answers and rubrics.
- **Swipe and highlight modes:** Learners can switch between gesture-based navigation and text selection.
- **Resilient local progress:** Highlights and reading sessions are stored in the browser, with invalid saved data removed automatically.
- **Responsive interface:** The experience is designed for touch, keyboard, mobile, and desktop use.

## How It Works

```text
passage -> adjustable chunks -> predefined or AI questions -> answer and reflect -> final recall -> results
```

The app starts with its predefined question set, so the full reading journey works without credentials or network access. When Groq is configured, restarting a session requests a fresh set from `llama-3.3-70b-versatile`. The server requests structured JSON, normalizes the response, validates question locations, and falls back to the predefined set if generation fails.

The client groups questions with passage chunks, requires reflection after incorrect multiple-choice answers, saves progress locally, and finishes with two passage-wide recall prompts. Results report multiple-choice accuracy separately from completed written responses so open-ended answers are not judged by brittle exact-text matching.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16.1.6 (App Router and Server Actions) |
| UI | React 19.2.3 and TypeScript 5 |
| Styling | Tailwind CSS 4.1.18 |
| AI | Groq SDK 0.37.0 with Llama 3.3 70B Versatile |
| Animation | Motion 12.29.2 |
| Icons | Heroicons and Lucide React |
| Deployment | Vercel |

## Run Locally

Requirement: Node.js. A [Groq API key](https://console.groq.com/keys) is optional; without one, the app uses predefined questions.

```bash
git clone https://github.com/tedasdf/edacc.git
cd edacc/my-app
npm install
```

To enable AI-generated questions, create `my-app/.env.local`:

```env
GROQ_API_KEY=your_key_here
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Windows PowerShell

If PowerShell reports that `npm.ps1` cannot be loaded because scripts are disabled, use the Windows command wrappers:

```powershell
cd my-app
npm.cmd install --cache "$env:TEMP\edacc-npm-cache"
npm.cmd run dev
```

## Project Structure

The Next.js application lives in `my-app/`:

```text
my-app/
|-- src/app/          # Routes and layouts
|-- src/components/   # Reading, question, notebook, and results UI
|-- src/data/         # Passages and predefined question sets
|-- src/lib/          # Passage helpers and Groq server action
`-- src/types/        # Shared reading types
```

## Live Demo

[Open the Vercel deployment](https://edacc-yggg.vercel.app/)

## Repository

[View the source on GitHub](https://github.com/tedasdf/edacc)
