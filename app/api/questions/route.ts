import { NextResponse } from "next/server";
import { SAMPLE_QUESTIONS } from "@/lib/store";
import { Question } from "@/lib/types";

export async function GET() {
  const questions: Question[] = SAMPLE_QUESTIONS;
  return NextResponse.json(questions);
}
