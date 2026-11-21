"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Edge,
  Node,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ConceptNode, ConceptNodeData } from "./concept-node";
import { Concept } from "@/lib/types";

const nodeTypes = {
  concept: ConceptNode,
};

const DEFAULT_CONCEPTS: Concept[] = [
  { id: "variables-types", name: "Variables & Data Types", prerequisites: [] },
  { id: "operators", name: "Operators & Integer Division", prerequisites: ["variables-types"] },
  { id: "strings", name: "String Basics", prerequisites: ["variables-types"] },
  { id: "string-equality", name: "String Equality (== vs equals)", prerequisites: ["strings", "operators"] },
  { id: "conditionals", name: "Conditionals", prerequisites: ["operators"] },
  { id: "loops", name: "Loops", prerequisites: ["conditionals"] },
  { id: "arrays", name: "Arrays", prerequisites: ["loops"] },
  { id: "methods", name: "Methods & Parameter Passing", prerequisites: ["variables-types", "conditionals"] },
  { id: "classes-objects", name: "Classes & Objects", prerequisites: ["methods"] },
  { id: "references", name: "References & Aliasing", prerequisites: ["classes-objects", "arrays"] },
  { id: "static-instance", name: "Static vs Instance", prerequisites: ["classes-objects"] },
  { id: "inheritance", name: "Inheritance & Polymorphism", prerequisites: ["classes-objects"] },
];

const NODE_COORDINATES: Record<string, { x: number; y: number }> = {
  "variables-types": { x: 380, y: 30 },
  "operators": { x: 200, y: 150 },
  "strings": { x: 560, y: 150 },
  "conditionals": { x: 120, y: 280 },
  "string-equality": { x: 380, y: 280 },
  "loops": { x: 60, y: 410 },
  "methods": { x: 330, y: 410 },
  "arrays": { x: 60, y: 540 },
  "classes-objects": { x: 420, y: 540 },
  "references": { x: 150, y: 680 },
  "static-instance": { x: 420, y: 680 },
  "inheritance": { x: 680, y: 680 },
};

const COMPACT_COORDINATES: Record<string, { x: number; y: number }> = {
  "variables-types": { x: 260, y: 20 },
  "operators": { x: 130, y: 110 },
  "strings": { x: 390, y: 110 },
  "conditionals": { x: 70, y: 200 },
  "string-equality": { x: 260, y: 200 },
  "loops": { x: 30, y: 290 },
  "methods": { x: 220, y: 290 },
  "arrays": { x: 30, y: 380 },
  "classes-objects": { x: 290, y: 380 },
  "references": { x: 100, y: 480 },
  "static-instance": { x: 290, y: 480 },
  "inheritance": { x: 470, y: 480 },
};

interface MasteryGraphProps {
  mastery: Record<string, number>;
  concepts?: Concept[];
  edgesList?: [string, string][];
  highlightedConceptId?: string;
  compact?: boolean;
  onSelectConcept?: (conceptId: string) => void;
}

export function MasteryGraph({
  mastery,
  concepts = DEFAULT_CONCEPTS,
  edgesList,
  highlightedConceptId,
  compact = false,
  onSelectConcept,
}: MasteryGraphProps) {
  // Build Nodes
  const nodes: Node<ConceptNodeData>[] = useMemo(() => {
    const coordsMap = compact ? COMPACT_COORDINATES : NODE_COORDINATES;

    return concepts.map((c) => {
      const coords = coordsMap[c.id] || { x: 200, y: 200 };
      const score = mastery[c.id] ?? 0;

      return {
        id: c.id,
        type: "concept",
        position: coords,
        data: {
          id: c.id,
          name: c.name,
          mastery: score,
          isHighlighted: highlightedConceptId === c.id,
          compact,
          onSelect: onSelectConcept,
        },
      };
    });
  }, [concepts, mastery, highlightedConceptId, compact, onSelectConcept]);

  // Build Edges
  const edges: Edge[] = useMemo(() => {
    const list: [string, string][] =
      edgesList ||
      concepts.flatMap((c) => c.prerequisites.map((p) => [p, c.id] as [string, string]));

    return list.map(([source, target], idx) => {
      const sourceMastery = mastery[source] ?? 0;
      const targetMastery = mastery[target] ?? 0;
      const avgScore =
        ((sourceMastery <= 1 ? sourceMastery * 100 : sourceMastery) +
          (targetMastery <= 1 ? targetMastery * 100 : targetMastery)) /
        2;

      return {
        id: `e-${source}-${target}-${idx}`,
        source,
        target,
        animated: avgScore < 40,
        style: {
          stroke: "#B5AEA0",
          strokeWidth: compact ? 1.5 : 1.75,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#B5AEA0",
          width: compact ? 12 : 16,
          height: compact ? 12 : 16,
        },
      };
    });
  }, [concepts, edgesList, mastery, compact]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden bg-[#FAF7F0]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: compact ? 0.15 : 0.2 }}
        nodesDraggable={!compact}
        nodesConnectable={false}
        zoomOnScroll={!compact}
        panOnDrag={!compact}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#D5CEC0" gap={20} size={1.5} />
        {!compact && (
          <Controls className="!bg-[#FFFDF9] !border-[#DDD6C7] !text-[#57534E] !shadow-xs" />
        )}
        {!compact && (
          <MiniMap
            nodeColor={(n) => {
              const score = mastery[n.id] ?? 0;
              const pct = score <= 1 ? score * 100 : score;
              return pct >= 80 ? "#0F766E" : pct >= 40 ? "#C87D16" : "#D94F2B";
            }}
            className="!bg-[#FFFDF9] !border-[#DDD6C7] rounded-xl shadow-xs"
            maskColor="rgba(246, 243, 236, 0.65)"
          />
        )}
      </ReactFlow>
    </div>
  );
}
