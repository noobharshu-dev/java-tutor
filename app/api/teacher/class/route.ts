import fs from "fs";
import path from "path";
import type { TeacherResponse, Concept, Misconception } from "@/lib/types";

export interface SeedStudent {
  id: string;
  name: string;
  misconception_id: string;
  mastery: Record<string, number>;
}

function loadSeedStudents(): SeedStudent[] {
  const filePath = path.join(process.cwd(), "data", "seed-students.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function loadConcepts(): Concept[] {
  const filePath = path.join(process.cwd(), "data", "concepts.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function loadMisconceptions(): Misconception[] {
  const filePath = path.join(process.cwd(), "data", "misconceptions.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function computeTeacherClassData(): TeacherResponse {
  const seedStudents = loadSeedStudents();
  const concepts = loadConcepts();
  const misconceptions = loadMisconceptions();

  // Heatmap rows
  const students = seedStudents.map((s) => ({
    name: s.name,
    mastery: s.mastery,
  }));

  // Misconception counts
  const counts: Record<string, number> = {};
  for (const s of seedStudents) {
    if (s.misconception_id) {
      counts[s.misconception_id] = (counts[s.misconception_id] || 0) + 1;
    }
  }

  const total = seedStudents.length || 1;
  const top_misconceptions = misconceptions
    .map((m) => {
      const c = counts[m.id] || 0;
      const percent = Math.round((c / total) * 100);
      return {
        id: m.id,
        name: m.name,
        percent,
      };
    })
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);

  return {
    concepts: concepts.map((c) => c.id),
    students,
    top_misconceptions,
  };
}

export async function GET() {
  const data: TeacherResponse = computeTeacherClassData();
  return Response.json(data);
}
