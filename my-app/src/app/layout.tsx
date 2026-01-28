import { Inter, Literata } from "next/font/google";
import { BookOpen } from 'lucide-react';
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const literata = Literata({ variable: "--font-literata", subsets: ["latin"], display: 'swap' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${literata.variable} antialiased min-h-[100dvh] bg-slate-50 flex flex-col`}>
        
        {/* GLOBAL HEADER: Responsive padding and height */}
        <header className="sticky top-0 z-[100] w-full border-b bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex flex-col justify-center">
            <div className="flex items-center">
              <div className="bg-emerald-600 rounded-lg p-1.5 md:p-2 text-white">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <h1 className="ml-3 text-lg md:text-xl font-bold font-sans tracking-tight text-slate-900">
                Reading Journey
              </h1>
            </div>
            
            {/* Hidden on very small screens, or we can make it a subtitle */}
            <p className="hidden md:block mt-1 text-xs text-slate-500 font-sans">
              Choose a passage to begin your reading comprehension adventure
            </p>
          </div>
        </header>

        {/* PAGE CONTENT: Responsive constraints */}
        <div className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
          {children}
        </div>

        {/* Optional: Simple Footer for Desktop */}
        <footer className="hidden md:block py-6 border-t text-center text-slate-400 text-[10px] uppercase tracking-widest font-bold">
          Progress is saved automatically
        </footer>
      </body>
    </html>
  );
}