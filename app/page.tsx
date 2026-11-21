"use client";

import React from "react";
import { PlumbHeader } from "@/components/plumb-header";
import { PlumbTerrain } from "@/components/plumb-terrain";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PlumbHeader />

      <main className="plumb-main flex-1">
        <section aria-label="Knowledge terrain">
          {/* Head & Stats */}
          <div className="head">
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
                  marginBottom: 16,
                }}
              >
                <span>AI tutors answer questions. Ours understands what you misunderstand.</span>
              </div>
              <h1>Your physics, mapped</h1>
              <p>
                Every concept is a place. Higher ground means stronger understanding. Unexplored areas stay in fog until Plumb has enough evidence to draw them.
              </p>
            </div>
            <div className="elev">
              <div>
                <b className="num">58%</b>
                <span>Electricity &amp; Light</span>
              </div>
              <div>
                <b className="num">3</b>
                <span>valleys to cross</span>
              </div>
            </div>
          </div>

          {/* Interactive D3 Topographic Map and Concept Card */}
          <PlumbTerrain />
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--rule)", padding: "18px 44px", fontSize: 13, color: "var(--ink-2)", display: "flex", justifyContent: "space-between" }}>
        <span>Plumb · Class 10 Physics (Electricity, Light, Force, Work &amp; Energy)</span>
        <span>Cartographic Learner Model</span>
      </footer>
    </div>
  );
}
