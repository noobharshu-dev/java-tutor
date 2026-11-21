import { NextResponse } from "next/server";
import { recordAnswer, getQuestion, getQuestions, SAMPLE_QUESTIONS } from "@/lib/store";
import { detectMisconception, diagnoseCorrectAnswerReasoning } from "@/lib/misconception";
import { AnswerRequest, AnswerResponse, DetectedMisconception } from "@/lib/types";

const CANONICAL_MISCONCEPTION_IDS = new Set([
  "M1",
  "M2",
  "M3",
  "M4",
  "M5",
  "M6",
  "M7",
  "M8",
]);

export async function POST(request: Request) {
  try {
    const body: AnswerRequest = await request.json();
    if (!body || !body.student_id || !body.question_id || !body.option_id) {
      return NextResponse.json(
        { error: "Missing required fields: student_id, question_id, option_id, reasoning" },
        { status: 400 }
      );
    }

    const questionBank = getQuestions();
    const question =
      questionBank.find((q) => q.id === body.question_id) ||
      getQuestion(body.question_id) ||
      SAMPLE_QUESTIONS.find((q) => q.id === body.question_id);

    if (!question) {
      return NextResponse.json(
        { error: `Question not found: ${body.question_id}` },
        { status: 404 }
      );
    }

    const isCorrect = question.correct_option === body.option_id;
    let detectedMisconception: DetectedMisconception | null = null;

    if (!isCorrect) {
      const chosenOption =
        question.options.find((o) => o.id === body.option_id) || {
          id: body.option_id,
          text: body.option_id,
          misconception_id: null,
        };
      detectedMisconception = await detectMisconception(
        question,
        chosenOption,
        body.reasoning || ""
      );
    } else if (body.reasoning) {
      detectedMisconception = await diagnoseCorrectAnswerReasoning(
        question,
        body.option_id,
        body.reasoning
      );
    }

    // Ensure student history analytics only stores canonical M1–M8 or "CUSTOM"
    const historySafeMisconception: DetectedMisconception | null = detectedMisconception
      ? {
          ...detectedMisconception,
          id: CANONICAL_MISCONCEPTION_IDS.has(detectedMisconception.id)
            ? detectedMisconception.id
            : "CUSTOM",
        }
      : null;

    const response: AnswerResponse = await recordAnswer(body, historySafeMisconception);

    return NextResponse.json({
      ...response,
      misconception: detectedMisconception,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request payload or server error", details: String(error) },
      { status: 500 }
    );
  }
}
