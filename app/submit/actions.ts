"use server";

import { redirect } from "next/navigation";
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

  const { error } = await supabase.from("listings").insert({
    user_id: user.id,
    ...values,
    approved: true,
    status: "active",
    is_demo: false,
  });

  if (error) {
    redirect(`/submit?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard?message=Listing created");
}
