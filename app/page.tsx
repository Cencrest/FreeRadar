import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";
import { SectionTitle } from "@/components/SectionTitle";

export default function HomePage() {
  return (
    <div className="stack">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">FreeRadar</span>
          <h1 className="page-title">Find free stuff near you</h1>
          <p className="page-subtitle">
            Browse free items, curb alerts, and community giveaways all in one
            place.
          </p>
        </div>

        <div className="split-actions">
          <Link href="/listings" className="button">
            Browse listings
          </Link>

          <Link href="/submit" className="button secondary">
            Post something free
          </Link>
        </div>
      </section>

      <section className="card">
        <SectionTitle
          title="Search"
          subtitle="Find free items by keyword, category, or location."
        />
        <SearchForm />
      </section>

      <section className="card" style={{ textAlign: "center" }}>
        <h2 style={{ marginTop: 0 }}>Browse free items near you</h2>
        <p className="muted" style={{ marginBottom: 20 }}>
          See the latest free stuff posted on FreeRadar and imported from local
          sources.
        </p>

        <div className="split-actions" style={{ justifyContent: "center" }}>
          <Link href="/listings" className="button">
            View listings
          </Link>

          <Link href="/submit" className="button secondary">
            Post something free
          </Link>
        </div>
      </section>
    </div>
  );
}
