/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Declare global d3 loaded via CDN in layout
declare const d3: any;

export interface ConceptItem {
  id: string;
  name: string;
  x: number;
  y: number;
  m: number;
  sub: string;
  trail: ("ok" | "no" | "part")[];
  fit: string;
  misc: { title: string; body: string; tone: string } | null;
}

export const DEFAULT_CONCEPTS: ConceptItem[] = [
  { id: "reflection", name: "Reflection", x: 22, y: 14, m: 0.86, sub: "Strong", trail: ["ok", "ok", "ok", "ok", "ok", "ok"], fit: "Secure. Reviewed in 14 days.", misc: null },
  { id: "force", name: "Force", x: 26, y: 84, m: 0.82, sub: "Strong", trail: ["ok", "ok", "ok", "part", "ok", "ok"], fit: "Secure. Reviewed in 9 days.", misc: null },
  { id: "work", name: "Work", x: 44, y: 44, m: 0.71, sub: "Secure", trail: ["ok", "ok", "part", "ok", "ok", "ok"], fit: "Solid. Reviewed in 6 days.", misc: null },
  { id: "energy", name: "Energy", x: 72, y: 30, m: 0.58, sub: "Developing", trail: ["ok", "no", "ok", "part", "ok", "no"], fit: "Mostly there. Reviewed in 3 days.", misc: null },
  { id: "power", name: "Power", x: 100, y: 22, m: 0.63, sub: "Developing", trail: ["ok", "part", "ok", "ok", "no", "ok"], fit: "Developing. Reviewed in 4 days.", misc: null },
  { id: "newton", name: "Newton's 2nd", x: 62, y: 74, m: 0.41, sub: "Developing", trail: ["no", "ok", "part", "no", "ok", "part"], fit: "Mass and weight used as one.", misc: { title: "Mass and weight used as one", body: "Shows up in 3 of your last 4 wrong answers. It explains why a heavy object needs more force to start moving.", tone: "clay" } },
  { id: "momentum", name: "Momentum", x: 90, y: 64, m: 0.35, sub: "Needs work", trail: ["no", "no", "part", "no", "ok", "no"], fit: "Momentum treated as velocity.", misc: { title: "Momentum treated as velocity", body: "Affects 4 of your last 6 questions. Momentum depends on mass as well as speed.", tone: "clay" } },
  { id: "ohm", name: "Ohm's law", x: 126, y: 82, m: 0.90, sub: "Strong", trail: ["ok", "ok", "ok", "ok", "ok", "ok"], fit: "Secure across the board.", misc: null },
  { id: "series", name: "Series", x: 140, y: 50, m: 0.52, sub: "Developing", trail: ["ok", "part", "no", "ok", "part", "ok"], fit: "Developing.", misc: null },
  { id: "parallel", name: "Parallel", x: 148, y: 24, m: 0.22, sub: "Needs work", trail: ["no", "no", "part", "no", "no", "ok"], fit: "Parallel treated as series.", misc: { title: "Parallel treated as series", body: "Seen in 3 separate answers. Current should split across branches, and resistance should fall.", tone: "clay" } },
  { id: "refraction", name: "Refraction", x: 86, y: 104, m: 0.30, sub: "Needs work", trail: ["no", "part", "no", "no", "ok", "no"], fit: "Angles measured from the surface.", misc: { title: "Angles measured from the surface", body: "Angles should be measured from the normal. This appears in 4 of 6 ray diagrams.", tone: "clay" } },
  { id: "lens", name: "Lens formula", x: 160, y: 100, m: 0.18, sub: "Needs work", trail: ["no", "no", "no", "part", "no", "no"], fit: "Sign convention ignored for virtual images.", misc: { title: "Sign convention ignored", body: "Plumb sees it when images are virtual. Practise with the real-image case first.", tone: "clay" } },
];

export const FOG_AREA = { name: "Magnetism", x: 44, y: 104, r: 20 };

export function PlumbTerrain({ isClassView = false }: { isClassView?: boolean }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>("parallel");
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const rampRef = useRef<HTMLSpanElement>(null);

  const concepts = isClassView
    ? DEFAULT_CONCEPTS.map((c) => ({ ...c, m: Math.max(0.05, c.m * 0.78) }))
    : DEFAULT_CONCEPTS;

  const selectedConcept = concepts.find((c) => c.id === selectedId) || concepts[9];

  useEffect(() => {
    if (typeof d3 === "undefined") return;

    const W = 180;
    const H = 120;
    const S = 4.2;
    const sigma = 17;

    // Generate field
    const grid = new Array(W * H);
    const offset = isClassView ? -0.02 : 0;
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        let v = 0;
        for (const c of concepts) {
          const d2 = (i - c.x) ** 2 + (j - c.y) ** 2;
          v += c.m * Math.exp(-d2 / (2 * sigma * sigma));
        }
        v += 0.035 * Math.sin(i * 0.19 + j * 0.07) * Math.cos(j * 0.23 - i * 0.05) + 0.02 * Math.sin(i * 0.41 + j * 0.33);
        grid[j * W + i] = Math.max(0, Math.min(1, v * 0.9 + offset));
      }
    }

    const tint = (t: number) =>
      d3.interpolateRgbBasis(["#EFE7D6", "#E4D7B5", "#C9B37A", "#7F9C7A", "#24513F"])(t);

    const levels = d3.range(0.06, 1, 0.07);
    const contours = d3.contours().size([W, H]).thresholds(levels)(grid);
    const path = d3.geoPath();

    const layerG = d3.select(isClassView ? "#classLayer" : "#terrainLayer").attr("transform", `scale(${S})`);
    layerG.selectAll("*").remove();

    layerG
      .selectAll("path.fill")
      .data(contours)
      .join("path")
      .attr("class", "fill")
      .attr("d", path)
      .attr("fill", (d: any) => tint(d.value))
      .attr("stroke", "none");

    layerG
      .selectAll("path.contour")
      .data(contours)
      .join("path")
      .attr("class", "contour")
      .attr("d", path);

    // Draw places if not class view
    if (!isClassView) {
      const placesG = d3.select("#placesG");
      placesG.selectAll("*").remove();

      // Fog circle
      placesG
        .append("circle")
        .attr("class", "fog")
        .attr("cx", FOG_AREA.x * S)
        .attr("cy", FOG_AREA.y * S)
        .attr("r", FOG_AREA.r * S * 0.9);

      placesG
        .append("text")
        .attr("x", FOG_AREA.x * S)
        .attr("y", FOG_AREA.y * S + 4)
        .attr("text-anchor", "middle")
        .attr("font-family", "Newsreader, Georgia, serif")
        .attr("font-style", "italic")
        .attr("font-size", 15)
        .attr("fill", "#5B6A60")
        .text(FOG_AREA.name + " · in fog");

      // Place dots
      const pl = placesG
        .selectAll("g.place")
        .data(concepts)
        .join("g")
        .attr("class", (d: any) => `place ${d.id === selectedId ? "sel" : ""}`)
        .attr("tabindex", 0)
        .attr("role", "button")
        .attr("aria-label", (d: any) => `${d.name}, ${Math.round(d.m * 100)} percent`)
        .attr("transform", (d: any) => `translate(${d.x * S},${d.y * S})`)
        .on("click", (_: any, d: any) => setSelectedId(d.id))
        .on("keydown", (e: any, d: any) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSelectedId(d.id);
          }
        });

      pl.append("circle").attr("class", "dot").attr("r", 5);
      pl.append("text").attr("x", 11).attr("y", -6).text((d: any) => d.name);
      pl.append("text").attr("class", "sub").attr("x", 11).attr("y", 9).text((d: any) => `${Math.round(d.m * 100)}%`);
    }

    // Legend ramp
    if (rampRef.current) {
      rampRef.current.innerHTML = d3
        .range(0, 1.01, 0.1)
        .map((t: number) => `<i style="background:${tint(t)}"></i>`)
        .join("");
    }

    // Trigger reveal transition
    if (mapRef.current) {
      const el = mapRef.current;
      requestAnimationFrame(() => setTimeout(() => el.classList.add("ready"), 120));
    }
  }, [selectedId, isClassView, concepts]);

  // Handle Practice click: calls /api/session, saves student_id, and routes to /practice
  const handleStartPractice = async () => {
    setIsStartingSession(true);
    let resolvedStudentId = "student-1";
    try {
      const stored = localStorage.getItem("student_id");
      if (stored) resolvedStudentId = stored;

      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: resolvedStudentId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.student_id) resolvedStudentId = data.student_id;
      }
    } catch {
      // Fallback
    }

    localStorage.setItem("student_id", resolvedStudentId);
    router.push("/practice");
  };

  // Retention curve SVG generator
  const renderCurve = (m: number) => {
    const pts = Array.from({ length: 31 }, (_, t) => ({
      t,
      r: Math.exp(-t / (1.8 + m * 6)),
    }));
    const w = 320;
    const h = 110;
    const pad = 18;
    const scaleX = (t: number) => pad + (t / 30) * (w - 6 - pad);
    const scaleY = (r: number) => h - pad - r * (h - pad - 6);

    const pathD = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${scaleX(p.t)} ${scaleY(p.r)}`, "");
    const areaD = `${pathD} L ${scaleX(30)} ${h - pad} L ${scaleX(0)} ${h - pad} Z`;
    const reviewDay = Math.round((1.8 + m * 6) * 0.9);

    return (
      <svg viewBox={`0 0 ${w} ${h}`} aria-label="Forgetting curve" className="w-full h-auto block overflow-visible">
        <line className="axis" x1={pad} x2={w - 6} y1={h - pad} y2={h - pad} stroke="var(--rule)" />
        <path className="area" d={areaD} fill="var(--pine)" opacity="0.08" />
        <path className="decay" d={pathD} fill="none" stroke="var(--ink)" strokeWidth="1.6" />
        <line
          x1={scaleX(reviewDay)}
          x2={scaleX(reviewDay)}
          y1={scaleY(0)}
          y2={scaleY(1)}
          stroke="var(--clay)"
          strokeDasharray="2 3"
        />
        <circle cx={scaleX(0)} cy={scaleY(1)} r="3.5" fill="var(--ink)" />
        <text x={pad} y={h - 4} fontSize="11" fill="var(--ink-2)">
          today
        </text>
        <text x={scaleX(reviewDay)} y={h - 4} textAnchor="middle" fill="var(--clay)" fontSize="11">
          review
        </text>
        <text x={w - 6} y={h - 4} textAnchor="end" fontSize="11" fill="var(--ink-2)">
          day 30
        </text>
      </svg>
    );
  };

  return (
    <div className="terrain-wrap">
      <div>
        <div className="map" id={isClassView ? "classMap" : "map"} ref={mapRef}>
          <svg viewBox="0 0 756 504" role="img" aria-label="Topographic map of concept mastery">
            <g className="layer" id={isClassView ? "classLayer" : "terrainLayer"} />
            {!isClassView && <g id="placesG" />}
          </svg>
          <div className="compass">
            <i />North is mastery
          </div>
        </div>
        <div className="legend">
          Valley
          <span className="ramp" ref={rampRef} />
          Summit
        </div>
      </div>

      {!isClassView && (
        <aside className="card" id="detail" aria-live="polite">
          <div className="kicker">Concept · Electricity &amp; Light</div>
          <h2 style={{ fontStyle: "italic" }}>{selectedConcept.name}</h2>

          <div className="meter">
            <b className="num">{Math.round(selectedConcept.m * 100)}%</b>
            <span>{selectedConcept.sub.toLowerCase()} · {selectedConcept.fit}</span>
          </div>

          <div className="band">
            <i
              style={{
                width: `${selectedConcept.m * 100}%`,
                background: selectedConcept.m < 0.4 ? "var(--clay)" : selectedConcept.m < 0.7 ? "var(--ochre)" : "var(--pine)",
              }}
            />
          </div>

          <div className="trail-label">
            <span>Last six answers</span>
            <span>✓ right · ~ partly · ✕ wrong</span>
          </div>

          <div className="trail" style={{ marginTop: 8 }}>
            {selectedConcept.trail.map((t, idx) => (
              <span key={idx} className={t}>
                {t === "ok" ? "✓" : t === "no" ? "✕" : "~"}
              </span>
            ))}
          </div>

          {selectedConcept.misc && (
            <div className="note">
              <b>Misconception · {selectedConcept.misc.title}</b>
              <p>{selectedConcept.misc.body}</p>
            </div>
          )}

          <div className="curve">
            <div className="small muted" style={{ marginBottom: 6 }}>
              Expected recall without review
            </div>
            {renderCurve(selectedConcept.m)}
          </div>

          <button
            type="button"
            className="cta"
            onClick={handleStartPractice}
            disabled={isStartingSession}
          >
            {isStartingSession ? "Opening Practice..." : "Practise this concept"}
          </button>
        </aside>
      )}
    </div>
  );
}
