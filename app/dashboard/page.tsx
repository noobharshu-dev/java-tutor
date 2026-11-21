"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { MasteryGraph } from "@/components/mastery-graph";
import { ReviewsDuePanel } from "@/components/reviews-due-panel";
import { GraphSkeleton, ErrorStateCard } from "@/components/loading-skeleton";
import { ArrowRightIcon } from "@/components/icons";
import { Concept, MasteryResponse, ReviewItem } from "@/lib/types";

export default function DashboardPage() {
  const [studentId, setStudentId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("student_id") || "student-1";
    }
    return "student-1";
  });
  const [masteryData, setMasteryData] = useState<MasteryResponse | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [reviewsDueCount, setReviewsDueCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [selectedConceptId, setSelectedConceptId] = useState<string | undefined>(undefined);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const retryFetch = () => {
    setIsLoading(true);
    setFetchTrigger((c) => c + 1);
  };

  // Listen to external auth changes from Navbar
  useEffect(() => {
    const handleAuthEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ studentId: string }>;
      const newId = customEvent.detail?.studentId;
      if (newId) {
        setStudentId(newId);
      }
    };

    window.addEventListener("javatutor-auth-changed", handleAuthEvent);
    return () => window.removeEventListener("javatutor-auth-changed", handleAuthEvent);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [masteryRes, conceptsRes, reviewsRes] = await Promise.all([
          fetch(`/api/mastery?student_id=${studentId}`),
          fetch("/api/concepts"),
          fetch(`/api/reviews?student_id=${studentId}`),
        ]);

        if (masteryRes.ok) {
          const mData: MasteryResponse = await masteryRes.json();
          if (isMounted) setMasteryData(mData);
        } else {
          throw new Error("Failed to fetch mastery data");
        }

        if (conceptsRes.ok) {
          const cData: Concept[] = await conceptsRes.json();
          if (isMounted) setConcepts(cData);
        }

        if (reviewsRes.ok) {
          const rData: ReviewItem[] = await reviewsRes.json();
          if (isMounted && Array.isArray(rData)) {
            const due = rData.filter((r) => r.due_in_days <= 0).length;
            setReviewsDueCount(due);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Dashboard data load error:", err);
          setErrorMsg("Unable to retrieve concept mastery records from /api/mastery.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [studentId, fetchTrigger]);

  // Compute aggregate stats
  const masteryMap = masteryData?.mastery || {};
  const totalConcepts = concepts.length || 12;
  let masteredCount = 0;
  let scoreSum = 0;

  Object.values(masteryMap).forEach((val) => {
    const pct = val <= 1 ? val * 100 : val;
    scoreSum += pct;
    if (pct >= 80) masteredCount++;
  });

  const avgMastery =
    Object.keys(masteryMap).length > 0
      ? Math.round(scoreSum / Object.keys(masteryMap).length)
      : 0;

  // Selected concept details
  const selectedConcept = concepts.find((c) => c.id === selectedConceptId);
  const selectedMastery =
    selectedConceptId && masteryMap[selectedConceptId] !== undefined
      ? masteryMap[selectedConceptId] <= 1
        ? Math.round(masteryMap[selectedConceptId] * 100)
        : Math.round(masteryMap[selectedConceptId])
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-studio-grid text-[#1C1917] font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab="mastery"
        studentId={studentId}
        onSelectStudent={setStudentId}
        dueReviewsCount={reviewsDueCount}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-8 pb-16 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1C1917]">
            Mastery Graph
          </h1>
          <p className="font-sans text-sm text-[#57534E] mt-1.5 leading-relaxed">
            Your live Java prerequisite map—click any node to inspect or practice it.
          </p>
        </div>

        {/* Compact 3-Card KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="studio-card rounded-2xl px-5 py-4">
            <span className="block text-xs font-mono uppercase text-[#78716C] mb-1">
              Average Mastery
            </span>
            <span className="font-mono text-2xl font-semibold text-[#1C1917]">
              {avgMastery}%
            </span>
          </div>

          <div className="studio-card rounded-2xl px-5 py-4">
            <span className="block text-xs font-mono uppercase text-[#78716C] mb-1">
              Mastered Concepts
            </span>
            <span className="font-mono text-2xl font-semibold text-[#1C1917]">
              {masteredCount}{" "}
              <span className="text-xs text-[#78716C] font-normal font-sans">
                / {totalConcepts}
              </span>
            </span>
          </div>

          <div className="studio-card rounded-2xl px-5 py-4">
            <span className="block text-xs font-mono uppercase text-[#78716C] mb-1">
              Reviews Due
            </span>
            <span className="font-mono text-2xl font-semibold text-[#D94F2B]">
              {reviewsDueCount}
            </span>
          </div>
        </div>

        {/* Main 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Node Graph Panel (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="studio-card rounded-2xl overflow-hidden">
              {/* Crisp Sand Legend Header */}
              <div className="bg-[#F2EDE3] border-b border-[#E3DDD1] px-5 py-3 flex items-center justify-between text-xs">
                <span className="font-mono text-xs font-semibold text-[#57534E] uppercase">
                  Prerequisite Network
                </span>

                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="flex items-center gap-1.5 text-[#B53219]">
                    <span className="w-2 h-2 rounded-full bg-[#D94F2B]" />
                    &lt; 40% Gap
                  </span>
                  <span className="flex items-center gap-1.5 text-[#9A5010]">
                    <span className="w-2 h-2 rounded-full bg-[#C87D16]" />
                    40–79% Developing
                  </span>
                  <span className="flex items-center gap-1.5 text-[#0F766E]">
                    <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                    ≥ 80% Mastered
                  </span>
                </div>
              </div>

              {/* React Flow Graph Area */}
              <div className="w-full h-[540px] relative bg-[#FAF7F0]">
                {isLoading ? (
                  <GraphSkeleton />
                ) : errorMsg ? (
                  <div className="w-full h-full flex items-center justify-center p-8 bg-[#FAF7F0]">
                    <ErrorStateCard
                      title="Knowledge Graph Unavailable"
                      message={errorMsg}
                      onRetry={retryFetch}
                    />
                  </div>
                ) : (
                  <MasteryGraph
                    mastery={masteryMap}
                    concepts={concepts}
                    edgesList={masteryData?.edges}
                    highlightedConceptId={selectedConceptId}
                    onSelectConcept={(id) => setSelectedConceptId(id)}
                  />
                )}
              </div>
            </div>

            {/* Selected Node Action Bar if clicked */}
            {selectedConcept && (
              <div className="studio-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up">
                <div>
                  <h4 className="font-sans font-semibold text-[#1C1917] text-sm">
                    {selectedConcept.name}
                  </h4>
                  <span className="text-xs text-[#57534E]">
                    Current Mastery:{" "}
                    <strong className="text-[#0F766E] font-mono font-semibold">
                      {selectedMastery}%
                    </strong>
                  </span>
                </div>

                <Link
                  href={`/practice?concept_id=${selectedConcept.id}`}
                  className="bg-[#D94F2B] hover:bg-[#BE3E1D] text-[#FFFDF9] font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-[0_2px_0_0_#9E3115] active:translate-y-[1px] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Practice Concept</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <ReviewsDuePanel
              studentId={studentId}
              concepts={concepts}
              onSelectConcept={(id) => setSelectedConceptId(id)}
            />

            <div className="studio-card rounded-2xl p-5 space-y-3">
              <h4 className="font-display text-base font-semibold text-[#1C1917]">
                Adaptive Prerequisite Flow
              </h4>
              <p className="font-sans text-xs text-[#57534E] leading-relaxed">
                Concepts are connected by causal dependencies. If downstream operations break,
                JavaTutor backtracks to remediate foundational gaps automatically.
              </p>
              <Link
                href="/diagnostic"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#D94F2B] hover:text-[#BE3E1D] pt-2 border-t border-[#E3DDD1] w-full"
              >
                <span>Run Diagnostic Assessment →</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
