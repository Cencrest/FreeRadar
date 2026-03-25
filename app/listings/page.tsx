import { ListingCard } from "@/components/ListingCard";
import { SearchForm } from "@/components/SearchForm";
import { searchListings } from "@/lib/data";

export default async function ListingsPage(props: any) {
  const searchParams = (await props.searchParams) ?? {};
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const zip = typeof searchParams.zip === "string" ? searchParams.zip : "";
  const category = typeof searchParams.category === "string" ? searchParams.category : "all";

  const listings = await searchListings({ q, zip, category });

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">Listings</h1>
        <p className="page-subtitle">
          Search your free-item feed by keyword, ZIP code, or category.
        </p>
      </div>

      <SearchForm defaultQ={q} defaultZip={zip} defaultCategory={category} />

      {listings.length ? (
        <div className="listings-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="empty">No listings matched that search yet.</div>
      )}
    </div>
  );
}
