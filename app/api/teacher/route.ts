import { NextResponse } from "next/server";
import { computeTeacherClassData } from "@/lib/teacher";
import type { TeacherResponse } from "@/lib/types";

export async function GET() {
  const response: TeacherResponse = computeTeacherClassData();
  return NextResponse.json(response);
}
