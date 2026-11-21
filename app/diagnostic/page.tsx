"use client";

import React from "react";
import { Navbar, useSyncedStudentId } from "@/components/navbar";
import { QuestionRunner } from "@/components/question-runner";

export default function DiagnosticPage() {
  const [studentId, setStudentId] = useSyncedStudentId();

  return (
    <div className="min-h-screen flex flex-col bg-studio-grid text-[#1C1917] font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab="tutor"
        studentId={studentId}
        onSelectStudent={setStudentId}
      />

      {/* Main Single-Focus Diagnostic Workspace */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 pt-8 pb-16 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1C1917]">
            Cognitive Diagnostic
          </h1>
          <p className="font-sans text-sm text-[#57534E] mt-1.5 leading-relaxed">
            Answer each snippet and explain your thinking. JavaTutor adapts to repair
            gaps in real time.
          </p>
        </div>

        {/* Question Runner */}
        <QuestionRunner
          key={studentId}
          mode="diagnostic"
          studentId={studentId}
        />
      </main>
    </div>
  );
}
