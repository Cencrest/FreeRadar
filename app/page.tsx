import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { SearchForm } from "@/components/SearchForm";
import { SectionTitle } from "@/components/SectionTitle";
import { getRecentListings } from "@/lib/data";

export default async function HomePage() {
  const listings = await getRecentListings(6);

  return (
    <div className="stack">
      <section className="hero">
        <div className="card hero-card">
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

        <div className="grid-3">
          <div className="card metric">
            <h3>Fast</h3>
            <p>Search, favorite, and alert flow already wired.</p>
          </div>
          <div className="card metric">
            <h3>Safe</h3>
            <p>No Stripe. Billing can be added later behind a clean feature flag.</p>
          </div>
          <div className="card metric">
            <h3>Deployable</h3>
            <p>Next.js + Supabase + Resend + Vercel ready.</p>
          </div>
        </div>
      </section>

      <SearchForm />

      <section>
        <SectionTitle
          title="Recent free listings"
          subtitle="The seed data below is demo content. You can replace it with manual imports, submissions, or future source adapters."
        />
        <div className="listings-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
