import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { importCraigslistNycFreeStuff } from "@/lib/craigslist-import";
import { ListingCard } from "@/components/ListingCard";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  source_url: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  created_at: string;
};

export default async function ListingsPage() {
  try {
    await importCraigslistNycFreeStuff();
  } catch (error) {
    console.error("Craigslist auto import failed:", error);
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, description, image_url, source_url, category, city, state, zip, created_at"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const listings = (data ?? []) as Listing[];

  return (
    <div className="stack">
      <div className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">Listings</span>
          <h1 className="page-title">Free Stuff Near You</h1>
          <p className="page-subtitle">
            Browse FreeRadar listings and freshly imported NYC Craigslist free items.
          </p>
        </div>

        <div className="split-actions">
          <Link href="/submit" className="button">
            New listing
          </Link>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No listings yet</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Check back in a bit. FreeRadar will keep pulling in fresh listings.
          </p>
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
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
