import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { importCraigslistNycFreeStuff } from "@/lib/craigslist-import";
import ListingCard from "@/components/ListingCard";

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

type ListingsPageProps = {
  searchParams?: Promise<{
    q?: string;
    zip?: string;
    category?: string;
  }>;
};

export default async function ListingsPage(props: ListingsPageProps) {
  try {
    await importCraigslistNycFreeStuff();
  } catch (error) {
    console.error("Craigslist auto import failed:", error);
  }

  const searchParams = await props.searchParams;
  const q = searchParams?.q?.trim() ?? "";
  const zip = searchParams?.zip?.trim() ?? "";
  const rawCategory = searchParams?.category?.trim() ?? "";
  const category = rawCategory === "all" ? "" : rawCategory;

  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(
      "id, title, description, image_url, source_url, category, city, state, zip, created_at"
    )
    .eq("is_active", true);

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,city.ilike.%${q}%`
    );
  }

  if (zip) {
    query = query.ilike("zip", `%${zip}%`);
  }

  if (category) {
    query = query.ilike("category", `%${category}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const listings = (data ?? []) as Listing[];

  return (
    <div
      className="stack"
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">Listings</span>
          <h1 className="page-title">Recent free listings</h1>
          <p className="page-subtitle">
            Browse FreeRadar posts and recently imported free items.
          </p>
        </div>

        <div className="split-actions">
          <Link href="/submit" className="button">
            Post something free
          </Link>
        </div>
      </div>

      {q || zip || category ? (
        <div className="card" style={{ padding: "14px 16px" }}>
          <strong>Showing results</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            {q ? `Keyword: "${q}"` : null}
            {q && zip ? " • " : null}
            {zip ? `ZIP: "${zip}"` : null}
            {(q || zip) && category ? " • " : null}
            {category ? `Category: "${category}"` : null}
          </div>
        </div>
      ) : null}

      {listings.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No matching listings</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Try a different keyword, ZIP, or category.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "18px",
            alignItems: "stretch",
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
