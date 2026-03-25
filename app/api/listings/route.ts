import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listingSearchSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = listingSearchSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("*")
    .eq("is_active", true)
    .order("posted_at", { ascending: false })
    .limit(50);

  if (parsed.data.q) query = query.ilike("title", `%${parsed.data.q}%`);
  if (parsed.data.zip) query = query.eq("zip", parsed.data.zip);
  if (parsed.data.category && parsed.data.category !== "all") {
    query = query.eq("category", parsed.data.category);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listings: data ?? [] });
}
