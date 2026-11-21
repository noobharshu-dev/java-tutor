"use client";

import React, { useState } from "react";
import { Concept, Question } from "@/lib/types";
import { CodeSnippet } from "./code-snippet";
import {
  BrainIcon,
  SparklesIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  HelpCircleIcon,
  CheckIcon,
} from "./icons";

interface TutorViewProps {
  question: Question | null;
  concepts: Concept[];
  studentId: string;
  isSubmitting: boolean;
  onSubmitAnswer: (optionId: string, reasoning: string) => Promise<void>;
  onSkipQuestion: () => void;
}

export function TutorView({
  question,
  concepts,
  isSubmitting,
  onSubmitAnswer,
  onSkipQuestion,
}: TutorViewProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [reasoning, setReasoning] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-300">
        <RefreshCwIcon className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
        <h3 className="text-lg font-semibold text-white">Loading next diagnostic challenge...</h3>
        <p className="text-sm text-slate-400 mt-1">Retrieving question from /api/question</p>
      </div>
    );
  }

  const concept = concepts.find((c) => c.id === question.concept_id);
  const difficultyLabels: Record<number, { text: string; color: string }> = {
    1: { text: "Level 1: Fundamentals", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    2: { text: "Level 2: Intermediate", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
    3: { text: "Level 3: Deep Dive", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId) {
      setErrorMsg("Please select an option before submitting.");
      return;
    }
    setErrorMsg("");
    await onSubmitAnswer(selectedOptionId, reasoning);
    // Reset option for next round
    setSelectedOptionId("");
    setReasoning("");
  };

  const optionLetters = ["A", "B", "C", "D", "E"];

  return (
    <div className="flex flex-col gap-6">
      {/* Question Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-xl p-6 sm:p-8">
        {/* Top Concept & Difficulty meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <BrainIcon className="w-3.5 h-3.5" />
              {concept ? concept.name : question.concept_id}
            </span>
            {concept?.prerequisites && concept.prerequisites.length > 0 && (
              <span className="hidden sm:inline-block text-xs text-slate-400">
                Prereqs: {concept.prerequisites.join(", ")}
              </span>
            )}
          </div>

          <span
            className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              difficultyLabels[question.difficulty]?.color || "bg-slate-800 text-slate-300"
            }`}
          >
            {difficultyLabels[question.difficulty]?.text || `Difficulty ${question.difficulty}`}
          </span>
        </div>

        {/* Question Prompt */}
        <div className="mt-5">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {question.prompt}
          </h2>

          {/* Java Code Snippet */}
          {question.code && (
            <CodeSnippet
              code={question.code}
              title={`Java Snippet (${concept?.name || "Code Evaluation"})`}
            />
          )}
        </div>

        {/* Options & Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Your Answer:
            </span>

            <div className="grid grid-cols-1 gap-3">
              {question.options.map((option, idx) => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSelectedOptionId(option.id);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl border text-left transition-all min-h-[52px] ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500"
                        : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}
                  >
                    <span
                      className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold font-mono transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
                      }`}
                    >
                      {optionLetters[idx] || idx + 1}
                    </span>

                    <span className="flex-1 text-sm sm:text-base leading-relaxed pt-0.5">
                      {option.text}
                    </span>

                    {isSelected && (
                      <span className="flex-shrink-0 p-1 text-indigo-400">
                        <CheckIcon className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Reasoning input */}
          <div className="flex flex-col gap-2 mt-2">
            <label
              htmlFor="reasoning-input"
              className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              <span className="flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-indigo-400" />
                Explain your reasoning (Helps diagnose mental models)
              </span>
              <span className="text-[11px] font-normal text-slate-500">Optional</span>
            </label>
            <textarea
              id="reasoning-input"
              rows={2}
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="e.g., 'I chose this because strings are compared by value or because integer division truncates...'"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Error Message if none selected */}
          {errorMsg && (
            <p className="text-xs font-medium text-rose-400 flex items-center gap-1.5">
              <span>⚠️</span>
              {errorMsg}
            </p>
          )}

          {/* Submission Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onSkipQuestion}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 min-h-[44px]"
            >
              <RefreshCwIcon className="w-4 h-4" />
              <span>Try Another Concept</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !selectedOptionId}
              className={`inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition-all min-h-[44px] ${
                isSubmitting || !selectedOptionId
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 hover:shadow-indigo-600/50 focus-visible:ring-2 focus-visible:ring-indigo-400"
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCwIcon className="w-4 h-4 animate-spin" />
                  <span>Evaluating with /api/answer...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Helpful Hint / Learning Prompt */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 text-xs text-slate-400 flex items-start gap-3">
        <HelpCircleIcon className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-medium text-slate-300">
            How Java Tutor Misconception Diagnosis Works:
          </p>
          <p className="mt-0.5">
            Every distractor option is linked to real conceptual traps (e.g. string identity vs equality,
            integer division truncation, reference copies). When you answer, the system updates your
            adaptive mastery record and detects cognitive gaps before they cause bugs!
          </p>
        </div>
      </div>
    </div>
  );
}
