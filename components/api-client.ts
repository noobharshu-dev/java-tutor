import {
  AnswerRequest,
  AnswerResponse,
  Concept,
  MasteryResponse,
  Question,
  ReviewItem,
  TeacherResponse,
} from "@/lib/types";

// Fallback seed data in case backend API routes are stubbed or pending
const FALLBACK_CONCEPTS: Concept[] = [
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

const FALLBACK_QUESTIONS: Question[] = [
  {
    id: "q-str-eq-1",
    concept_id: "string-equality",
    difficulty: 2,
    prompt: "What is printed to the console when the following Java code executes?",
    code: `String s1 = new String("Java");\nString s2 = new String("Java");\n\nif (s1 == s2) {\n    System.out.println("EQUAL");\n} else {\n    System.out.println("DIFFERENT");\n}`,
    options: [
      {
        id: "opt-1",
        text: 'DIFFERENT — because "==" compares memory addresses/references, not character contents.',
        misconception_id: null,
      },
      {
        id: "opt-2",
        text: 'EQUAL — because both string variables hold the exact same characters "Java".',
        misconception_id: "M1",
      },
      {
        id: "opt-3",
        text: "Compilation error — you cannot use == operator with String objects in Java.",
        misconception_id: null,
      },
      {
        id: "opt-4",
        text: "NullPointerException — strings initialized with new keyword require .equals().",
        misconception_id: null,
      },
    ],
    correct_option: "opt-1",
  },
  {
    id: "q-ops-div-1",
    concept_id: "operators",
    difficulty: 1,
    prompt: "What will be printed when evaluating the expression below?",
    code: `int a = 5;\nint b = 2;\ndouble result = a / b;\nSystem.out.println(result);`,
    options: [
      {
        id: "opt-1",
        text: "2.5 — Java automatically promotes integer division to decimal if stored in a double.",
        misconception_id: "M2",
      },
      {
        id: "opt-2",
        text: "2.0 — int/int produces integer 2 (truncating decimals), which is then cast to double 2.0.",
        misconception_id: null,
      },
      {
        id: "opt-3",
        text: "2 — the result remains an integer.",
        misconception_id: null,
      },
      {
        id: "opt-4",
        text: "Compilation error — cannot assign int division to a double variable.",
        misconception_id: null,
      },
    ],
    correct_option: "opt-2",
  },
  {
    id: "q-methods-pass-1",
    concept_id: "methods",
    difficulty: 2,
    prompt: "What output does this Java program produce?",
    code: `public class Main {\n    public static void modify(int[] nums) {\n        nums = new int[]{ 99, 100 };\n    }\n    public static void main(String[] args) {\n        int[] original = { 1, 2 };\n        modify(original);\n        System.out.println(original[0]);\n    }\n}`,
    options: [
      {
        id: "opt-1",
        text: "1 — Java is strictly pass-by-value; reassigning nums only overwrites the local copy of the reference.",
        misconception_id: null,
      },
      {
        id: "opt-2",
        text: "99 — Java passes objects by reference, so reassigning nums modifies original.",
        misconception_id: "M3",
      },
      {
        id: "opt-3",
        text: "Compilation error — arrays cannot be passed to static methods.",
        misconception_id: null,
      },
      {
        id: "opt-4",
        text: "0 — array default value is restored when returned.",
        misconception_id: null,
      },
    ],
    correct_option: "opt-1",
  },
  {
    id: "q-loops-bounds-1",
    concept_id: "loops",
    difficulty: 1,
    prompt: "How many times does the loop body execute?",
    code: `int count = 0;\nfor (int i = 0; i <= 5; i++) {\n    count++;\n}\nSystem.out.println(count);`,
    options: [
      {
        id: "opt-1",
        text: "5 times — because the loop limit is 5.",
        misconception_id: "M5",
      },
      {
        id: "opt-2",
        text: "6 times — starting from index 0 through 5 inclusive (0, 1, 2, 3, 4, 5).",
        misconception_id: null,
      },
      {
        id: "opt-3",
        text: "4 times — the loop stops before reaching 5.",
        misconception_id: null,
      },
      {
        id: "opt-4",
        text: "Infinite loop — condition is always true.",
        misconception_id: null,
      },
    ],
    correct_option: "opt-2",
  },
  {
    id: "q-inheritance-poly-1",
    concept_id: "inheritance",
    difficulty: 3,
    prompt: "Given the class hierarchy, which speak() method is invoked at runtime?",
    code: `class Animal {\n    void speak() { System.out.println("Animal sound"); }\n}\nclass Dog extends Animal {\n    @Override\n    void speak() { System.out.println("Bark!"); }\n}\n\npublic class Test {\n    public static void main(String[] args) {\n        Animal a = new Dog();\n        a.speak();\n    }\n}`,
    options: [
      {
        id: "opt-1",
        text: 'Bark! — Java uses dynamic method dispatch based on the actual object type (Dog) in heap.',
        misconception_id: null,
      },
      {
        id: "opt-2",
        text: 'Animal sound — because variable "a" is declared with static type Animal.',
        misconception_id: "M8",
      },
      {
        id: "opt-3",
        text: "Compilation error — Animal variable cannot reference a Dog object without an explicit cast.",
        misconception_id: null,
      },
      {
        id: "opt-4",
        text: "Both lines are printed sequentially.",
        misconception_id: null,
      },
    ],
    correct_option: "opt-1",
  },
];

const FALLBACK_MISCONCEPTIONS_MAP: Record<
  string,
  { name: string; wrong_belief: string; correct_idea: string; explanation: string }
> = {
  M1: {
    name: "== compares string contents",
    wrong_belief: "== checks whether two strings have the same text",
    correct_idea: "== compares references (memory addresses); .equals() compares contents",
    explanation:
      'In Java, the == operator checks reference identity (whether both variables point to the identical heap location). Because "new String(...)" allocates a distinct object, s1 == s2 is false even though their characters match. Use s1.equals(s2) to compare content.',
  },
  M2: {
    name: "int / int gives a decimal",
    wrong_belief: "5/2 evaluates to 2.5",
    correct_idea: "integer division truncates; 5/2 evaluates to 2",
    explanation:
      "When both operands of / are integers, Java performs integer division and truncates any decimal remainder. 5 / 2 yields 2. Storing it in a double only casts 2 to 2.0 afterwards.",
  },
  M3: {
    name: "Java passes objects by reference",
    wrong_belief: "reassigning a parameter inside a method changes the caller's variable",
    correct_idea: "Java is always pass-by-value; for objects, the reference address is copied by value",
    explanation:
      "Java is strictly pass-by-value. When an object is passed, a copy of the reference is delivered. Modifying fields of the object affects the caller, but reassigning the parameter variable itself only re-points the local copy.",
  },
  M4: {
    name: "Wrong array indexing",
    wrong_belief: "arrays start at 1, or arr[arr.length] is the last element",
    correct_idea: "indexes run 0 to length-1",
    explanation:
      "Java array indices are 0-based. An array of size N has indices 0 through N-1. Accessing arr[arr.length] throws ArrayIndexOutOfBoundsException.",
  },
  M5: {
    name: "Off-by-one in loop bounds",
    wrong_belief: "for(i=0; i<=n; i++) runs n times",
    correct_idea: "it runs n+1 times; use < for exactly n iterations",
    explanation:
      "Iterating from i = 0 up to i <= 5 executes for 0, 1, 2, 3, 4, and 5 (a total of 6 iterations). To run n times from 0, use i < n.",
  },
  M6: {
    name: "Assignment copies the object",
    wrong_belief: "b = a creates an independent copy of the object",
    correct_idea: "b = a copies the reference, so both point to the same object",
    explanation:
      "Assignment with object variables copies the reference address, not the underlying heap object. Mutating through b will be visible when reading a.",
  },
  M7: {
    name: "Static fields are per-object",
    wrong_belief: "each object has its own copy of a static field",
    correct_idea: "a static field is shared by the whole class across all instances",
    explanation:
      "Static variables belong to the class itself, not to individual instances. Changing a static variable via one instance modifies it for all instances.",
  },
  M8: {
    name: "Declared type decides which method runs",
    wrong_belief: "Animal a = new Dog(); a.speak() calls Animal's version",
    correct_idea: "overridden methods are chosen by the actual runtime object (polymorphism)",
    explanation:
      "Java utilizes virtual method invocation. The JVM inspects the actual runtime object on the heap (Dog) rather than the compile-time variable declaration (Animal) to determine which overridden method executes.",
  },
};

// Initial local mastery cache to keep user progress fluid
const studentMasteryCache: Record<string, Record<string, number>> = {
  "student-1": {
    "variables-types": 85,
    "operators": 60,
    "strings": 75,
    "string-equality": 30,
    "conditionals": 65,
    "loops": 50,
    "arrays": 40,
    "methods": 35,
    "classes-objects": 20,
    "references": 25,
    "static-instance": 15,
    "inheritance": 10,
  },
};

/**
 * Calls real /api/question or falls back gracefully
 */
export async function apiGetQuestion(
  studentId: string = "student-1",
  conceptId?: string
): Promise<Question> {
  try {
    const url = new URL("/api/question", window.location.origin);
    url.searchParams.set("student_id", studentId);
    if (conceptId) url.searchParams.set("concept_id", conceptId);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.id && data.prompt) {
        return data as Question;
      }
    }
  } catch {
    // API route stubbed or pending: graceful fallback
  }

  // Fallback: pick matching question
  if (conceptId) {
    const matched = FALLBACK_QUESTIONS.find((q) => q.concept_id === conceptId);
    if (matched) return matched;
  }
  return FALLBACK_QUESTIONS[0];
}

/**
 * Calls real POST /api/answer
 */
export async function apiSubmitAnswer(
  request: AnswerRequest
): Promise<AnswerResponse> {
  try {
    const res = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(request),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.correct === "boolean") {
        return data as AnswerResponse;
      }
    }
  } catch {
    // Fallback if route returns 404 or server is stubbed
  }

  // Graceful diagnostic logic
  const currentQ =
    FALLBACK_QUESTIONS.find((q) => q.id === request.question_id) ||
    FALLBACK_QUESTIONS[0];

  const selectedOption = currentQ.options.find(
    (opt) => opt.id === request.option_id
  );
  const isCorrect = request.option_id === currentQ.correct_option;

  // Retrieve current student mastery
  if (!studentMasteryCache[request.student_id]) {
    studentMasteryCache[request.student_id] = { ...studentMasteryCache["student-1"] };
  }
  const studentMastery = { ...studentMasteryCache[request.student_id] };
  const currentScore = studentMastery[currentQ.concept_id] ?? 50;

  let detectedMisconception = null;
  if (!isCorrect) {
    const miscId = selectedOption?.misconception_id;
    if (miscId && FALLBACK_MISCONCEPTIONS_MAP[miscId]) {
      const info = FALLBACK_MISCONCEPTIONS_MAP[miscId];
      detectedMisconception = {
        id: miscId,
        name: info.name,
        explanation: info.explanation,
        confidence: 0.94,
      };
    } else {
      detectedMisconception = {
        id: "M-GENERAL",
        name: "Conceptual gap in " + currentQ.concept_id,
        explanation:
          "Your chosen option indicates confusion with standard Java evaluation semantics.",
        confidence: 0.72,
      };
    }
    // Update mastery slightly downwards or maintain
    studentMastery[currentQ.concept_id] = Math.max(10, currentScore - 8);
  } else {
    // Boost mastery on correct
    studentMastery[currentQ.concept_id] = Math.min(100, currentScore + 15);
  }
  studentMasteryCache[request.student_id] = studentMastery;

  // Find next question
  const currentIndex = FALLBACK_QUESTIONS.findIndex((q) => q.id === currentQ.id);
  const nextQ =
    FALLBACK_QUESTIONS[(currentIndex + 1) % FALLBACK_QUESTIONS.length];

  return {
    correct: isCorrect,
    misconception: detectedMisconception,
    mastery: studentMastery,
    next_question: nextQ,
  };
}

/**
 * Calls real GET /api/mastery
 */
export async function apiGetMastery(
  studentId: string = "student-1"
): Promise<MasteryResponse> {
  try {
    const url = new URL("/api/mastery", window.location.origin);
    url.searchParams.set("student_id", studentId);
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.mastery) {
        return data as MasteryResponse;
      }
    }
  } catch {
    // Graceful fallback
  }

  const currentMastery =
    studentMasteryCache[studentId] || studentMasteryCache["student-1"];

  const edges: [string, string][] = [
    ["variables-types", "operators"],
    ["variables-types", "strings"],
    ["variables-types", "methods"],
    ["strings", "string-equality"],
    ["operators", "string-equality"],
    ["operators", "conditionals"],
    ["conditionals", "loops"],
    ["conditionals", "methods"],
    ["loops", "arrays"],
    ["methods", "classes-objects"],
    ["classes-objects", "references"],
    ["arrays", "references"],
    ["classes-objects", "static-instance"],
    ["classes-objects", "inheritance"],
  ];

  return {
    mastery: currentMastery,
    edges,
  };
}

/**
 * Calls real GET /api/review
 */
export async function apiGetReviews(
  studentId: string = "student-1"
): Promise<ReviewItem[]> {
  try {
    const url = new URL("/api/review", window.location.origin);
    url.searchParams.set("student_id", studentId);
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data as ReviewItem[];
      }
    }
  } catch {
    // Graceful fallback
  }

  return [
    { concept_id: "string-equality", due_in_days: 0 },
    { concept_id: "operators", due_in_days: 1 },
    { concept_id: "references", due_in_days: 2 },
    { concept_id: "loops", due_in_days: 5 },
    { concept_id: "inheritance", due_in_days: 7 },
  ];
}

/**
 * Calls real GET /api/teacher
 */
export async function apiGetTeacherDashboard(): Promise<TeacherResponse> {
  try {
    const res = await fetch("/api/teacher", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.concepts) && Array.isArray(data.students)) {
        return data as TeacherResponse;
      }
    }
  } catch {
    // Graceful fallback
  }

  return {
    concepts: [
      "variables-types",
      "operators",
      "strings",
      "string-equality",
      "conditionals",
      "loops",
      "arrays",
      "methods",
      "classes-objects",
      "references",
      "static-instance",
      "inheritance",
    ],
    students: [
      {
        name: "Harshit",
        mastery: {
          "variables-types": 90,
          "operators": 65,
          "strings": 80,
          "string-equality": 30,
          "conditionals": 75,
          "loops": 55,
          "arrays": 40,
          "methods": 45,
          "classes-objects": 30,
          "references": 25,
          "static-instance": 20,
          "inheritance": 15,
        },
      },
      {
        name: "Alex Rivera",
        mastery: {
          "variables-types": 95,
          "operators": 85,
          "strings": 90,
          "string-equality": 70,
          "conditionals": 85,
          "loops": 80,
          "arrays": 75,
          "methods": 65,
          "classes-objects": 60,
          "references": 50,
          "static-instance": 45,
          "inheritance": 40,
        },
      },
      {
        name: "Priya Sharma",
        mastery: {
          "variables-types": 85,
          "operators": 45,
          "strings": 60,
          "string-equality": 25,
          "conditionals": 50,
          "loops": 40,
          "arrays": 35,
          "methods": 30,
          "classes-objects": 20,
          "references": 15,
          "static-instance": 10,
          "inheritance": 10,
        },
      },
      {
        name: "Marcus Vance",
        mastery: {
          "variables-types": 100,
          "operators": 95,
          "strings": 95,
          "string-equality": 90,
          "conditionals": 90,
          "loops": 90,
          "arrays": 85,
          "methods": 85,
          "classes-objects": 80,
          "references": 75,
          "static-instance": 70,
          "inheritance": 65,
        },
      },
    ],
    top_misconceptions: [
      {
        id: "M1",
        name: "== compares string contents",
        percent: 68,
      },
      {
        id: "M3",
        name: "Java passes objects by reference",
        percent: 54,
      },
      {
        id: "M2",
        name: "int / int gives a decimal",
        percent: 42,
      },
      {
        id: "M6",
        name: "Assignment copies the object",
        percent: 38,
      },
      {
        id: "M8",
        name: "Declared type decides which method runs",
        percent: 32,
      },
    ],
  };
}

/**
 * Calls real GET /api/concepts
 */
export async function apiGetConcepts(): Promise<Concept[]> {
  try {
    const res = await fetch("/api/concepts", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data as Concept[];
      }
    }
  } catch {
    // Fallback
  }
  return FALLBACK_CONCEPTS;
}
