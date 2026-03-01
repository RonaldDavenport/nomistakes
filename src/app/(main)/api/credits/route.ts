import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCredits, getTransactionHistory, CREDIT_COSTS, CREDIT_PACKS } from "@/lib/credits";

// GET /api/credits?userId=X&businessId=Y — get credit balance + recent transactions
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const businessId = req.nextUrl.searchParams.get("businessId");

  if (!userId || !businessId) {
    return NextResponse.json({ error: "userId and businessId required" }, { status: 400 });
  }

  try {
    const [balance, transactions] = await Promise.all([
      getCredits(userId, businessId),
      getTransactionHistory(userId, businessId, 20),
    ]);

    return NextResponse.json({
      balance,
      transactions,
      costs: CREDIT_COSTS,
      packs: CREDIT_PACKS,
    });
  } catch (err) {
    console.error("[credits] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
  }
}
