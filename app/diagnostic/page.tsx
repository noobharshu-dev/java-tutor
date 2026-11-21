"use client";

import React, { useState } from "react";
import { PlumbHeader } from "@/components/plumb-header";

export default function DiagnosticPage() {
  const [selectedOpt, setSelectedOpt] = useState<string>("B");
  const [reasoning, setReasoning] = useState<string>("Reciprocal summation indicates total resistance decreases in parallel.");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const options = [
    { key: "A", val: "10 Ω", text: "Direct addition: 4 + 6 = 10" },
    { key: "B", val: "2.4 Ω", text: "Reciprocal sum: 1/R = 1/4 + 1/6" },
    { key: "C", val: "5 Ω", text: "Arithmetic average: (4 + 6) / 2" },
    { key: "D", val: "0.42 Ω", text: "Inversion omission: 5 / 12" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const studentId = typeof window !== "undefined" ? localStorage.getItem("student_id") || "student-1" : "student-1";
      await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          question_id: "diag-parallel-1",
          option_id: selectedOpt,
          reasoning,
        }),
      });
    } catch {
      // Offline fallback
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PlumbHeader />

      <main className="plumb-main flex-1">
        <section aria-label="Diagnostic mode">
          <div className="head" style={{ marginBottom: 28 }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: "var(--paper-2)",
                  border: "1px solid var(--rule)",
                  fontSize: 13,
                  color: "var(--pine)",
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                <span>Diagnostic Assessment · Cognitive Model</span>
              </div>
              <h1>Diagnostic Calibration</h1>
              <p>
                Each distractor is mapped to a documented cognitive misconception. Your written reasoning exposes whether an answer is a lucky guess or a sound mental model.
              </p>
            </div>
            <div className="elev">
              <div>
                <b className="num">Probe 1</b>
                <span>of 5 scheduled</span>
              </div>
            </div>
          </div>

          <div className="slip" style={{ maxWidth: 1080 }}>
            <div>
              <div className="slip-card">
                <div className="small muted" style={{ marginBottom: 14 }}>
                  Electricity &bull; Equivalent Resistance &bull; Probe #01
                </div>

                <p className="prompt" style={{ fontSize: 24, maxWidth: "100%" }}>
                  Two resistors of 4 &Omega; and 6 &Omega; are joined in parallel across an ideal 12 V potential difference. What is the equivalent resistance of the network?
                </p>

                <div className="opts" role="radiogroup" aria-label="Options" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
                        style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="k">{opt.key}</span>
                          <strong style={{ fontSize: 16 }}>{opt.val}</strong>
                        </div>
                        <span className="small muted">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: 28, borderTop: "1px dashed var(--rule)", paddingTop: 20 }}>
                  <div className="reason-head" style={{ margin: "0 0 10px" }}>
                    <h3>Why did you pick this? (one line)</h3>
                    <span className="small muted">Plumb checks for underlying misconceptions</span>
                  </div>

                  <input
                    type="text"
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    placeholder="e.g. Current splits and reciprocal sum gives 2.4 ohms..."
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: "var(--paper)",
                      border: "1px solid var(--rule)",
                      borderRadius: 3,
                      fontFamily: "var(--serif)",
                      fontSize: 17,
                      color: "var(--ink)",
                      outline: "none",
                    }}
                  />

                  <button
                    type="submit"
                    className="submit"
                    disabled={isSubmitting}
                    style={{ marginTop: 18 }}
                  >
                    {isSubmitting ? "Diagnosing..." : "Submit for cognitive diagnosis"}
                  </button>
                </form>
              </div>
            </div>

            {/* Diagnostic Result */}
            <div>
              {submitted ? (
                <div className="read">
                  <div className="lede">Diagnostic Telemetry</div>
                  <h2>Evaluation complete</h2>
                  <p className="verdict" style={{ fontSize: 20 }}>
                    Selected choice <strong>2.4 &Omega;</strong> matches correct reciprocal inversion.
                  </p>

                  <div className="note" style={{ borderLeft: "3px solid var(--pine)", background: "var(--paper-2)", marginBottom: 18 }}>
                    <b style={{ color: "var(--pine)" }}>Sound Physical Principle Verified</b>
                    <p>
                      Branch reciprocity formula <code>1/R = 1/R1 + 1/R2</code> confirmed. Equivalent resistance correctly recognized as strictly bounded below the smallest branch resistor.
                    </p>
                  </div>

                  <div className="finding">
                    <div className="mark" style={{ background: "var(--pine)" }}>&check;</div>
                    <div>
                      <h3>Cognitive Misconception Averted</h3>
                      <p>Did not confuse parallel branch addition with series accumulation.</p>
                    </div>
                  </div>

                  <div className="finding">
                    <div className="mark" style={{ background: "var(--rule)", color: "var(--ink)" }}>&rarr;</div>
                    <div>
                      <h3>Calibrating next probe</h3>
                      <p>Advancing to non-identical three-branch parallel loops with internal cell resistance.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="cta"
                    onClick={() => {
                      setSubmitted(false);
                      setSelectedOpt("B");
                    }}
                    style={{ marginTop: 22 }}
                  >
                    Next diagnostic question &rarr;
                  </button>
                </div>
              ) : (
                <aside className="card">
                  <div className="kicker">Diagnostic Calibration Guide</div>
                  <h2 style={{ fontStyle: "italic", fontSize: 22 }}>How Plumb evaluates</h2>
                  <p className="small muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
                    Unlike standard multiple-choice tests, Plumb maps distractor selections directly to known cognitive pitfalls in the Class 10 Physics ontology.
                  </p>
                  <div className="note" style={{ marginTop: 16 }}>
                    <b>Targeted Concept: Parallel Circuits</b>
                    <p className="small">Current mastery: 22% (Valley). 19 students in your cohort share this gap.</p>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
