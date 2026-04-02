"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { submissionSchema } from "@/lib/validators";

export async function createSubmissionAction(formData: FormData) {
  const user = await requireUser();

  const values = submissionSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    image_url: formData.get("image_url"),
    source_url: formData.get("source_url"),
    category: formData.get("category"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
  });

  const supabase = await createClient();

  const activeUntil = new Date();
  activeUntil.setDate(activeUntil.getDate() + 7);

  const { error } = await supabase.from("listings").insert({
    user_id: user.id,
    ...values,
    is_active: true,
    active_until: activeUntil.toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/listings");
  redirect("/dashboard");
}

export async function updateListingAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const listingId = formData.get("listingId");

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Missing listingId");
  }

  const values = submissionSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    image_url: formData.get("image_url"),
    source_url: formData.get("source_url"),
    category: formData.get("category"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
  });

  const { error } = await supabase
    .from("listings")
    .update(values)
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/listings");
  revalidatePath(`/listings/${listingId}`);
  redirect("/dashboard");
}

export async function deleteListingAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const listingId = formData.get("listingId");

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Missing listingId");
  }

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/listings");
}
