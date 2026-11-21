import { NextResponse } from "next/server";
import { computeTeacherClassData } from "@/lib/teacher";
import type { TeacherResponse } from "@/lib/types";

export { computeTeacherClassData };

export async function GET() {
  const data: TeacherResponse = computeTeacherClassData();
  return NextResponse.json(data);
}
