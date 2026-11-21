import { NextResponse } from "next/server";
import { getReviewSchedule } from "@/lib/store";
import { ReviewItem } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id") || "student-1";

  const response: ReviewItem[] = getReviewSchedule(studentId);
  return NextResponse.json(response);
}
