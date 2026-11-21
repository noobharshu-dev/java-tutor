"use client";

import React, { useState } from "react";
import { PlumbHeader } from "@/components/plumb-header";
import { PlumbTerrain } from "@/components/plumb-terrain";

export default function TeacherPage() {
  const [groupedValleys, setGroupedValleys] = useState<Record<number, boolean>>({ 0: true });

  const valleyData = [
    {
      id: 0,
      name: "Parallel",
      m: "22%",
      students: 19,
      gap: "Adds resistances as if in series.",
      tag: "Parallel = series",
    },
    {
      id: 1,
      name: "Lens formula",
      m: "18%",
      students: 12,
      gap: "Ignores the sign convention for virtual images.",
      tag: "Sign convention",
    },
    {
      id: 2,
      name: "Refraction",
      m: "30%",
      students: 14,
      gap: "Measures angles from the surface, not the normal.",
      tag: "Angle reference",
    },
  ];

  const toggleGroup = (idx: number) => {
    setGroupedValleys((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PlumbHeader />

      <main className="plumb-main flex-1">
        <section aria-label="Class view">
          <div className="head">
            <div>
              <h1>Class 10 B, Physics</h1>
              <p>
                The same terrain, averaged across 34 students. Valleys are concepts where most of the class is below 60%. Select a valley to group the students who share its misconception.
              </p>
            </div>
            <div className="stats">
              <div>
                <b className="num">34</b>
                <span>students</span>
              </div>
              <div>
                <b className="num">1,184</b>
                <span>answers this week</span>
              </div>
              <div>
                <b className="num" style={{ color: "var(--clay)" }}>
                  19
                </b>
                <span>share one gap</span>
              </div>
            </div>
          </div>

          <div className="class-grid">
            {/* Left: Class average terrain */}
            <div>
              <PlumbTerrain isClassView={true} />
            </div>

            {/* Right: Deepest Valleys & Suggested Thursday Plan */}
            <div>
              <h2 style={{ marginBottom: 10 }}>Deepest valleys</h2>

              <ul className="valleys">
                {valleyData.map((v) => {
                  const isGrouped = !!groupedValleys[v.id];
                  return (
                    <li key={v.id} className="valley">
                      <div className="depth num">{v.m}</div>
                      <div>
                        <h3>{v.name}</h3>
                        <p>{v.gap}</p>
                        <div className="chips">
                          <span className="chip">
                            <b className="num">{v.students}</b> students
                          </span>
                          <span className="chip">{v.tag}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-pressed={isGrouped}
                        onClick={() => toggleGroup(v.id)}
                      >
                        {isGrouped ? "Grouped" : "Group these"}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="plan">
                <div className="small muted">Suggested for Thursday · 12 minutes</div>
                <h3 style={{ marginTop: 6 }}>Parallel is not series, shown with current</h3>
                <ol>
                  <li>Ask: &ldquo;If one branch is cut, does current stop everywhere?&rdquo; Collect answers.</li>
                  <li>Show the current split with two bulbs of different brightness.</li>
                  <li>Send 5 reasoning-based questions to the 19 students in the Parallel group.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
