"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

export interface ConceptNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  mastery: number; // 0 to 100
  isHighlighted?: boolean;
  compact?: boolean;
  onSelect?: (id: string) => void;
}

export const ConceptNode = memo(function ConceptNode({
  data,
}: {
  data: ConceptNodeData;
}) {
  const { id, name, mastery, isHighlighted, compact, onSelect } = data;

  const pct = Math.max(0, Math.min(100, Math.round(mastery <= 1 ? mastery * 100 : mastery)));

  // Dynamic HSL colors: 0 (Red) -> 45 (Yellow/Orange) -> 135 (Emerald/Green)
  const hue = Math.round((pct / 100) * 135);
  const backgroundColor = `hsl(${hue}, 65%, 11%)`;
  const borderColor = `hsl(${hue}, 75%, 45%)`;
  const glowShadow = isHighlighted
    ? `0 0 24px hsla(${hue}, 85%, 55%, 0.6), 0 0 8px hsla(${hue}, 85%, 55%, 0.4)`
    : `0 4px 14px hsla(${hue}, 80%, 40%, 0.25)`;
  const pillBg = `hsla(${hue}, 75%, 45%, 0.2)`;
  const pillText = `hsl(${hue}, 85%, 70%)`;
  const progressBarColor = `hsl(${hue}, 80%, 48%)`;

  return (
    <div
      onClick={() => onSelect && onSelect(id)}
      style={{
        backgroundColor,
        borderColor,
        boxShadow: glowShadow,
        transition:
          "background-color 0.8s ease, border-color 0.8s ease, box-shadow 0.8s ease, transform 0.2s ease",
      }}
      className={`relative select-none border-2 rounded-2xl cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${
        compact ? "p-2.5 w-[140px]" : "p-3.5 w-[190px]"
      } backdrop-blur-sm text-left`}
    >
      {/* React Flow Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900"
      />

      {/* Header with Title and Mastery % */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <h4
          className={`font-bold text-white tracking-tight leading-snug line-clamp-2 ${
            compact ? "text-[11px]" : "text-xs sm:text-sm"
          }`}
          title={name}
        >
          {name}
        </h4>
        <span
          style={{
            backgroundColor: pillBg,
            color: pillText,
            transition: "all 0.8s ease",
          }}
          className={`font-mono font-extrabold rounded-md flex-shrink-0 ${
            compact ? "text-[10px] px-1 py-0.2" : "text-xs px-1.5 py-0.5"
          }`}
        >
          {pct}%
        </span>
      </div>

      {/* Smooth animated progress bar */}
      <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden mt-1">
        <div
          style={{
            width: `${Math.max(4, pct)}%`,
            backgroundColor: progressBarColor,
            transition: "width 0.8s ease, background-color 0.8s ease",
          }}
          className="h-1.5 rounded-full"
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900"
      />
    </div>
  );
});
