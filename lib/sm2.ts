import type { ReviewItem } from "./types";

export interface SM2Item {
  concept_id?: string;
  repetitions: number;
  interval: number; // in days
  easeFactor: number;
  dueDate?: string; // ISO date string
  nextReviewDate?: string; // ISO date string
}

export function createInitialSM2Item(conceptId: string, now: Date = new Date()): SM2Item {
  return {
    concept_id: conceptId,
    repetitions: 0,
    interval: 1,
    easeFactor: 2.5,
    dueDate: now.toISOString(),
  };
}

/**
 * Calculates updated SM-2 parameters:
 * Quality is 5 if correct, 2 if wrong.
 */
export function calculateSM2(
  item: SM2Item | undefined,
  correct: boolean,
  now: Date = new Date()
): SM2Item {
  const current = item || createInitialSM2Item("concept", now);
  const q = correct ? 5 : 2;

  let repetitions = current.repetitions;
  let interval = current.interval;

  if (q >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * current.easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // SM-2 ease factor formula:
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const deltaEF = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  const newEaseFactor = Math.max(1.3, Number((current.easeFactor + deltaEF).toFixed(2)));

  const dueDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString();

  return {
    concept_id: current.concept_id,
    repetitions,
    interval,
    easeFactor: newEaseFactor,
    dueDate,
  };
}

/**
 * Returns concepts that are currently due (dueDate <= now)
 */
export function getDueConcepts(
  student: { sm2?: Record<string, SM2Item> },
  now: Date = new Date()
): ReviewItem[] {
  if (!student.sm2) return [];

  const dueItems: ReviewItem[] = [];
  const nowMs = now.getTime();

  for (const [conceptId, item] of Object.entries(student.sm2)) {
    const dueStr = item.dueDate || item.nextReviewDate || new Date().toISOString();
    const dueMs = new Date(dueStr).getTime();
    if (dueMs <= nowMs) {
      dueItems.push({
        concept_id: item.concept_id || conceptId,
        due_in_days: 0,
      });
    }
  }

  return dueItems;
}

/**
 * Returns full review schedule with due_in_days for each scheduled concept
 */
export function getAllReviewSchedule(
  student: { sm2?: Record<string, SM2Item> },
  now: Date = new Date()
): ReviewItem[] {
  if (!student.sm2) return [];

  const items: ReviewItem[] = [];
  const nowMs = now.getTime();

  for (const [conceptId, item] of Object.entries(student.sm2)) {
    const dueStr = item.dueDate || item.nextReviewDate || new Date().toISOString();
    const dueMs = new Date(dueStr).getTime();
    const diffDays = Math.ceil((dueMs - nowMs) / (1000 * 60 * 60 * 24));
    items.push({
      concept_id: item.concept_id || conceptId,
      due_in_days: Math.max(0, diffDays),
    });
  }

  return items.sort((a, b) => a.due_in_days - b.due_in_days);
}
