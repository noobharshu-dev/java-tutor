import { NextResponse } from "next/server";
import { computeTeacherClassData } from "@/app/api/teacher/class/route";
import { TeacherResponse } from "@/lib/types";

export async function GET() {
  const response: TeacherResponse = computeTeacherClassData();
  return NextResponse.json(response);
}
