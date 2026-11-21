import React from "react";
import Link from "next/link";
import { QuestionRunner } from "@/components/question-runner";
import { CoffeeIcon, SparklesIcon, ArrowRightIcon } from "@/components/icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Targeted Practice — JavaTutor",
  description:
    "Reinforce foundational and advanced Java programming concepts with interactive, syntax-highlighted code challenges.",
};

export default function PracticePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <CoffeeIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">
                JavaTutor
              </span>
              <span className="ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Practice
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-3 text-xs">
            <Link
              href="/diagnostic"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
            >
              <span>Diagnostic Mode</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/40 to-slate-950 border border-emerald-500/20 shadow-lg flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
            <SparklesIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Adaptive Practice Mode
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Solve interactive Java challenges with full syntax highlighting. Inspect the code, pick your choice,
              and receive real-time feedback to strengthen your long-term memory and mastery.
            </p>
          </div>
        </div>

        {/* Runner */}
        <QuestionRunner mode="practice" studentId="student-1" />
      </main>
    </div>
  );
}
