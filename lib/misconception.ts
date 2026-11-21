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
  misconception_name?: string;
  confidence: number;
  explanation: string;
}

/**
 * Smart Question-Specific Fallback (NEVER returns null on a wrong answer).
 */
export function smartFallbackMisconception(
  question: Question,
  chosenOption: Option,
  correctOption: { id: string; text: string },
  reasoning: string,
  misconceptions: Misconception[] = loadMisconceptions()
): DetectedMisconception {
  const userReasoning = reasoning ? reasoning.trim() : "";

  // 1. Check if chosenOption has an explicit misconception_id from catalog M1–M8
  if (chosenOption.misconception_id) {
    const m = misconceptions.find((item) => item.id === chosenOption.misconception_id);
    if (m) {
      let explanation = `${m.wrong_belief}. Clarification: ${m.correct_idea}.`;
      if (userReasoning) {
        explanation = `You reasoned: "${userReasoning}". However, ${m.wrong_belief.toLowerCase()}. In Java, ${m.correct_idea}.`;
      }
      return {
        id: m.id,
        name: m.name,
        explanation,
        confidence: 0.85,
      };
    }
  }

  // 2. Specific fallback for questions outside catalog M1–M8 (e.g. variables-types)
  const conceptName = question.concept_id.replace(/-/g, " ");
  const fallbackId = question.concept_id.toUpperCase();
  const fallbackName = `Misread Java behavior in ${conceptName}`;

  let explanation = "";
  if (userReasoning) {
    explanation = `You reasoned: "${userReasoning}". While this led you to choose "${chosenOption.text}", Java evaluates this code to produce "${correctOption.text}". Check how ${conceptName} operates in the JVM.`;
  } else {
    explanation = `Choosing "${chosenOption.text}" reflects an inaccurate mental model of ${conceptName} in Java. For this code snippet, the JVM produces "${correctOption.text}".`;
  }

  return {
    id: fallbackId,
    name: fallbackName,
    explanation,
    confidence: 0.8,
  };
}

/**
 * Calls Gemini with model fallback and strict timeout to prevent hangs.
 */
async function callGeminiJson(ai: GoogleGenAI, prompt: string, timeoutMs = 6000): Promise<string> {
  const models = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"];
  let lastError: unknown = null;

  for (const model of models) {
    try {
      const generatePromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error(`Gemini model ${model} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      return response.text?.trim() || "";
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

/**
 * Detects student misconception using Gemini with in-memory caching and smart question fallback.
 * ALWAYS returns a specific, reasoning-driven DetectedMisconception on a wrong answer (never null!).
 */
export async function detectMisconception(
  question: Question,
  chosenOption: Option,
  reasoning: string
): Promise<DetectedMisconception> {
  const cacheKey = computeCacheKey(question.id, chosenOption.id, reasoning);
  if (misconceptionCache.has(cacheKey)) {
    const cached = misconceptionCache.get(cacheKey);
    if (cached) return cached;
  }

  const misconceptions = loadMisconceptions();
  const candidateMisconceptions = getMisconceptionsForConceptWithNeighbors(question.concept_id);
  const correctOption =
    question.options.find((o) => o.id === question.correct_option) || {
      id: question.correct_option,
      text: question.correct_option,
      misconception_id: null,
    };
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    const fallback = smartFallbackMisconception(question, chosenOption, correctOption, reasoning, misconceptions);
    misconceptionCache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert Java computer science tutor diagnosing student errors.
Analyze the student's selected WRONG answer and written reasoning for the following Java question.

--- Question ---
Concept: ${question.concept_id}
Prompt: ${question.prompt}
${question.code ? `Code:\n${question.code}` : "No code snippet provided"}
Correct Answer Option: "${correctOption.text}" (ID: ${question.correct_option})

--- Student Submission ---
Selected WRONG Option: "${chosenOption.text}" (ID: ${chosenOption.id})
Associated Option Misconception ID: ${chosenOption.misconception_id || "None"}
Student's Stated Reasoning: "${reasoning ? reasoning.trim() : "No reasoning provided."}"

--- Candidate Catalog Misconceptions (M1–M8) ---
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
1. Identify the exact flawed mental model or Java rule misunderstanding that led the student to pick "${chosenOption.text}".
2. If the student's mistake matches one of the catalog misconceptions M1–M8, set "misconception_id" to that ID (e.g. "M1").
3. If it is a Java misconception outside M1–M8 (such as widening int to double printing 10.0, integer truncation, operator precedence, string immutability, reference assignment, etc.), set "misconception_id" to "CUSTOM".
4. ALWAYS provide a sharp, accurate "misconception_name" (short 4-8 words title of the exact wrong belief).
5. In "explanation", write 2-3 crisp sentences directly quoting or addressing the student's reasoning (if provided), explaining why their choice "${chosenOption.text}" is wrong on THIS exact code snippet, and stating the exact Java rule that produces "${correctOption.text}".
6. Output must be strictly valid JSON matching this schema:
{
  "misconception_id": "M1..M8 or CUSTOM",
  "misconception_name": "Short 4-8 word title of the exact wrong belief",
  "confidence": number between 0.7 and 1.0,
  "explanation": "2-3 crisp sentences directly addressing their reasoning, why their choice is wrong for this code, and the exact Java rule for the correct output."
}`;

    const text = await callGeminiJson(ai, prompt);
    const parsed: GeminiMisconceptionResponse = JSON.parse(text);

    const rawId = typeof parsed.misconception_id === "string" ? parsed.misconception_id.trim() : "CUSTOM";
    const catalogMatch = misconceptions.find((m) => m.id === rawId);

    const name =
      typeof parsed.misconception_name === "string" && parsed.misconception_name.trim()
        ? parsed.misconception_name.trim()
        : catalogMatch?.name || `Misconception in ${question.concept_id.replace(/-/g, " ")}`;

    const explanation =
      typeof parsed.explanation === "string" && parsed.explanation.trim()
        ? parsed.explanation.trim()
        : catalogMatch
        ? `${catalogMatch.wrong_belief}. Clarification: ${catalogMatch.correct_idea}`
        : `Selected "${chosenOption.text}", but Java produces "${correctOption.text}".`;

    const confidence = Math.max(0.7, Math.min(1, Number(parsed.confidence) || 0.9));

    const result: DetectedMisconception = {
      id: catalogMatch ? catalogMatch.id : "CUSTOM",
      name,
      explanation,
      confidence,
    };

    misconceptionCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error("[Gemini diagnosis error]", err);
    const fallback = smartFallbackMisconception(question, chosenOption, correctOption, reasoning, misconceptions);
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

  // Guessing detection
  if (lower.includes("guess") || lower.includes("guessed") || lower.includes("random pick")) {
    return {
      id: "CUSTOM",
      name: "Guessing Without Semantic Verification",
      explanation: "You selected the correct option, but stated you were guessing rather than reasoning through Java execution mechanics.",
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
  if (!reasoning || reasoning.trim().length < 4) {
    return null;
  }

  const normalized = `correct:${question.id}:${optionId}:${reasoning.trim().toLowerCase()}`;
  const cacheKey = crypto.createHash("sha256").update(normalized).digest("hex");

  if (misconceptionCache.has(cacheKey)) {
    return misconceptionCache.get(cacheKey)!;
  }

  const misconceptions = loadMisconceptions();
  const candidateMisconceptions = getMisconceptionsForConceptWithNeighbors(question.concept_id);
  const correctOption =
    question.options.find((o) => o.id === question.correct_option) || {
      id: question.correct_option,
      text: question.correct_option,
      misconception_id: null,
    };
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
However, we need to diagnose whether their written reasoning reveals a FALSE BELIEF, FLAWED MENTAL MODEL, GUESS, or WRONG JAVA RULE despite getting the answer right.

--- Question ---
Concept: ${question.concept_id}
Prompt: ${question.prompt}
${question.code ? `Code:\n${question.code}` : "No code snippet provided"}
Correct Answer Option: "${correctOption.text}" (ID: ${question.correct_option})

--- Student Submission ---
Selected Option: "${correctOption.text}" (ID: ${optionId}) (CORRECT)
Student's Written Reasoning: "${reasoning.trim()}"

--- Catalog Misconceptions (M1–M8) ---
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
1. Evaluate ONLY the student's written reasoning.
2. If their reasoning is sound, accurate, and reflects correct Java mechanics, return:
   { "misconception_id": null, "misconception_name": "", "confidence": 0, "explanation": "" }
3. If their reasoning reveals a flawed mental model, wrong rule (even outside M1–M8, such as misunderstanding widening, guessing, incorrect operator rules, etc.):
   - If matching M1–M8, set "misconception_id" to that ID.
   - Otherwise set "misconception_id" to "CUSTOM".
   - Provide a short 4-8 word "misconception_name" capturing their false belief.
   - In "explanation", write 2 crisp sentences directly quoting/contrasting their reasoning with the actual Java JVM semantics for this code.
   - "confidence": number between 0.7 and 1.0.
4. Output must be strictly valid JSON matching this schema:
{
  "misconception_id": string or null,
  "misconception_name": string,
  "confidence": number,
  "explanation": string
}`;

    const text = await callGeminiJson(ai, prompt);
    const parsed: GeminiMisconceptionResponse = JSON.parse(text);

    let result: DetectedMisconception | null = null;
    if (
      parsed.misconception_id &&
      parsed.misconception_id !== "null" &&
      parsed.misconception_id !== null &&
      Number(parsed.confidence) >= 0.7
    ) {
      const rawId = String(parsed.misconception_id).trim();
      const catalogMatch = misconceptions.find((m) => m.id === rawId);
      const name =
        typeof parsed.misconception_name === "string" && parsed.misconception_name.trim()
          ? parsed.misconception_name.trim()
          : catalogMatch?.name || "Flawed Reasoning on Correct Answer";

      const explanation =
        typeof parsed.explanation === "string" && parsed.explanation.trim()
          ? parsed.explanation.trim()
          : catalogMatch
          ? `${catalogMatch.wrong_belief}. Clarification: ${catalogMatch.correct_idea}`
          : "Your output matched, but your stated reasoning does not reflect Java mechanics.";

      result = {
        id: catalogMatch ? catalogMatch.id : "CUSTOM",
        name,
        explanation,
        confidence: Math.max(0.7, Math.min(1, Number(parsed.confidence))),
      };
    }

    misconceptionCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error("[Gemini correct diagnosis error]", err);
    const fallback = fallbackCorrectAnswerMisconception(reasoning, candidateMisconceptions);
    misconceptionCache.set(cacheKey, fallback);
    return fallback;
  }
}
