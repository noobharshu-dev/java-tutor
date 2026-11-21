"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthModal, SAMPLE_LEARNERS } from "./auth-modal";

export type ActiveTab = "tutor" | "mastery" | "review" | "teacher";

interface NavbarProps {
  activeTab?: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  studentId?: string;
  onSelectStudent?: (id: string) => void;
  dueReviewsCount?: number;
}

function lookupStudentName(id: string, fallbackName?: string): string {
  const sample = SAMPLE_LEARNERS.find((l) => l.id === id);
  if (sample) return sample.name;
  if (fallbackName && fallbackName !== "Alex Johnson") {
    return fallbackName;
  }
  return id
    .replace(/^student-/, "Learner ")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "ST";
}

export function Navbar({
  activeTab,
  onSelectTab,
  studentId: propStudentId,
  onSelectStudent,
  dueReviewsCount = 0,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [internalStudentId, setInternalStudentId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("student_id") || "student-1";
    }
    return "student-1";
  });
  const [internalStudentName, setInternalStudentName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("student_name");
      if (stored) return stored;
    }
    return "Alex Johnson";
  });

  // Listen to external auth events from AuthModal or other components
  useEffect(() => {
    const handleAuthEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ studentId: string; studentName: string }>;
      const newId = customEvent.detail?.studentId || "";
      const newName = customEvent.detail?.studentName || "";
      setInternalStudentId(newId);
      setInternalStudentName(newName || (newId ? lookupStudentName(newId) : ""));
      if (onSelectStudent && newId) {
        onSelectStudent(newId);
      }
    };

    window.addEventListener("javatutor-auth-changed", handleAuthEvent);
    return () => window.removeEventListener("javatutor-auth-changed", handleAuthEvent);
  }, [onSelectStudent]);

  const currentId = propStudentId !== undefined ? propStudentId : internalStudentId;
  const currentName = currentId ? lookupStudentName(currentId, internalStudentName) : "";

  const handleAuthChange = (newStudentId: string, newStudentName: string) => {
    setInternalStudentId(newStudentId);
    setInternalStudentName(newStudentName);
    if (onSelectStudent && newStudentId) {
      onSelectStudent(newStudentId);
    }
  };

  const navItems = [
    { id: "tutor" as const, label: "Diagnostic", href: "/diagnostic" },
    {
      id: "review" as const,
      label: "Practice",
      href: "/practice",
      badge: dueReviewsCount > 0 ? dueReviewsCount : null,
    },
    { id: "mastery" as const, label: "Mastery", href: "/dashboard" },
    { id: "teacher" as const, label: "Teacher", href: "/teacher" },
  ];

  const isItemActive = (item: (typeof navItems)[0]) => {
    if (activeTab) {
      return activeTab === item.id;
    }
    return pathname === item.href;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#F6F3EC]/85 backdrop-blur-md border-b border-[#E3DDD1] h-16">
        <div className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between gap-4">
          {/* Left Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-[#D94F2B] text-[#FFFDF9] font-mono text-xs font-semibold w-7 h-7 rounded-lg flex items-center justify-center shadow-[0_2px_0_0_#A63518] group-hover:scale-105 transition-transform">
              J/
            </div>
            <span className="font-display text-xl font-semibold text-[#1C1917] tracking-tight">
              JavaTutor
            </span>
          </Link>

          {/* Center Clean Airy Text Navigation (No bulky pill container) */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm">
            {navItems.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onSelectTab?.(item.id)}
                  className={`relative px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                    active
                      ? "bg-[#EAE4D8] text-[#1C1917] font-medium"
                      : "text-[#57534E] hover:text-[#1C1917]"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#D94F2B] text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Account Chip / Auth Button */}
          <div className="flex items-center gap-3">
            {currentId ? (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2.5 bg-[#FFFDF9] hover:bg-[#EFEAE0] border border-[#DDD6C7] rounded-full pl-1.5 pr-3 py-1 text-xs transition-colors cursor-pointer shadow-2xs"
                title="Switch Learner Profile"
              >
                <div className="w-6 h-6 rounded-full bg-[#EAE4D8] text-[#1C1917] font-mono text-[11px] font-semibold flex items-center justify-center border border-[#DDD6C7]">
                  {getInitials(currentName)}
                </div>
                <span className="font-medium text-[#1C1917] max-w-[120px] truncate">
                  {currentName}
                </span>
                <span className="text-[#78716C] text-[10px]">▼</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="text-xs font-medium text-[#57534E] hover:text-[#1C1917] px-2.5 py-1.5 transition-colors cursor-pointer"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAuthChange("student-1", "Alex Johnson");
                    router.push("/diagnostic");
                  }}
                  className="bg-[#1C1917] hover:bg-[#292524] text-[#FFFDF9] text-xs font-medium px-3.5 py-2 rounded-lg transition-all active:translate-y-[1px] shadow-xs cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F6F3EC]/95 backdrop-blur-md border-t border-[#E3DDD1] px-3 py-2 flex items-center justify-around shadow-lg safe-area-inset-bottom">
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => onSelectTab?.(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
                active
                  ? "text-[#D94F2B] font-semibold bg-[#EAE4D8]/60"
                  : "text-[#57534E] hover:text-[#1C1917]"
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="absolute -top-1 right-2 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#D94F2B] text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setIsAuthOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-lg text-xs font-medium text-[#57534E] hover:text-[#1C1917]"
        >
          <span>Account</span>
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentStudentId={currentId}
        onAuthChange={handleAuthChange}
      />
    </>
  );
}
