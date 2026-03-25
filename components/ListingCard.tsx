import Link from "next/link";
import { formatDate, formatLocation } from "@/lib/utils";
import type { Listing } from "@/lib/types";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="card listing-card">
      <div className="listing-card-body">
        <div className="listing-card-meta">
          <span className="badge">{listing.category || "other"}</span>
          <span>{listing.source_name}</span>
        </div>
        <h3 className="listing-title">
          <Link href={`/listings/${listing.id}`}>{listing.title}</Link>
        </h3>
        <p className="muted">{formatLocation(listing.city, listing.state, listing.zip) || "Location TBD"}</p>
        {listing.description ? <p className="description-clamp">{listing.description}</p> : null}
      </div>

      <div className="listing-card-footer">
        <small className="muted">Posted {formatDate(listing.posted_at)}</small>
        <a href={listing.source_url} target="_blank" rel="noreferrer" className="button secondary small">
          Original post
        </a>
      </div>
    </article>
  );
}
