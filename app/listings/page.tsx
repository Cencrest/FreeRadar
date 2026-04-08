import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { importCraigslistNycFreeStuff } from "@/lib/craigslist-import";
import ListingCard from "@/components/ListingCard";
import { SearchForm } from "@/components/SearchForm";

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
    borough?: string;
    category?: string;
  }>;
};

function getBoroughFilter(borough: string): string[] {
  switch (borough.toLowerCase()) {
    case "manhattan":
      return [
        "manhattan",
        "new york",
        "harlem",
        "upper east side",
        "upper west side",
        "midtown",
        "chelsea",
        "soho",
        "tribeca",
        "east village",
        "west village",
        "lower east side",
      ];
    case "brooklyn":
      return [
        "brooklyn",
        "williamsburg",
        "greenpoint",
        "bushwick",
        "bed-stuy",
        "bedford-stuyvesant",
        "park slope",
        "crown heights",
        "bay ridge",
        "flatbush",
        "dumbo",
      ];
    case "queens":
      return [
        "queens",
        "astoria",
        "long island city",
        "lic",
        "flushing",
        "jamaica",
        "forest hills",
        "sunnyside",
        "ridgewood",
        "elmhurst",
      ];
    case "bronx":
      return ["bronx", "riverdale", "fordham", "pelham", "mott haven"];
    case "staten island":
      return ["staten island", "st george", "tottenville", "great kills"];
    default:
      return [];
  }
}

export default async function ListingsPage(props: ListingsPageProps) {
  let importInfo: {
    imported?: number;
    skipped?: boolean;
    checked?: number;
  } | null = null;

  try {
    importInfo = await importCraigslistNycFreeStuff();
  } catch (error) {
    console.error("Listings page import failed:", error);
  }

  const searchParams = await props.searchParams;
  const q = searchParams?.q?.trim() ?? "";
  const rawBorough = searchParams?.borough?.trim() ?? "";
  const rawCategory = searchParams?.category?.trim() ?? "";

  const borough = rawBorough === "all" ? "" : rawBorough;
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

  if (category) {
    query = query.ilike("category", `%${category}%`);
  }

  if (borough) {
    const boroughTerms = getBoroughFilter(borough);

    if (boroughTerms.length > 0) {
      const boroughOr = boroughTerms
        .map((term) => `city.ilike.%${term}%`)
        .join(",");

      query = query.or(boroughOr);
    }
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
        maxWidth: "1500px",
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

      <SearchForm
        defaultQ={q}
        defaultBorough={borough}
        defaultCategory={category}
      />

      {q || borough || category ? (
        <div className="card" style={{ padding: "14px 16px" }}>
          <strong>Showing results</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            {q ? `Keyword: "${q}"` : null}
            {q && borough ? " • " : null}
            {borough ? `Borough: "${borough}"` : null}
            {(q || borough) && category ? " • " : null}
            {category ? `Category: "${category}"` : null}
          </div>
        </div>
      ) : null}

      {importInfo ? (
        <div
          className="muted"
          style={{
            fontSize: "0.95rem",
            padding: "0 4px",
          }}
        >
          {importInfo.skipped
            ? "Feed refreshed recently."
            : `Checked ${importInfo.checked ?? 0} source listings and imported ${importInfo.imported ?? 0} new ones.`}
        </div>
      ) : null}

      {listings.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No matching listings</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Try a different keyword, borough, or category.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 320px))",
            gap: "16px",
            alignItems: "stretch",
            justifyContent: "start",
          }}
        >
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}        "midtown",
        "chelsea",
        "soho",
        "tribeca",
        "east village",
        "west village",
        "lower east side",
      ];
    case "brooklyn":
      return [
        "brooklyn",
        "williamsburg",
        "greenpoint",
        "bushwick",
        "bed-stuy",
        "bedford-stuyvesant",
        "park slope",
        "crown heights",
        "bay ridge",
        "flatbush",
        "dumbo",
      ];
    case "queens":
      return [
        "queens",
        "astoria",
        "long island city",
        "lic",
        "flushing",
        "jamaica",
        "forest hills",
        "sunnyside",
        "ridgewood",
        "elmhurst",
      ];
    case "bronx":
      return ["bronx", "riverdale", "fordham", "pelham", "mott haven"];
    case "staten island":
      return ["staten island", "st george", "tottenville", "great kills"];
    default:
      return [];
  }
}

export default async function ListingsPage(props: ListingsPageProps) {
  let importInfo: {
    imported?: number;
    skipped?: boolean;
    checked?: number;
  } | null = null;

  try {
    importInfo = await importCraigslistNycFreeStuff();
  } catch (error) {
    console.error("Listings page import failed:", error);
  }

  const searchParams = await props.searchParams;
  const q = searchParams?.q?.trim() ?? "";
  const rawBorough = searchParams?.borough?.trim() ?? "";
  const rawCategory = searchParams?.category?.trim() ?? "";

  const borough = rawBorough === "all" ? "" : rawBorough;
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

  if (category) {
    query = query.ilike("category", `%${category}%`);
  }

  if (borough) {
    const boroughTerms = getBoroughFilter(borough);

    if (boroughTerms.length > 0) {
      const boroughOr = boroughTerms
        .map((term) => `city.ilike.%${term}%`)
        .join(",");

      query = query.or(boroughOr);
    }
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
        maxWidth: "1500px",
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

      <SearchForm
        defaultQ={q}
        defaultBorough={borough}
        defaultCategory={category}
      />

      {q || borough || category ? (
        <div className="card" style={{ padding: "14px 16px" }}>
          <strong>Showing results</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            {q ? `Keyword: "${q}"` : null}
            {q && borough ? " • " : null}
            {borough ? `Borough: "${borough}"` : null}
            {(q || borough) && category ? " • " : null}
            {category ? `Category: "${category}"` : null}
          </div>
        </div>
      ) : null}

      {importInfo ? (
        <div
          className="muted"
          style={{
            fontSize: "0.95rem",
            padding: "0 4px",
          }}
        >
          {importInfo.skipped
            ? "Feed refreshed recently."
            : `Checked ${importInfo.checked ?? 0} source listings and imported ${importInfo.imported ?? 0} new ones.`}
        </div>
      ) : null}

      {listings.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No matching listings</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Try a different keyword, borough, or category.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 320px))",
            gap: "16px",
            alignItems: "stretch",
            justifyContent: "start",
          }}
        >
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}        "midtown",
        "chelsea",
        "soho",
        "tribeca",
        "east village",
        "west village",
        "lower east side",
      ];
    case "brooklyn":
      return [
        "brooklyn",
        "williamsburg",
        "greenpoint",
        "bushwick",
        "bed-stuy",
        "bedford-stuyvesant",
        "park slope",
        "crown heights",
        "bay ridge",
        "flatbush",
        "dumbo",
      ];
    case "queens":
      return [
        "queens",
        "astoria",
        "long island city",
        "lic",
        "flushing",
        "jamaica",
        "forest hills",
        "sunnyside",
        "ridgewood",
        "elmhurst",
      ];
    case "bronx":
      return ["bronx", "riverdale", "fordham", "pelham", "mott haven"];
    case "staten island":
      return ["staten island", "st george", "tottenville", "great kills"];
    default:
      return [];
  }
}

export default async function ListingsPage(props: ListingsPageProps) {
  let importInfo: {
    imported?: number;
    skipped?: boolean;
    checked?: number;
  } | null = null;

  try {
    importInfo = await importCraigslistNycFreeStuff();
    console.log("Listings page import result:", importInfo);
  } catch (error) {
    console.error("Listings page import failed:", error);
  }

  const searchParams = await props.searchParams;
  const q = searchParams?.q?.trim() ?? "";
  const rawBorough = searchParams?.borough?.trim() ?? "";
  const rawCategory = searchParams?.category?.trim() ?? "";

  const borough = rawBorough === "all" ? "" : rawBorough;
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

  if (category) {
    query = query.ilike("category", `%${category}%`);
  }

  if (borough) {
    const boroughTerms = getBoroughFilter(borough);

    if (boroughTerms.length > 0) {
      const boroughOr = boroughTerms
        .map((term) => `city.ilike.%${term}%`)
        .join(",");

      query = query.or(boroughOr);
    }
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
        maxWidth: "1500px",
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

      <SearchForm
        defaultQ={q}
        defaultBorough={borough}
        defaultCategory={category}
      />

      {q || borough || category ? (
        <div className="card" style={{ padding: "14px 16px" }}>
          <strong>Showing results</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            {q ? `Keyword: "${q}"` : null}
            {q && borough ? " • " : null}
            {borough ? `Borough: "${borough}"` : null}
            {(q || borough) && category ? " • " : null}
            {category ? `Category: "${category}"` : null}
          </div>
        </div>
      ) : null}

      {importInfo ? (
        <div
          className="muted"
          style={{
            fontSize: "0.95rem",
            padding: "0 4px",
          }}
        >
          {importInfo.skipped
            ? "Feed refreshed recently."
            : `Checked ${importInfo.checked ?? 0} source listings and imported ${importInfo.imported ?? 0} new ones.`}
        </div>
      ) : null}

      {listings.length === 0 ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>No matching listings</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Try a different keyword, borough, or category.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 320px))",
            gap: "16px",
            alignItems: "stretch",
            justifyContent: "start",
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
