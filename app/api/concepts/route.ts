import { NextResponse } from "next/server";
import { getConcepts } from "@/lib/store";
import { Concept } from "@/lib/types";

export async function GET() {
  const concepts: Concept[] = getConcepts();
  return NextResponse.json(concepts);
}
