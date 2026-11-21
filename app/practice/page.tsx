"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { QuestionRunner } from "@/components/question-runner";
import { MasteryGraph } from "@/components/mastery-graph";
import { CoffeeIcon, CompassIcon, ArrowRightIcon, AwardIcon } from "@/components/icons";
import { GraphSkeleton } from "@/components/loading-skeleton";
import { Concept, MasteryResponse } from "@/lib/types";

export default function PracticePage() {
  const [studentId, setStudentId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("student_id") || "student-1";
    }
    return "student-1";
  });
  const [masteryData, setMasteryData] = useState<MasteryResponse | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [currentConceptId, setCurrentConceptId] = useState<string>("string-equality");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const [mRes, cRes] = await Promise.all([
          fetch(`/api/mastery?student_id=${studentId}`),
          fetch("/api/concepts"),
        ]);

        if (mRes.ok) {
          const m: MasteryResponse = await mRes.json();
          if (isMounted) setMasteryData(m);
        }
        if (cRes.ok) {
          const c: Concept[] = await cRes.json();
          if (isMounted) setConcepts(c);
        }
      } catch (err) {
        console.error("Error loading practice mastery:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void init();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const handleMasteryUpdate = (newMastery: Record<string, number>) => {
    setMasteryData((prev) =>
      prev ? { ...prev, mastery: newMastery } : { mastery: newMastery, edges: [] }
    );
  };

  const masteryMap = masteryData?.mastery || {};
  const currentScore = masteryMap[currentConceptId] !== undefined
    ? masteryMap[currentConceptId] <= 1
      ? Math.round(masteryMap[currentConceptId] * 100)
      : Math.round(masteryMap[currentConceptId])
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
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

          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-2 text-xs">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <CompassIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Full Dashboard</span>
              </Link>
              <Link
                href="/diagnostic"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span>Diagnostic</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                Home
              </Link>
            </nav>

            <select
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                localStorage.setItem("student_id", e.target.value);
              }}
              className="hidden sm:inline-block px-2.5 py-1 text-xs font-medium rounded-xl border border-slate-800 bg-slate-900 text-slate-300 focus:border-indigo-500 focus:outline-none"
            >
              <option value="student-1">Alex Johnson</option>
              <option value="student-2">Maya Lin</option>
              <option value="student-3">Carlos Diaz</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area: Split 2-Column on Desktop */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Question Runner (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <QuestionRunner
              mode="practice"
              studentId={studentId}
              onMasteryChange={handleMasteryUpdate}
              onCurrentConceptChange={setCurrentConceptId}
            />
          </div>

          {/* Right Column: Embedded Compact Live Mastery Graph (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md flex flex-col gap-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CompassIcon className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm tracking-tight">
                    Live Mastery Graph
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  Updates Live
                </span>
              </div>

              {/* Active concept indicator */}
              <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <AwardIcon className="w-3.5 h-3.5 text-indigo-400" />
                  Active Target: <strong className="text-slate-200">{currentConceptId}</strong>
                </span>
                {currentScore !== null && (
                  <span className="font-mono font-bold text-emerald-400">
                    {currentScore}%
                  </span>
                )}
              </div>

              {/* Compact React Flow Container */}
              <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 relative">
                {isLoading ? (
                  <GraphSkeleton />
                ) : (
                  <MasteryGraph
                    mastery={masteryMap}
                    concepts={concepts}
                    edgesList={masteryData?.edges}
                    highlightedConceptId={currentConceptId}
                    compact={true}
                  />
                )}
              </div>

              {/* Quick Legend & Link */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Novice
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Developing
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Mastered
                  </span>
                </div>

                <Link
                  href="/dashboard"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <span>Full View</span>
                  <ArrowRightIcon className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
