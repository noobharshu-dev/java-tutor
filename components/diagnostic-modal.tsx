"use client";

import React from "react";
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  SparklesIcon,
  ArrowRightIcon,
  BrainIcon,
  AwardIcon,
} from "./icons";
import { DetectedMisconception, Question } from "@/lib/types";

interface DiagnosticModalProps {
  isOpen: boolean;
  correct: boolean;
  misconception: DetectedMisconception | null;
  conceptName: string;
  conceptMastery: number;
  nextQuestion: Question;
  onContinue: () => void;
}

export function DiagnosticModal({
  isOpen,
  correct,
  misconception,
  conceptName,
  conceptMastery,
  nextQuestion,
  onContinue,
}: DiagnosticModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8 text-slate-100 flex flex-col gap-6">
        {/* Header verdict */}
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 p-3 rounded-2xl ${
              correct
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
            }`}
          >
            {correct ? (
              <CheckCircleIcon className="w-8 h-8" />
            ) : (
              <AlertTriangleIcon className="w-8 h-8" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  correct
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {correct ? "Correct Analysis" : "Conceptual Gap Detected"}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {conceptName}
              </span>
            </div>
            <h2
              id="feedback-title"
              className="text-2xl font-bold mt-1 text-white tracking-tight"
            >
              {correct
                ? "Excellent! Your Java mental model is solid."
                : "Let's diagnose this misconception."}
            </h2>
          </div>
        </div>

        {/* Misconception Deep Dive if incorrect */}
        {!correct && misconception && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <BrainIcon className="w-5 h-5 text-amber-400" />
                <span className="font-semibold text-amber-200">
                  Detected Misconception: {misconception.name}
                </span>
              </div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Confidence: {Math.round(misconception.confidence * 100)}%
              </span>
            </div>

            <p className="text-sm leading-relaxed text-slate-300">
              {misconception.explanation}
            </p>

            {/* Side-by-side mental model compare */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg bg-rose-950/30 border border-rose-900/50 p-3.5">
                <span className="block text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
                  Common Intuitive Trap
                </span>
                <p className="text-xs text-slate-300 leading-normal">
                  Assuming Java behaves intuitively like math or pass-by-reference.
                </p>
              </div>

              <div className="rounded-lg bg-emerald-950/30 border border-emerald-900/50 p-3.5">
                <span className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  JVM Mental Model
                </span>
                <p className="text-xs text-slate-300 leading-normal">
                  Follow JVM heap allocations, stack frames, and explicit type promotion rules.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Correct celebration notes */}
        {correct && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-5 flex items-start gap-3">
            <SparklesIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300 leading-relaxed">
              <p className="font-semibold text-emerald-300 mb-1">
                Concept Verified
              </p>
              <p>
                You successfully applied the underlying Java mechanics. Your mastery score
                in <span className="font-medium text-white">{conceptName}</span> has increased!
              </p>
            </div>
          </div>
        )}

        {/* Mastery Progress Bar */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <AwardIcon className="w-4 h-4 text-indigo-400" />
              <span>Current Concept Mastery</span>
            </span>
            <span className="font-mono font-bold text-white">
              {conceptMastery}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${
                conceptMastery >= 80
                  ? "bg-emerald-500"
                  : conceptMastery >= 50
                  ? "bg-indigo-500"
                  : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, conceptMastery))}%` }}
            />
          </div>
        </div>

        {/* Next Question Sneak Peek */}
        {nextQuestion && (
          <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-4">
            <span>Next up: {nextQuestion.concept_id} (Level {nextQuestion.difficulty})</span>
            <span className="text-indigo-400 font-medium">Ready</span>
          </div>
        )}

        {/* CTA Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onContinue}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 min-h-[44px]"
          >
            <span>Continue Learning</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
