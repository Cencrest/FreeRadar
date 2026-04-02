import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteListingAction } from "@/app/submit/actions";
import ListingImage from "@/components/listing-image";
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            alignItems: "start",
          }}
        >
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
              <article
                key={listing.id}
                className="card"
                style={{
                  padding: "0",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "320px",
                }}
              >
                {listing.image_url ? (
                  <ListingImage
                    src={listing.image_url}
                    alt={listing.title}
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : null}

                <div
                  style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    flex: 1,
                  }}
                >
                  <div
                    className="listing-card-meta"
                    style={{ marginBottom: 0, gap: "8px", flexWrap: "wrap" }}
                  >
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

                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "1.75rem",
                        lineHeight: 1.1,
                      }}
                    >
                      {listing.title}
                    </h2>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: "var(--muted-foreground, rgba(255,255,255,0.72))",
                      fontSize: "1rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {listing.description || "No description provided."}
                  </p>

                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "12px",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      display: "grid",
                      gap: "6px",
                    }}
                  >
                    <div className="muted" style={{ fontSize: "0.95rem" }}>
                      {location || "Location not provided"}
                    </div>

                    <div className="muted" style={{ fontSize: "0.95rem" }}>
                      {listing.created_at
                        ? `Posted ${formatDate(listing.created_at)}`
                        : "Posted date unknown"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginTop: "4px",
                    }}
                  >
                    <Link
                      href={`/listings/${listing.id}`}
                      className="button secondary small"
                      style={{
                        padding: "10px 14px",
                        fontSize: "0.95rem",
                        lineHeight: 1,
                      }}
                    >
                      View
                    </Link>

                    <Link
                      href={`/submit?edit=${listing.id}`}
                      className="button secondary small"
                      style={{
                        padding: "10px 14px",
                        fontSize: "0.95rem",
                        lineHeight: 1,
                      }}
                    >
                      Edit
                    </Link>

                    <form action={deleteListingAction} style={{ margin: 0 }}>
                      <input
                        type="hidden"
                        name="listingId"
                        value={listing.id}
                      />
                      <button
                        type="submit"
                        className="button danger small"
                        style={{
                          padding: "10px 14px",
                          fontSize: "0.95rem",
                          lineHeight: 1,
                        }}
                      >
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
