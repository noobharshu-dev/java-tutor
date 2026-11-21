"use client";

import React, { useState } from "react";
import { PlumbHeader } from "@/components/plumb-header";

export default function PracticePage() {
  const [selectedOpt, setSelectedOpt] = useState<string>("B");
  const [checkedReasoning, setCheckedReasoning] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const options = [
    { key: "A", val: "10 Ω" },
    { key: "B", val: "2.4 Ω" },
    { key: "C", val: "5 Ω" },
    { key: "D", val: "0.42 Ω" },
  ];

  const handleCheckReasoning = async () => {
    setIsSubmitting(true);
    try {
      const studentId = typeof window !== "undefined" ? localStorage.getItem("student_id") || "student-1" : "student-1";
      await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          question_id: "parallel-resistors-1",
          option_id: selectedOpt,
          reasoning: "1/R = 1/4 + 1/6 = 5/12, so R = 12/5 = 2.4. Since it is smaller than both, it has to be right.",
        }),
      });
    } catch {
      // Offline fallback
    } finally {
      setIsSubmitting(false);
      setCheckedReasoning(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PlumbHeader />

      <main className="plumb-main flex-1">
        <section aria-label="Practice">
          <div className="slip">
            {/* Left: Question Slip */}
            <div>
              <div className="why">
                <b>Why this question:</b> Parallel circuits is in a valley at 22%. Plumb chose a question that tests the idea, not the arithmetic.
              </div>

              <div className="slip-card">
                <div className="small muted" style={{ marginBottom: 14 }}>
                  Electricity · Parallel circuits · Question 3 of 5
                </div>

                <p className="prompt">
                  Two resistors, 4 Ω and 6 Ω, are joined in parallel. What is the equivalent resistance?
                </p>

                <div className="opts" role="radiogroup" aria-label="Options">
                  {options.map((opt) => {
                    const isChecked = selectedOpt === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        className="opt"
                        role="radio"
                        aria-checked={isChecked}
                        onClick={() => setSelectedOpt(opt.key)}
                      >
                        <span className="k">{opt.key}</span>
                        {opt.val}
                      </button>
                    );
                  })}
                </div>

                <div className="reason-head">
                  <h3>Explain your thinking</h3>
                  <span>Hover a highlight to see what Plumb noticed</span>
                </div>

                <p className="reasoning" id="reasoning">
                  Current splits between the two branches, so the total should be smaller than 4 Ω. I used{" "}
                  <span
                    className="tag good"
                    tabIndex={0}
                    data-note="Correct formula for parallel resistors. Solid."
                  >
                    1/R = 1/4 + 1/6
                  </span>{" "}
                  and got 2.4.{" "}
                  <span
                    className="tag warn"
                    tabIndex={0}
                    data-note="Right answer, but the check that it is below 4 Ω may be a rule you memorised, not a reason you can state. Ask: why must it be smaller than the smallest branch?"
                  >
                    Since it&#39;s smaller than both, it has to be right.
                  </span>
                </p>

                <div className="legend-tags">
                  <span className="g">Sound step</span>
                  <span className="y">Right, but unexplained</span>
                  <span className="r">Misconception</span>
                </div>

                <button
                  type="button"
                  className="submit"
                  onClick={handleCheckReasoning}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Analysing reasoning..." : "Check my reasoning"}
                </button>
              </div>
            </div>

            {/* Right: Feedback & Mastery Movement */}
            <div className="read" id="read">
              <div className="lede">Feedback · after you submit</div>
              <h2>Correct answer, fragile understanding</h2>
              <p className="verdict">
                You got 2.4 Ω. Your method is solid. One sentence is doing the work for you, and Plumb wants to see the reason behind it.
              </p>

              <div className="finding">
                <div className="mark" style={{ background: "var(--pine)" }}>
                  ✓
                </div>
                <div>
                  <h3>Parallel formula applied correctly</h3>
                  <p>You wrote the reciprocal sum, not a plain addition. That is the core idea of this concept.</p>
                </div>
              </div>

              <div className="finding">
                <div className="mark" style={{ background: "var(--ochre)", color: "var(--ink)" }}>
                  !
                </div>
                <div>
                  <h3>Bound not explained</h3>
                  <p>&ldquo;It has to be smaller than both&rdquo; is a rule you recall. Plumb will ask one follow-up next session to check the reasoning behind it.</p>
                </div>
              </div>

              <div className="finding">
                <div className="mark" style={{ background: "var(--rule)", color: "var(--ink)" }}>
                  &rarr;
                </div>
                <div>
                  <h3>Scheduled for review</h3>
                  <p>Returns in 3 days, when recall is expected to dip. The next question will be one step harder.</p>
                </div>
              </div>

              {checkedReasoning && (
                <div className="ripple">
                  <div className="small" style={{ opacity: 0.8 }}>
                    Mastery movement
                  </div>
                  <div className="num" style={{ fontFamily: "var(--serif)", fontSize: 30, marginTop: 4 }}>
                    22% &rarr; 36%
                  </div>
                  <p>Climbing slowly because the answer was right but the reasoning was not yet proven.</p>
                  <div className="bars" aria-hidden="true">
                    <i />
                    <i />
                    <i className="on" />
                    <i />
                    <i />
                    <i className="on" />
                    <i />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
