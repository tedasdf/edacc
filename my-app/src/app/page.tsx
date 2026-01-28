"use client";
import { useState } from 'react';
import { PassageCard } from '@/src/components/PassageCard';
import { usePassages } from '@/src/lib/hooks/usePassages';
import { generateQuestions } from '@/src/lib/actions/generate';

export default function Home() {
  const { getPassageSummaries } = usePassages();
  const passages = getPassageSummaries();
  const [isTesting, setIsTesting] = useState(false);

  const runAiTest = async () => {
    setIsTesting(true);
    try {
      const result = await generateQuestions(passages[0]?.title || "Sample Text"); 
      console.log("✅ AI Response:", result);
      alert("Check your browser console!");
    } catch (err) {
      console.error("❌ Test Failed:", err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    /* We removed 'p-6' because the layout.tsx now handles the padding (md:p-8) */
    <div className="space-y-6 md:space-y-10">
      
      {/* SECTION HEADER: Just the button and a smaller title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Available Passages</h2>
          <p className="text-sm text-slate-500">Pick a story to practice your skills.</p>
        </div>

        <button 
          onClick={runAiTest}
          disabled={isTesting}
          className={`self-start md:self-center px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
            isTesting 
            ? "bg-slate-200 text-slate-400 cursor-wait" 
            : "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200 shadow-sm active:scale-95"
          }`}
        >
          {isTesting ? "Running Diagnostics..." : "🧪 Test AI Engine"}
        </button>
      </div>

      {/* THE GRID: Optimized for all screens */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {passages.map((p) => (
          <PassageCard key={p.id} passage={p} />
        ))}
      </section>
    </div>
  );
}