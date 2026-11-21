import { NextResponse } from "next/server";
import { getQuestion, getStudent } from "@/lib/store";
import { nextQuestion } from "@/lib/questions";
import type { Question } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? undefined;
  const conceptId = searchParams.get("concept_id") ?? undefined;
  const studentId = searchParams.get("student_id") ?? undefined;

  if (!id && !conceptId && studentId) {
    const student = getStudent(studentId);
    const question: Question = nextQuestion(student);
    return NextResponse.json(question);
  }

  const question: Question = getQuestion(id, conceptId);
  return NextResponse.json(question);
}
