import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  createSubmissionAction,
  updateListingAction,
} from "@/app/submit/actions";
import SourceUrlAutofill from "@/components/source-url-autofill";

type SubmitPageProps = {
  searchParams?: Promise<{
    edit?: string;
  }>;
};

type EditableListing = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  source_url: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
};

export default async function SubmitPage(props: SubmitPageProps) {
  const user = await requireUser();
  const supabase = await createClient();

  const searchParams = await props.searchParams;
  const editId = searchParams?.edit;

  let listing: EditableListing | null = null;

  if (editId) {
    const { data, error } = await supabase
      .from("listings")
      .select(
        "id, title, description, image_url, source_url, category, city, state, zip"
      )
      .eq("id", editId)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      notFound();
    }

    listing = data as EditableListing;
  }

  const isEditMode = !!listing;

  return (
    <div
      className="stack"
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        width: "100%",
        padding: "0 16px",
      }}
    >
      <div className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">
            {isEditMode ? "Edit Listing" : "New Listing"}
          </span>
          <h1 className="page-title">
            {isEditMode ? "Update Listing" : "Post a New Listing"}
          </h1>
          <p className="page-subtitle">
            {isEditMode
              ? "Make changes to your existing FreeRadar post."
              : "Paste a source link and FreeRadar will try to pull the title, image, and description automatically."}
          </p>
        </div>

        <div className="split-actions">
          <Link href="/dashboard" className="button secondary">
            Back to dashboard
          </Link>
          <Link href="/listings" className="button secondary">
            Browse listings
          </Link>
        </div>
      </div>

      <div
        className="card"
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <form
          action={isEditMode ? updateListingAction : createSubmissionAction}
          className="stack"
        >
          {isEditMode && listing ? (
            <input type="hidden" name="listingId" value={listing.id} />
          ) : null}

          <SourceUrlAutofill
            initialTitle={listing?.title ?? ""}
            initialDescription={listing?.description ?? ""}
            initialImageUrl={listing?.image_url ?? ""}
            initialSourceUrl={listing?.source_url ?? ""}
          />

          <div className="split-actions" style={{ marginTop: 8 }}>
            <button type="submit" className="button">
              {isEditMode ? "Save changes" : "Create listing"}
            </button>

            <Link href="/dashboard" className="button secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
