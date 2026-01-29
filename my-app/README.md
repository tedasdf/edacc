📚 AI-Powered Adaptive Reader
A modern, gesture-based reading application designed to improve comprehension through active engagement. This project features a unique "Swipe-to-Read" interface combined with real-time AI question generation and mobile-optimized text highlighting.

🚀 Key Features
1. Adaptive Card Stack
Segmented Reading: Large passages are automatically broken down into digestible "chunks" based on your preference.

Gesture Control: Smooth, Framer Motion-powered swiping logic.

Active Recall: The stack "locks" until you answer the AI-generated questions for the current section, ensuring you don't just skim through.

2. Intelligent Highlighting (Notebook)
Dual-Mode Interface: Toggle between Swipe Mode (for navigation) and Highlight Mode (for study).

Mobile Optimized: Specifically engineered to handle native mobile touch events, preventing crashes during long-press selection.

Persistent Notebook: Highlights are saved to localStorage, allowing you to build a personal study guide that survives page refreshes.

3. Dynamic AI Generation
Contextual Questions: Uses LLMs (via Next.js Server Actions) to analyze the specific text on your screen and generate relevant multiple-choice questions.

Regeneration: The "Retry" feature allows you to wipe progress and generate a completely fresh set of questions for a new study session.

4. Progress Tracking
Visual Feedback: A global progress bar tracks both your card position and question completion rate.

Session Persistence: Automatically saves your state (current card, answers, and progress) so you can pick up exactly where you left off.

🛠️ Tech Stack
Framework: Next.js 14+ (App Router)

Animation: Framer Motion

Styling: Tailwind CSS

Icons: Lucide React

Deployment: Vercel

📱 Mobile-First Engineering
One of the core challenges addressed in this project was the conflict between JS-driven drag gestures and Native browser text selection.

The Problem: releasePointerCapture errors often occur when a drag library and the browser's text magnifier fight for the same pointer ID.

The Solution: We implemented a dragListener toggle and event propagation blocking. In "Highlight Mode," the card becomes "motion-silent," allowing the mobile OS to take full control of the text selection handles.

⚙️ Installation & Setup
Clone the repo:

Bash
git clone https://github.com/your-username/your-repo-name.git
Install dependencies:

Bash
npm install
Set up Environment Variables: Create a .env.local file and add your AI API keys:

Code snippet
OPENAI_API_KEY=your_key_here
Run locally:

Bash
npm run dev
🌐 Deployment on Vercel
This project is optimized for Vercel.

Push your code to GitHub.

Import the project into the Vercel Dashboard.

Crucial: Add your OPENAI_API_KEY to the Environment Variables in the Vercel project settings.

If you encounter 404 errors on refreshes, ensure your vercel.json is configured for client-side routing.