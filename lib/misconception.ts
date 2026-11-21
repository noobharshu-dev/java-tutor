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
