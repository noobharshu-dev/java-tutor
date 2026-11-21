"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Concept, TeacherResponse } from "@/lib/types";
import { TableSkeleton } from "@/components/loading-skeleton";

export default function TeacherPage() {
  const [teacherData, setTeacherData] = useState<TeacherResponse | null>(null);
  const [conceptsList, setConceptsList] = useState<Concept[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");

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

  const getScore = (
    mastery: Record<string, number>,
    conceptNameOrId: string
  ): number => {
    if (mastery[conceptNameOrId] !== undefined) {
      return toPercent(mastery[conceptNameOrId]);
    }
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

  const students = teacherData?.students || [];
  const concepts = teacherData?.concepts || [];
  const topMisconceptions = teacherData?.top_misconceptions || [];

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const conceptAverages: Record<string, number> = {};
  concepts.forEach((c) => {
    let cSum = 0;
    students.forEach((s) => {
      cSum += getScore(s.mastery, c);
    });
    conceptAverages[c] = students.length > 0 ? Math.round(cSum / students.length) : 0;
  });

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

  return (
    <div className="min-h-screen flex flex-col bg-studio-grid text-[#1C1917] font-sans">
      {/* Top Navbar */}
      <Navbar activeTab="teacher" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-8 pb-16 space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1C1917]">
            Teacher Misconception Radar
          </h1>
          <p className="font-sans text-sm text-[#57534E] mt-1.5 leading-relaxed">
            Class-wide mastery heatmap and the highest-impact cognitive traps across your cohort.
          </p>
        </div>

        {/* Top Section — Top 3 Class Misconceptions */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-[#1C1917]">
            Top Cognitive Bottlenecks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topMisconceptions.slice(0, 3).map((misc) => (
              <div
                key={misc.id}
                className="studio-card rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-[#FCECE8] text-[#B53219] px-2 py-0.5 rounded border border-[#F2C0B5]">
                    {misc.id}
                  </span>
                  <span className="font-mono text-[11px] text-[#78716C] bg-[#F2EDE3] px-2 py-0.5 rounded">
                    High impact
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-3xl font-semibold text-[#C23B22]">
                      {misc.percent}%
                    </span>
                    <span className="text-xs text-[#78716C]">of students affected</span>
                  </div>
                  <h3 className="font-sans text-sm font-semibold text-[#1C1917] mt-1 line-clamp-2">
                    {misc.name}
                  </h3>
                </div>

                <div className="w-full bg-[#F2EDE3] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D94F2B] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, misc.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section — 20-Student Mastery Heatmap */}
        <div className="studio-card rounded-2xl overflow-hidden">
          {/* Top Toolbar */}
          <div className="bg-[#F2EDE3] border-b border-[#E3DDD1] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-[#1C1917]">
                Cohort Mastery Matrix
              </h2>
              <span className="font-mono text-xs text-[#78716C]">
                {students.length} Enrolled Students
              </span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search student..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="bg-[#FFFDF9] border border-[#DDD6C7] rounded-lg px-3 py-1.5 text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#D94F2B]"
              />

              <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-[#78716C]">
                <span className="flex items-center gap-1 text-[#B53219]">
                  <span className="w-2 h-2 rounded-full bg-[#D94F2B]" />
                  &lt; 40%
                </span>
                <span className="flex items-center gap-1 text-[#9A5010]">
                  <span className="w-2 h-2 rounded-full bg-[#C87D16]" />
                  40–79%
                </span>
                <span className="flex items-center gap-1 text-[#0F766E]">
                  <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                  ≥ 80%
                </span>
              </div>
            </div>
          </div>

          {/* Horizontally scrollable light table */}
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-x-auto bg-[#FFFDF9]">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-[#E3DDD1] text-[#57534E] font-mono text-[11px] uppercase">
                    <th className="sticky left-0 bg-[#FAF7F0] z-10 px-4 py-3 min-w-[160px] font-semibold border-r border-[#E3DDD1]">
                      Student
                    </th>
                    {concepts.map((c) => (
                      <th
                        key={c}
                        className="px-3 py-3 text-center min-w-[80px] font-semibold"
                        title={c}
                      >
                        <div>{getShortName(c)}</div>
                        <div className="text-[10px] text-[#78716C] font-normal lowercase">
                          avg: {conceptAverages[c] || 0}%
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EFEAE0]">
                  {filteredStudents.map((s) => (
                    <tr
                      key={s.name}
                      className="hover:bg-[#FAF7F0] transition-colors"
                    >
                      <td className="sticky left-0 bg-[#FFFDF9] hover:bg-[#FAF7F0] z-10 px-4 py-2.5 font-sans text-xs font-medium text-[#1C1917] border-r border-[#E3DDD1] truncate">
                        {s.name}
                      </td>

                      {concepts.map((c) => {
                        const score = getScore(s.mastery, c);
                        let cellBg = "bg-[#FEF3D6] text-[#9A5010]";
                        if (score >= 80) {
                          cellBg = "bg-[#E6F4F1] text-[#0F766E]";
                        } else if (score < 40) {
                          cellBg = "bg-[#FCECE8] text-[#B53219]";
                        }

                        return (
                          <td key={c} className="px-2 py-2 text-center">
                            <span
                              className={`inline-block w-11 py-1 rounded-md font-mono text-xs font-semibold ${cellBg}`}
                            >
                              {score}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
