"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CoffeeIcon,
  BrainIcon,
  CompassIcon,
  SparklesIcon,
  UsersIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  ClockIcon,
  RefreshCwIcon,
  AwardIcon,
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
  const [demoMastery, setDemoMastery] = useState<number>(42);
  const [isSimulatingMastery, setIsSimulatingMastery] = useState<boolean>(false);

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
        // Fallback: If backend endpoint is stubbed or 404, generate or retain session
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

    // Smooth navigation to target route
    router.push(targetRoute);
  };

  // Demo interactive mastery slider/simulation for smooth transitions
  const triggerMasterySimulation = () => {
    setIsSimulatingMastery(true);
    const targets = [28, 55, 84, 95, 38];
    const nextVal = targets[(targets.indexOf(demoMastery) + 1) % targets.length] || 78;
    setDemoMastery(nextVal);
    setTimeout(() => {
      setIsSimulatingMastery(false);
    }, 850);
  };

  const getHue = (val: number) => Math.round((val / 100) * 135);

  const conceptsList = [
    { id: "variables-types", name: "Variables & Data Types", level: "Tier 1", prereqs: "None" },
    { id: "operators", name: "Operators & Division", level: "Tier 1", prereqs: "Variables" },
    { id: "strings", name: "String Basics", level: "Tier 1", prereqs: "Variables" },
    { id: "string-equality", name: "String Equality (== vs .equals)", level: "Tier 2", prereqs: "Strings, Operators" },
    { id: "conditionals", name: "Conditionals & Logic", level: "Tier 2", prereqs: "Operators" },
    { id: "loops", name: "Loops & Iteration", level: "Tier 2", prereqs: "Conditionals" },
    { id: "arrays", name: "Arrays & Indexing", level: "Tier 2", prereqs: "Loops" },
    { id: "methods", name: "Methods & Parameters", level: "Tier 3", prereqs: "Conditionals" },
    { id: "classes-objects", name: "Classes & Objects", level: "Tier 3", prereqs: "Methods" },
    { id: "references", name: "References & Aliasing", level: "Tier 3", prereqs: "Classes, Arrays" },
    { id: "static-instance", name: "Static vs Instance Scope", level: "Tier 3", prereqs: "Classes" },
    { id: "inheritance", name: "Inheritance & Polymorphism", level: "Tier 3", prereqs: "Classes" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <CoffeeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  JavaTutor
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border border-amber-500/30">
                  ITS 2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Cognitive Diagnostic Engine
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <Link
              href="/diagnostic"
              className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all flex items-center gap-1.5"
            >
              <BrainIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Diagnostic</span>
            </Link>
            <Link
              href="/practice"
              className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all flex items-center gap-1.5"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Practice</span>
            </Link>
            <Link
              href="/dashboard"
              className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all flex items-center gap-1.5"
            >
              <CompassIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Mastery Graph</span>
            </Link>
            <Link
              href="/teacher"
              className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all flex items-center gap-1.5"
            >
              <UsersIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Teacher View</span>
            </Link>
          </nav>

          {/* Header Action Button */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{studentId}</span>
            </div>

            <button
              type="button"
              onClick={() => handleStartSession("/diagnostic")}
              disabled={isStartingSession}
              className="relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/30 transition-all duration-200 min-h-[40px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              {isStartingSession ? (
                <>
                  <RefreshCwIcon className="w-3.5 h-3.5 animate-spin" />
                  <span>Initializing...</span>
                </>
              ) : (
                <>
                  <span>Start Tutor</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 flex flex-col items-center text-center overflow-hidden">
          {/* Subtle Ambient Radial Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/15 to-amber-500/10 blur-3xl pointer-events-none -z-10" />

          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300 mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-amber-300 font-bold">Cognitive Misconception Diagnosis</span>
            <span className="text-slate-600">&bull;</span>
            <span className="font-mono text-slate-400">Java SE 21</span>
          </div>

          {/* EXACT ONE-LINE PROBLEM STATEMENT */}
          <h1 className="max-w-4xl text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] sm:leading-[1.12]">
            AI tutors answer questions.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-indigo-300 to-emerald-400">
              Ours understands what you misunderstand.
            </span>
          </h1>

          {/* Subheading Narrative */}
          <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Generic LLMs autocomplete code or give away answers. JavaTutor diagnoses false mental models—like
            reference aliasing confusion, integer division truncation, and String equality traps—then systematically
            repairs your internal JVM execution model.
          </p>

          {/* Error Banner if session failed */}
          {sessionError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4 text-rose-400" />
              <span>{sessionError}</span>
            </div>
          )}

          {/* Primary CTA Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {/* The Start Button calling /api/session */}
            <button
              type="button"
              onClick={() => handleStartSession("/diagnostic")}
              disabled={isStartingSession}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 min-h-[56px] cursor-pointer border border-indigo-400/30"
            >
              {isStartingSession ? (
                <>
                  <RefreshCwIcon className="w-5 h-5 animate-spin" />
                  <span>Connecting to Session...</span>
                </>
              ) : (
                <>
                  <BrainIcon className="w-5 h-5 text-indigo-200" />
                  <span>Start Diagnostic Assessment</span>
                  <ArrowRightIcon className="w-5 h-5 text-indigo-200" />
                </>
              )}
            </button>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl text-base font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2.5 min-h-[56px]"
            >
              <CompassIcon className="w-5 h-5 text-purple-400" />
              <span>Explore Mastery Graph</span>
            </Link>
          </div>

          {/* Key Product Credibility Markers */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-3xl w-full border-t border-slate-800/80 pt-8 text-left">
            <div>
              <span className="block text-2xl font-black font-mono text-white">12</span>
              <span className="text-xs text-slate-400">Core Concepts with Prerequisite DAG</span>
            </div>
            <div>
              <span className="block text-2xl font-black font-mono text-amber-400">Adversarial</span>
              <span className="text-xs text-slate-400">Distractor-Based Misconception Probing</span>
            </div>
            <div>
              <span className="block text-2xl font-black font-mono text-emerald-400">SM-2</span>
              <span className="text-xs text-slate-400">Memory Decay Spaced Repetition</span>
            </div>
            <div>
              <span className="block text-2xl font-black font-mono text-indigo-400">0 Guesswork</span>
              <span className="text-xs text-slate-400">One-Line Reasoning Validation</span>
            </div>
          </div>
        </section>

        {/* INTERACTIVE PRODUCT SHOWCASE & SMOOTH MASTERY TRANSITION DEMO */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                  How JavaTutor Diagnoses Your Code
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  From False Belief to Conceptual Mastery
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Watch how our cognitive diagnostic model isolates misconceptions in real time and smoothly recalculates your knowledge graph.
                </p>
              </div>

              {/* Interactive Transition Test Button */}
              <button
                type="button"
                onClick={triggerMasterySimulation}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center gap-2 self-start md:self-auto min-h-[44px] cursor-pointer"
              >
                <RefreshCwIcon className={`w-3.5 h-3.5 text-indigo-400 ${isSimulatingMastery ? "animate-spin" : ""}`} />
                <span>Simulate Mastery Update</span>
              </button>
            </div>

            {/* Split Interactive Demo Cards */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left: Adversarial Diagnostic Question (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-500/30">
                      Concept: string-equality
                    </span>
                    <span className="text-xs font-mono text-slate-500">Diagnostic Probe #04</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white">
                    What does the JVM output for this comparison?
                  </h3>

                  {/* Simulated Syntax-Highlighted Code Block */}
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-xs leading-relaxed text-slate-300 shadow-inner">
                    <div className="text-slate-500">{"// String literal pool vs heap instantiation"}</div>
                    <div><span className="text-purple-400">String</span> s1 = <span className="text-emerald-400">&quot;Java&quot;</span>;</div>
                    <div><span className="text-purple-400">String</span> s2 = <span className="text-indigo-400">new</span> <span className="text-purple-400">String</span>(<span className="text-emerald-400">&quot;Java&quot;</span>);</div>
                    <div className="mt-2"><span className="text-amber-400">if</span> (s1 == s2) &#123;</div>
                    <div className="pl-4"><span className="text-purple-400">System</span>.out.println(<span className="text-emerald-400">&quot;EQUAL&quot;</span>);</div>
                    <div>&#125; <span className="text-amber-400">else</span> &#123;</div>
                    <div className="pl-4"><span className="text-purple-400">System</span>.out.println(<span className="text-emerald-400">&quot;DIFFERENT&quot;</span>);</div>
                    <div>&#125;</div>
                  </div>

                  {/* Student Distractor Choice */}
                  <div className="mt-4 p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/20 text-xs">
                    <div className="flex items-center gap-2 font-bold text-rose-300 mb-1">
                      <AlertTriangleIcon className="w-4 h-4 text-rose-400" />
                      <span>Learner selected Option B: &quot;EQUAL&quot;</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Reasoning submitted: <em className="text-slate-200">&quot;Both variables have the same letters so == evaluates to true.&quot;</em>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>POST /api/answer submitted</span>
                  <span className="text-indigo-400 font-mono font-bold">Latency: 48ms</span>
                </div>
              </div>

              {/* Right: Cognitive Diagnosis & Smooth Mastery Adjustment (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-slate-950 p-6 flex flex-col justify-between gap-6 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-3">
                    <AwardIcon className="w-4 h-4" />
                    <span>DIAGNOSIS ENGINE RESULT</span>
                  </div>

                  {/* Misconception Card */}
                  <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/30">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        DETECTED: MISCONCEPTION #M1
                      </span>
                      <span className="text-xs font-mono text-amber-400 font-bold">96% Conf.</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">
                      Reference Equality vs Value Equivalence
                    </h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      You assumed <code className="text-amber-300">==</code> checks character sequence equality. In Java, <code className="text-amber-300">==</code> compares object references in memory. Use <code className="text-emerald-300">.equals()</code> for content comparison.
                    </p>
                  </div>

                  {/* Smooth Mastery Transition Node */}
                  <div className="mt-5 p-4 rounded-xl border border-slate-800 bg-slate-900/90">
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-300">Concept Mastery Transition</span>
                      <span
                        style={{
                          color: `hsl(${getHue(demoMastery)}, 85%, 70%)`,
                          transition: "color 0.8s ease",
                        }}
                        className="font-mono font-black text-sm"
                      >
                        {demoMastery}%
                      </span>
                    </div>

                    {/* The Smooth Transition Bar */}
                    <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
                      <div
                        style={{
                          width: `${demoMastery}%`,
                          backgroundColor: `hsl(${getHue(demoMastery)}, 80%, 48%)`,
                          transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.8s ease",
                        }}
                        className="h-full rounded-full shadow-sm"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
                      <span>Prerequisites: Strings &bull; Operators</span>
                      <span className="text-indigo-400">Smooth 800ms Bézier</span>
                    </div>
                  </div>
                </div>

                {/* Spaced Review Scheduler pill */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <ClockIcon className="w-4 h-4 text-indigo-400" />
                    <span>SM-2 Memory Review:</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">Scheduled in 2 Days</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 CORE PRODUCT PILLARS */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              Architecture &amp; Features
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Built for Deep Conceptual Retention
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Every workflow in JavaTutor connects to your cognitive graph, turning momentary confusion into permanent competence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Link
              href="/diagnostic"
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-6 group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
                  <BrainIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-indigo-300 transition-colors">
                  Cognitive Diagnostic
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Adversarial questions probe false beliefs. Requiring one-line reasoning filters out lucky guesses and isolates true bugs in your mental model.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                <span>Launch /diagnostic</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 2 */}
            <Link
              href="/dashboard"
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-purple-500/50 transition-all flex flex-col justify-between gap-6 group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                  <CompassIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-purple-300 transition-colors">
                  Mastery Knowledge DAG
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Interactive 12-concept prerequisite graph rendered with smooth Red-to-Green transitions. Inspect downstream dependencies before advancing.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                <span>Open /dashboard</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 3 */}
            <Link
              href="/practice"
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-6 group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-emerald-300 transition-colors">
                  Targeted Practice
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Dual-pane workspace with syntax-highlighted code and an embedded live graph updating in real time after every single response.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span>Enter /practice</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 4 */}
            <Link
              href="/teacher"
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-6 group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                  <UsersIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-amber-300 transition-colors">
                  Instructor Analytics
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Student-by-concept heatmap matrix with column hover insights and classwide misconception ranking so teachers intervene where it matters.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <span>View /teacher</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* 12-CONCEPT CURRICULUM OVERVIEW */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                Curriculum Structure
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                12 Essential Java Knowledge Modules
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Structured in a strict prerequisite directed acyclic graph (DAG) to ensure durable foundational mastery.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 self-start md:self-auto"
            >
              <span>Explore full DAG interactive view</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {conceptsList.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {c.level}
                    </span>
                    <span className="text-slate-500">{c.id}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm tracking-tight">{c.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Prereq: <span className="text-slate-300">{c.prereqs}</span>
                  </p>
                </div>

                <Link
                  href={`/practice?concept_id=${c.id}`}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-2 border-t border-slate-800/60"
                >
                  <span>Practice this concept</span>
                  <ArrowRightIcon className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-indigo-950/40 p-8 sm:p-14 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center">
              <CoffeeIcon className="w-8 h-8" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight max-w-2xl">
              Ready to uncover your hidden Java misconceptions?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Begin your diagnostic session in under 30 seconds. No credit card, no sign-up wall, just immediate cognitive feedback on your code.
            </p>

            <button
              type="button"
              onClick={() => handleStartSession("/diagnostic")}
              disabled={isStartingSession}
              className="px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 min-h-[56px] cursor-pointer"
            >
              {isStartingSession ? (
                <>
                  <RefreshCwIcon className="w-5 h-5 animate-spin" />
                  <span>Preparing Diagnostic Session...</span>
                </>
              ) : (
                <>
                  <BrainIcon className="w-5 h-5" />
                  <span>Start Free Diagnostic Session</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CoffeeIcon className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-300">JavaTutor Intelligent Tutoring System</span>
            <span>&bull; Java SE 21</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/diagnostic" className="hover:text-slate-300 transition-colors">Diagnostic</Link>
            <Link href="/practice" className="hover:text-slate-300 transition-colors">Practice</Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Mastery Graph</Link>
            <Link href="/teacher" className="hover:text-slate-300 transition-colors">Teacher Analytics</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
