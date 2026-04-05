import { NextResponse } from "next/server";
import { importCraigslistNycFreeStuff } from "@/lib/craigslist-import";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  console.log("=== CRON ROUTE HIT ===");

  if (!cronSecret) {
    console.error("CRON_SECRET is not set");
    return NextResponse.json(
      { error: "CRON_SECRET is not set" },
      { status: 500 }
    );
  }

  console.log("Authorization header present:", !!authHeader);

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error("Unauthorized cron request");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await importCraigslistNycFreeStuff({ force: true });

    console.log("Cron import result:", JSON.stringify(result, null, 2));

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error("Cron import failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
