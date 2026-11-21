"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import {
  ArrowRightIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
} from "@/components/icons";

export default function LandingPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("student_id") || "student-1";
    }
    return "student-1";
  });
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);
  const [sessionError, setSessionError] = useState<string>("");
  const [selectedChoice, setSelectedChoice] = useState<"A" | "B">("A");

  // Handle Start Session: Calls /api/session, saves to localStorage, routes to /diagnostic
  const handleStartSession = async (targetRoute: string = "/diagnostic") => {
    setIsStartingSession(true);
    setSessionError("");

    let resolvedStudentId = studentId;

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: resolvedStudentId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.student_id) {
          resolvedStudentId = data.student_id;
        } else if (data.id) {
          resolvedStudentId = data.id;
        }
      } else {
        if (!resolvedStudentId) {
          resolvedStudentId = `student-${Date.now().toString().slice(-4)}`;
        }
      }
    } catch (err) {
      console.warn("Session endpoint fallback:", err);
      if (!resolvedStudentId) {
        resolvedStudentId = `student-${Date.now().toString().slice(-4)}`;
      }
    }

    try {
      localStorage.setItem("student_id", resolvedStudentId);
      setStudentId(resolvedStudentId);
    } catch {
      // LocalStorage access fallback (e.g. private browsing)
    }

    router.push(targetRoute);
  };

  const handleStudentChange = (id: string) => {
    setStudentId(id);
    try {
      localStorage.setItem("student_id", id);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-studio-grid">
      {/* Top Navbar */}
      <Navbar
        studentId={studentId}
        onSelectStudent={handleStudentChange}
      />

      <main className="flex-1 flex flex-col">
        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto px-5 pt-12 pb-16 grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Typography & Session Launcher */}
          <div className="lg:col-span-6 space-y-6">
            {/* Clean warm eyebrow badge */}
            <div className="inline-flex items-center gap-2 bg-[#EFEAE0] border border-[#DDD6C7] rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#57534E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D94F2B]" />
              <span>Cognitive Diagnostic Tutor · Java SE</span>
            </div>

            {/* Display Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-semibold tracking-tight text-[#1C1917] leading-[1.06]">
              We don&apos;t track what you got wrong.
              <br />
              We track what you{" "}
              <span className="italic text-[#D94F2B] underline decoration-[#D94F2B]/35 decoration-2 underline-offset-4">
                misunderstand.
              </span>
            </h1>

            {/* Subheadline Narrative */}
            <p className="text-base sm:text-lg text-[#57534E] leading-relaxed max-w-lg">
              Write a one-line reason with every answer. Our diagnostic engine
              reads your reasoning to pinpoint the exact flawed mental model—then
              adapts your next question and mastery graph to repair it.
            </p>

            {/* Session Error Banner if needed */}
            {sessionError && (
              <div className="p-3 rounded-xl bg-[#FCECE8] border border-[#F2C0B5] text-[#C23B22] text-xs flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-[#C23B22]" />
                <span>{sessionError}</span>
              </div>
            )}

            {/* Smooth Session Launcher Bar */}
            <div className="studio-card rounded-2xl p-3 flex flex-wrap sm:flex-nowrap items-center gap-2.5 max-w-lg">
              <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                <label
                  htmlFor="hero-student-select"
                  className="text-xs text-[#78716C] font-mono pl-1"
                >
                  Student:
                </label>
                <select
                  id="hero-student-select"
                  value={studentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="bg-[#F6F3EC] border border-[#DDD6C7] text-[#1C1917] text-xs font-mono rounded-lg px-2.5 py-2 flex-1 focus:outline-none focus:ring-1 focus:ring-[#D94F2B]"
                >
                  <option value="student-1">Alex Johnson (student-1)</option>
                  <option value="student-2">Maya Lin (student-2)</option>
                  <option value="student-3">Carlos Diaz (student-3)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleStartSession("/diagnostic")}
                disabled={isStartingSession}
                className="bg-[#D94F2B] hover:bg-[#BE3E1D] text-[#FFFDF9] font-medium px-5 py-2.5 rounded-xl shadow-[0_2px_0_0_#9E3115] active:translate-y-[1px] transition-all whitespace-nowrap text-sm flex items-center gap-2 cursor-pointer"
              >
                {isStartingSession ? (
                  <>
                    <RefreshCwIcon className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>Start Diagnostic</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Secondary Direct Links */}
            <div className="flex items-center gap-4 text-xs font-mono text-[#78716C]">
              <span>Or explore:</span>
              <Link
                href="/dashboard"
                className="hover:text-[#1C1917] underline underline-offset-2 transition-colors"
              >
                Mastery Graph (/dashboard)
              </Link>
              <span>·</span>
              <Link
                href="/teacher"
                className="hover:text-[#1C1917] underline underline-offset-2 transition-colors"
              >
                Teacher Radar (/teacher)
              </Link>
            </div>

            {/* Compact Credibility Strip */}
            <div className="pt-4 border-t border-[#DDD6C7] text-xs font-mono text-[#78716C] flex flex-wrap gap-x-4 gap-y-1">
              <span>12 Prerequisite Concepts</span>
              <span>·</span>
              <span>8 Cognitive Traps</span>
              <span>·</span>
              <span>SM-2 Spaced Recall</span>
              <span>·</span>
              <span>Syllabus-Agnostic JSON</span>
            </div>
          </div>

          {/* Right Column: INTERACTIVE 5-SECOND DIAGNOSIS SANDBOX */}
          <div className="lg:col-span-6">
            <div className="studio-card rounded-2xl overflow-hidden">
              {/* Header Bar */}
              <div className="bg-[#EFEAE0] border-b border-[#DDD6C7] px-4 py-2.5 flex items-center justify-between">
                <span className="font-mono text-xs font-medium text-[#57534E]">
                  Try it live · Interactive Diagnosis
                </span>
                <span className="font-mono text-[11px] text-[#78716C] bg-[#FFFDF9] px-2 py-0.5 rounded border border-[#DDD6C7]">
                  Snippet.java
                </span>
              </div>

              {/* Sandbox Body */}
              <div className="p-5 space-y-4">
                {/* Clean Dark Code Inset */}
                <div className="bg-[#1C1917] text-[#F5F2EB] font-mono text-xs sm:text-[13px] leading-relaxed rounded-xl p-4">
                  <div className="text-stone-500 pb-1 text-[11px]">
                    {"// Equality evaluation in JVM memory"}
                  </div>
                  <div>
                    <span className="text-[#E7E1D5]">String</span> a ={" "}
                    <span className="text-[#D94F2B]">new</span>{" "}
                    <span className="text-[#E7E1D5]">String</span>(
                    <span className="text-[#A4D4B4]">&quot;java&quot;</span>);
                  </div>
                  <div>
                    <span className="text-[#E7E1D5]">String</span> b ={" "}
                    <span className="text-[#D94F2B]">new</span>{" "}
                    <span className="text-[#E7E1D5]">String</span>(
                    <span className="text-[#A4D4B4]">&quot;java&quot;</span>);
                  </div>
                  <div className="pt-1">
                    System.out.println(a == b);
                  </div>
                </div>

                {/* Interactive Prompt & Choice Selectors */}
                <div className="space-y-2">
                  <p className="text-xs font-mono text-[#78716C]">
                    Pick a student&apos;s 1-line reasoning to see how JavaTutor responds:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedChoice("A")}
                      className={`text-left text-xs p-3 rounded-xl transition-all cursor-pointer ${
                        selectedChoice === "A"
                          ? "border-2 border-[#D94F2B] bg-[#FFFDF9] text-[#1C1917] font-medium shadow-xs"
                          : "border border-[#DDD6C7] bg-[#F6F3EC] text-[#57534E] hover:bg-[#EFEAE0]"
                      }`}
                    >
                      <div className="font-mono text-[10px] text-[#D94F2B] font-bold mb-0.5">
                        CHOICE A (Trap)
                      </div>
                      <div>&quot;Both hold &apos;java&apos;, so == prints true.&quot;</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedChoice("B")}
                      className={`text-left text-xs p-3 rounded-xl transition-all cursor-pointer ${
                        selectedChoice === "B"
                          ? "border-2 border-[#0F766E] bg-[#FFFDF9] text-[#1C1917] font-medium shadow-xs"
                          : "border border-[#DDD6C7] bg-[#F6F3EC] text-[#57534E] hover:bg-[#EFEAE0]"
                      }`}
                    >
                      <div className="font-mono text-[10px] text-[#0F766E] font-bold mb-0.5">
                        CHOICE B (Sound)
                      </div>
                      <div>&quot;new creates two objects, so == prints false.&quot;</div>
                    </button>
                  </div>
                </div>

                {/* Live Animated Verdict Panel */}
                {selectedChoice === "A" ? (
                  <div className="bg-[#FCECE8] border border-[#F2C0B5] rounded-xl p-4 space-y-2.5 animate-fade-up">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#C23B22] text-[#FFFDF9] text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                        MISCONCEPTION CAUGHT · M1
                      </span>
                      <span className="text-xs font-mono text-[#B53219]">
                        96% confidence
                      </span>
                    </div>

                    <div className="font-semibold text-[#1C1917] text-sm">
                      == compares string contents
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-white/80 rounded-lg p-2.5 border border-[#F2C0B5]">
                        <span className="block font-mono text-[10px] text-[#C23B22] font-semibold mb-0.5">
                          YOUR BELIEF
                        </span>
                        == checks text equality
                      </div>
                      <div className="bg-[#E6F4F1] rounded-lg p-2.5 border border-[#B2DDD5]">
                        <span className="block font-mono text-[10px] text-[#0F766E] font-semibold mb-0.5">
                          JAVA REALITY
                        </span>
                        == compares refs; use .equals()
                      </div>
                    </div>

                    {/* Live Mini Mastery Ripple Bar */}
                    <div className="flex items-center justify-between text-xs font-mono bg-[#F6F3EC] rounded-lg px-3 py-2 border border-[#DDD6C7] mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[#57534E]">string-equality:</span>
                        <div className="w-24 h-2 bg-[#E7E1D5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#C23B22] w-[31%] transition-all duration-500" />
                        </div>
                        <span className="text-[#C23B22] font-bold">31%</span>
                      </div>
                      <span className="text-[10px] font-mono bg-[#FFFDF9] text-[#57534E] border border-[#DDD6C7] px-2 py-0.5 rounded">
                        Next Q targets M1
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#E6F4F1] border border-[#B2DDD5] rounded-xl p-4 space-y-2.5 animate-fade-up">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#0F766E] text-[#FFFDF9] text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                        MENTAL MODEL VERIFIED
                      </span>
                      <span className="text-xs font-mono text-[#0F766E]">
                        100% confidence
                      </span>
                    </div>

                    <div className="font-semibold text-[#1C1917] text-sm">
                      Accurate reference-equality model
                    </div>

                    <p className="text-xs text-[#57534E] leading-relaxed">
                      Mastery climbs to 78% · Next review scheduled in 6 days via SM-2.
                    </p>

                    {/* Live Mini Mastery Ripple Bar */}
                    <div className="flex items-center justify-between text-xs font-mono bg-[#F6F3EC] rounded-lg px-3 py-2 border border-[#DDD6C7] mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[#57534E]">string-equality:</span>
                        <div className="w-24 h-2 bg-[#E7E1D5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0F766E] w-[78%] transition-all duration-500" />
                        </div>
                        <span className="text-[#0F766E] font-bold">78%</span>
                      </div>
                      <span className="text-[10px] font-mono bg-[#FFFDF9] text-[#0F766E] border border-[#B2DDD5] px-2 py-0.5 rounded">
                        Mastered
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 3-CARD "HOW THE ENGINE WORKS" STRIP */}
        <section className="max-w-6xl mx-auto px-5 pb-20 w-full">
          <div className="border-t border-[#DDD6C7] pt-12 pb-6">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#1C1917]">
              Engine Architecture
            </h2>
            <p className="text-sm text-[#57534E] mt-1">
              How the cognitive diagnostic cycle fixes flawed mental representations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* 01 Card */}
            <div className="studio-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#78716C]">01</span>
                <h3 className="font-display text-lg font-semibold text-[#1C1917] mt-1">
                  Reasoning-First Diagnosis
                </h3>
                <p className="text-sm text-[#57534E] mt-2 leading-relaxed">
                  Reads the why behind every answer to uncover hidden mental bugs,
                  not just right or wrong scores.
                </p>
              </div>
              <Link
                href="/diagnostic"
                className="text-xs font-mono font-semibold text-[#D94F2B] hover:text-[#BE3E1D] pt-5 mt-6 border-t border-[#DDD6C7] flex items-center gap-1.5 transition-colors"
              >
                <span>Try Diagnostic</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 02 Card */}
            <div className="studio-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#78716C]">02</span>
                <h3 className="font-display text-lg font-semibold text-[#1C1917] mt-1">
                  Live Prerequisite Graph
                </h3>
                <p className="text-sm text-[#57534E] mt-2 leading-relaxed">
                  Automatically flags shaky upstream foundations when a downstream
                  concept breaks in practice.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="text-xs font-mono font-semibold text-[#D94F2B] hover:text-[#BE3E1D] pt-5 mt-6 border-t border-[#DDD6C7] flex items-center gap-1.5 transition-colors"
              >
                <span>Open Graph</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 03 Card */}
            <div className="studio-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#78716C]">03</span>
                <h3 className="font-display text-lg font-semibold text-[#1C1917] mt-1">
                  Class Misconception Radar
                </h3>
                <p className="text-sm text-[#57534E] mt-2 leading-relaxed">
                  Gives instructors a live heatmap of which exact false beliefs are
                  spreading across the student cohort.
                </p>
              </div>
              <Link
                href="/teacher"
                className="text-xs font-mono font-semibold text-[#D94F2B] hover:text-[#BE3E1D] pt-5 mt-6 border-t border-[#DDD6C7] flex items-center gap-1.5 transition-colors"
              >
                <span>View Teacher Heatmap</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DDD6C7] bg-[#EFEAE0]/50 py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C] font-mono">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1C1917]">JavaTutor</span>
            <span>·</span>
            <span>Cognitive Diagnostic Tutor for Java SE</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/diagnostic"
              className="hover:text-[#1C1917] transition-colors"
            >
              Diagnostic
            </Link>
            <Link
              href="/practice"
              className="hover:text-[#1C1917] transition-colors"
            >
              Practice
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-[#1C1917] transition-colors"
            >
              Mastery Graph
            </Link>
            <Link
              href="/teacher"
              className="hover:text-[#1C1917] transition-colors"
            >
              Teacher Radar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
