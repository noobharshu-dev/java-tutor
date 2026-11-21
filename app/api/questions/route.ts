import { NextResponse } from "next/server";
import { getQuestions } from "@/lib/questions";
import type { Question } from "@/lib/types";

export async function GET() {
  const questions: Question[] = getQuestions();
  return NextResponse.json(questions);
}
