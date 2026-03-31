import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatLocation, getListingAgeBadge } from "@/lib/utils";

export default async function ListingDetailPage(props: any) {
  const params = await props.params;
  const id = params?.id;

  if (!id) {
    notFound();
  }

  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const ageBadge = listing.created_at
    ? getListingAgeBadge(listing.created_at)
    : "";

  const location = formatLocation(listing.city, listing.state, listing.zip);

  const isExternalSource =
    !!listing.source_url &&
    !listing.source_url.includes("free-radar.vercel.app") &&
    !listing.source_url.startsWith("/listings/");

  return (
    <div className="stack">
      <div className="split-actions">
        <Link href="/listings" className="button secondary small">
          Back to listings
        </Link>
      </div>

      <div className="detail-layout">
        <div className="card detail-card">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              style={{
                width: "100%",
                maxHeight: "420px",
                objectFit: "cover",
                borderRadius: "16px",
                display: "block",
                marginBottom: "18px",
              }}
            />
          ) : null}

          <div className="listing-card-meta">
            {listing.category ? <span className="badge">{listing.category}</span> : null}

            {ageBadge ? (
              <span className={ageBadge === "New" ? "badge badge-new" : "badge badge-age"}>
                {ageBadge}
              </span>
            ) : null}

            {location ? <span>{location}</span> : null}
          </div>

          <h1 className="page-title" style={{ marginBottom: 12 }}>
            {listing.title}
          </h1>

          <p className="page-subtitle" style={{ marginBottom: 18 }}>
            {listing.description || "No description provided."}
          </p>

          <div className="split-actions">
            {isExternalSource ? (
              <a
                href={listing.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="button"
              >
                Original post
              </a>
            ) : (
              <Link href={`/listings/${listing.id}`} className="button">
                View listing
              </Link>
            )}

            <Link href="/dashboard" className="button secondary">
              Dashboard
            </Link>
          </div>
        </div>

        <div className="card detail-card">
          <h3 style={{ marginTop: 0 }}>Listing Details</h3>

          <div className="kv">
            <div>
              <span className="muted">Category</span>
              <span>{listing.category || "Uncategorized"}</span>
            </div>

            <div>
              <span className="muted">Location</span>
              <span>{location || "Not provided"}</span>
            </div>

            <div>
              <span className="muted">Created</span>
              <span>{listing.created_at ? formatDate(listing.created_at) : "Unknown"}</span>
            </div>

            <div>
              <span className="muted">Status</span>
              <span>{listing.is_active ? "Active" : "Inactive"}</span>
            </div>

            {listing.active_until ? (
              <div>
                <span className="muted">Active Until</span>
                <span>{formatDate(listing.active_until)}</span>
              </div>
            ) : null}
          </div>

          {listing.source_url ? (
            <div className="notice" style={{ marginTop: 18 }}>
              {isExternalSource ? (
                <>
                  This listing was shared from an external source.{" "}
                  <a
                    href={listing.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open the original post
                  </a>
                  .
                </>
              ) : (
                <>This listing was posted directly on FreeRadar.</>
              )}
            </div>
          ) : (
            <div className="notice" style={{ marginTop: 18 }}>
              This listing was posted directly on FreeRadar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}        <h1 className="page-title">{listing.title}</h1>
        <p className="page-subtitle">
          {formatLocation(listing.city, listing.state, listing.zip) || "Location TBD"}
        </p>

        <div className="notice">
          This MVP stores the original source URL instead of scraping full-source content into the UI.
        </div>

        <div className="stack" style={{ marginTop: 16 }}>
          <p>{listing.description || "No description supplied yet."}</p>

          <div className="split-actions">
            <a href={listing.source_url} target="_blank" rel="noreferrer" className="button">
              View original post
            </a>

            {user ? (
              <form action={toggleFavoriteAction}>
                <input type="hidden" name="listing_id" value={listing.id} />
                <button type="submit" className="button secondary">
                  {isFavorite ? "Remove favorite" : "Save favorite"}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </article>

      <aside className="card detail-card">
        <h3>Listing details</h3>
        <div className="kv">
          <div>
            <span className="muted">Posted</span>
            <strong>{formatDate(listing.posted_at)}</strong>
          </div>
          <div>
            <span className="muted">Source</span>
            <strong>{listing.source_name}</strong>
          </div>
          <div>
            <span className="muted">ZIP code</span>
            <strong>{listing.zip || "N/A"}</strong>
          </div>
          <div>
            <span className="muted">State</span>
            <strong>{listing.state || "N/A"}</strong>
          </div>
        </div>
      </aside>
    </div>
  );
}
