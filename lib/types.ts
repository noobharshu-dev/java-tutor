export type Concept = { id: string; name: string; prerequisites: string[] };
export type Misconception = { id: string; concept_id: string; name: string; wrong_belief: string; correct_idea: string };
export type Option = { id: string; text: string; misconception_id: string | null };
export type Question = { id: string; concept_id: string; difficulty: 1 | 2 | 3; code?: string; prompt: string; options: Option[]; correct_option: string };

export type AnswerRequest = { student_id: string; question_id: string; option_id: string; reasoning: string };
export type DetectedMisconception = { id: string; name: string; explanation: string; confidence: number };
export type AnswerResponse = { correct: boolean; misconception: DetectedMisconception | null; mastery: Record<string, number>; next_question: Question };
export type MasteryResponse = { mastery: Record<string, number>; edges: [string, string][] };
export type ReviewItem = { concept_id: string; due_in_days: number };
export type TeacherResponse = {
  concepts: string[];
  students: { name: string; mastery: Record<string, number> }[];
  top_misconceptions: { id: string; name: string; percent: number }[];
};
