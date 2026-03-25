"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavoriteAction(formData: FormData) {
  const listingId = String(formData.get("listing_id") ?? "");
  const user = await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
  } else {
    await supabase.from("favorites").insert({
      user_id: user.id,
      listing_id: listingId
    });
  }

  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/dashboard");
}
