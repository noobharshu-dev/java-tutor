"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QuestionRunner } from "@/components/question-runner";
import { CoffeeIcon, BrainIcon, ArrowRightIcon } from "@/components/icons";

export default function DiagnosticPage() {
  const [studentId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("student_id") || "student-1";
    }
    return "student-1";
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <CoffeeIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">
                JavaTutor
              </span>
              <span className="ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Diagnostic
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-3 text-xs">
            <Link
              href="/practice"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
            >
              <span>Practice Mode</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard"
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
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/40 to-slate-950 border border-indigo-500/20 shadow-lg flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex-shrink-0">
            <BrainIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Cognitive Diagnostic Mode
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Answer the questions below to probe your underlying JVM execution model. Each distractor is mapped
              to real conceptual pitfalls. Providing your one-line reasoning helps identify subtle misconceptions.
            </p>
          </div>
        </div>

        {/* Runner */}
        <QuestionRunner mode="diagnostic" studentId={studentId} />
      </main>
    </div>
  );
}
