import { getPassageById, getQuestionsByPassageId } from "@/src/lib/passages";
import { ReadingView } from "@/src/components/ReadingView";
import { notFound } from "next/navigation";
import Link from "next/link";
import { X } from 'lucide-react';

export default async function ReadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const passage = getPassageById(id);
  const questions = getQuestionsByPassageId(id) || [];

  if (!passage) notFound();

  return (
    <main className="min-h-screen bg-slate-50 w-full relative">
      {/* Absolute positioned Back Button to stay on top of the reading experience */}
      <div className="absolute top-6 left-6 z-50">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-3 py-2 bg-white/50 hover:bg-white rounded-full transition-all border border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm"
        >
          <X size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest pr-1">Exit</span>
        </Link>
      </div>

      {/* The main reading logic */}
      <ReadingView passage={passage} initialQuestions={questions} />
    </main>
  );
}
