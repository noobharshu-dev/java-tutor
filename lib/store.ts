import fs from "fs";
import path from "path";
import os from "os";
import type {
  Concept,
  Misconception,
  Question,
  AnswerRequest,
  AnswerResponse,
  DetectedMisconception,
  MasteryResponse,
  ReviewItem,
  TeacherResponse,
} from "./types";
import { getInitialMastery, updateMastery } from "./learner";
import { detectMisconception, diagnoseCorrectAnswerReasoning } from "./misconception";
import { getQuestions, nextQuestion as selectNextQuestion } from "./questions";
export { getQuestions };
import { calculateSM2 } from "./sm2";

export interface SM2State {
  repetitions: number;
  interval: number; // in days
  easeFactor: number;
  nextReviewDate: string; // ISO date string
}

export interface StudentAnswerRecord {
  question_id: string;
  concept_id: string;
  option_id: string;
  reasoning: string;
  correct: boolean;
  misconception_id: string | null;
  timestamp: string;
}

export interface Student {
  id: string;
  name: string;
  mastery: Record<string, number>;
  history: StudentAnswerRecord[];
  sm2: Record<string, SM2State>;
}

export interface StoreData {
  students: Record<string, Student>;
}

const STORE_PATH = path.join(process.cwd(), "data", "store.json");
const TMP_STORE_PATH = path.join(os.tmpdir(), "javatutor-store.json");

// Helper: load concepts.json
export function getConcepts(): Concept[] {
  const filePath = path.join(process.cwd(), "data", "concepts.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// Helper: load misconceptions.json
export function getMisconceptions(): Misconception[] {
  const filePath = path.join(process.cwd(), "data", "misconceptions.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function getConceptEdges(): [string, string][] {
  const concepts = getConcepts();
  const edges: [string, string][] = [];
  for (const c of concepts) {
    for (const p of c.prerequisites) {
      edges.push([p, c.id]);
    }
  }
  return edges;
}

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q-var-1",
    concept_id: "variables-types",
    difficulty: 1,
    code: `int x = 10;\ndouble y = x;\nSystem.out.println(y);`,
    prompt: "What does this code snippet print to standard output?",
    options: [
      { id: "opt-1", text: "10.0", misconception_id: null },
      { id: "opt-2", text: "10", misconception_id: null },
      { id: "opt-3", text: "Compilation error", misconception_id: null },
      { id: "opt-4", text: "ClassCastException", misconception_id: null },
    ],
    correct_option: "opt-1",
  },
  {
    id: "q-op-1",
    concept_id: "operators",
    difficulty: 1,
    code: `int x = 5;\nint y = 2;\ndouble result = x / y;\nSystem.out.println(result);`,
    prompt: "What is printed when this snippet executes?",
    options: [
      { id: "opt-1", text: "2.5", misconception_id: "M2" },
      { id: "opt-2", text: "2.0", misconception_id: null },
      { id: "opt-3", text: "2", misconception_id: null },
      { id: "opt-4", text: "Compilation error", misconception_id: null },
    ],
    correct_option: "opt-2",
  },
  {
    id: "q-strbasics-1",
    concept_id: "strings",
    difficulty: 1,
    code: `String s = "Java";\ns.concat(" Tutor");\nSystem.out.println(s);`,
    prompt: "What is printed to standard output?",
    options: [
      { id: "opt-1", text: "Java", misconception_id: null },
      { id: "opt-2", text: "Java Tutor", misconception_id: null },
      { id: "opt-3", text: "Tutor", misconception_id: null },
      { id: "opt-4", text: "Compilation error", misconception_id: null },
    ],
    correct_option: "opt-1",
  },
  {
    id: "q-str-1",
    concept_id: "string-equality",
    difficulty: 1,
    code: `String a = new String("Java");\nString b = new String("Java");\nSystem.out.println(a == b);\nSystem.out.println(a.equals(b));`,
    prompt: "What does this code snippet print to standard output?",
    options: [
      { id: "opt-1", text: "false then true", misconception_id: null },
      { id: "opt-2", text: "true then true", misconception_id: "M1" },
      { id: "opt-3", text: "true then false", misconception_id: null },
      { id: "opt-4", text: "false then false", misconception_id: null },
    ],
    correct_option: "opt-1",
  },
  {
    id: "q-cond-1",
    concept_id: "conditionals",
    difficulty: 1,
    code: `int score = 75;\nif (score > 90) {\n    System.out.println("A");\n} else if (score > 70) {\n    System.out.println("B");\n} else {\n    System.out.println("C");\n}`,
    prompt: "What grade is output by this conditional block?",
    options: [
      { id: "opt-1", text: "B", misconception_id: null },
      { id: "opt-2", text: "A", misconception_id: null },
      { id: "opt-3", text: "C", misconception_id: null },
      { id: "opt-4", text: "B and C", misconception_id: null },
    ],
    correct_option: "opt-1",
  },
  {
    id: "q-loop-1",
    concept_id: "loops",
    difficulty: 1,
    code: `int count = 0;\nfor (int i = 0; i <= 5; i++) {\n    count++;\n}\nSystem.out.println(count);`,
    prompt: "What does the console print?",
    options: [
      { id: "opt-1", text: "5", misconception_id: "M5" },
      { id: "opt-2", text: "6", misconception_id: null },
      { id: "opt-3", text: "4", misconception_id: null },
      { id: "opt-4", text: "Infinite loop", misconception_id: null },
    ],
    correct_option: "opt-2",
  },
  {
    id: "q-arr-1",
    concept_id: "arrays",
    difficulty: 1,
    code: `int[] arr = new int[5];\nSystem.out.println(arr[arr.length]);`,
    prompt: "What happens when this snippet runs?",
    options: [
      { id: "opt-1", text: "Prints 0 (the default value of the last slot)", misconception_id: "M4" },
      { id: "opt-2", text: "Throws ArrayIndexOutOfBoundsException", misconception_id: null },
      { id: "opt-3", text: "Prints null", misconception_id: null },
      { id: "opt-4", text: "Compilation error", misconception_id: null },
    ],
    correct_option: "opt-2",
  },
  {
    id: "q-methods-1",
    concept_id: "methods",
    difficulty: 2,
    code: `public static void modify(int[] list) {\n    list = new int[] { 99, 100 };\n}\n\npublic static void main(String[] args) {\n    int[] nums = { 1, 2 };\n    modify(nums);\n    System.out.println(nums[0]);\n}`,
    prompt: "What value is printed by main?",
    options: [
      { id: "opt-1", text: "99", misconception_id: "M3" },
      { id: "opt-2", text: "1", misconception_id: null },
      { id: "opt-3", text: "NullPointerException", misconception_id: null },
      { id: "opt-4", text: "Compilation error", misconception_id: null },
    ],
    correct_option: "opt-2",
  },
  {
    id: "q-cls-1",
    concept_id: "classes-objects",
    difficulty: 2,
    code: `class Point {\n    int x;\n    Point(int x) { this.x = x; }\n}\nPoint p = new Point(5);\nSystem.out.println(p.x);`,
    prompt: "What is the value of p.x printed to the console?",
    options: [
      { id: "opt-1", text: "5", misconception_id: null },
      { id: "opt-2", text: "0", misconception_id: null },
      { id: "opt-3", text: "null", misconception_id: null },
      { id: "opt-4", text: "Compilation error", misconception_id: null },
    ],
    correct_option: "opt-1",
  },
  {
    id: "q-ref-1",
    concept_id: "references",
    difficulty: 2,
    code: `int[] first = { 10, 20 };\nint[] second = first;\nsecond[0] = 50;\nSystem.out.println(first[0]);`,
    prompt: "What value does first[0] contain after the assignment?",
    options: [
      { id: "opt-1", text: "10 (second is an independent copy)", misconception_id: "M6" },
      { id: "opt-2", text: "50 (both refer to the same array)", misconception_id: null },
      { id: "opt-3", text: "0", misconception_id: null },
      { id: "opt-4", text: "Compilation error", misconception_id: null },
    ],
    correct_option: "opt-2",
  },
  {
    id: "q-static-1",
    concept_id: "static-instance",
    difficulty: 2,
    code: `class Item {\n    static int tally = 0;\n    Item() { tally++; }\n}\nItem a = new Item();\nItem b = new Item();\nSystem.out.println(a.tally + " " + b.tally);`,
    prompt: "What is printed to the terminal?",
    options: [
      { id: "opt-1", text: "1 1", misconception_id: "M7" },
      { id: "opt-2", text: "2 2", misconception_id: null },
      { id: "opt-3", text: "1 2", misconception_id: null },
      { id: "opt-4", text: "0 0", misconception_id: null },
    ],
    correct_option: "opt-2",
  },
  {
    id: "q-inh-1",
    concept_id: "inheritance",
    difficulty: 2,
    code: `class Animal {\n    void sound() { System.out.println("Animal"); }\n}\nclass Cat extends Animal {\n    void sound() { System.out.println("Meow"); }\n}\nAnimal pet = new Cat();\npet.sound();`,
    prompt: "Which sound method executes?",
    options: [
      { id: "opt-1", text: "Animal", misconception_id: "M8" },
      { id: "opt-2", text: "Meow", misconception_id: null },
      { id: "opt-3", text: "Compilation error", misconception_id: null },
      { id: "opt-4", text: "ClassCastException", misconception_id: null },
    ],
    correct_option: "opt-2",
  },
];

function createDefaultMastery(): Record<string, number> {
  return getInitialMastery();
}

function createInitialStore(): StoreData {
  const initialMastery1 = createDefaultMastery();
  initialMastery1["variables-types"] = 0.85;
  initialMastery1["operators"] = 0.7;
  initialMastery1["strings"] = 0.8;
  initialMastery1["string-equality"] = 0.4;
  initialMastery1["conditionals"] = 0.65;
  initialMastery1["loops"] = 0.5;
  initialMastery1["arrays"] = 0.35;

  const initialMastery2 = createDefaultMastery();
  initialMastery2["variables-types"] = 0.95;
  initialMastery2["operators"] = 0.9;
  initialMastery2["strings"] = 0.85;
  initialMastery2["string-equality"] = 0.8;
  initialMastery2["conditionals"] = 0.85;
  initialMastery2["loops"] = 0.75;
  initialMastery2["arrays"] = 0.7;
  initialMastery2["methods"] = 0.6;
  initialMastery2["classes-objects"] = 0.5;

  const initialMastery3 = createDefaultMastery();
  initialMastery3["variables-types"] = 0.6;
  initialMastery3["operators"] = 0.45;
  initialMastery3["strings"] = 0.5;
  initialMastery3["string-equality"] = 0.3;

  const now = new Date();
  const addDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

  return {
    students: {
      "student-1": {
        id: "student-1",
        name: "Alex Johnson",
        mastery: initialMastery1,
        history: [
          {
            question_id: "q-str-1",
            concept_id: "string-equality",
            option_id: "opt-2",
            reasoning: "I assumed == checks whether both strings have identical characters.",
            correct: false,
            misconception_id: "M1",
            timestamp: new Date(now.getTime() - 86400000).toISOString(),
          },
          {
            question_id: "q-op-1",
            concept_id: "operators",
            option_id: "opt-1",
            reasoning: "5 divided by 2 is 2.5 in math.",
            correct: false,
            misconception_id: "M2",
            timestamp: new Date(now.getTime() - 43200000).toISOString(),
          },
        ],
        sm2: {
          "string-equality": { repetitions: 0, interval: 1, easeFactor: 2.3, nextReviewDate: addDays(1) },
          operators: { repetitions: 1, interval: 2, easeFactor: 2.4, nextReviewDate: addDays(2) },
          "variables-types": { repetitions: 3, interval: 6, easeFactor: 2.6, nextReviewDate: addDays(5) },
          arrays: { repetitions: 0, interval: 1, easeFactor: 2.5, nextReviewDate: addDays(1) },
        },
      },
      "student-2": {
        id: "student-2",
        name: "Beatriz Ramos",
        mastery: initialMastery2,
        history: [],
        sm2: {
          "classes-objects": { repetitions: 2, interval: 4, easeFactor: 2.5, nextReviewDate: addDays(3) },
        },
      },
      "student-3": {
        id: "student-3",
        name: "Chen Wei",
        mastery: initialMastery3,
        history: [],
        sm2: {
          operators: { repetitions: 0, interval: 1, easeFactor: 2.2, nextReviewDate: addDays(1) },
        },
      },
    },
  };
}

// Preserve across HMR using globalThis
const globalForStore = globalThis as unknown as {
  __javaTutorStore?: StoreData;
};

export function loadStore(): StoreData {
  if (globalForStore.__javaTutorStore) {
    return globalForStore.__javaTutorStore;
  }

  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const data = JSON.parse(raw);
      globalForStore.__javaTutorStore = data;
      return data;
    }
  } catch (err) {
    console.warn("Primary store read failed, attempting temp store fallback:", err);
  }

  try {
    if (fs.existsSync(TMP_STORE_PATH)) {
      const raw = fs.readFileSync(TMP_STORE_PATH, "utf-8");
      const data = JSON.parse(raw);
      globalForStore.__javaTutorStore = data;
      return data;
    }
  } catch (err) {
    console.warn("Fallback temp store read failed:", err);
  }

  const defaultData = createInitialStore();
  saveStore(defaultData);
  globalForStore.__javaTutorStore = defaultData;
  return defaultData;
}

export function saveStore(data: StoreData): void {
  globalForStore.__javaTutorStore = data;
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return;
  } catch (err) {
    // EROFS / EACCES on read-only serverless filesystems (e.g. Vercel)
    console.warn("Primary store write failed (read-only filesystem?), falling back to temp dir:", err);
  }

  try {
    const tmpDir = path.dirname(TMP_STORE_PATH);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(TMP_STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (tmpErr) {
    console.error("Fallback temp store write failed:", tmpErr);
  }
}

// Public Store API
export function getStudents(): Student[] {
  const store = loadStore();
  return Object.values(store.students);
}

export function getStudent(id: string): Student {
  const store = loadStore();
  if (!store.students[id]) {
    store.students[id] = {
      id,
      name: `Student ${id}`,
      mastery: createDefaultMastery(),
      history: [],
      sm2: {},
    };
    saveStore(store);
  }
  return store.students[id];
}

export function getMastery(studentId: string = "student-1"): MasteryResponse {
  const student = getStudent(studentId);
  return {
    mastery: student.mastery,
    edges: getConceptEdges(),
  };
}

export function getReviewSchedule(studentId: string = "student-1"): ReviewItem[] {
  const student = getStudent(studentId);
  const now = Date.now();
  const items: ReviewItem[] = [];

  for (const [conceptId, state] of Object.entries(student.sm2)) {
    const dueTime = new Date(state.nextReviewDate).getTime();
    const diffDays = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
    items.push({
      concept_id: conceptId,
      due_in_days: Math.max(0, diffDays),
    });
  }

  return items.sort((a, b) => a.due_in_days - b.due_in_days);
}

export function getTeacherOverview(): TeacherResponse {
  const store = loadStore();
  const concepts = getConcepts().map((c) => c.name);
  const misconceptions = getMisconceptions();

  const studentsList = Object.values(store.students).map((s) => ({
    name: s.name,
    mastery: s.mastery,
  }));

  // Calculate misconception statistics from all answer history
  const countPerMisconception: Record<string, number> = {};
  let totalIncorrectWithMisconception = 0;

  for (const s of Object.values(store.students)) {
    for (const h of s.history) {
      if (h.misconception_id) {
        countPerMisconception[h.misconception_id] = (countPerMisconception[h.misconception_id] || 0) + 1;
        totalIncorrectWithMisconception++;
      }
    }
  }

  const top_misconceptions = misconceptions
    .map((m) => {
      const count = countPerMisconception[m.id] || 0;
      const percent =
        totalIncorrectWithMisconception > 0
          ? Math.round((count / totalIncorrectWithMisconception) * 100)
          : 0;
      return {
        id: m.id,
        name: m.name,
        percent,
      };
    })
    .sort((a, b) => b.percent - a.percent);

  return {
    concepts,
    students: studentsList,
    top_misconceptions,
  };
}

export function getQuestion(id?: string, conceptId?: string): Question {
  const bank = getQuestions();
  if (id) {
    const found = bank.find((q) => q.id === id);
    if (found) return found;
  }
  if (conceptId) {
    const found = bank.find((q) => q.concept_id === conceptId);
    if (found) return found;
  }
  return bank[0];
}

export function getQuestionForConcept(conceptId: string, excludeQuestionId?: string): Question {
  const bank = getQuestions();
  const matching = bank.filter((q) => q.concept_id === conceptId);
  if (matching.length === 0) {
    return bank[0];
  }
  const different = matching.find((q) => q.id !== excludeQuestionId);
  return different || matching[0];
}

export function getNextQuestion(currentQuestionId?: string): Question {
  const bank = getQuestions();
  const idx = bank.findIndex((q) => q.id === currentQuestionId);
  const nextIdx = idx >= 0 && idx < bank.length - 1 ? idx + 1 : 0;
  return bank[nextIdx];
}


export async function recordAnswer(
  req: AnswerRequest,
  preDiagnosedMisconception?: DetectedMisconception | null
): Promise<AnswerResponse> {
  const store = loadStore();
  const student = getStudent(req.student_id);

  const questionBank = getQuestions();
  const question =
    questionBank.find((q) => q.id === req.question_id) ||
    SAMPLE_QUESTIONS.find((q) => q.id === req.question_id) ||
    questionBank[0] ||
    SAMPLE_QUESTIONS[0];
  const selectedOption = question.options.find((o) => o.id === req.option_id) || question.options[0];
  const isCorrect = question.correct_option === req.option_id;

  let detectedMisconception: DetectedMisconception | null = null;
  if (!isCorrect) {
    detectedMisconception = await detectMisconception(question, selectedOption, req.reasoning);
  } else if (preDiagnosedMisconception !== undefined) {
    detectedMisconception = preDiagnosedMisconception;
  } else if (req.reasoning) {
    detectedMisconception = await diagnoseCorrectAnswerReasoning(question, req.option_id, req.reasoning);
  }

  // Update mastery using learner model (mastery += 0.3 * (target - mastery); reduce prereqs if wrong)
  student.mastery = updateMastery(student.mastery, question.concept_id, isCorrect);

  // Update SM-2 schedule (quality 5 if correct, 2 if wrong)
  const currentSM2 = student.sm2[question.concept_id] || {
    repetitions: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
  };
  const updatedSM2 = calculateSM2(
    {
      concept_id: question.concept_id,
      repetitions: currentSM2.repetitions,
      interval: currentSM2.interval,
      easeFactor: currentSM2.easeFactor,
      dueDate: currentSM2.nextReviewDate,
    },
    isCorrect
  );
  student.sm2[question.concept_id] = {
    repetitions: updatedSM2.repetitions,
    interval: updatedSM2.interval,
    easeFactor: updatedSM2.easeFactor,
    nextReviewDate: updatedSM2.dueDate || new Date().toISOString(),
  };

  // Append history
  student.history.push({
    question_id: question.id,
    concept_id: question.concept_id,
    option_id: req.option_id,
    reasoning: req.reasoning,
    correct: isCorrect,
    misconception_id: detectedMisconception?.id ?? null,
    timestamp: new Date().toISOString(),
  });

  saveStore(store);

  // Pick next question adaptively (concept from learner, difficulty from history, targeting misconceptions, non-repeating)
  const nextQuestion = selectNextQuestion(student);

  return {
    correct: isCorrect,
    misconception: detectedMisconception,
    mastery: student.mastery,
    next_question: nextQuestion,
  };
}
