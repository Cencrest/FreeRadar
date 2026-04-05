import Link from "next/link";
import ListingImage from "@/components/listing-image";
import { getListingAgeBadge } from "@/lib/utils";

type Listing = {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  source_url?: string | null;
  category?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  created_at: string;
};

type ListingCardProps = {
  listing: Listing;
};

export default function ListingCard({ listing }: ListingCardProps) {
  const ageBadge = getListingAgeBadge(listing.created_at);

  const isExternalSource =
    !!listing.source_url &&
    !listing.source_url.includes("free-radar.vercel.app") &&
    !listing.source_url.startsWith("/listings/");

  return (
    <article
      className="card listing-card"
      style={{
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "360px",
      }}
    >
      {listing.image_url ? (
        <Link
          href={`/listings/${listing.id}`}
          style={{ display: "block", textDecoration: "none" }}
        >
          <ListingImage
            src={listing.image_url}
            alt={listing.title}
            style={{
              width: "100%",
              height: "180px",
              objectFit: "cover",
              display: "block",
              borderBottom: "1px solid var(--border)",
            }}
          />
        </Link>
      ) : null}

      <div
        className="listing-card-body"
        style={{
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flex: 1,
        }}
      >
        <div
          className="listing-card-meta"
          style={{
            marginBottom: 0,
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {listing.category ? (
            <span className="badge">{listing.category}</span>
          ) : null}

          <span
            className={ageBadge === "New" ? "badge badge-new" : "badge badge-age"}
          >
            {ageBadge}
          </span>

          {listing.city || listing.state ? (
            <span>{[listing.city, listing.state].filter(Boolean).join(", ")}</span>
          ) : null}
        </div>

        <h3
          className="listing-title"
          style={{
            margin: 0,
            fontSize: "1.35rem",
            lineHeight: 1.2,
          }}
        >
          <Link
            href={`/listings/${listing.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {listing.title}
          </Link>
        </h3>

        {listing.description ? (
          <p
            className="description-clamp"
            style={{
              margin: 0,
              color: "var(--muted-foreground, rgba(255,255,255,0.72))",
              lineHeight: 1.4,
              fontSize: "0.95rem",
            }}
          >
            {listing.description}
          </p>
        ) : (
          <p className="description-clamp muted" style={{ margin: 0 }}>
            No description provided.
          </p>
        )}

        <div
          className="listing-card-footer"
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
            flexWrap: "wrap",
            paddingTop: "12px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Link href={`/listings/${listing.id}`} className="button small">
            View listing
          </Link>

          {isExternalSource ? (
            <a
              href={listing.source_url as string}
              target="_blank"
              rel="noopener noreferrer"
              className="button small secondary"
            >
              Original post
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
