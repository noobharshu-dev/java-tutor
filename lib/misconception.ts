import fs from "fs";
import path from "path";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import type { Question, Option, DetectedMisconception, Misconception, Concept } from "./types";

// In-memory cache for detectMisconception results
const misconceptionCache = new Map<string, DetectedMisconception | null>();

export function getCacheSize(): number {
  return misconceptionCache.size;
}

export function clearCache(): void {
  misconceptionCache.clear();
}

export function computeCacheKey(questionId: string, optionId: string, reasoning: string): string {
  const normalized = `${questionId}:${optionId}:${reasoning.trim()}`;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function loadConcepts(): Concept[] {
  const filePath = path.join(process.cwd(), "data", "concepts.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function loadMisconceptions(): Misconception[] {
  const filePath = path.join(process.cwd(), "data", "misconceptions.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

/**
 * Returns the concept ID plus all neighboring concept IDs (prerequisites and dependents)
 */
export function getNeighboringConceptIds(conceptId: string, concepts: Concept[] = loadConcepts()): string[] {
  const target = concepts.find((c) => c.id === conceptId);
  const neighbors = new Set<string>();
  neighbors.add(conceptId);

  if (target && target.prerequisites) {
    for (const prereq of target.prerequisites) {
      neighbors.add(prereq);
    }
  }

  for (const c of concepts) {
    if (c.prerequisites && c.prerequisites.includes(conceptId)) {
      neighbors.add(c.id);
    }
  }

  return Array.from(neighbors);
}

/**
 * Returns misconceptions for the given concept and its neighboring concepts
 */
export function getMisconceptionsForConceptWithNeighbors(
  conceptId: string,
  concepts: Concept[] = loadConcepts(),
  misconceptions: Misconception[] = loadMisconceptions()
): Misconception[] {
  const neighborIds = new Set(getNeighboringConceptIds(conceptId, concepts));
  return misconceptions.filter((m) => neighborIds.has(m.concept_id));
}

/**
 * Reads GEMINI_API_KEY from environment or directly from .env.local
 */
export function getGeminiApiKey(): string | undefined {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }

  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("GEMINI_API_KEY=")) {
          const val = trimmed.slice("GEMINI_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
          if (val) {
            process.env.GEMINI_API_KEY = val;
            return val;
          }
        }
      }
    }
  } catch {
    // Ignore error reading file
  }

  return undefined;
}

/**
 * Fallback to the chosen option's misconception_id when Gemini fails or key is missing
 */
export function fallbackMisconception(
  chosenOption: Option,
  misconceptions: Misconception[] = loadMisconceptions()
): DetectedMisconception | null {
  if (!chosenOption.misconception_id) {
    return null;
  }

  const m = misconceptions.find((item) => item.id === chosenOption.misconception_id);
  if (!m) {
    return null;
  }

  return {
    id: m.id,
    name: m.name,
    explanation: `${m.wrong_belief}. Clarification: ${m.correct_idea}`,
    confidence: 0.85,
  };
}

interface GeminiMisconceptionResponse {
  misconception_id: string | null;
  confidence: number;
  explanation: string;
}

/**
 * Detects student misconception using Gemini with in-memory caching and option fallback.
 */
export async function detectMisconception(
  question: Question,
  chosenOption: Option,
  reasoning: string
): Promise<DetectedMisconception | null> {
  const cacheKey = computeCacheKey(question.id, chosenOption.id, reasoning);
  if (misconceptionCache.has(cacheKey)) {
    return misconceptionCache.get(cacheKey)!;
  }

  const misconceptions = loadMisconceptions();
  const candidateMisconceptions = getMisconceptionsForConceptWithNeighbors(question.concept_id);
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    const fallback = fallbackMisconception(chosenOption, misconceptions);
    misconceptionCache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert Java computer science tutor diagnosing student errors.
Analyze the student's selected answer and written reasoning for the following Java question.

--- Question ---
Prompt: ${question.prompt}
${question.code ? `Code:\n${question.code}` : ""}
Correct Answer Option ID: ${question.correct_option}

--- Student Submission ---
Selected Option: "${chosenOption.text}" (ID: ${chosenOption.id})
Associated Option Misconception ID: ${chosenOption.misconception_id || "None"}
Student's Stated Reasoning: "${reasoning || "No reasoning provided."}"

--- Candidate Misconceptions (Relevant to this concept and its neighbors) ---
${JSON.stringify(
  candidateMisconceptions.map((m) => ({
    id: m.id,
    concept_id: m.concept_id,
    name: m.name,
    wrong_belief: m.wrong_belief,
    correct_idea: m.correct_idea,
  })),
  null,
  2
)}

--- Instructions ---
1. Identify if the student demonstrates a known misconception.
2. If the student's reasoning reveals a misconception DIFFERENT from the option's default misconception, PREFER the reasoning.
3. If the student did not demonstrate any listed misconception or is correct, set misconception_id to null and confidence to 0.
4. Output must be strictly valid JSON matching this schema:
{
  "misconception_id": string or null,
  "confidence": number between 0 and 1,
  "explanation": "one friendly sentence to the student addressing their mistake and gently correcting them"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "";
    const parsed: GeminiMisconceptionResponse = JSON.parse(text);

    let result: DetectedMisconception | null = null;
    if (parsed.misconception_id) {
      const match = misconceptions.find((m) => m.id === parsed.misconception_id);
      if (match) {
        result = {
          id: match.id,
          name: match.name,
          explanation: parsed.explanation || match.correct_idea,
          confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.85)),
        };
      }
    }

    misconceptionCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error("Gemini misconception detection failed, falling back to option misconception:", err);
    const fallback = fallbackMisconception(chosenOption, misconceptions);
    misconceptionCache.set(cacheKey, fallback);
    return fallback;
  }
}

/**
 * Deterministic keyword check for candidate misconceptions on correct answer reasoning.
 */
function fallbackCorrectAnswerMisconception(
  reasoning: string,
  candidates: Misconception[]
): DetectedMisconception | null {
  const lower = reasoning.toLowerCase();
  const hasCandidate = (id: string) => candidates.some((m) => m.id === id);
  const getCandidate = (id: string) => candidates.find((m) => m.id === id);

  // M1: == compares string contents
  if (
    hasCandidate("M1") &&
    (lower.includes("==") || lower.includes("double equal") || lower.includes("equals operator")) &&
    (lower.includes("content") ||
      lower.includes("text") ||
      lower.includes("value") ||
      lower.includes("character") ||
      lower.includes("char") ||
      lower.includes("spelling"))
  ) {
    const m = getCandidate("M1")!;
    return {
      id: m.id,
      name: m.name,
      explanation: `${m.wrong_belief}. Clarification: ${m.correct_idea}`,
      confidence: 0.8,
    };
  }

  // M2: int / int gives a decimal
  if (
    hasCandidate("M2") &&
    (lower.includes("division") || lower.includes("divide") || lower.includes("/")) &&
    (lower.includes("decimal") ||
      lower.includes("float") ||
      lower.includes("double") ||
      lower.includes(".5") ||
      lower.includes("fraction"))
  ) {
    const m = getCandidate("M2")!;
    return {
      id: m.id,
      name: m.name,
      explanation: `${m.wrong_belief}. Clarification: ${m.correct_idea}`,
      confidence: 0.8,
    };
  }

  // M3: Java passes objects by reference
  if (
    hasCandidate("M3") &&
    (lower.includes("by reference") ||
      lower.includes("modifies the original reference") ||
      lower.includes("pass by reference") ||
      lower.includes("passed by reference"))
  ) {
    const m = getCandidate("M3")!;
    return {
      id: m.id,
      name: m.name,
      explanation: `${m.wrong_belief}. Clarification: ${m.correct_idea}`,
      confidence: 0.8,
    };
  }

  // M6: Assignment copies the object
  if (
    hasCandidate("M6") &&
    (lower.includes("copies the object") ||
      lower.includes("creates a copy") ||
      lower.includes("independent copy") ||
      lower.includes("shallow copy") ||
      lower.includes("cloned"))
  ) {
    const m = getCandidate("M6")!;
    return {
      id: m.id,
      name: m.name,
      explanation: `${m.wrong_belief}. Clarification: ${m.correct_idea}`,
      confidence: 0.8,
    };
  }

  // M7: Static fields are per-object
  if (
    hasCandidate("M7") &&
    (lower.includes("each object has its own") ||
      lower.includes("per object") ||
      lower.includes("per-object") ||
      lower.includes("separate copy for each object"))
  ) {
    const m = getCandidate("M7")!;
    return {
      id: m.id,
      name: m.name,
      explanation: `${m.wrong_belief}. Clarification: ${m.correct_idea}`,
      confidence: 0.8,
    };
  }

  return null;
}

/**
 * Diagnoses whether a student who selected the CORRECT option nevertheless holds a flawed mental model or misconception.
 */
export async function diagnoseCorrectAnswerReasoning(
  question: Question,
  optionId: string,
  reasoning: string
): Promise<DetectedMisconception | null> {
  if (!reasoning || reasoning.trim().length < 6) {
    return null;
  }

  const normalized = `correct:${question.id}:${optionId}:${reasoning.trim().toLowerCase()}`;
  const cacheKey = crypto.createHash("sha256").update(normalized).digest("hex");

  if (misconceptionCache.has(cacheKey)) {
    return misconceptionCache.get(cacheKey)!;
  }

  const misconceptions = loadMisconceptions();
  const candidateMisconceptions = getMisconceptionsForConceptWithNeighbors(question.concept_id);
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    const fallback = fallbackCorrectAnswerMisconception(reasoning, candidateMisconceptions);
    misconceptionCache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert Java computer science tutor evaluating a student's answer.
Context: The student selected the CORRECT multiple-choice option for this Java question.
However, we need to diagnose whether their written reasoning reveals a FALSE BELIEF, FLAWED MENTAL MODEL, or KNOWN MISCONCEPTION despite getting the answer right.

--- Question ---
Prompt: ${question.prompt}
${question.code ? `Code:\n${question.code}` : ""}
Correct Answer Option ID: ${question.correct_option}

--- Student Submission ---
Selected Option ID: ${optionId} (CORRECT)
Student's Written Reasoning: "${reasoning.trim()}"

--- Candidate Misconceptions (Relevant to this concept and its neighbors) ---
${JSON.stringify(
  candidateMisconceptions.map((m) => ({
    id: m.id,
    concept_id: m.concept_id,
    name: m.name,
    wrong_belief: m.wrong_belief,
    correct_idea: m.correct_idea,
  })),
  null,
  2
)}

--- Instructions ---
1. Check ONLY the student's reasoning.
2. If their reasoning is sound, accurate, or too brief/vague to prove a false belief, set "misconception_id" to null, "confidence" to 0, and "explanation" to "".
3. ONLY if their reasoning explicitly demonstrates a flawed mental model matching one of the candidate misconceptions (e.g. believing == compares string text/contents, integer division produces decimals, Java passes objects by reference, assignment copies an object/array, static fields belong to individual objects), return that "misconception_id" (ONLY if confidence >= 0.7), its confidence, and a crisp 2-sentence explanation contrasting what they assumed with how Java actually behaves.
4. Output must be strictly valid JSON matching this schema:
{
  "misconception_id": string or null,
  "confidence": number,
  "explanation": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "";
    const parsed: GeminiMisconceptionResponse = JSON.parse(text);

    let result: DetectedMisconception | null = null;
    if (parsed.misconception_id && Number(parsed.confidence) >= 0.7) {
      const match =
        candidateMisconceptions.find((m) => m.id === parsed.misconception_id) ||
        misconceptions.find((m) => m.id === parsed.misconception_id);

      if (match) {
        result = {
          id: match.id,
          name: match.name,
          explanation: parsed.explanation || `${match.wrong_belief}. Clarification: ${match.correct_idea}`,
          confidence: Math.max(0, Math.min(1, Number(parsed.confidence))),
        };
      }
    }

    misconceptionCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error("Gemini correct reasoning diagnosis failed, using fallback check:", err);
    const fallback = fallbackCorrectAnswerMisconception(reasoning, candidateMisconceptions);
    misconceptionCache.set(cacheKey, fallback);
    return fallback;
  }
}
