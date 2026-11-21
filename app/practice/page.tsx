"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { QuestionRunner } from "@/components/question-runner";
import { MasteryGraph } from "@/components/mastery-graph";
import { GraphSkeleton } from "@/components/loading-skeleton";
import { Concept, MasteryResponse } from "@/lib/types";

export default function PracticePage() {
  const [studentId, setStudentId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("student_id") || "student-1";
    }
    return "student-1";
  });
  const [masteryData, setMasteryData] = useState<MasteryResponse | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [currentConceptId, setCurrentConceptId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cid = params.get("concept_id");
      if (cid) return cid;
    }
    return "string-equality";
  });
  const [isLoading, setIsLoading] = useState(true);

  // Listen to external auth changes
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

  // Fetch mastery and concepts
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const [mRes, cRes] = await Promise.all([
          fetch(`/api/mastery?student_id=${studentId}`),
          fetch("/api/concepts"),
        ]);

        if (mRes.ok) {
          const m: MasteryResponse = await mRes.json();
          if (isMounted) setMasteryData(m);
        }
        if (cRes.ok) {
          const c: Concept[] = await cRes.json();
          if (isMounted) setConcepts(c);
        }
      } catch (err) {
        console.error("Error loading practice mastery:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void init();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const handleMasteryUpdate = (newMastery: Record<string, number>) => {
    setMasteryData((prev) =>
      prev ? { ...prev, mastery: newMastery } : { mastery: newMastery, edges: [] }
    );
  };

  const masteryMap = masteryData?.mastery || {};
  const currentScore =
    masteryMap[currentConceptId] !== undefined
      ? masteryMap[currentConceptId] <= 1
        ? Math.round(masteryMap[currentConceptId] * 100)
        : Math.round(masteryMap[currentConceptId])
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-studio-grid text-[#1C1917] font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab="review"
        studentId={studentId}
        onSelectStudent={setStudentId}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-8 pb-16 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1C1917]">
            Targeted Practice
          </h1>
          <p className="font-sans text-sm text-[#57534E] mt-1.5 leading-relaxed">
            Click any concept node on the left to drill that specific skill.
          </p>
        </div>

        {/* 12-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Compact Mastery Graph (5 cols) */}
          <div className="lg:col-span-5 studio-card rounded-2xl overflow-hidden lg:sticky lg:top-24">
            <div className="bg-[#F2EDE3] border-b border-[#E3DDD1] px-5 py-3 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-semibold uppercase text-[#57534E] block">
                  Target: {currentConceptId}
                </span>
              </div>
              {currentScore !== null && (
                <span className="font-mono text-xs font-bold text-[#0F766E] bg-[#E6F4F1] border border-[#B2DDD5] px-2 py-0.5 rounded-full">
                  {currentScore}% Mastery
                </span>
              )}
            </div>

            <div className="w-full h-[520px] relative bg-[#FAF7F0]">
              {isLoading ? (
                <GraphSkeleton />
              ) : (
                <MasteryGraph
                  mastery={masteryMap}
                  concepts={concepts}
                  edgesList={masteryData?.edges}
                  highlightedConceptId={currentConceptId}
                  compact={true}
                  onSelectConcept={setCurrentConceptId}
                />
              )}
            </div>

            <div className="p-3 bg-[#FAF7F0] border-t border-[#E3DDD1] text-[11px] font-mono text-[#78716C] flex items-center justify-between">
              <span>Click node to switch target</span>
              <span>12 Concepts</span>
            </div>
          </div>

          {/* Right Column: Question Runner (7 cols) */}
          <div className="lg:col-span-7">
            <QuestionRunner
              key={`${studentId}-${currentConceptId}`}
              mode="practice"
              studentId={studentId}
              conceptId={currentConceptId}
              onMasteryChange={handleMasteryUpdate}
              onCurrentConceptChange={setCurrentConceptId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
