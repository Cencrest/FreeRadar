import Link from "next/link";
import {
  createAlertAction,
  deleteAlertAction,
  deleteFavoriteAction,
  deleteSubmissionAction,
} from "./actions";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { signOutAction } from "@/app/login/actions";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage(props: any) {
  const searchParams = (await props.searchParams) ?? {};
  const user = await requireUser();
  const profile = await getCurrentProfile();
  const data = await getDashboardData(user.id);

  const supabase = await createClient();

  const { data: myListings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="stack">
      <div className="spread">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Manage alerts, favorites, your listings, and user submissions.
          </p>
        </div>

        <div className="inline-form">
          {profile?.is_admin ? (
            <Link href="/admin" className="button secondary small">
              Admin
            </Link>
          ) : null}

          <form action={signOutAction}>
            <button className="button secondary small" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {searchParams.message ? (
        <div className="notice">{searchParams.message}</div>
      ) : null}

      {searchParams.error ? (
        <div className="notice">{searchParams.error}</div>
      ) : null}

      <section className="card panel">
        <h3>Create alert</h3>
        <p className="muted">
          Alerts are matched in the scheduled alert job and sent by email.
        </p>

        <form action={createAlertAction} className="search-form">
          <div className="field">
            <label htmlFor="keyword">Keyword</label>
            <input id="keyword" name="keyword" type="text" required />
          </div>

          <div className="field">
            <label htmlFor="zip">ZIP code</label>
            <input id="zip" name="zip" type="text" />
          </div>

          <div className="field">
            <label htmlFor="radius_miles">Radius miles</label>
            <input
              id="radius_miles"
              name="radius_miles"
              type="number"
              min="1"
              defaultValue="10"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue="all">
              <option value="all">All</option>
              <option value="furniture">Furniture</option>
              <option value="appliances">Appliances</option>
              <option value="electronics">Electronics</option>
              <option value="home">Home</option>
              <option value="baby">Baby</option>
              <option value="tools">Tools</option>
              <option value="outdoors">Outdoors</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="action-field">
            <button className="button" type="submit">
              Save alert
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="section-title">
          <h2>My Listings</h2>
        </div>

        <div className="table-list">
          {myListings && myListings.length > 0 ? (
            myListings.map((listing: any) => (
              <div key={listing.id} className="table-item">
                <div className="spread">
                  <div>
                    <strong>{listing.title}</strong>
                    <div className="muted">
                      {[listing.city, listing.state, listing.zip]
                        .filter(Boolean)
                        .join(", ") || "No location"}
                    </div>
                  </div>

                  <span className="tag">
                    {listing.is_active ? "active" : "inactive"}
                  </span>
                </div>

                {listing.description ? (
                  <div className="muted">{listing.description}</div>
                ) : null}

                <div className="muted">
                  Created {formatDate(listing.created_at)}
                </div>

                <div className="split-actions">
                  <Link
                    href={`/listings/${listing.id}`}
                    className="button small secondary"
                  >
                    View listing
                  </Link>

                  {listing.source_url ? (
                    <a
                      href={listing.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button small secondary"
                    >
                      Original post
                    </a>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="empty">You haven’t created any listings yet.</div>
          )}
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Your alerts</h2>
        </div>
        <p className="muted">{data.alerts.length} active alert(s)</p>

        <div className="table-list">
          {data.alerts.length ? (
            data.alerts.map((alert: any) => (
              <div key={alert.id} className="table-item">
                <div className="spread">
                  <div>
                    <strong>{alert.keyword}</strong>
                    <div className="muted">
                      {alert.category || "all"} • {alert.zip || "any ZIP"} •{" "}
                      {alert.radius_miles} miles
                    </div>
                  </div>

                  <form action={deleteAlertAction}>
                    <input type="hidden" name="id" value={alert.id} />
                    <button className="button small danger" type="submit">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">No alerts yet.</div>
          )}
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Favorites</h2>
        </div>
        <p className="muted">Saved listings for quick access.</p>

        <div className="table-list">
          {data.favoriteListings.length ? (
            data.favoriteListings.map((favorite: any) => (
              <div key={favorite.id} className="table-item">
                <div className="spread">
                  <div>
                    <strong>{favorite.listings?.title}</strong>
                    <div className="muted">
                      {favorite.listings?.city || "Unknown city"}
                    </div>
                  </div>

                  <div className="inline-form">
                    <Link
                      href={`/listings/${favorite.listing_id}`}
                      className="button small secondary"
                    >
                      Open
                    </Link>

                    <form action={deleteFavoriteAction}>
                      <input type="hidden" name="id" value={favorite.id} />
                      <button className="button small danger" type="submit">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">
              No favorites yet.{" "}
              <Link href="/listings" className="button small secondary">
                Browse listings
              </Link>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Your submissions</h2>
        </div>
        <p className="muted">
          Pending, approved, or rejected community finds.
        </p>

        <div className="table-list">
          {data.submissions.length ? (
            data.submissions.map((submission: any) => (
              <div key={submission.id} className="table-item">
                <div className="spread">
                  <div>
                    <strong>{submission.title}</strong>
                    <div className="muted">
                      {submission.status} • submitted{" "}
                      {formatDate(submission.created_at)}
                    </div>
                  </div>

                  {submission.status === "pending" ? (
                    <form action={deleteSubmissionAction}>
                      <input type="hidden" name="id" value={submission.id} />
                      <button className="button small danger" type="submit">
                        Delete
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="empty">
              No submissions yet.{" "}
              <Link href="/submit" className="button small secondary">
                Submit your first one
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
