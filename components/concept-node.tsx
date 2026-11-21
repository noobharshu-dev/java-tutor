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

  const pct = Math.max(
    0,
    Math.min(100, Math.round(mastery <= 1 ? mastery * 100 : mastery))
  );

  let borderColor = "border-[#E07A5F]";
  let badgeStyles = "bg-[#FCECE8] text-[#B53219]";
  let barColor = "bg-[#D94F2B]";

  if (pct >= 80) {
    borderColor = "border-[#4CA69A]";
    badgeStyles = "bg-[#E6F4F1] text-[#0F766E]";
    barColor = "bg-[#0F766E]";
  } else if (pct >= 40) {
    borderColor = "border-[#E0A44B]";
    badgeStyles = "bg-[#FEF3D6] text-[#9A5010]";
    barColor = "bg-[#C87D16]";
  }

  const highlightRing = isHighlighted
    ? "ring-2 ring-[#D94F2B] ring-offset-2 ring-offset-[#FAF7F0]"
    : "";

  return (
    <div
      onClick={() => onSelect && onSelect(id)}
      className={`relative select-none bg-[#FFFDF9] rounded-xl border-2 shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] text-left ${borderColor} ${highlightRing} ${
        compact ? "p-2.5 min-w-[144px]" : "p-3.5 min-w-[172px]"
      }`}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[#A8A29E] !w-2 !h-2 !border-[#FFFDF9]"
      />

      {/* Header: Concept Name & Mastery % Badge */}
      <div className="flex items-start justify-between gap-1.5 mb-2">
        <h4
          className={`font-sans font-semibold text-[#1C1917] tracking-tight leading-snug line-clamp-2 ${
            compact ? "text-[11px]" : "text-xs"
          }`}
          title={name}
        >
          {name}
        </h4>
        <span
          className={`font-mono text-[11px] font-semibold rounded px-1.5 py-0.5 flex-shrink-0 ${badgeStyles}`}
        >
          {pct}%
        </span>
      </div>

      {/* 4px Rounded Progress Bar */}
      <div className="w-full bg-[#E7E1D5] rounded-full h-1 overflow-hidden mt-1">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.max(4, pct)}%` }}
        />
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[#A8A29E] !w-2 !h-2 !border-[#FFFDF9]"
      />
    </div>
  );
});
