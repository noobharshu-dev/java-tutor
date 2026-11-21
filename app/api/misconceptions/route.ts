import { NextResponse } from "next/server";
import { getMisconceptions } from "@/lib/store";
import { Misconception } from "@/lib/types";

export async function GET() {
  const misconceptions: Misconception[] = getMisconceptions();
  return NextResponse.json(misconceptions);
}
