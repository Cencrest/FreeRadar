import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          FreeRadar
        </Link>

        <nav className="nav">
          <Link href="/listings">Listings</Link>
          <Link href="/submit">Submit</Link>
          {user ? <Link href="/dashboard">Dashboard</Link> : <Link href="/login">Log in</Link>}
        </nav>
      </div>
    </header>
  );
}
