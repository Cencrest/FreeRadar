"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) redirect("/dashboard");
  return profile;
}

export async function approveSubmissionAction(formData: FormData) {
  await requireAdmin();
  const submissionId = String(formData.get("submission_id") ?? "");
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (!submission) {
    redirect("/admin?error=Submission not found");
  }

  const { error: insertError } = await supabase.from("listings").insert({
    title: submission.title,
    description: submission.description,
    image_url: submission.image_url,
    source_url: submission.source_url || `${process.env.NEXT_PUBLIC_APP_URL}/submit`,
    source_name: "community",
    category: submission.category || "other",
    city: submission.city,
    state: submission.state,
    zip: submission.zip,
    posted_at: new Date().toISOString(),
    created_by: submission.user_id,
    dedupe_key: `submission:${submission.id}`
  });

  if (insertError) {
    redirect(`/admin?error=${encodeURIComponent(insertError.message)}`);
  }

  await supabase.from("submissions").update({ status: "approved" }).eq("id", submissionId);
  revalidatePath("/admin");
  revalidatePath("/listings");
  revalidatePath("/dashboard");
}

export async function rejectSubmissionAction(formData: FormData) {
  await requireAdmin();
  const submissionId = String(formData.get("submission_id") ?? "");
  const supabase = await createClient();

  await supabase.from("submissions").update({ status: "rejected" }).eq("id", submissionId);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
