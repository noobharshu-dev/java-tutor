import { NextResponse } from "next/server";
import { getStudent } from "@/lib/store";
import { getDueConcepts, getAllReviewSchedule } from "@/lib/sm2";
import type { ReviewItem } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id") || "student-1";
  const dueOnly = searchParams.get("due_only") === "true";

  const student = getStudent(studentId);

  // If due_only=true, strictly return due items; otherwise return due items or schedule
  const dueItems = getDueConcepts(student);
  const response: ReviewItem[] = dueOnly || dueItems.length > 0 ? dueItems : getAllReviewSchedule(student);

  return NextResponse.json(response);
}
