import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import type { Question, Concept, Misconception } from "./types";
import { pickNextConcept } from "./learner";
import { getGeminiApiKey } from "./misconception";

export interface StudentHistoryEntry {
  question_id: string;
  concept_id: string;
  option_id?: string;
  reasoning?: string;
  correct: boolean;
  misconception_id?: string | null;
  timestamp?: string;
}

export interface StudentLike {
  id: string;
  name?: string;
  mastery: Record<string, number>;
  history: StudentHistoryEntry[];
}

let cachedQuestions: Question[] | null = null;

const QUESTIONS_PATH = path.join(process.cwd(), "data", "questions.json");

/**
 * Loads questions from /data/questions.json
 */
export function loadQuestions(): Question[] {
  try {
    if (fs.existsSync(QUESTIONS_PATH)) {
      const raw = fs.readFileSync(QUESTIONS_PATH, "utf-8");
      cachedQuestions = JSON.parse(raw);
      return cachedQuestions || [];
    }
  } catch (err) {
    console.error("Failed to load /data/questions.json:", err);
  }
  return cachedQuestions || [];
}

/**
 * Returns question bank (cached in memory)
 */
export function getQuestions(): Question[] {
  if (!cachedQuestions || cachedQuestions.length === 0) {
    return loadQuestions();
  }
  return cachedQuestions;
}

export function getQuestionById(id: string): Question | undefined {
  return getQuestions().find((q) => q.id === id);
}

/**
 * Validates whether an object matches the Question type contract
 */
export function validateQuestionShape(q: unknown): q is Question {
  if (!q || typeof q !== "object") return false;
  const candidate = q as Record<string, unknown>;

  if (typeof candidate.id !== "string" || candidate.id.trim() === "") return false;
  if (typeof candidate.concept_id !== "string" || candidate.concept_id.trim() === "") return false;
  if (![1, 2, 3].includes(candidate.difficulty as number)) return false;
  if (typeof candidate.prompt !== "string" || candidate.prompt.trim() === "") return false;
  if (candidate.code !== undefined && typeof candidate.code !== "string") return false;

  if (!Array.isArray(candidate.options) || candidate.options.length < 2) return false;
  for (const opt of candidate.options) {
    if (!opt || typeof opt !== "object") return false;
    if (typeof opt.id !== "string" || typeof opt.text !== "string") return false;
    if (opt.misconception_id !== null && typeof opt.misconception_id !== "string" && opt.misconception_id !== undefined) {
      return false;
    }
  }

  if (typeof candidate.correct_option !== "string") return false;
  const hasCorrectOption = candidate.options.some((opt: { id: string }) => opt.id === candidate.correct_option);
  if (!hasCorrectOption) return false;

  return true;
}

/**
 * Computes target difficulty from the student's last 3 answers on that concept:
 * - 2 correct in a row -> raise difficulty (+1, max 3)
 * - any wrong -> lower difficulty (-1, min 1)
 * - min 1, max 3
 */
export function computeTargetDifficulty(
  history: StudentHistoryEntry[],
  conceptId: string
): 1 | 2 | 3 {
  const onConcept = history.filter((h) => h.concept_id === conceptId);
  if (onConcept.length === 0) {
    return 1;
  }

  let diff = 1;
  for (let i = 0; i < onConcept.length; i++) {
    const start = Math.max(0, i - 2);
    const window = onConcept.slice(start, i + 1);

    const len = window.length;
    const lastTwoCorrect = len >= 2 && window[len - 1].correct && window[len - 2].correct;

    if (lastTwoCorrect) {
      diff = Math.min(3, diff + 1);
    } else if (window.some((a) => !a.correct)) {
      diff = Math.max(1, diff - 1);
    }
  }

  return diff as 1 | 2 | 3;
}

/**
 * Picks the next question for a student:
 * 1. Concept from pickNextConcept
 * 2. Difficulty from last 3 answers on that concept
 * 3. Prefer questions targeting a misconception recently shown
 * 4. Never repeat a question until all are used
 */
export function nextQuestion(student: StudentLike): Question {
  const bank = getQuestions();
  if (bank.length === 0) {
    throw new Error("No questions available in question bank");
  }

  // 1. Pick concept from learner model
  const nextConcept = pickNextConcept(student);
  const targetConceptId = nextConcept.id;

  // 2. Compute difficulty
  const targetDifficulty = computeTargetDifficulty(student.history, targetConceptId);

  // Filter bank by concept
  const forConcept = bank.filter((q) => q.concept_id === targetConceptId);
  const pool = forConcept.length > 0 ? forConcept : bank;

  // 4. Never repeat a question until all are used
  const usedQuestionIds = new Set(student.history.map((h) => h.question_id));
  let available = pool.filter((q) => !usedQuestionIds.has(q.id));
  if (available.length === 0) {
    // All used: reset and allow all in pool
    available = pool;
  }

  // 3. Prefer questions whose options target a misconception the student recently showed
  const recentMisconceptions = student.history
    .filter((h) => h.misconception_id)
    .slice(-5)
    .map((h) => h.misconception_id as string)
    .reverse();

  let targetMisconceptionId: string | null = null;
  if (recentMisconceptions.length > 0) {
    targetMisconceptionId = recentMisconceptions[0];
  }

  let candidates = available;

  if (targetMisconceptionId) {
    const targeting = available.filter((q) =>
      q.options.some((o) => o.misconception_id === targetMisconceptionId)
    );
    if (targeting.length > 0) {
      candidates = targeting;
    }
  }

  // Match target difficulty if possible, or closest difficulty
  const exactDiff = candidates.filter((q) => q.difficulty === targetDifficulty);
  if (exactDiff.length > 0) {
    return exactDiff[0];
  }

  // Closest difficulty
  candidates.sort(
    (a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty)
  );

  return candidates[0];
}

/**
 * Generates a question via Gemini with schema validation, falling back to bank on failure
 */
export async function generateQuestion(
  concept: Concept | string,
  misconception?: Misconception | string | null,
  difficulty: 1 | 2 | 3 = 1
): Promise<Question> {
  const conceptId = typeof concept === "string" ? concept : concept.id;
  const misconceptionId = typeof misconception === "string" ? misconception : misconception?.id ?? null;

  // Fallback question from the bank
  const bank = getQuestions();
  const bankFallback =
    bank.find((q) => q.concept_id === conceptId && q.difficulty === difficulty) ||
    bank.find((q) => q.concept_id === conceptId) ||
    bank[0];

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return bankFallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Generate a high quality Java multiple-choice diagnostic question.

Concept: ${conceptId}
Target Difficulty: ${difficulty} (1: beginner fundamentals, 2: intermediate syntax/mechanics, 3: advanced/subtle nuances)
${misconceptionId ? `Target Misconception ID: ${misconceptionId} (ensure one distractor option represents this specific misconception)` : ""}

Return strictly valid JSON adhering to this schema:
{
  "id": "generated-${conceptId}-${Date.now()}",
  "concept_id": "${conceptId}",
  "difficulty": ${difficulty},
  "code": "optional short Java code snippet or omit",
  "prompt": "clear question prompt",
  "options": [
    { "id": "opt-1", "text": "choice 1", "misconception_id": null },
    { "id": "opt-2", "text": "choice 2", "misconception_id": ${misconceptionId ? `"${misconceptionId}"` : "null"} },
    { "id": "opt-3", "text": "choice 3", "misconception_id": null },
    { "id": "opt-4", "text": "choice 4", "misconception_id": null }
  ],
  "correct_option": "opt-1"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "";
    const parsed = JSON.parse(text);

    if (validateQuestionShape(parsed)) {
      return parsed;
    }
    console.warn("Generated question failed shape validation, falling back to bank.");
    return bankFallback;
  } catch (err) {
    console.error("Gemini generateQuestion failed, using bank fallback:", err);
    return bankFallback;
  }
}
