import { NextResponse } from "next/server";
import { getTeacherOverview } from "@/lib/store";
import { TeacherResponse } from "@/lib/types";

export async function GET() {
  const response: TeacherResponse = getTeacherOverview();
  return NextResponse.json(response);
}
