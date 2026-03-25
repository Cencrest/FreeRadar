import { toggleFavoriteAction } from "./actions";
import { getListingById } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatLocation } from "@/lib/utils";

export default async function ListingDetailPage(props: any) {
  const params = await props.params;
  const listing = await getListingById(params.id);

  if (!listing) {
    return <div className="empty">Listing not found.</div>;
  }

  const user = await getCurrentUser();
  let isFavorite = false;

  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listing.id)
      .maybeSingle();

    isFavorite = Boolean(data);
  }

  return (
    <div className="detail-layout">
      <article className="card detail-card">
        <div className="listing-card-meta">
          <span className="badge">{listing.category || "other"}</span>
          <span>{listing.source_name}</span>
        </div>
        <h1 className="page-title">{listing.title}</h1>
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
