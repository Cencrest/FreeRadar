import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type InputListing = {
  title: string;
  description?: string;
  image_url?: string;
  source_name?: string;
  source_url: string;
  category?: string;
  city?: string;
  state?: string;
  zip?: string;
  posted_at?: string;
  dedupe_key?: string;
};

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.ADMIN_INGEST_KEY || authHeader !== `Bearer ${process.env.ADMIN_INGEST_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as { listings?: InputListing[] };
  if (!payload.listings?.length) {
    return NextResponse.json({ error: "No listings provided" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const rows = payload.listings.map((listing) => ({
    title: listing.title,
    description: listing.description || null,
    image_url: listing.image_url || null,
    source_name: listing.source_name || "manual",
    source_url: listing.source_url,
    category: listing.category || "other",
    city: listing.city || null,
    state: listing.state || null,
    zip: listing.zip || null,
    posted_at: listing.posted_at || new Date().toISOString(),
    dedupe_key: listing.dedupe_key || `${listing.source_url}:${listing.title}`
  }));

  const { data, error } = await supabase.from("listings").upsert(rows, {
    onConflict: "dedupe_key"
  }).select("id, title");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inserted: data ?? [] });
}
