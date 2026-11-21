"use client";

import React from "react";
import { Concept, ReviewItem } from "@/lib/types";
import {
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "./icons";

interface ReviewViewProps {
  reviews: ReviewItem[];
  concepts: Concept[];
  onStartReview: (conceptId: string) => void;
}

export function ReviewView({
  reviews,
  concepts,
  onStartReview,
}: ReviewViewProps) {
  const getConcept = (id: string) => concepts.find((c) => c.id === id);

  const overdue = reviews.filter((r) => r.due_in_days <= 0);
  const dueSoon = reviews.filter((r) => r.due_in_days > 0 && r.due_in_days <= 2);
  const upcoming = reviews.filter((r) => r.due_in_days > 2);

  return (
    <div className="flex flex-col gap-8">
      {/* Header Info Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex-shrink-0">
            <ClockIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Spaced Repetition &amp; Memory Retention
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Based on the Ebbinghaus retention curve, Java syntax nuances and JVM rules
              fade without periodic recall. Reviewing due concepts locks your mental models
              into long-term memory.
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Due Today
          </span>
          <span className="text-3xl font-extrabold text-amber-400 font-mono">
            {overdue.length}
          </span>
        </div>
      </div>

      {/* Due Today / Overdue Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangleIcon className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            Urgent: Ready for Diagnostic Review
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
            {overdue.length}
          </span>
        </div>

        {overdue.length === 0 ? (
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-center text-slate-400">
            <CheckCircleIcon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-white">All caught up!</p>
            <p className="text-xs text-slate-400 mt-0.5">
              No concepts are currently overdue for spaced review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overdue.map((item) => {
              const concept = getConcept(item.concept_id);
              return (
                <div
                  key={item.concept_id}
                  className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-5 shadow-lg flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                        Overdue &bull; High Memory Decay Risk
                      </span>
                      <h4 className="text-base font-bold text-white">
                        {concept ? concept.name : item.concept_id}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Due Today
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Targeted questions will verify that your understanding of {concept?.name || item.concept_id} hasn&apos;t degraded.
                  </p>

                  <button
                    type="button"
                    onClick={() => onStartReview(item.concept_id)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-md shadow-amber-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 min-h-[44px]"
                  >
                    <span>Start Diagnostic Review</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Due in 1-2 Days */}
      {dueSoon.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Due in 1 &ndash; 2 Days
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold">
              {dueSoon.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueSoon.map((item) => {
              const concept = getConcept(item.concept_id);
              return (
                <div
                  key={item.concept_id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-md flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">
                      {concept ? concept.name : item.concept_id}
                    </h4>
                    <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                      In {item.due_in_days} {item.due_in_days === 1 ? "day" : "days"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartReview(item.concept_id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-indigo-600 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 min-h-[38px]"
                  >
                    <span>Review Early</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Retention Schedule (3+ Days) */}
      {upcoming.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Firmly Retained (Scheduled Later)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {upcoming.map((item) => {
              const concept = getConcept(item.concept_id);
              return (
                <div
                  key={item.concept_id}
                  className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-medium text-slate-300">
                      {concept ? concept.name : item.concept_id}
                    </span>
                  </div>
                  <span className="font-mono text-slate-500">
                    Due in {item.due_in_days}d
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
