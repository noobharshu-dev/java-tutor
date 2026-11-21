"use client";

import React, { useState, useEffect, useRef } from "react";
import { Question, AnswerResponse, AnswerRequest } from "@/lib/types";
import { ShikiCode } from "./shiki-code";
import { QuestionSkeleton, ErrorStateCard } from "./loading-skeleton";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  SparklesIcon,
} from "./icons";
import Link from "next/link";

interface QuestionRunnerProps {
  mode: "diagnostic" | "practice";
  initialQuestion?: Question | null;
  studentId?: string;
  conceptId?: string;
  onMasteryChange?: (mastery: Record<string, number>) => void;
  onCurrentConceptChange?: (conceptId: string) => void;
}

export function QuestionRunner({
  mode,
  initialQuestion,
  studentId = "student-1",
  conceptId,
  onMasteryChange,
  onCurrentConceptChange,
}: QuestionRunnerProps) {
  const [question, setQuestion] = useState<Question | null>(initialQuestion || null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(!initialQuestion);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [reasoning, setReasoning] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AnswerResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [fetchError, setFetchError] = useState<string>("");
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const onCurrentConceptChangeRef = useRef(onCurrentConceptChange);
  useEffect(() => {
    onCurrentConceptChangeRef.current = onCurrentConceptChange;
  });

  const [retryCount, setRetryCount] = useState(0);

  const retryLoad = () => {
    setIsLoadingQuestion(true);
    setFetchError("");
    setRetryCount((c) => c + 1);
  };

  // Fetch initial question if not provided
  useEffect(() => {
    let isMounted = true;
    if (!initialQuestion) {
      const url = new URL("/api/question", window.location.origin);
      if (conceptId) url.searchParams.set("concept_id", conceptId);

      fetch(url.toString())
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch question`);
          return res.json();
        })
        .then((data: Question) => {
          if (isMounted && data?.id) {
            setQuestion(data);
            if (onCurrentConceptChangeRef.current) {
              onCurrentConceptChangeRef.current(data.concept_id);
            }
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error("Error fetching question:", err);
            setFetchError("Unable to load question from /api/question. Please verify your connection.");
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingQuestion(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [initialQuestion, conceptId, retryCount]);

  const handleOptionSelect = (optionId: string) => {
    if (feedback) return;
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
      if (result.mastery && onMasteryChange) {
        onMasteryChange(result.mastery);
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
      if (onCurrentConceptChange) {
        onCurrentConceptChange(feedback.next_question.concept_id);
      }
    }
    setSelectedOptionId("");
    setReasoning("");
    setFeedback(null);
    setErrorMsg("");
  };

  const optionLetters = ["A", "B", "C", "D", "E"];

  if (isLoadingQuestion) {
    return <QuestionSkeleton />;
  }

  if (fetchError || !question) {
    return (
      <div className="py-8">
        <ErrorStateCard
          title="Diagnostic Challenge Unavailable"
          message={
            fetchError ||
            "Unable to retrieve a diagnostic challenge from /api/question. Please try again."
          }
          onRetry={retryLoad}
        />
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-[#57534E] hover:text-[#1C1917] font-medium underline underline-offset-4"
          >
            &larr; Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto flex flex-col gap-5">
      {/* Session Progress Meta */}
      <div className="flex items-center justify-between text-xs text-[#78716C] pb-2 border-b border-[#E3DDD1]">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#57534E]">
            {mode === "diagnostic" ? "Diagnostic Session" : "Targeted Drill"}
          </span>
          <span>·</span>
          <span className="font-mono">Challenge #{questionsAnswered + 1}</span>
        </div>

        {streak > 1 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3D6] text-[#9A5010] border border-[#F0D18A] font-mono text-[11px] font-semibold">
            <SparklesIcon className="w-3 h-3 text-[#B45309]" />
            {streak} In a Row
          </span>
        )}
      </div>

      {/* Main Question Card */}
      <div className="studio-card rounded-2xl overflow-hidden">
        {/* Clean Header Strip */}
        <div className="bg-[#F2EDE3] border-b border-[#E3DDD1] px-6 py-3 flex items-center justify-between">
          <span className="font-mono text-xs font-medium uppercase tracking-wide text-[#57534E]">
            {question.concept_id}
          </span>
          <span className="bg-[#FFFDF9] border border-[#DDD6C7] text-[#57534E] font-mono text-xs px-2.5 py-0.5 rounded-full">
            Level {question.difficulty}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          {/* Prompt */}
          <h2 className="font-sans text-lg font-semibold text-[#1C1917] leading-snug">
            {question.prompt}
          </h2>

          {/* Java Code snippet */}
          {question.code && (
            <ShikiCode code={question.code} title="Snippet.java" />
          )}

          {/* Answer Options */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-[#57534E] uppercase tracking-wider block mb-1">
              Select an option:
            </span>

            {question.options.map((opt, idx) => {
              const isSelected = selectedOptionId === opt.id;
              const isAnswered = feedback !== null;
              const isCorrectOption = feedback && question.correct_option === opt.id;
              const isWrongChoice = feedback && isSelected && !feedback.correct;

              let cardStyles =
                "bg-[#FFFDF9] border-[#DDD6C7] hover:border-[#A8A29E] hover:bg-[#FAF7F0] text-[#1C1917]";
              let badgeStyles = "bg-[#EAE4D8] text-[#57534E]";

              if (isSelected && !isAnswered) {
                cardStyles = "bg-[#FCECE8]/45 border-[#D94F2B] ring-1 ring-[#D94F2B] text-[#1C1917]";
                badgeStyles = "bg-[#D94F2B] text-[#FFFDF9]";
              } else if (isCorrectOption) {
                cardStyles = "bg-[#E6F4F1] border-[#0F766E] text-[#1C1917]";
                badgeStyles = "bg-[#0F766E] text-[#FFFDF9]";
              } else if (isWrongChoice) {
                cardStyles = "bg-[#FCECE8] border-[#C23B22] text-[#1C1917]";
                badgeStyles = "bg-[#C23B22] text-[#FFFDF9]";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswered || isSubmitting}
                  onClick={() => handleOptionSelect(opt.id)}
                  className={`w-full text-left flex items-center gap-3.5 px-4 py-3.5 rounded-xl border transition-all cursor-pointer ${cardStyles}`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg font-mono text-xs font-semibold flex items-center justify-center shrink-0 ${badgeStyles}`}
                  >
                    {optionLetters[idx] || idx + 1}
                  </span>
                  <span className="flex-1 text-sm leading-relaxed font-sans">
                    {opt.text}
                  </span>
                  {isCorrectOption && (
                    <CheckCircleIcon className="w-5 h-5 text-[#0F766E] shrink-0" />
                  )}
                  {isWrongChoice && (
                    <XCircleIcon className="w-5 h-5 text-[#C23B22] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Reasoning Input Box (Signature Feature) */}
          {selectedOptionId && !feedback && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="bg-[#F6F3EC] border border-[#DDD6C7] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="reasoning-input"
                    className="text-xs font-semibold text-[#1C1917]"
                  >
                    Why did you choose this answer?
                  </label>
                  <span className="font-mono text-[11px] text-[#78716C]">
                    1-line reasoning
                  </span>
                </div>
                <textarea
                  id="reasoning-input"
                  rows={2}
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder="e.g. Because both strings contain the same characters in heap memory..."
                  className="w-full bg-[#FFFDF9] border border-[#DDD6C7] focus:border-[#D94F2B] focus:outline-none rounded-lg px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] resize-none"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-[#C23B22] flex items-center gap-1.5">
                  <span>⚠️</span>
                  {errorMsg}
                </p>
              )}

              {/* Submit CTA */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#D94F2B] hover:bg-[#BE3E1D] text-[#FFFDF9] font-medium rounded-xl shadow-[0_2px_0_0_#9E3115] active:translate-y-[1px] transition-all px-6 py-2.5 text-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCwIcon className="w-4 h-4 animate-spin" />
                      <span>Diagnosing reasoning...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit &amp; Diagnose</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Diagnostic Verdict Reveal Card */}
          {feedback && (
            <div className="pt-2">
              {!feedback.correct ? (
                <div className="bg-[#FCECE8]/85 border border-[#F2C0B5] rounded-xl p-5 space-y-3 animate-fade-up">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[#B53219]">
                      {feedback.misconception?.id
                        ? `${feedback.misconception.id} · Misconception Caught`
                        : "Conceptual Misconception Caught"}
                    </span>
                    {typeof feedback.misconception?.confidence === "number" && (
                      <span className="font-mono text-xs text-[#B53219]">
                        {Math.round(feedback.misconception.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                    {feedback.misconception?.name || "Flawed JVM execution assumption"}
                  </h3>

                  <p className="font-sans text-sm text-[#44403C] leading-relaxed">
                    {feedback.misconception?.explanation ||
                      "Your answer indicates a misunderstanding of how Java executes this operation. Review the mechanics and try the next targeted challenge."}
                  </p>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="bg-[#1C1917] hover:bg-[#292524] text-[#FFFDF9] font-medium px-5 py-2.5 rounded-xl transition-all active:translate-y-[1px] text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <span>Next Adaptive Question</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#E6F4F1] border border-[#B2DDD5] rounded-xl p-5 space-y-3 animate-fade-up">
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[#0F766E]">
                    Mental Model Verified
                  </div>

                  <h3 className="font-display text-xl font-semibold text-[#1C1917]">
                    Correct Analysis
                  </h3>

                  <p className="font-sans text-sm text-[#44403C] leading-relaxed">
                    Your reasoning accurately mirrors JVM runtime semantics. Concept mastery in{" "}
                    <strong className="font-mono text-[#0F766E]">{question.concept_id}</strong> has updated.
                  </p>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="bg-[#1C1917] hover:bg-[#292524] text-[#FFFDF9] font-medium px-5 py-2.5 rounded-xl transition-all active:translate-y-[1px] text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <span>Next Question</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
