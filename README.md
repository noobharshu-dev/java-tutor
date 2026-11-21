# JavaTutor — Cognitive Diagnostic Tutor for Java SE

> **We don't track what you got wrong. We track what you *misunderstand*.**

JavaTutor is an AI-powered adaptive learning platform that reads a student's written reasoning to pinpoint flawed mental models — not just right/wrong answers — and schedules targeted practice using spaced repetition.

---

## How It Works

1. **Student answers a Java question** and writes a one-line explanation of their reasoning.
2. **Gemini AI reads the reasoning** and classifies any misconception behind the answer (e.g., *"assumes `==` compares text contents"*).
3. **Mastery is updated** per concept using an exponential moving-average model, with prerequisite concepts penalized when a downstream concept is missed.
4. **Next question is selected** by picking the lowest-mastery concept whose prerequisites are all above the threshold (≥ 0.5).
5. **Spaced repetition (SM-2)** schedules future reviews so concepts are revisited at the right intervals.
6. **Teachers see a live class radar** — a cohort mastery heatmap and the top misconceptions spreading across students.

---

## Features

| Feature | Description |
|---|---|
| 🧠 **Misconception detection** | Gemini classifies the *wrong belief* behind an answer, not just correctness |
| 📈 **Adaptive question selection** | Prerequisite-aware; always targets your weakest unlocked concept |
| 🗺️ **Knowledge graph** | Interactive DAG of Java concepts with live mastery overlaid |
| 🔁 **SM-2 spaced repetition** | Scientifically-scheduled reviews to fight forgetting |
| 👩‍🏫 **Teacher dashboard** | Cohort heatmap + top-3 class-wide misconceptions |
| 🎯 **Diagnostic mode** | First-run assessment to bootstrap a student's mastery profile |
| 💻 **Syntax-highlighted code** | Questions rendered with Shiki (server-side, zero flash) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| AI | Google Gemini via `@google/genai` |
| Graph UI | `@xyflow/react` |
| Code highlighting | Shiki 4 |
| Persistence | Local JSON file (`data/store.json`) |

---

## Concept Curriculum

The tutor covers 12 core Java SE concepts in a prerequisite-ordered DAG:

```
Variables & Data Types
├── Operators & Integer Division
│   ├── Conditionals
│   │   ├── Loops
│   │   │   └── Arrays
│   │   └── Methods & Parameter Passing
│   │       └── Classes & Objects
│   │           ├── References & Aliasing ←─ also needs Arrays
│   │           ├── Static vs Instance
│   │           └── Inheritance & Polymorphism
└── String Basics
    └── String Equality (== vs equals) ←─ also needs Operators
```

---

## Project Structure

```
java-tutor/
├── app/
│   ├── page.tsx              # Landing page with interactive preview
│   ├── diagnostic/           # First-run diagnostic flow
│   ├── practice/             # Ongoing adaptive practice
│   ├── dashboard/            # Student mastery graph & review schedule
│   ├── teacher/              # Teacher radar (cohort view)
│   └── api/
│       ├── answer/           # POST — grade answer, detect misconception, update mastery
│       ├── question/         # GET  — fetch next question for a student
│       ├── questions/        # GET  — fetch questions by concept
│       ├── mastery/          # GET  — student mastery + graph edges
│       ├── concepts/         # GET  — all concepts
│       ├── misconceptions/   # GET  — misconception catalogue
│       ├── review/           # GET  — due review items (SM-2)
│       ├── reviews/          # GET  — full review schedule
│       ├── session/          # POST — create/resume a student session
│       └── teacher/          # GET  — cohort heatmap + top misconceptions
├── components/               # React UI components
├── lib/
│   ├── types.ts              # Shared TypeScript types (source of truth)
│   ├── learner.ts            # Mastery model & concept selection
│   ├── sm2.ts                # SM-2 spaced repetition algorithm
│   ├── teacher.ts            # Cohort aggregation
│   ├── misconception.ts      # Gemini-based misconception classifier
│   ├── questions.ts          # Question loading utilities
│   └── store.ts              # JSON file persistence layer
└── data/
    ├── concepts.json         # Concept DAG
    ├── questions.json        # Question bank
    ├── misconceptions.json   # Misconception catalogue
    └── seed-students.json    # Seed data for teacher dashboard demo
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Google AI Studio](https://aistudio.google.com/) API key

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd java-tutor
npm install

# 2. Set your Gemini API key
# Create a .env.local file:
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key_here" > .env.local

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Start Diagnostic**.

---

## Mastery Model

**Exponential moving average** per concept, updated on every answered question:

$$\text{mastery}_{t+1} = \text{mastery}_t + 0.3 \times (\text{target} - \text{mastery}_t)$$

where `target = 1` for a correct answer, `0` for incorrect.

**Prerequisite penalty:** when a concept is answered incorrectly, each of its prerequisites takes a −0.05 mastery hit to reflect the likely gap upstream.

**Concept selection:** the tutor always picks the *eligible* concept with the lowest mastery. A concept is eligible only when all its prerequisites are above **0.5**.

---

## Spaced Repetition (SM-2)

The classic SuperMemo SM-2 algorithm drives the review scheduler:

- **Correct answer** → quality score 5; interval grows (1 → 6 → `interval × ease`)
- **Incorrect answer** → quality score 2; resets to interval 1
- **Ease factor** floors at 1.3 and adjusts after every answer
- The `/dashboard` page shows each concept's days until next review

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/session` | Create or resume a student session |
| `GET` | `/api/question?student_id=` | Get the next adaptive question |
| `POST` | `/api/answer` | Submit an answer + reasoning; returns misconception, updated mastery, next question |
| `GET` | `/api/mastery?student_id=` | Student mastery scores + graph edges |
| `GET` | `/api/review?student_id=` | SM-2 items currently due for review |
| `GET` | `/api/reviews?student_id=` | Full upcoming review schedule |
| `GET` | `/api/teacher` | Cohort heatmap + top misconceptions |
| `GET` | `/api/concepts` | Full concept list |
| `GET` | `/api/misconceptions` | Misconception catalogue |

---

## Available Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

---

## Notes

- Student state is persisted in `data/store.json` (gitignored). Delete it to reset all progress.
- The teacher dashboard uses `data/seed-students.json` for demo cohort data.
- `lib/types.ts` is the shared contract between frontend and backend — do not modify without coordinating both sides.
