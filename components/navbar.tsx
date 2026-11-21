"use client";

import React from "react";
import Link from "next/link";
import {
  CoffeeIcon,
  BrainIcon,
  CompassIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon,
} from "./icons";

export type ActiveTab = "tutor" | "mastery" | "review" | "teacher";

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  studentId: string;
  onSelectStudent: (id: string) => void;
  dueReviewsCount: number;
}

export function Navbar({
  activeTab,
  onSelectTab,
  studentId,
  onSelectStudent,
  dueReviewsCount,
}: NavbarProps) {
  const tabs = [
    {
      id: "tutor" as const,
      label: "Diagnostic Tutor",
      shortLabel: "Tutor",
      icon: BrainIcon,
    },
    {
      id: "mastery" as const,
      label: "Mastery Graph",
      shortLabel: "Mastery",
      icon: CompassIcon,
    },
    {
      id: "review" as const,
      label: "Spaced Review",
      shortLabel: "Review",
      icon: ClockIcon,
      badge: dueReviewsCount > 0 ? dueReviewsCount : null,
    },
    {
      id: "teacher" as const,
      label: "Teacher Analytics",
      shortLabel: "Teacher",
      icon: UsersIcon,
    },
  ];

  return (
    <>
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <CoffeeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">
                  JavaTutor
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ITS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Adaptive Misconception Diagnostic System
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-2">
            <nav className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Direct Page Links */}
            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 transition-colors flex items-center gap-1.5"
              >
                <CompassIcon className="w-3.5 h-3.5" />
                <span>/dashboard</span>
              </Link>
              <Link
                href="/diagnostic"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/60 transition-colors flex items-center gap-1.5"
              >
                <BrainIcon className="w-3.5 h-3.5" />
                <span>/diagnostic</span>
              </Link>
              <Link
                href="/practice"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 transition-colors flex items-center gap-1.5"
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>/practice</span>
              </Link>
            </div>
          </div>

          {/* Student Selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="student-select"
              className="text-xs text-slate-400 hidden sm:inline-block font-medium"
            >
              Learner:
            </label>
            <select
              id="student-select"
              value={studentId}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-800 bg-slate-900 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors min-h-[36px]"
            >
              <option value="student-1">Alex Johnson (student-1)</option>
              <option value="student-2">Maya Lin (student-2)</option>
              <option value="student-3">Carlos Diaz (student-3)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-inset-bottom">
        <Link
          href="/diagnostic"
          className="flex flex-col items-center justify-center flex-1 py-1 rounded-lg text-[10px] font-semibold text-indigo-400"
        >
          <BrainIcon className="w-5 h-5 mb-0.5" />
          <span>Diagnostic</span>
        </Link>
        <Link
          href="/practice"
          className="flex flex-col items-center justify-center flex-1 py-1 rounded-lg text-[10px] font-semibold text-emerald-400"
        >
          <SparklesIcon className="w-5 h-5 mb-0.5" />
          <span>Practice</span>
        </Link>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg text-[10px] font-semibold transition-colors min-h-[44px] ${
                isActive ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-slate-950">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span>{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
