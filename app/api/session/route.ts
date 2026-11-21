import { NextResponse } from "next/server";
import { getStudent } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const studentId = body?.student_id || "student-1";
    const student = getStudent(studentId);

    return NextResponse.json({
      student_id: student.id,
      name: student.name,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to initialize session", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id") || "student-1";
  const student = getStudent(studentId);

  return NextResponse.json({
    student_id: student.id,
    name: student.name,
    success: true,
  });
}
