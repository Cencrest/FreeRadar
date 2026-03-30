import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getRecentListings(limit = 12) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("is_active", true)
    .gt("active_until", now)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function searchListings(params: {
  q?: string;
  zip?: string;
  category?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  let query = supabase
    .from("listings")
    .select("*")
    .eq("is_active", true)
    .gt("active_until", now)
    .order("created_at", { ascending: false })
    .limit(params.limit ?? 50);

  if (params.q) query = query.ilike("title", `%${params.q}%`);
  if (params.zip) query = query.eq("zip", params.zip);
  if (params.category && params.category !== "all") {
    query = query.eq("category", params.category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getListingById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const [{ data: alerts }, { data: favorites }, { data: submissions }, { data: favoritesJoined }] =
    await Promise.all([
      supabase
        .from("alerts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),

      supabase
        .from("favorites")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),

      supabase
        .from("submissions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),

      supabase
        .from("favorites")
        .select("id, listing_id, created_at, listings(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

  return {
    alerts: alerts ?? [],
    favorites: favorites ?? [],
    submissions: submissions ?? [],
    favoriteListings: favoritesJoined ?? [],
  };
}

export async function getAdminQueue() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("submissions")
    .select("*, profiles(email)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getAlertRunPreview() {
  const supabase = createAdminClient();

  const { data: alerts } = await supabase
    .from("alerts")
    .select("id, keyword, zip, category, user_id, profiles(email)")
    .limit(20);

  return alerts ?? [];
}
