import ListingImage from "@/components/listing-image";
import Link from "next/link";
import { getListingAgeBadge } from "@/lib/utils";

type ListingCardProps = {
  listing: {
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
};

export function ListingCard({ listing }: ListingCardProps) {
  const ageBadge = getListingAgeBadge(listing.created_at);

  const isExternalSource =
    !!listing.source_url &&
    !listing.source_url.includes("free-radar.vercel.app") &&
    !listing.source_url.startsWith("/listings/");

  const hasImage = !!listing.image_url;

  return (
    <div
      className="card listing-card"
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {hasImage ? (
        <Link href={`/listings/${listing.id}`}>
          <ListingImage
            src={listing.image_url as string}
            alt={listing.title}
            style={{
              width: "100%",
              height: "220px",
              objectFit: "cover",
              borderTopLeftRadius: "18px",
              borderTopRightRadius: "18px",
              display: "block",
              borderBottom: "1px solid var(--border)",
            }}
          />
        </Link>
      ) : null}

      <div
        className="listing-card-body"
        style={{
          padding: hasImage ? undefined : "18px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
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

          {(listing.city || listing.state) && (
            <span>{[listing.city, listing.state].filter(Boolean).join(", ")}</span>
          )}
        </div>

        <h3
          className="listing-title"
          style={{
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          <Link href={`/listings/${listing.id}`}>{listing.title}</Link>
        </h3>

        {listing.description ? (
          <p
            className="description-clamp"
            style={{
              margin: 0,
            }}
          >
            {listing.description}
          </p>
        ) : (
          <p
            className="description-clamp muted"
            style={{
              margin: 0,
            }}
          >
            No description provided.
          </p>
        )}
      </div>

      <div
        className="listing-card-footer"
        style={{
          marginTop: "auto",
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
  );
}
