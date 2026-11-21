"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface SampleLearner {
  id: string;
  name: string;
  initials: string;
  description: string;
}

export const SAMPLE_LEARNERS: SampleLearner[] = [
  {
    id: "student-1",
    name: "Alex Johnson",
    initials: "AJ",
    description: "Beginner · Focuses on string equality M1",
  },
  {
    id: "student-2",
    name: "Maya Lin",
    initials: "ML",
    description: "Intermediate · 8 concepts diagnosed",
  },
  {
    id: "student-3",
    name: "Carlos Diaz",
    initials: "CD",
    description: "Advanced · Review schedule active",
  },
];

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudentId?: string;
  onAuthChange?: (studentId: string, studentName: string) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  currentStudentId,
  onAuthChange,
}: AuthModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"student" | "instructor">("student");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const notifyAuthChange = (studentId: string, studentName: string, role: string) => {
    try {
      if (studentId) {
        localStorage.setItem("student_id", studentId);
        localStorage.setItem("student_name", studentName);
        localStorage.setItem("role", role);
      } else {
        localStorage.removeItem("student_id");
        localStorage.removeItem("student_name");
        localStorage.removeItem("role");
      }
    } catch {
      // ignore localStorage quota/disabled errors
    }

    onAuthChange?.(studentId, studentName);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("javatutor-auth-changed", {
          detail: { studentId, studentName, role },
        })
      );
    }
  };

  const syncBackendSession = async (studentId: string) => {
    try {
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      });
    } catch {
      // Non-blocking fallback
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const trimmedName = fullName.trim();
    const studentId = trimmedName
      ? trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `student-${Date.now().toString().slice(-4)}`
      : "student-1";
    const displayName = trimmedName || "Alex Johnson";

    await syncBackendSession(studentId);
    notifyAuthChange(studentId, displayName, "student");
    setIsSubmitting(false);
    onClose();
  };

  const handleSelectSample = async (learner: SampleLearner) => {
    await syncBackendSession(learner.id);
    notifyAuthChange(learner.id, learner.name, "student");
    onClose();
  };

  const handleInstructorLogin = () => {
    notifyAuthChange("instructor", "Instructor", "teacher");
    onClose();
    router.push("/teacher");
  };

  const handleSignOut = () => {
    notifyAuthChange("", "", "");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/35 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="studio-card rounded-2xl max-w-md w-full p-6 relative animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Close Button */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DDD6C7]">
          <h2
            id="auth-modal-title"
            className="font-display text-xl font-semibold text-[#1C1917]"
          >
            {currentStudentId ? "Account & Profiles" : "Sign In to JavaTutor"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#EFEAE0] flex items-center justify-center transition-colors cursor-pointer text-sm font-mono"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Segmented Role Switcher */}
        <div className="bg-[#EAE4D8]/80 p-1 rounded-full border border-[#DDD6C7] flex items-center gap-1 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("student")}
            className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer text-center ${
              activeTab === "student"
                ? "bg-[#FFFDF9] text-[#1C1917] shadow-xs"
                : "text-[#57534E] hover:text-[#1C1917]"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("instructor")}
            className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer text-center ${
              activeTab === "instructor"
                ? "bg-[#FFFDF9] text-[#1C1917] shadow-xs"
                : "text-[#57534E] hover:text-[#1C1917]"
            }`}
          >
            Instructor
          </button>
        </div>

        {/* Tab 1: Student Tab */}
        {activeTab === "student" && (
          <div className="space-y-4">
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label
                  htmlFor="auth-fullname"
                  className="block text-xs font-medium text-[#57534E] mb-1"
                >
                  Full Name
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full bg-[#FFFDF9] border border-[#DDD6C7] text-[#1C1917] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#D94F2B] placeholder:text-[#A8A29E]"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-medium text-[#57534E] mb-1"
                >
                  Email Address <span className="text-[#A8A29E]">(optional)</span>
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@example.edu"
                  className="w-full bg-[#FFFDF9] border border-[#DDD6C7] text-[#1C1917] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#D94F2B] placeholder:text-[#A8A29E]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D94F2B] hover:bg-[#BE3E1D] text-[#FFFDF9] font-medium py-2.5 px-4 rounded-xl shadow-[0_2px_0_0_#9E3115] active:translate-y-[1px] text-sm transition-all cursor-pointer mt-1"
              >
                {isSubmitting ? "Connecting..." : "Continue as Student"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#DDD6C7]" />
              </div>
              <span className="relative bg-[#FFFDF9] px-2.5 text-[11px] text-[#78716C] font-mono uppercase tracking-wider">
                or continue with a sample learner
              </span>
            </div>

            {/* 3 Clickable Sample Learner Rows */}
            <div className="space-y-2">
              {SAMPLE_LEARNERS.map((learner) => {
                const isCurrent = currentStudentId === learner.id;
                return (
                  <button
                    key={learner.id}
                    type="button"
                    onClick={() => handleSelectSample(learner)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isCurrent
                        ? "border-[#D94F2B] bg-[#FFFDF9] shadow-xs"
                        : "border-[#DDD6C7] bg-[#F6F3EC] hover:bg-[#EFEAE0]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#EAE4D8] text-[#1C1917] font-mono text-xs font-semibold flex items-center justify-center border border-[#DDD6C7] flex-shrink-0">
                        {learner.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#1C1917] truncate">
                          {learner.name}
                        </div>
                        <div className="text-xs text-[#78716C] truncate">
                          {learner.description}
                        </div>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-mono font-medium text-[#D94F2B] bg-[#FCECE8] px-2 py-0.5 rounded border border-[#F2C0B5] flex-shrink-0">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Instructor Tab */}
        {activeTab === "instructor" && (
          <div className="space-y-4 pt-1">
            <p className="text-sm text-[#57534E] leading-relaxed">
              Inspect class-wide mastery heatmaps and top cognitive misconceptions across all enrolled students.
            </p>
            <button
              type="button"
              onClick={handleInstructorLogin}
              className="w-full bg-[#1C1917] hover:bg-[#292524] text-[#FFFDF9] font-medium py-2.5 px-4 rounded-xl shadow-[0_2px_0_0_#0C0A09] active:translate-y-[1px] text-sm transition-all cursor-pointer"
            >
              Sign in as Instructor →
            </button>
          </div>
        )}

        {/* Sign Out Option (if signed in) */}
        {currentStudentId && (
          <div className="pt-3 mt-4 border-t border-[#DDD6C7] text-center">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs text-[#78716C] hover:text-[#C23B22] font-mono transition-colors cursor-pointer"
            >
              Sign out of current account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
