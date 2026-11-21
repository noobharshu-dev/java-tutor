import { NextResponse } from "next/server";
import { getQuestion } from "@/lib/store";
import { Question } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? undefined;
  const conceptId = searchParams.get("concept_id") ?? undefined;

  const question: Question = getQuestion(id, conceptId);
  return NextResponse.json(question);
}
