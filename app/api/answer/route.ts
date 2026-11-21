import { NextResponse } from "next/server";
import { recordAnswer, getQuestion, getQuestions, SAMPLE_QUESTIONS } from "@/lib/store";
import { diagnoseCorrectAnswerReasoning } from "@/lib/misconception";
import { AnswerRequest, AnswerResponse, DetectedMisconception } from "@/lib/types";

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

    const isCorrect = question ? question.correct_option === body.option_id : false;

    let detectedMisconception: DetectedMisconception | null = null;
    if (isCorrect && body.reasoning && question) {
      detectedMisconception = await diagnoseCorrectAnswerReasoning(
        question,
        body.option_id,
        body.reasoning
      );
    }

    const response: AnswerResponse = await recordAnswer(
      body,
      isCorrect ? detectedMisconception : undefined
    );
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request payload or server error", details: String(error) },
      { status: 500 }
    );
  }
}
