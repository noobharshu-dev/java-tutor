"use client";

import React, { useState } from "react";
import { Concept, MasteryResponse } from "@/lib/types";
import {
  BrainIcon,
  CheckCircleIcon,
  AwardIcon,
  ArrowRightIcon,
  SearchIcon,
  SparklesIcon,
  CompassIcon,
} from "./icons";

interface MasteryViewProps {
  masteryData: MasteryResponse | null;
  concepts: Concept[];
  onSelectConceptToPractice: (conceptId: string) => void;
}

export function MasteryView({
  masteryData,
  concepts,
  onSelectConceptToPractice,
}: MasteryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<"all" | "mastered" | "learning" | "needs-work">("all");

  const masteryMap = masteryData?.mastery || {};
  const edges = masteryData?.edges || [];

  const toPercent = (val: number | undefined): number => {
    if (val === undefined || isNaN(val)) return 0;
    return val <= 1 ? Math.round(val * 100) : Math.round(val);
  };

  // Compute aggregate stats
  const totalConcepts = concepts.length;
  let masteredCount = 0;
  let learningCount = 0;
  let needsWorkCount = 0;
  let totalScoreSum = 0;

  concepts.forEach((c) => {
    const score = toPercent(masteryMap[c.id]);
    totalScoreSum += score;
    if (score >= 80) masteredCount++;
    else if (score >= 40) learningCount++;
    else needsWorkCount++;
  });

  const avgMastery = totalConcepts > 0 ? Math.round(totalScoreSum / totalConcepts) : 0;

  // Filter concepts
  const filteredConcepts = concepts.filter((c) => {
    const score = toPercent(masteryMap[c.id]);
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTier === "mastered") return score >= 80;
    if (filterTier === "learning") return score >= 40 && score < 80;
    if (filterTier === "needs-work") return score < 40;
    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Avg Mastery
            </span>
            <AwardIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">
              {avgMastery}%
            </span>
            <span className="text-xs text-indigo-400 font-medium">Adaptive</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full"
              style={{ width: `${avgMastery}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Mastered
            </span>
            <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono">
              {masteredCount}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {totalConcepts}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">&ge; 80% accuracy & retention</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Developing
            </span>
            <SparklesIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-400 font-mono">
              {learningCount}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {totalConcepts}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">40% &ndash; 79% in progress</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Needs Attention
            </span>
            <BrainIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-400 font-mono">
              {needsWorkCount}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {totalConcepts}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Target for diagnostic review</p>
        </div>
      </div>

      {/* Prerequisite Knowledge Graph Flow */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CompassIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Knowledge Graph &amp; Prerequisite Dependencies
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {edges.length} directed dependency links
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          The tutoring system enforces conceptual scaffolding. Each node below represents a core
          Java competency, unlocking deeper object-oriented and JVM execution principles.
        </p>

        {/* Visual Graph Pills */}
        <div className="flex flex-wrap items-center gap-2.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          {concepts.map((concept, idx) => {
            const score = toPercent(masteryMap[concept.id]);
            const isMastered = score >= 80;
            const isLearning = score >= 40 && score < 80;

            return (
              <React.Fragment key={concept.id}>
                <button
                  type="button"
                  onClick={() => onSelectConceptToPractice(concept.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isMastered
                      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:border-emerald-400"
                      : isLearning
                      ? "border-indigo-500/40 bg-indigo-950/30 text-indigo-300 hover:border-indigo-400"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isMastered
                        ? "bg-emerald-400"
                        : isLearning
                        ? "bg-indigo-400"
                        : "bg-slate-600"
                    }`}
                  />
                  <span>{concept.name}</span>
                  <span className="font-mono text-[10px] opacity-75">{score}%</span>
                </button>
                {idx < concepts.length - 1 && (
                  <span className="text-slate-600 select-none text-xs">&rarr;</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Filter and Concept List */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Java concepts or prerequisites..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-800 bg-slate-900/90 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: "all", label: "All Concepts" },
                { id: "mastered", label: "Mastered (80%+)" },
                { id: "learning", label: "Developing (40-79%)" },
                { id: "needs-work", label: "Needs Work (<40%)" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTier(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                  filterTier === tab.id
                    ? "bg-indigo-600 text-white font-semibold"
                    : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Concept Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConcepts.map((concept) => {
            const score = toPercent(masteryMap[concept.id]);
            const isMastered = score >= 80;
            const isDeveloping = score >= 40 && score < 80;

            return (
              <div
                key={concept.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-white text-base tracking-tight group-hover:text-indigo-300 transition-colors">
                      {concept.name}
                    </h4>
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        isMastered
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : isDeveloping
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {score}%
                    </span>
                  </div>

                  {/* Prerequisites */}
                  {concept.prerequisites.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        Prereq:
                      </span>
                      {concept.prerequisites.map((p) => (
                        <span
                          key={p}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      Foundational Concept (No prerequisites)
                    </span>
                  )}
                </div>

                <div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isMastered
                          ? "bg-emerald-500"
                          : isDeveloping
                          ? "bg-indigo-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.max(4, score)}%` }}
                    />
                  </div>

                  {/* Practice CTA */}
                  <button
                    type="button"
                    onClick={() => onSelectConceptToPractice(concept.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-indigo-600 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 min-h-[38px]"
                  >
                    <span>Practice Concept</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
