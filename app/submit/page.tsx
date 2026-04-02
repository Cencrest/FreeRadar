import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  createSubmissionAction,
  updateListingAction,
} from "@/app/submit/actions";

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
    <div className="stack">
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
              : "Add a free item so people nearby can find it fast."}
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

      <div className="card" style={{ maxWidth: 820 }}>
        <form
          action={isEditMode ? updateListingAction : createSubmissionAction}
          className="stack"
        >
          {isEditMode && listing ? (
            <input type="hidden" name="listingId" value={listing.id} />
          ) : null}

          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={listing?.title ?? ""}
              placeholder="Free couch, free bike, curb alert..."
              required
            />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={listing?.description ?? ""}
              placeholder="Condition, pickup details, size, notes..."
            />
          </div>

          <div className="field">
            <label htmlFor="image_url">Image URL</label>
            <input
              id="image_url"
              name="image_url"
              type="url"
              defaultValue={listing?.image_url ?? ""}
              placeholder="https://..."
            />
          </div>

          <div className="field">
            <label htmlFor="source_url">Source URL</label>
            <input
              id="source_url"
              name="source_url"
              type="url"
              defaultValue={listing?.source_url ?? ""}
              placeholder="https://..."
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <div className="field">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                type="text"
                defaultValue={listing?.category ?? ""}
                placeholder="furniture, electronics, curb alert..."
              />
            </div>

            <div className="field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                defaultValue={listing?.city ?? ""}
                placeholder="Brooklyn"
              />
            </div>

            <div className="field">
              <label htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                type="text"
                defaultValue={listing?.state ?? ""}
                placeholder="NY"
              />
            </div>

            <div className="field">
              <label htmlFor="zip">ZIP</label>
              <input
                id="zip"
                name="zip"
                type="text"
                defaultValue={listing?.zip ?? ""}
                placeholder="11211"
              />
            </div>
          </div>

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
