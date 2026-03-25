import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAlertEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: alerts, error: alertsError } = await supabase
    .from("alerts")
    .select("id, keyword, zip, category, user_id, profiles(email)")
    .limit(250);

  if (alertsError) {
    return NextResponse.json({ error: alertsError.message }, { status: 500 });
  }

  let emailsSent = 0;

  for (const alert of alerts ?? []) {
    let listingQuery = supabase
      .from("listings")
      .select("id, title, source_url, city, state, zip")
      .eq("is_active", true)
      .ilike("title", `%${alert.keyword}%`)
      .order("posted_at", { ascending: false })
      .limit(10);

    if (alert.zip) listingQuery = listingQuery.eq("zip", alert.zip);
    if (alert.category && alert.category !== "all") {
      listingQuery = listingQuery.eq("category", alert.category);
    }

    const { data: listings } = await listingQuery;
    if (!listings?.length) continue;

    const { data: existingMatches } = await supabase
      .from("alert_matches")
      .select("listing_id")
      .eq("alert_id", alert.id);

    const seenIds = new Set((existingMatches ?? []).map((row: any) => row.listing_id));
    const freshMatches = listings.filter((listing) => !seenIds.has(listing.id));
    if (!freshMatches.length) continue;

    const email = (alert as any).profiles?.email;
    if (!email) continue;

    await sendAlertEmail({
      to: email,
      keyword: alert.keyword,
      matches: freshMatches
    });

    emailsSent += 1;

    await supabase.from("alert_matches").insert(
      freshMatches.map((listing) => ({
        alert_id: alert.id,
        listing_id: listing.id
      }))
    );

    await supabase
      .from("alerts")
      .update({ last_sent_at: new Date().toISOString() })
      .eq("id", alert.id);
  }

  return NextResponse.json({
    ok: true,
    emailsSent
  });
}
