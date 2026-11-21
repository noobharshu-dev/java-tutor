import { NextResponse } from "next/server";
import { recordAnswer } from "@/lib/store";
import { AnswerRequest, AnswerResponse } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body: AnswerRequest = await request.json();
    if (!body || !body.student_id || !body.question_id || !body.option_id) {
      return NextResponse.json(
        { error: "Missing required fields: student_id, question_id, option_id, reasoning" },
        { status: 400 }
      );
    }

    const response: AnswerResponse = await recordAnswer(body);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request payload or server error", details: String(error) },
      { status: 500 }
    );
  }
}
