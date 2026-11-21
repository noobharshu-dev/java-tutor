import fs from "fs";
import path from "path";
import type { Concept } from "./types";

export const INITIAL_MASTERY = 0.3;
export const LEARNING_RATE = 0.3;
export const PREREQUISITE_PENALTY = 0.05;
export const MASTERY_THRESHOLD = 0.5;

function loadConcepts(): Concept[] {
  const filePath = path.join(process.cwd(), "data", "concepts.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

/**
 * Creates initial mastery map with 0.3 for each concept.
 */
export function getInitialMastery(concepts: Concept[] = loadConcepts()): Record<string, number> {
  const mastery: Record<string, number> = {};
  for (const c of concepts) {
    mastery[c.id] = INITIAL_MASTERY;
  }
  return mastery;
}

/**
 * Updates mastery for the answered concept and its prerequisites:
 * mastery += 0.3 * (target - mastery), target = 1 if correct else 0.
 * If wrong, also reduces each prerequisite concept's mastery by 0.05.
 */
export function updateMastery(
  currentMastery: Record<string, number>,
  conceptId: string,
  correct: boolean,
  concepts: Concept[] = loadConcepts()
): Record<string, number> {
  const updated = { ...currentMastery };
  const current = updated[conceptId] ?? INITIAL_MASTERY;
  const target = correct ? 1 : 0;

  // mastery += 0.3 * (target - mastery)
  const newMastery = current + LEARNING_RATE * (target - current);
  updated[conceptId] = Math.max(0, Math.min(1, Number(newMastery.toFixed(4))));

  // If wrong, also reduce each prerequisite concept's mastery by 0.05
  if (!correct) {
    const concept = concepts.find((c) => c.id === conceptId);
    if (concept && concept.prerequisites) {
      for (const prereqId of concept.prerequisites) {
        const prereqMastery = updated[prereqId] ?? INITIAL_MASTERY;
        const reduced = Math.max(0, prereqMastery - PREREQUISITE_PENALTY);
        updated[prereqId] = Math.max(0, Math.min(1, Number(reduced.toFixed(4))));
      }
    }
  }

  return updated;
}

/**
 * Returns the lowest-mastery concept whose prerequisites all have mastery > 0.5.
 */
export function pickNextConcept(
  student: { mastery: Record<string, number> },
  concepts: Concept[] = loadConcepts()
): Concept {
  // A concept is eligible if for all p in prerequisites, mastery > 0.5
  const eligible = concepts.filter((c) => {
    if (!c.prerequisites || c.prerequisites.length === 0) {
      return true;
    }
    return c.prerequisites.every((prereqId) => {
      const m = student.mastery[prereqId] ?? INITIAL_MASTERY;
      return m > MASTERY_THRESHOLD;
    });
  });

  if (eligible.length === 0) {
    return concepts[0];
  }

  // Pick the lowest-mastery concept among eligible ones
  let lowestConcept = eligible[0];
  let lowestScore = student.mastery[lowestConcept.id] ?? INITIAL_MASTERY;

  for (let i = 1; i < eligible.length; i++) {
    const candidate = eligible[i];
    const score = student.mastery[candidate.id] ?? INITIAL_MASTERY;
    if (score < lowestScore) {
      lowestScore = score;
      lowestConcept = candidate;
    }
  }

  return lowestConcept;
}
