"use client";

import React, { useState } from "react";
import { Concept, TeacherResponse } from "@/lib/types";
import {
  UsersIcon,
  BarChart3Icon,
  AlertTriangleIcon,
  SearchIcon,
  BrainIcon,
  AwardIcon,
} from "./icons";

interface TeacherViewProps {
  teacherData: TeacherResponse | null;
  conceptsList?: Concept[];
}

export function TeacherView({ teacherData, conceptsList = [] }: TeacherViewProps) {
  const [studentSearch, setStudentSearch] = useState("");

  if (!teacherData) {
    return (
      <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-400">
        <BarChart3Icon className="w-8 h-8 text-indigo-400 animate-pulse mx-auto mb-3" />
        <p className="font-semibold text-white">Loading Teacher Analytics...</p>
        <p className="text-xs text-slate-500 mt-1">Calling /api/teacher</p>
      </div>
    );
  }

  const { concepts, students, top_misconceptions } = teacherData;

  const toPercent = (val: number | undefined): number => {
    if (val === undefined || isNaN(val)) return 0;
    return val <= 1 ? Math.round(val * 100) : Math.round(val);
  };

  // Helper to map either concept name or ID to student mastery key
  const getStudentScore = (mastery: Record<string, number>, conceptKey: string): number => {
    if (mastery[conceptKey] !== undefined) {
      return toPercent(mastery[conceptKey]);
    }
    // Try matching concept by name in conceptsList
    const matched = conceptsList.find(
      (c) => c.name.toLowerCase() === conceptKey.toLowerCase() || c.id === conceptKey
    );
    if (matched && mastery[matched.id] !== undefined) {
      return toPercent(mastery[matched.id]);
    }
    return 0;
  };

  // Aggregate stats
  const totalStudents = students.length;
  let totalScoreSum = 0;
  let totalDataPoints = 0;

  students.forEach((s) => {
    Object.values(s.mastery).forEach((score) => {
      totalScoreSum += toPercent(score);
      totalDataPoints++;
    });
  });

  const classAvgMastery =
    totalDataPoints > 0 ? Math.round(totalScoreSum / totalDataPoints) : 0;

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Enrolled Students
            </span>
            <UsersIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">
              {totalStudents}
            </span>
            <span className="text-xs text-indigo-400 font-medium">Cohort A</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Live cognitive diagnostics active</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Class Average Mastery
            </span>
            <AwardIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono">
              {classAvgMastery}%
            </span>
            <span className="text-xs text-slate-400">across concepts</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${classAvgMastery}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              High-Risk Misconceptions
            </span>
            <AlertTriangleIcon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-400 font-mono">
              {top_misconceptions.length}
            </span>
            <span className="text-xs text-amber-400/80">Identified in cohort</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Requires targeted classroom review</p>
        </div>
      </div>

      {/* Top Misconceptions Leaderboard */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BrainIcon className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Classwide Misconception Diagnostic
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
            Ranked by % of Students Affected
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          The table below highlights conceptual stumbling blocks detected across all student responses.
          These represent persistent mental model flaws rather than careless mistakes.
        </p>

        <div className="space-y-4">
          {top_misconceptions.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md bg-slate-800 font-mono text-xs font-bold text-slate-300">
                  #{idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      [{item.id}]
                    </span>
                    <h4 className="font-semibold text-white text-sm">
                      {item.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Commonly observed during option selection &amp; reasoning analysis.
                  </p>
                </div>
              </div>

              {/* Percentage bar */}
              <div className="w-full sm:w-64 flex flex-col gap-1.5 flex-shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Prevalence</span>
                  <span className="font-mono font-bold text-amber-400">
                    {item.percent}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Mastery Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Student Concept Mastery Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual student competency across foundational and advanced Java concepts.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search student name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-800 bg-slate-950/80 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <th className="p-3.5 sticky left-0 bg-slate-950 z-10 whitespace-nowrap min-w-[140px]">
                  Student
                </th>
                <th className="p-3.5 whitespace-nowrap text-center">
                  Overall
                </th>
                {concepts.map((c) => (
                  <th
                    key={c}
                    className="p-3.5 whitespace-nowrap text-center font-mono max-w-[120px] truncate"
                    title={c}
                  >
                    {c.replace("-", " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredStudents.map((student) => {
                const scores = Object.values(student.mastery).map((s) => toPercent(s));
                const avg =
                  scores.length > 0
                    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                    : 0;

                return (
                  <tr
                    key={student.name}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5 sticky left-0 bg-slate-900/95 font-semibold text-white whitespace-nowrap z-10 border-r border-slate-800">
                      {student.name}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          avg >= 80
                            ? "bg-emerald-500/20 text-emerald-300"
                            : avg >= 50
                            ? "bg-indigo-500/20 text-indigo-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {avg}%
                      </span>
                    </td>
                    {concepts.map((conceptKey) => {
                      const score = getStudentScore(student.mastery, conceptKey);
                      return (
                        <td
                          key={conceptKey}
                          className="p-3.5 text-center font-mono whitespace-nowrap"
                        >
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                              score >= 80
                                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-900"
                                : score >= 50
                                ? "bg-indigo-950/60 text-indigo-300 border border-indigo-900"
                                : score >= 25
                                ? "bg-amber-950/60 text-amber-300 border border-amber-900"
                                : "bg-slate-950 text-slate-500 border border-slate-800"
                            }`}
                          >
                            {score}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
