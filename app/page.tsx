import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { SearchForm } from "@/components/SearchForm";
import { SectionTitle } from "@/components/SectionTitle";
import { getRecentListings } from "@/lib/data";

export default async function HomePage() {
  const listings = await getRecentListings(6);

  return (
    <div className="stack">
      {/* HERO */}
      <section className="hero-shell">
        <div className="card hero-card hero-main-card">
          <span className="badge">MVP built for launch</span>
          <h1>Find free stuff near you before everyone else.</h1>
          <p>
            FreeRadar lets users search local free listings, save favorites, submit finds,
            and create email alerts by keyword and ZIP code.
          </p>

          <div className="split-actions">
            <Link href="/listings" className="button">
              Browse listings
            </Link>
            <Link href="/submit" className="button secondary">
              Submit a free item
            </Link>
          </div>
        </div>

        <div className="hero-feature-grid">
          <div className="card hero-feature-card">
            <h3 className="hero-feature-title">Fast search</h3>
            <p className="hero-feature-copy">
              Search free listings by keyword, ZIP code, and category in seconds.
            </p>
          </div>

          <div className="card hero-feature-card">
            <h3 className="hero-feature-title">Community-powered</h3>
            <p className="hero-feature-copy">
              Users can submit free finds to help more people discover useful items nearby.
            </p>
          </div>

          <div className="card hero-feature-card">
            <h3 className="hero-feature-title">Built to grow</h3>
            <p className="hero-feature-copy">
              Alerts, favorites, and admin tools are already structured for expansion.
            </p>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <SearchForm />

      {/* LISTINGS */}
      <section>
        <SectionTitle title="Recent free listings" />
        <div className="grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
