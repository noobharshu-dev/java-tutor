"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type ActiveTab = "tutor" | "mastery" | "review" | "teacher";

interface NavbarProps {
  activeTab?: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  studentId: string;
  onSelectStudent: (id: string) => void;
  dueReviewsCount?: number;
}

export function Navbar({
  activeTab,
  onSelectTab,
  studentId,
  onSelectStudent,
  dueReviewsCount = 0,
}: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { id: "tutor" as const, label: "Diagnostic", href: "/diagnostic" },
    {
      id: "review" as const,
      label: "Practice",
      href: "/practice",
      badge: dueReviewsCount > 0 ? dueReviewsCount : null,
    },
    { id: "mastery" as const, label: "Mastery Graph", href: "/dashboard" },
    { id: "teacher" as const, label: "Teacher View", href: "/teacher" },
  ];

  const isItemActive = (item: (typeof navItems)[0]) => {
    if (activeTab) {
      return activeTab === item.id;
    }
    return pathname === item.href;
  };

  return (
    <>
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 w-full bg-[#F6F3EC]/85 backdrop-blur-md border-b border-[#DDD6C7]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-[#D94F2B] text-[#FFFDF9] font-mono text-xs font-semibold w-7 h-7 rounded-lg flex items-center justify-center shadow-[0_2px_0_0_#A63518] group-hover:scale-105 transition-transform">
              J/
            </div>
            <span className="font-display text-xl font-semibold tracking-tight text-[#1C1917]">
              JavaTutor
            </span>
          </Link>

          {/* Center Floating Segmented Pill Nav */}
          <nav className="hidden md:flex items-center gap-0.5 bg-[#EAE4D8]/80 p-1 rounded-full border border-[#DDD6C7]">
            {navItems.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onSelectTab?.(item.id)}
                  className={`relative rounded-full px-3.5 py-1.5 text-sm transition-colors flex items-center gap-1.5 ${
                    active
                      ? "bg-[#FFFDF9] text-[#1C1917] font-medium shadow-xs"
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

          {/* Right Action: Student Switcher & Direct CTA */}
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="student-select"
              className="text-xs text-[#78716C] font-mono hidden sm:inline-block"
            >
              ID:
            </label>
            <select
              id="student-select"
              value={studentId}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="bg-[#FFFDF9] border border-[#DDD6C7] text-[#1C1917] text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#D94F2B] cursor-pointer"
            >
              <option value="student-1">Alex Johnson (student-1)</option>
              <option value="student-2">Maya Lin (student-2)</option>
              <option value="student-3">Carlos Diaz (student-3)</option>
            </select>
            <Link
              href="/diagnostic"
              className="hidden sm:inline-flex items-center bg-[#1C1917] hover:bg-[#292524] text-[#FFFDF9] text-xs font-medium px-3.5 py-2 rounded-lg transition-all active:translate-y-[1px]"
            >
              Start Diagnostic
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F6F3EC]/95 backdrop-blur-md border-t border-[#DDD6C7] px-3 py-2 flex items-center justify-around shadow-lg safe-area-inset-bottom">
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
      </div>
    </>
  );
}
