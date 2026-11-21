"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PlumbHeader() {
  const pathname = usePathname();
  const [studentId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("student_id") || "student-1";
    }
    return "student-1";
  });

  const isTerrain = pathname === "/" || pathname === "/dashboard";
  const isPractice = pathname === "/practice";
  const isClass = pathname === "/teacher";
  const isDiagnostic = pathname === "/diagnostic";

  return (
    <header className="plumb-header">
      <Link href="/" className="brand" aria-label="Plumb home">
        <svg viewBox="0 0 22 30" aria-hidden="true">
          <path d="M11 0v20" stroke="#1D2A24" strokeWidth="1.4" fill="none" />
          <path d="M11 20 L2 28 M11 20 L20 28" stroke="#24513F" strokeWidth="0" />
          <ellipse cx="11" cy="23" rx="7" ry="8" fill="#24513F" />
          <circle cx="11" cy="23" r="2.2" fill="#EFE7D6" />
        </svg>
        <span>Plumb</span>
      </Link>

      <nav className="plumb-nav" role="tablist" aria-label="Views">
        <Link
          href="/"
          role="tab"
          aria-selected={isTerrain}
          className={isTerrain ? "active" : ""}
        >
          Terrain
        </Link>
        <Link
          href="/practice"
          role="tab"
          aria-selected={isPractice}
          className={isPractice ? "active" : ""}
        >
          Practice
        </Link>
        <Link
          href="/teacher"
          role="tab"
          aria-selected={isClass}
          className={isClass ? "active" : ""}
        >
          Class
        </Link>
        <Link
          href="/diagnostic"
          role="tab"
          aria-selected={isDiagnostic}
          className={isDiagnostic ? "active" : ""}
        >
          Diagnostic
        </Link>
      </nav>

      <div className="who">
        <span className="small">
          {studentId === "student-2"
            ? "Maya Lin · Class 10"
            : studentId === "student-3"
            ? "Carlos Diaz · Class 10"
            : "Aanya Rao · Class 10 Physics"}
        </span>
        <div className="seal" aria-hidden="true">
          {studentId === "student-2" ? "M" : studentId === "student-3" ? "C" : "A"}
        </div>
      </div>
    </header>
  );
}
