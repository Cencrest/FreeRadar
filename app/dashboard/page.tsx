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
import { revalidatePath } from "next/cache";

async function updateMyListingAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("listings")
    .update({
      title: formData.get("title"),
      description: formData.get("description"),
      image_url: formData.get("image_url"),
      source_url: formData.get("source_url"),
      category: formData.get("category"),
      city: formData.get("city"),
      state: formData.get("state"),
      zip: formData.get("zip"),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/listings");
}

async function deleteMyListingAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/listings");
}

async function deactivateMyListingAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("listings")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/listings");
}

async function reactivateMyListingAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const activeUntil = new Date();
  activeUntil.setDate(activeUntil.getDate() + 7);

  const { error } = await supabase
    .from("listings")
    .update({
      is_active: true,
      active_until: activeUntil.toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/listings");
}

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

  const now = new Date();

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

      <section>
        <div className="section-title">
          <h2>My Listings</h2>
        </div>

        <div className="table-list">
          {myListings && myListings.length > 0 ? (
            myListings.map((listing: any) => {
              const expired =
                !listing.active_until || new Date(listing.active_until) <= now;
              const active = listing.is_active && !expired;

              return (
                <div key={listing.id} className="table-item">
                  <div className="spread">
                    <div>
                      <strong>{listing.title}</strong>
                      <div className="muted">
                        {[listing.city, listing.state].filter(Boolean).join(", ") || "No location"}
                      </div>
                    </div>

                    <span className="tag">
                      {active ? "active" : "inactive"}
                    </span>
                  </div>

                  <div className="muted">
                    Created {formatDate(listing.created_at)}
                  </div>

                  <div className="muted">
                    {listing.active_until
                      ? `Active until ${formatDate(listing.active_until)}`
                      : "No expiry set"}
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

                    {!active ? (
                      <form action={reactivateMyListingAction}>
                        <input type="hidden" name="id" value={listing.id} />
                        <button className="button small" type="submit">
                          Reactivate 7 days
                        </button>
                      </form>
                    ) : (
                      <form action={deactivateMyListingAction}>
                        <input type="hidden" name="id" value={listing.id} />
                        <button className="button small warning" type="submit">
                          Deactivate
                        </button>
                      </form>
                    )}

                    <form action={deleteMyListingAction}>
                      <input type="hidden" name="id" value={listing.id} />
                      <button className="button small danger" type="submit">
                        Delete
                      </button>
                    </form>
                  </div>

                  <details>
                    <summary className="muted" style={{ cursor: "pointer" }}>
                      Edit listing
                    </summary>

                    <form action={updateMyListingAction} className="stack" style={{ marginTop: 12 }}>
                      <input type="hidden" name="id" value={listing.id} />

                      <div className="field">
                        <label>Title</label>
                        <input name="title" defaultValue={listing.title ?? ""} required />
                      </div>

                      <div className="field">
                        <label>Description</label>
                        <textarea
                          name="description"
                          defaultValue={listing.description ?? ""}
                        />
                      </div>

                      <div className="grid-2">
                        <div className="field">
                          <label>Image URL</label>
                          <input name="image_url" defaultValue={listing.image_url ?? ""} />
                        </div>

                        <div className="field">
                          <label>Source URL</label>
                          <input name="source_url" defaultValue={listing.source_url ?? ""} />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div className="field">
                          <label>Category</label>
                          <input name="category" defaultValue={listing.category ?? ""} />
                        </div>

                        <div className="field">
                          <label>ZIP</label>
                          <input name="zip" defaultValue={listing.zip ?? ""} />
                        </div>
                      </div>

                      <div className="grid-2">
                        <div className="field">
                          <label>City</label>
                          <input name="city" defaultValue={listing.city ?? ""} />
                        </div>

                        <div className="field">
                          <label>State</label>
                          <input name="state" defaultValue={listing.state ?? ""} />
                        </div>
                      </div>

                      <div>
                        <button className="button small" type="submit">
                          Save changes
                        </button>
                      </div>
                    </form>
                  </details>
                </div>
              );
            })
          ) : (
            <div className="empty">You haven’t created any listings yet.</div>
          )}
        </div>
      </section>

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
                    <div className="muted">{fav.listings?.city}</div>
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
