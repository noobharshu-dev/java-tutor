"use client";

import React from "react";
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  SparklesIcon,
  ArrowRightIcon,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/35 backdrop-blur-xs animate-fade-up"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto studio-card rounded-2xl p-6 sm:p-8 text-[#1C1917] flex flex-col gap-6">
        {/* Header verdict */}
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 p-3 rounded-2xl ${
              correct
                ? "bg-[#E6F4F1] text-[#0F766E] border border-[#B2DDD5]"
                : "bg-[#FCECE8] text-[#C23B22] border border-[#F2C0B5]"
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
                className={`text-xs font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  correct
                    ? "bg-[#E6F4F1] text-[#0F766E]"
                    : "bg-[#FCECE8] text-[#B53219]"
                }`}
              >
                {correct ? "Correct Analysis" : "Conceptual Gap Detected"}
              </span>
              <span className="text-xs text-[#78716C] font-mono">
                {conceptName}
              </span>
            </div>
            <h2
              id="feedback-title"
              className="font-display text-2xl font-semibold mt-1 text-[#1C1917] tracking-tight"
            >
              {correct
                ? "Excellent! Your Java mental model is solid."
                : "Let's diagnose this misconception."}
            </h2>
          </div>
        </div>

        {/* Misconception Deep Dive if incorrect */}
        {!correct && misconception && (
          <div className="rounded-xl border border-[#F2C0B5] bg-[#FCECE8]/60 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-sm text-[#1C1917]">
                Detected Misconception: {misconception.name}
              </span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#FFFDF9] text-[#B53219] border border-[#F2C0B5]">
                Confidence: {Math.round(misconception.confidence * 100)}%
              </span>
            </div>

            <p className="text-sm leading-relaxed text-[#57534E]">
              {misconception.explanation}
            </p>
          </div>
        )}

        {/* Correct celebration notes */}
        {correct && (
          <div className="rounded-xl border border-[#B2DDD5] bg-[#E6F4F1]/60 p-5 flex items-start gap-3">
            <SparklesIcon className="w-5 h-5 text-[#0F766E] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#57534E] leading-relaxed">
              <p className="font-semibold text-[#0F766E] mb-1">
                Concept Verified
              </p>
              <p>
                You successfully applied the underlying Java mechanics. Your mastery score
                in <span className="font-medium text-[#1C1917]">{conceptName}</span> has increased.
              </p>
            </div>
          </div>
        )}

        {/* Mastery Progress Bar */}
        <div className="rounded-xl border border-[#DDD6C7] bg-[#F6F3EC] p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#57534E] flex items-center gap-1.5">
              <AwardIcon className="w-4 h-4 text-[#D94F2B]" />
              <span>Current Concept Mastery</span>
            </span>
            <span className="font-mono font-bold text-[#1C1917]">
              {conceptMastery}%
            </span>
          </div>
          <div className="w-full bg-[#E7E1D5] rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                conceptMastery >= 80
                  ? "bg-[#0F766E]"
                  : conceptMastery >= 40
                  ? "bg-[#C87D16]"
                  : "bg-[#D94F2B]"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, conceptMastery))}%` }}
            />
          </div>
        </div>

        {/* Next Question Sneak Peek */}
        {nextQuestion && (
          <div className="text-xs text-[#78716C] flex items-center justify-between border-t border-[#DDD6C7] pt-4 font-mono">
            <span>Next up: {nextQuestion.concept_id} (Level {nextQuestion.difficulty})</span>
            <span className="text-[#0F766E] font-medium">Ready</span>
          </div>
        )}

        {/* CTA Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onContinue}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-[#FFFDF9] font-medium text-sm transition-all shadow-xs cursor-pointer"
          >
            <span>Continue Learning</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
