"use client";

import React, { useState, useEffect } from "react";
import { Question, AnswerResponse, AnswerRequest } from "@/lib/types";
import { ShikiCode } from "./shiki-code";
import {
  BrainIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  SparklesIcon,
  CheckIcon,
  AwardIcon,
} from "./icons";
import Link from "next/link";

interface QuestionRunnerProps {
  mode: "diagnostic" | "practice";
  initialQuestion?: Question | null;
  studentId?: string;
  conceptId?: string;
}

export function QuestionRunner({
  mode,
  initialQuestion,
  studentId = "student-1",
  conceptId,
}: QuestionRunnerProps) {
  const [question, setQuestion] = useState<Question | null>(initialQuestion || null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(!initialQuestion);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [reasoning, setReasoning] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AnswerResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  // Fetch initial question if not provided
  useEffect(() => {
    let isMounted = true;
    if (!initialQuestion) {
      const url = new URL("/api/question", window.location.origin);
      if (conceptId) url.searchParams.set("concept_id", conceptId);

      fetch(url.toString())
        .then((res) => res.json())
        .then((data: Question) => {
          if (isMounted && data?.id) {
            setQuestion(data);
          }
        })
        .catch((err) => console.error("Error fetching question:", err))
        .finally(() => {
          if (isMounted) setIsLoadingQuestion(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [initialQuestion, conceptId]);

  const handleOptionSelect = (optionId: string) => {
    if (feedback) return; // Prevent changing after submit
    setSelectedOptionId(optionId);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !selectedOptionId) {
      setErrorMsg("Please select an answer choice before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const payload: AnswerRequest = {
      student_id: studentId,
      question_id: question.id,
      option_id: selectedOptionId,
      reasoning: reasoning.trim(),
    };

    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const result: AnswerResponse = await res.json();
      setFeedback(result);
      setQuestionsAnswered((prev) => prev + 1);
      if (result.correct) {
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMsg("Failed to evaluate answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (feedback?.next_question) {
      setQuestion(feedback.next_question);
    }
    // Reset state for next question
    setSelectedOptionId("");
    setReasoning("");
    setFeedback(null);
    setErrorMsg("");
  };

  const optionLetters = ["A", "B", "C", "D", "E"];

  if (isLoadingQuestion) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <RefreshCwIcon className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-white">Loading next diagnostic challenge...</h3>
        <p className="text-xs text-slate-400 mt-1">Fetching question from /api/question</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <AlertTriangleIcon className="w-8 h-8 text-amber-400 mb-3" />
        <h3 className="text-lg font-bold text-white">No question found</h3>
        <p className="text-xs text-slate-400 mt-1">Unable to load question from /api/question.</p>
        <Link
          href="/"
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const difficultyMeta: Record<number, { label: string; badge: string }> = {
    1: { label: "Level 1: Fundamentals", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    2: { label: "Level 2: Intermediate", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
    3: { label: "Level 3: Deep Dive", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Session Progress Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="font-semibold uppercase tracking-wider text-slate-300">
            {mode === "diagnostic" ? "Cognitive Diagnostic" : "Targeted Mastery Practice"}
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="font-mono">Answered: {questionsAnswered}</span>
        </div>

        <div className="flex items-center gap-2">
          {streak > 1 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold font-mono">
              <SparklesIcon className="w-3 h-3 text-amber-400" />
              {streak} Streak!
            </span>
          )}
          <span className="font-mono text-slate-500">Learner: {studentId}</span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        {/* Concept & Difficulty Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <BrainIcon className="w-4 h-4" />
            <span>Concept: {question.concept_id}</span>
          </span>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              difficultyMeta[question.difficulty]?.badge || "bg-slate-800 text-slate-300 border-slate-700"
            }`}
          >
            {difficultyMeta[question.difficulty]?.label || `Difficulty: Level ${question.difficulty}`}
          </span>
        </div>

        {/* Prompt */}
        <div className="mt-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {question.prompt}
          </h2>

          {/* Java Code in Shiki syntax-highlighted block */}
          {question.code && (
            <div className="mt-4">
              <ShikiCode code={question.code} title={`Java Code — ${question.concept_id}`} />
            </div>
          )}
        </div>

        {/* Big Clickable Option Cards */}
        <div className="mt-6 flex flex-col gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Choose an option:
          </label>

          <div className="grid grid-cols-1 gap-3.5">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOptionId === opt.id;
              const isAnswered = feedback !== null;
              const isCorrectOption = feedback && question.correct_option === opt.id;
              const isWrongChoice = feedback && isSelected && !feedback.correct;

              let cardStyles = "border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-700 hover:bg-slate-800/40";
              if (isSelected && !isAnswered) {
                cardStyles = "border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-950/60 ring-2 ring-indigo-500";
              } else if (isCorrectOption) {
                cardStyles = "border-emerald-500 bg-emerald-950/40 text-white ring-2 ring-emerald-500";
              } else if (isWrongChoice) {
                cardStyles = "border-rose-500 bg-rose-950/40 text-white ring-2 ring-rose-500";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswered || isSubmitting}
                  onClick={() => handleOptionSelect(opt.id)}
                  className={`group relative flex items-start gap-4 p-5 rounded-2xl border text-left transition-all min-h-[58px] ${cardStyles} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}
                >
                  {/* Option letter badge */}
                  <span
                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl font-mono text-xs font-bold transition-colors ${
                      isSelected && !isAnswered
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                        : isCorrectOption
                        ? "bg-emerald-500 text-slate-950"
                        : isWrongChoice
                        ? "bg-rose-500 text-white"
                        : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-100"
                    }`}
                  >
                    {optionLetters[idx] || idx + 1}
                  </span>

                  {/* Option Text */}
                  <div className="flex-1 text-sm sm:text-base leading-relaxed pt-0.5">
                    {opt.text}
                  </div>

                  {/* Status Icons */}
                  {isSelected && !isAnswered && (
                    <span className="flex-shrink-0 text-indigo-400 mt-1">
                      <CheckIcon className="w-5 h-5" />
                    </span>
                  )}
                  {isCorrectOption && (
                    <span className="flex-shrink-0 text-emerald-400 mt-1">
                      <CheckCircleIcon className="w-6 h-6" />
                    </span>
                  )}
                  {isWrongChoice && (
                    <span className="flex-shrink-0 text-rose-400 mt-1">
                      <XCircleIcon className="w-6 h-6" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Revealed after choosing an option (Before Submission) */}
        {selectedOptionId && !feedback && (
          <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t border-slate-800/80 animate-fadeIn">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="one-line-reasoning"
                className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
              >
                <SparklesIcon className="w-4 h-4 text-indigo-400" />
                Why did you pick this? (one line)
              </label>
              <input
                id="one-line-reasoning"
                type="text"
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Why did you pick this? (one line)"
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/90 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[44px]"
              />
            </div>

            {errorMsg && (
              <p className="mt-2 text-xs font-medium text-rose-400 flex items-center gap-1.5">
                <span>⚠️</span>
                {errorMsg}
              </p>
            )}

            {/* Submit Button */}
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCwIcon className="w-4 h-4 animate-spin" />
                    <span>Evaluating with /api/answer...</span>
                  </>
                ) : (
                  <>
                    <span>Submit</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* FEEDBACK PANEL (Shown after POST to /api/answer) */}
        {feedback && (
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col gap-5 animate-fadeIn">
            {/* Correct / Wrong Main Status */}
            <div
              className={`p-5 rounded-2xl border flex items-center gap-4 ${
                feedback.correct
                  ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                  : "border-rose-500/40 bg-rose-950/30 text-rose-300"
              }`}
            >
              <div
                className={`p-2.5 rounded-xl ${
                  feedback.correct ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {feedback.correct ? (
                  <CheckCircleIcon className="w-8 h-8" />
                ) : (
                  <XCircleIcon className="w-8 h-8" />
                )}
              </div>

              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {feedback.correct ? "Evaluation Result: Correct" : "Evaluation Result: Incorrect"}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  {feedback.correct
                    ? "Great job! Your Java mental model is accurate."
                    : "Not quite — review the misconception breakdown below."}
                </h3>
              </div>
            </div>

            {/* If a misconception is detected: HIGHLIGHTED CARD with its name and explanation */}
            {feedback.misconception && (
              <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-amber-950/20 to-slate-900/60 p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-slate-950 font-bold font-mono text-[10px] uppercase rounded-bl-xl tracking-wider">
                  Misconception Identified
                </div>

                <div className="flex items-start gap-3.5 mb-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
                    <AlertTriangleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      [{feedback.misconception.id}]
                    </span>
                    <h4 className="text-lg font-bold text-white tracking-tight">
                      {feedback.misconception.name}
                    </h4>
                  </div>
                </div>

                {/* Explanation */}
                <div className="mt-2 text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-amber-500/20">
                  <p className="font-semibold text-amber-300 text-xs uppercase tracking-wide mb-1">
                    Cognitive Diagnostic Explanation:
                  </p>
                  <p>{feedback.misconception.explanation}</p>
                </div>

                {typeof feedback.misconception.confidence === "number" && (
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Diagnosis Confidence</span>
                    <span className="font-mono font-bold text-amber-400">
                      {Math.round(feedback.misconception.confidence * 100)}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mastery Update Snippet */}
            {feedback.mastery && question.concept_id && (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <AwardIcon className="w-4 h-4 text-indigo-400" />
                  Updated Mastery in {question.concept_id}:
                </span>
                <span className="font-mono font-bold text-white text-sm">
                  {feedback.mastery[question.concept_id] !== undefined
                    ? feedback.mastery[question.concept_id] <= 1
                      ? Math.round(feedback.mastery[question.concept_id] * 100)
                      : Math.round(feedback.mastery[question.concept_id])
                    : 50}
                  %
                </span>
              </div>
            )}

            {/* Next Button using next_question from the response */}
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <span>Next Question</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
