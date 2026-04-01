import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteListingAction } from "@/app/submit/actions";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">My Listings</h1>

      {!listings || listings.length === 0 ? (
        <p>No listings yet.</p>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-lg border p-4 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{listing.title}</h2>

              {listing.description ? (
                <p className="mt-2 text-sm text-gray-600">
                  {listing.description}
                </p>
              ) : null}

              <div className="mt-4 flex gap-3">
                <form action={deleteListingAction}>
                  <input
                    type="hidden"
                    name="listingId"
                    value={listing.id}
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
