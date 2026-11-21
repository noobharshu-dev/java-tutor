import { NextResponse } from "next/server";
import { getStudent } from "@/lib/store";
import { getAllReviewSchedule, getDueConcepts } from "@/lib/sm2";
import { ReviewItem } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id") || "student-1";
  const dueOnly = searchParams.get("due_only") === "true";

  const student = getStudent(studentId);
  const dueItems = getDueConcepts(student);
  const response: ReviewItem[] = dueOnly ? dueItems : getAllReviewSchedule(student);

  return NextResponse.json(response);
}
