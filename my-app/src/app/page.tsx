"use client";
import { useState } from 'react';
import { PassageCard } from '@/src/components/PassageCard';
import { usePassages } from '@/src/lib/hooks/usePassages';
import { generateQuestions } from '@/src/lib/actions/generate';

export default function Home() {
  const { getPassageSummaries } = usePassages();
  const passages = getPassageSummaries();
  const [isTesting, setIsTesting] = useState(false);

  return (
    /* We removed 'p-6' because the layout.tsx now handles the padding (md:p-8) */
    <div className="space-y-6 md:space-y-10">

      {/* THE GRID: Optimized for all screens */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {passages.map((p) => (
          <PassageCard key={p.id} passage={p} />
        ))}
      </section>
    </div>
  );
}