import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteListingAction } from "@/app/submit/actions";
import { formatDate, formatLocation, getListingAgeBadge } from "@/lib/utils";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  created_at: string | null;
  is_active: boolean | null;
};

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, description, image_url, category, city, state, zip, created_at, is_active"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const listings = (data ?? []) as Listing[];

  return (
    <div className="stack">
      <div className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">Dashboard</span>
          <h1 className="page-title">My Listings</h1>
          <p className="page-subtitle">
            Manage the items you posted to FreeRadar.
          </p>
        </div>

        <div className="split-actions">
          <Link href="/submit" className="button">
            New listing
          </Link>
          <Link href="/listings" className="button secondary">
            Browse listings
          </Link>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No listings yet</h3>
          <p className="muted" style={{ marginBottom: 16 }}>
            Post your first free item and it will show up here.
          </p>
          <Link href="/submit" className="button">
            Create listing
          </Link>
        </div>
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => {
            const location = formatLocation(
              listing.city,
              listing.state,
              listing.zip
            );

            const ageBadge = listing.created_at
              ? getListingAgeBadge(listing.created_at)
              : "";

            return (
              <article key={listing.id} className="card listing-card">
                {listing.image_url ? (
                  <img
                    src={listing.image_url}
                    alt={listing.title}
                    className="listing-card-image"
                  />
                ) : (
                  <div className="listing-card-image placeholder-image">
                    No image
                  </div>
                )}

                <div className="listing-card-body">
                  <div className="listing-card-meta">
                    {listing.category ? (
                      <span className="badge">{listing.category}</span>
                    ) : null}

                    {ageBadge ? (
                      <span
                        className={
                          ageBadge === "New"
                            ? "badge badge-new"
                            : "badge badge-age"
                        }
                      >
                        {ageBadge}
                      </span>
                    ) : null}

                    {listing.is_active === false ? (
                      <span className="badge badge-age">Inactive</span>
                    ) : null}
                  </div>

                  <h2 className="listing-card-title">{listing.title}</h2>

                  <p className="listing-card-description">
                    {listing.description || "No description provided."}
                  </p>

                  <div className="listing-card-footer">
                    <div className="muted">
                      {location || "Location not provided"}
                    </div>
                    <div className="muted">
                      {listing.created_at
                        ? `Posted ${formatDate(listing.created_at)}`
                        : "Posted date unknown"}
                    </div>
                  </div>

                  <div className="split-actions" style={{ marginTop: 16 }}>
                    <Link
                      href={`/listings/${listing.id}`}
                      className="button secondary small"
                    >
                      View
                    </Link>

                    <Link
                      href={`/submit?edit=${listing.id}`}
                      className="button secondary small"
                    >
                      Edit
                    </Link>

                    <form action={deleteListingAction}>
                      <input
                        type="hidden"
                        name="listingId"
                        value={listing.id}
                      />
                      <button type="submit" className="button danger small">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
