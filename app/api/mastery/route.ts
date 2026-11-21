import { NextResponse } from "next/server";
import { getMastery } from "@/lib/store";
import { MasteryResponse } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id") || "student-1";

  const response: MasteryResponse = getMastery(studentId);
  return NextResponse.json(response);
}
