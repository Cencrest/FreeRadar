"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { alertSchema } from "@/lib/validators";

export async function createAlertAction(formData: FormData) {
  const user = await requireUser();
  const values = alertSchema.parse({
    keyword: formData.get("keyword"),
    zip: formData.get("zip"),
    radius_miles: formData.get("radius_miles"),
    category: formData.get("category")
  });

  const supabase = await createClient();
  const { error } = await supabase.from("alerts").insert({
    user_id: user.id,
    keyword: values.keyword,
    zip: values.zip || null,
    radius_miles: values.radius_miles,
    category: values.category || "all"
  });

  if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard");
}

export async function deleteAlertAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await requireUser();
  const supabase = await createClient();

  await supabase.from("alerts").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/dashboard");
}

export async function deleteFavoriteAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await requireUser();
  const supabase = await createClient();

  await supabase.from("favorites").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/dashboard");
}

export async function deleteSubmissionAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await requireUser();
  const supabase = await createClient();

  await supabase
    .from("submissions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending");
  revalidatePath("/dashboard");
}
