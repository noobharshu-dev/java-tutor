"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";

export default function LandingPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<"A" | "B">("A");
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);

  const handleStartSession = async () => {
    setIsStartingSession(true);
    let resolvedStudentId = "student-1";
    if (typeof window !== "undefined") {
      resolvedStudentId = localStorage.getItem("student_id") || "student-1";
    }

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
        }
      }
    } catch (err) {
      console.warn("Session endpoint fallback:", err);
    }

    try {
      localStorage.setItem("student_id", resolvedStudentId);
    } catch {
      // LocalStorage access fallback
    }

    router.push("/diagnostic");
  };

  return (
    <div className="min-h-screen flex flex-col bg-studio-grid">
      {/* Top Navbar */}
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* HERO SECTION: Breathable, uncluttered 2-column layout */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-12 gap-14 items-center w-full">
          {/* Left Column: Only 3 focused elements */}
          <div className="lg:col-span-6 space-y-7">
            {/* 1. Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[52px] font-semibold tracking-tight text-[#1C1917] leading-[1.08]">
              We don&apos;t track what you got wrong.
              <br />
              We track what you{" "}
              <span className="italic text-[#D94F2B]">misunderstand.</span>
            </h1>

            {/* 2. Subtitle */}
            <p className="font-sans text-lg text-[#57534E] leading-relaxed max-w-md">
              Explain your answer in one line. JavaTutor reads your reasoning to
              pinpoint flawed mental models and adapts your next question to fix
              them.
            </p>

            {/* 3. Action Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleStartSession}
                disabled={isStartingSession}
                className="bg-[#D94F2B] hover:bg-[#BE3E1D] text-[#FFFDF9] font-sans font-medium px-6 py-3 rounded-xl shadow-[0_2px_0_0_#9E3115] active:translate-y-[1px] transition-all cursor-pointer text-sm"
              >
                {isStartingSession ? "Connecting..." : "Start Diagnostic →"}
              </button>

              <Link
                href="/teacher"
                className="bg-[#FFFDF9] hover:bg-[#EFEAE0] text-[#1C1917] border border-[#DDD6C7] font-sans font-medium px-5 py-3 rounded-xl transition-colors text-sm"
              >
                View Teacher Radar
              </Link>
            </div>
          </div>

          {/* Right Column: Clean, Breathable Interactive Preview */}
          <div className="lg:col-span-6">
            <div className="studio-card rounded-2xl overflow-hidden">
              {/* Minimal Top Bar */}
              <div className="px-5 py-3 bg-[#F2EDE3] border-b border-[#E3DDD1] flex items-center justify-between">
                <span className="font-sans text-xs font-medium text-[#57534E]">
                  Interactive preview
                </span>
                <span className="font-mono text-xs text-[#78716C]">
                  StringCheck.java
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-5">
                {/* 3-line Java Code Block */}
                <div className="bg-[#1C1917] text-[#F5F2EB] font-mono text-[13px] leading-relaxed rounded-xl p-4">
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
                  <div>System.out.println(a == b);</div>
                </div>

                {/* Clean Label */}
                <div className="space-y-2.5">
                  <span className="text-xs font-medium text-[#78716C] uppercase tracking-wider block">
                    Select a student&apos;s reasoning
                  </span>

                  {/* 2 Clean Toggle Buttons (No Trap/Sound spoiler labels) */}
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedOption("A")}
                      className={`text-left text-xs p-3.5 rounded-xl transition-all cursor-pointer ${
                        selectedOption === "A"
                          ? "border-2 border-[#D94F2B] bg-[#FFFDF9] text-[#1C1917] font-medium shadow-xs"
                          : "border border-[#DDD6C7] bg-[#F6F3EC] text-[#57534E] hover:bg-[#EFEAE0]"
                      }`}
                    >
                      &quot;Both hold &apos;java&apos;, so it prints true.&quot;
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedOption("B")}
                      className={`text-left text-xs p-3.5 rounded-xl transition-all cursor-pointer ${
                        selectedOption === "B"
                          ? "border-2 border-[#0F766E] bg-[#FFFDF9] text-[#1C1917] font-medium shadow-xs"
                          : "border border-[#DDD6C7] bg-[#F6F3EC] text-[#57534E] hover:bg-[#EFEAE0]"
                      }`}
                    >
                      &quot;Two separate objects, so it prints false.&quot;
                    </button>
                  </div>
                </div>

                {/* Single Calm Verdict Panel */}
                {selectedOption === "A" ? (
                  <div className="bg-[#FCECE8]/70 border border-[#F2C0B5] rounded-xl p-4 space-y-2.5 animate-fade-up">
                    <div className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[#B53219]">
                      M1 · Misconception Caught
                    </div>
                    <div className="font-sans text-[15px] font-semibold text-[#1C1917]">
                      Assumes == compares text contents
                    </div>
                    <p className="font-sans text-sm text-[#57534E] leading-relaxed">
                      == checks object references in memory. Use a.equals(b) to
                      compare values.
                    </p>
                    <div className="pt-2 border-t border-[#F2C0B5]/60 flex items-center justify-between text-xs font-mono text-[#78716C]">
                      <span>string-equality</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-[#E7E1D5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#C23B22] w-[31%] transition-all duration-500" />
                        </div>
                        <span className="text-[#C23B22] font-semibold">31%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#E6F4F1]/80 border border-[#B2DDD5] rounded-xl p-4 space-y-2.5 animate-fade-up">
                    <div className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[#0F766E]">
                      Sound Mental Model
                    </div>
                    <div className="font-sans text-[15px] font-semibold text-[#1C1917]">
                      Accurate reference vs. value distinction
                    </div>
                    <p className="font-sans text-sm text-[#57534E] leading-relaxed">
                      Mastery increases and review is scheduled in 6 days via SM-2.
                    </p>
                    <div className="pt-2 border-t border-[#B2DDD5]/60 flex items-center justify-between text-xs font-mono text-[#78716C]">
                      <span>string-equality</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-[#E7E1D5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0F766E] w-[78%] transition-all duration-500" />
                        </div>
                        <span className="text-[#0F766E] font-semibold">78%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* BELOW THE FOLD: Clean 3-Column Section */}
        <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[#E3DDD1] w-full">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <span className="font-mono text-xs text-[#78716C] block mb-2">01</span>
              <h3 className="font-display text-lg font-semibold text-[#1C1917] mb-2">
                Diagnose reasoning
              </h3>
              <p className="font-sans text-sm text-[#57534E] leading-relaxed">
                Catches the wrong belief behind an answer, not just a right/wrong
                score.
              </p>
            </div>

            <div>
              <span className="font-mono text-xs text-[#78716C] block mb-2">02</span>
              <h3 className="font-display text-lg font-semibold text-[#1C1917] mb-2">
                Map prerequisites
              </h3>
              <p className="font-sans text-sm text-[#57534E] leading-relaxed">
                Updates your live knowledge graph and flags weak upstream
                foundations automatically.
              </p>
            </div>

            <div>
              <span className="font-mono text-xs text-[#78716C] block mb-2">03</span>
              <h3 className="font-display text-lg font-semibold text-[#1C1917] mb-2">
                Surface class trends
              </h3>
              <p className="font-sans text-sm text-[#57534E] leading-relaxed">
                Shows instructors which exact misconceptions are spreading
                across the cohort.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Subtle Footer */}
      <footer className="border-t border-[#E3DDD1] bg-[#F2EDE3]/40 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C] font-mono">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1C1917]">JavaTutor</span>
            <span>·</span>
            <span>Cognitive Diagnostic Tutor for Java SE</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/diagnostic" className="hover:text-[#1C1917] transition-colors">
              Diagnostic
            </Link>
            <Link href="/practice" className="hover:text-[#1C1917] transition-colors">
              Practice
            </Link>
            <Link href="/dashboard" className="hover:text-[#1C1917] transition-colors">
              Mastery
            </Link>
            <Link href="/teacher" className="hover:text-[#1C1917] transition-colors">
              Teacher
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
