"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MasteryGraph } from "@/components/mastery-graph";
import { ReviewsDuePanel } from "@/components/reviews-due-panel";
import { CoffeeIcon, BrainIcon, SparklesIcon, CompassIcon, ArrowRightIcon, RefreshCwIcon, AwardIcon, UsersIcon } from "@/components/icons";
import { Concept, MasteryResponse } from "@/lib/types";

export default function DashboardPage() {
  const [studentId, setStudentId] = useState<string>("student-1");
  const [masteryData, setMasteryData] = useState<MasteryResponse | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConceptId, setSelectedConceptId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const [masteryRes, conceptsRes] = await Promise.all([
          fetch(`/api/mastery?student_id=${studentId}`),
          fetch("/api/concepts"),
        ]);

        if (masteryRes.ok) {
          const mData: MasteryResponse = await masteryRes.json();
          if (isMounted) setMasteryData(mData);
        }
        if (conceptsRes.ok) {
          const cData: Concept[] = await conceptsRes.json();
          if (isMounted) setConcepts(cData);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  // Compute aggregate stats
  const masteryMap = masteryData?.mastery || {};
  const totalConcepts = concepts.length || 12;
  let masteredCount = 0;
  let scoreSum = 0;

  Object.values(masteryMap).forEach((val) => {
    const pct = val <= 1 ? val * 100 : val;
    scoreSum += pct;
    if (pct >= 70) masteredCount++;
  });

  const avgMastery = Object.keys(masteryMap).length > 0
    ? Math.round(scoreSum / Object.keys(masteryMap).length)
    : 0;

  // Selected concept details
  const selectedConcept = concepts.find((c) => c.id === selectedConceptId);
  const selectedMastery = selectedConceptId && masteryMap[selectedConceptId] !== undefined
    ? masteryMap[selectedConceptId] <= 1
      ? Math.round(masteryMap[selectedConceptId] * 100)
      : Math.round(masteryMap[selectedConceptId])
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <CoffeeIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">
                  JavaTutor
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Mastery Graph
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center gap-2 text-xs">
            <Link
              href="/practice"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Practice</span>
            </Link>
            <Link
              href="/diagnostic"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <BrainIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Diagnostic</span>
            </Link>
            <Link
              href="/teacher"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <UsersIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Teacher</span>
            </Link>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              Home
            </Link>
          </nav>

          {/* Student Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="learner-select" className="text-xs text-slate-400 hidden sm:inline-block font-medium">
              Learner:
            </label>
            <select
              id="learner-select"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-800 bg-slate-900 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[36px]"
            >
              <option value="student-1">Alex Johnson (student-1)</option>
              <option value="student-2">Maya Lin (student-2)</option>
              <option value="student-3">Carlos Diaz (student-3)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Banner with Stats */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CompassIcon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Cognitive Mastery Map
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Interactive Java Knowledge Graph
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              12 core Java competencies connected by prerequisite dependencies. Nodes smoothly
              interpolate from red (novice) to yellow (developing) to green (mastered) as cognitive mastery grows.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Avg Mastery
              </span>
              <span className="text-2xl font-black font-mono text-indigo-400">
                {avgMastery}%
              </span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mastered
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {masteredCount} <span className="text-xs text-slate-500 font-normal">/ {totalConcepts}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Graph (Left/Main) & Sidebar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Node Graph Panel (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Prerequisite Dependency Graph
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    (Drag &amp; zoom supported)
                  </span>
                </div>

                {/* Color Legend */}
                <div className="flex items-center gap-3 text-[11px] font-medium">
                  <span className="flex items-center gap-1.5 text-red-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    Novice (&lt;35%)
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    Developing (35-70%)
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    Mastered (&gt;70%)
                  </span>
                </div>
              </div>

              {/* React Flow Graph Area */}
              <div className="w-full h-[620px] rounded-2xl overflow-hidden border border-slate-800/80 shadow-inner">
                {isLoading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400">
                    <RefreshCwIcon className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
                    <p className="text-sm font-semibold text-white">Rendering Knowledge Graph...</p>
                  </div>
                ) : (
                  <MasteryGraph
                    mastery={masteryMap}
                    concepts={concepts}
                    edgesList={masteryData?.edges}
                    highlightedConceptId={selectedConceptId}
                    onSelectConcept={(id) => setSelectedConceptId(id)}
                  />
                )}
              </div>
            </div>

            {/* Selected Node Action Bar if clicked */}
            {selectedConcept && (
              <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <AwardIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {selectedConcept.name}
                    </h4>
                    <span className="text-xs text-slate-400">
                      Current Mastery: <strong className="text-indigo-300 font-mono">{selectedMastery}%</strong>
                    </span>
                  </div>
                </div>

                <Link
                  href={`/practice?concept_id=${selectedConcept.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1.5 min-h-[38px]"
                >
                  <span>Practice {selectedConcept.name}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Reviews Due Panel from /api/reviews */}
            <ReviewsDuePanel studentId={studentId} concepts={concepts} />

            {/* Practice CTA Card */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-5 shadow-xl flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-white text-sm">Adaptive Practice</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Test your Java mental models with full syntax highlighting. Real-time diagnostic evaluation
                updates your mastery graph after every single challenge.
              </p>
              <Link
                href="/practice"
                className="mt-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 min-h-[40px] shadow-lg shadow-emerald-600/20"
              >
                <span>Launch Practice Mode</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
