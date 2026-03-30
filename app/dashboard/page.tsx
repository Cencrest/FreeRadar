import Link from "next/link";
import {
  createAlertAction,
  deleteAlertAction,
  deleteFavoriteAction,
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
            Manage alerts, favorites, and your listings.
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

      {/* CREATE ALERT */}
      <section className="card panel">
        <h3>Create alert</h3>
        <p className="muted">
          Get notified when new listings match your search.
        </p>

        <form action={createAlertAction} className="search-form">
          <div className="field">
            <label>Keyword</label>
            <input name="keyword" required />
          </div>

          <div className="field">
            <label>ZIP</label>
            <input name="zip" />
          </div>

          <div className="field">
            <label>Radius (miles)</label>
            <input name="radius_miles" type="number" defaultValue="10" />
          </div>

          <div className="field">
            <label>Category</label>
            <select name="category">
              <option value="all">All</option>
              <option value="furniture">Furniture</option>
              <option value="electronics">Electronics</option>
              <option value="appliances">Appliances</option>
              <option value="home">Home</option>
              <option value="baby">Baby</option>
              <option value="tools">Tools</option>
              <option value="outdoors">Outdoors</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="action-field">
            <button className="button">Create</button>
          </div>
        </form>
      </section>

      {/* MY LISTINGS */}
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
                      {[listing.city, listing.state].filter(Boolean).join(", ") || "No location"}
                    </div>
                  </div>

                  <span className="tag">
                    {listing.is_active ? "active" : "inactive"}
                  </span>
                </div>

                <div className="muted">
                  Created {formatDate(listing.created_at)}
                </div>

                <div className="split-actions">
                  <Link href={`/listings/${listing.id}`} className="button small secondary">
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

      {/* ALERTS */}
      <section>
        <div className="section-title">
          <h2>Your Alerts</h2>
        </div>

        <div className="table-list">
          {data.alerts.length ? (
            data.alerts.map((alert: any) => (
              <div key={alert.id} className="table-item">
                <div className="spread">
                  <div>
                    <strong>{alert.keyword}</strong>
                    <div className="muted">
                      {alert.category} · {alert.zip || "anywhere"}
                    </div>
                  </div>

                  <form action={deleteAlertAction}>
                    <input type="hidden" name="id" value={alert.id} />
                    <button className="button small danger">Delete</button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">No alerts yet</div>
          )}
        </div>
      </section>

      {/* FAVORITES */}
      <section>
        <div className="section-title">
          <h2>Favorites</h2>
        </div>

        <div className="table-list">
          {data.favoriteListings.length ? (
            data.favoriteListings.map((fav: any) => (
              <div key={fav.id} className="table-item">
                <div className="spread">
                  <div>
                    <strong>{fav.listings?.title}</strong>
                    <div className="muted">
                      {fav.listings?.city}
                    </div>
                  </div>

                  <div className="inline-form">
                    <Link
                      href={`/listings/${fav.listing_id}`}
                      className="button small secondary"
                    >
                      View
                    </Link>

                    <form action={deleteFavoriteAction}>
                      <input type="hidden" name="id" value={fav.id} />
                      <button className="button small danger">Remove</button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">No favorites yet</div>
          )}
        </div>
      </section>
    </div>
  );
}
