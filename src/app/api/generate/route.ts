import { NextResponse } from "next/server";
import { generateConcepts } from "@/lib/wizard-data";

// This endpoint generates business concepts.
// In production, this would call Claude API for truly custom concepts.
// For the MVP, we use the local scoring algorithm.

export async function POST(req: Request) {
  try {
    const { skills, time, budget, bizType } = await req.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: "At least one skill required" }, { status: 400 });
    }

    const concepts = generateConcepts(skills, time || "side", budget || "zero", bizType || "any");

    return NextResponse.json({ concepts });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
