"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CoffeeIcon,
  UsersIcon,
  BrainIcon,
  AlertTriangleIcon,
  CompassIcon,
  SparklesIcon,
  SearchIcon,
  AwardIcon,
} from "@/components/icons";
import { Concept, TeacherResponse } from "@/lib/types";
import { TableSkeleton } from "@/components/loading-skeleton";

export default function TeacherPage() {
  const [teacherData, setTeacherData] = useState<TeacherResponse | null>(null);
  const [conceptsList, setConceptsList] = useState<Concept[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [hoveredHeader, setHoveredHeader] = useState<{
    index: number;
    name: string;
    id: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [teacherRes, conceptsRes] = await Promise.all([
          fetch("/api/teacher/class"),
          fetch("/api/concepts"),
        ]);

        if (teacherRes.ok) {
          const tData: TeacherResponse = await teacherRes.json();
          if (isMounted) setTeacherData(tData);
        } else {
          // Fallback to /api/teacher if /api/teacher/class not available
          const fallbackRes = await fetch("/api/teacher");
          if (fallbackRes.ok) {
            const fbData: TeacherResponse = await fallbackRes.json();
            if (isMounted) setTeacherData(fbData);
          }
        }

        if (conceptsRes.ok) {
          const cData: Concept[] = await conceptsRes.json();
          if (isMounted) setConceptsList(cData);
        }
      } catch (err) {
        console.error("Failed to load teacher class data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const toPercent = (val: number | undefined): number => {
    if (val === undefined || isNaN(val)) return 0;
    return val <= 1 ? Math.round(val * 100) : Math.round(val);
  };

  // Helper to map column key to student's mastery score
  const getScore = (
    mastery: Record<string, number>,
    conceptNameOrId: string
  ): number => {
    if (mastery[conceptNameOrId] !== undefined) {
      return toPercent(mastery[conceptNameOrId]);
    }
    // Match by concept name
    const found = conceptsList.find(
      (c) =>
        c.name.toLowerCase() === conceptNameOrId.toLowerCase() ||
        c.id.toLowerCase() === conceptNameOrId.toLowerCase()
    );
    if (found && mastery[found.id] !== undefined) {
      return toPercent(mastery[found.id]);
    }
    return 0;
  };

  const getConceptId = (conceptName: string): string => {
    const found = conceptsList.find(
      (c) => c.name.toLowerCase() === conceptName.toLowerCase() || c.id === conceptName
    );
    return found ? found.id : conceptName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  };

  // Calculate stats
  const students = teacherData?.students || [];
  const concepts = teacherData?.concepts || [];
  const topMisconceptions = teacherData?.top_misconceptions || [];

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  let totalScoreSum = 0;
  let totalDataPoints = 0;
  const conceptAverages: Record<string, number> = {};

  concepts.forEach((c) => {
    let cSum = 0;
    students.forEach((s) => {
      const score = getScore(s.mastery, c);
      cSum += score;
      totalScoreSum += score;
      totalDataPoints++;
    });
    conceptAverages[c] = students.length > 0 ? Math.round(cSum / students.length) : 0;
  });

  const classAvgMastery =
    totalDataPoints > 0 ? Math.round(totalScoreSum / totalDataPoints) : 0;

  // Short labels for table columns
  const getShortName = (name: string): string => {
    if (name.includes("Variables")) return "Variables";
    if (name.includes("Operators")) return "Operators";
    if (name.includes("String Basics")) return "Strings";
    if (name.includes("String Equality")) return "Str ==";
    if (name.includes("Conditionals")) return "Conditionals";
    if (name.includes("Loops")) return "Loops";
    if (name.includes("Arrays")) return "Arrays";
    if (name.includes("Methods")) return "Methods";
    if (name.includes("Classes")) return "Classes";
    if (name.includes("References")) return "References";
    if (name.includes("Static")) return "Static";
    if (name.includes("Inheritance")) return "Inheritance";
    return name.slice(0, 10);
  };

  // Heatmap cell color generator
  const getCellColor = (score: number) => {
    const hue = Math.round((score / 100) * 135); // 0 (Red) -> 45 (Yellow) -> 135 (Green)
    return {
      backgroundColor: `hsla(${hue}, 75%, 15%, 0.85)`,
      borderColor: `hsla(${hue}, 80%, 42%, 0.6)`,
      color: `hsl(${hue}, 85%, 85%)`,
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <CoffeeIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">
                  JavaTutor
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  Teacher View
                </span>
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2 text-xs">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <CompassIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/practice"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Practice</span>
            </Link>
            <Link
              href="/diagnostic"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <BrainIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Diagnostic</span>
            </Link>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Banner with Cohort Summary */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UsersIcon className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Classroom Diagnostics &bull; /api/teacher/class
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cohort Heatmap &amp; Diagnostic Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Real-time concept mastery across enrolled students. Pinpoint students needing intervention
              and review classwide cognitive misconceptions.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Cohort
              </span>
              <span className="text-2xl font-black font-mono text-white">
                {students.length} <span className="text-xs text-slate-500 font-normal">Learners</span>
              </span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Class Mastery
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {classAvgMastery}%
              </span>
            </div>
          </div>
        </div>

        {/* TOP CLASS MISCONCEPTIONS CARD LIST */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Top Class Misconceptions
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              From /api/teacher/class
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topMisconceptions.map((item, idx) => (
              <div
                key={item.id}
                className="relative p-5 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-b from-amber-950/25 to-slate-900/90 shadow-xl flex flex-col justify-between gap-3 group hover:border-amber-500/50 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Rank #{idx + 1} &bull; [{item.id}]
                    </span>
                    <span className="text-2xl font-black font-mono text-amber-400">
                      {item.percent}%
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base tracking-tight leading-snug group-hover:text-amber-200 transition-colors">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Affecting {item.percent}% of enrolled learners. Target this pitfall during lecture
                    or diagnostic reviews.
                  </p>
                </div>

                {/* Prevalence Bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden mt-1 border border-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                    style={{ width: `${Math.max(6, item.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HEATMAP GRID: Rows = Students, Columns = Concepts */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Student Mastery Heatmap Grid
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Hover over any column header to view the full concept name and class average.
              </p>
            </div>

            {/* Search Student Filter */}
            <div className="relative w-full sm:w-72">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student name..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-800 bg-slate-950/90 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Column Header Hover Floating Banner (when hovering on a column) */}
          {hoveredHeader && (
            <div className="p-3.5 rounded-2xl border border-indigo-500/40 bg-indigo-950/40 text-xs text-indigo-200 flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <AwardIcon className="w-4 h-4 text-indigo-400" />
                <span>
                  Column Focus: <strong className="text-white text-sm">{hoveredHeader.name}</strong> ({hoveredHeader.id})
                </span>
              </div>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold">
                Cohort Average: {conceptAverages[hoveredHeader.name] ?? 0}%
              </span>
            </div>
          )}

          {/* Heatmap Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-inner">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <th className="p-3.5 sticky left-0 bg-slate-950 z-20 whitespace-nowrap min-w-[150px] border-r border-slate-800">
                      Student ({filteredStudents.length})
                    </th>
                    <th className="p-3.5 text-center whitespace-nowrap bg-slate-950 border-r border-slate-800/80">
                      Overall
                    </th>

                    {/* Columns = Concepts with HOVER SHOWING FULL CONCEPT NAME */}
                    {concepts.map((cName, idx) => {
                      const cId = getConceptId(cName);
                      const isHovered = hoveredHeader?.index === idx;

                      return (
                        <th
                          key={cName}
                          onMouseEnter={() => setHoveredHeader({ index: idx, name: cName, id: cId })}
                          onMouseLeave={() => setHoveredHeader(null)}
                          className={`p-3 text-center whitespace-nowrap cursor-pointer transition-colors relative border-r border-slate-800/60 ${
                            isHovered
                              ? "bg-indigo-950/80 text-indigo-200 ring-2 ring-indigo-500 ring-inset"
                              : "hover:bg-slate-900 text-slate-300"
                          }`}
                          title={`Click to focus: ${cName}`}
                        >
                          <span className="font-mono text-[11px] block">
                            {getShortName(cName)}
                          </span>
                          <span className="text-[10px] font-normal text-slate-500 block font-mono">
                            {conceptAverages[cName] ?? 0}%
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredStudents.map((student) => {
                    const studentScores = concepts.map((c) => getScore(student.mastery, c));
                    const studentAvg =
                      studentScores.length > 0
                        ? Math.round(studentScores.reduce((a, b) => a + b, 0) / studentScores.length)
                        : 0;

                    return (
                      <tr
                        key={student.name}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Student Name Sticky Column */}
                        <td className="p-3.5 sticky left-0 bg-slate-900/95 font-semibold text-white whitespace-nowrap z-10 border-r border-slate-800 font-sans">
                          {student.name}
                        </td>

                        {/* Overall Average */}
                        <td className="p-3 text-center font-bold border-r border-slate-800/80">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                              studentAvg >= 70
                                ? "bg-emerald-500/20 text-emerald-300"
                                : studentAvg >= 45
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {studentAvg}%
                          </span>
                        </td>

                        {/* Cells = Concepts colored by mastery */}
                        {concepts.map((cName, cIdx) => {
                          const score = getScore(student.mastery, cName);
                          const isColHovered = hoveredHeader?.index === cIdx;
                          const cellStyle = getCellColor(score);

                          return (
                            <td
                              key={cName}
                              style={cellStyle}
                              className={`p-2.5 text-center font-bold text-[11px] border border-slate-800/40 transition-all ${
                                isColHovered ? "ring-2 ring-indigo-400 ring-inset scale-[1.02] z-10" : ""
                              }`}
                              title={`${student.name} • ${cName}: ${score}%`}
                            >
                              {score}%
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
