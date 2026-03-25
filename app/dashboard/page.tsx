import Link from "next/link";
import { createAlertAction, deleteAlertAction, deleteFavoriteAction, deleteSubmissionAction } from "./actions";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { signOutAction } from "@/app/login/actions";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage(props: any) {
  const searchParams = (await props.searchParams) ?? {};
  const user = await requireUser();
  const profile = await getCurrentProfile();
  const data = await getDashboardData(user.id);

  return (
    <div className="stack">
      <div className="spread">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Manage alerts, favorites, and user submissions.
          </p>
        </div>

        <div className="split-actions">
          {profile?.is_admin ? (
            <Link href="/admin" className="button secondary">
              Admin
            </Link>
          ) : null}
          <form action={signOutAction}>
            <button className="button secondary" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {searchParams.message ? <div className="notice">{searchParams.message}</div> : null}
      {searchParams.error ? <div className="empty">{searchParams.error}</div> : null}

      <div className="dashboard-grid">
        <section className="card panel stack">
          <div>
            <h3>Create alert</h3>
            <p className="muted">
              Alerts are matched in the scheduled alert job and sent by email.
            </p>
          </div>

          <form action={createAlertAction} className="stack">
            <div className="field">
              <label htmlFor="keyword">Keyword</label>
              <input id="keyword" name="keyword" placeholder="dresser" required />
            </div>
            <div className="grid-3">
              <div className="field">
                <label htmlFor="zip">ZIP code</label>
                <input id="zip" name="zip" placeholder="10001" />
              </div>
              <div className="field">
                <label htmlFor="radius_miles">Radius miles</label>
                <input id="radius_miles" name="radius_miles" type="number" defaultValue="25" />
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
            </div>

            <button className="button" type="submit">
              Save alert
            </button>
          </form>
        </section>

        <section className="card panel stack">
          <div>
            <h3>Your alerts</h3>
            <p className="muted">{data.alerts.length} active alert(s)</p>
          </div>

          {data.alerts.length ? (
            <div className="table-list">
              {data.alerts.map((alert: any) => (
                <div className="table-item" key={alert.id}>
                  <div className="spread">
                    <div>
                      <strong>{alert.keyword}</strong>
                      <div className="muted">
                        {alert.category || "all"} • {alert.zip || "any ZIP"} • {alert.radius_miles} miles
                      </div>
                    </div>
                    <form action={deleteAlertAction}>
                      <input type="hidden" name="id" value={alert.id} />
                      <button className="button danger small" type="submit">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No alerts yet.</div>
          )}
        </section>

        <section className="card panel stack">
          <div>
            <h3>Favorites</h3>
            <p className="muted">Saved listings for quick access.</p>
          </div>

          {data.favoriteListings.length ? (
            <div className="table-list">
              {data.favoriteListings.map((favorite: any) => (
                <div className="table-item" key={favorite.id}>
                  <div className="spread">
                    <div>
                      <strong>{favorite.listings?.title}</strong>
                      <div className="muted">{favorite.listings?.city || "Unknown city"}</div>
                    </div>
                    <div className="split-actions">
                      <a
                        href={favorite.listings?.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="button secondary small"
                      >
                        Open
                      </a>
                      <form action={deleteFavoriteAction}>
                        <input type="hidden" name="id" value={favorite.id} />
                        <button className="button danger small" type="submit">
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              No favorites yet. <Link href="/listings">Browse listings</Link>
            </div>
          )}
        </section>

        <section className="card panel stack">
          <div>
            <h3>Your submissions</h3>
            <p className="muted">Pending, approved, or rejected community finds.</p>
          </div>

          {data.submissions.length ? (
            <div className="table-list">
              {data.submissions.map((submission: any) => (
                <div className="table-item" key={submission.id}>
                  <div className="spread">
                    <div>
                      <strong>{submission.title}</strong>
                      <div className="muted">
                        {submission.status} • submitted {formatDate(submission.created_at)}
                      </div>
                    </div>
                    {submission.status === "pending" ? (
                      <form action={deleteSubmissionAction}>
                        <input type="hidden" name="id" value={submission.id} />
                        <button className="button danger small" type="submit">
                          Delete
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No submissions yet. <Link href="/submit">Submit your first one</Link>.</div>
          )}
        </section>
      </div>
    </div>
  );
}
