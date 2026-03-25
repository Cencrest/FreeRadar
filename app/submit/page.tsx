import { createSubmissionAction } from "./actions";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function SubmitPage(props: any) {
  const searchParams = (await props.searchParams) ?? {};
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="auth-card card stack">
        <h1 className="page-title">Submit a free item</h1>
        <p className="muted">You need an account to submit listings.</p>
        <Link href="/login" className="button">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="submit-card card stack">
      <div>
        <h1 className="page-title">Submit a free item</h1>
        <p className="page-subtitle">
          This creates a pending item for review. Approved items can later be promoted into the public listings feed.
        </p>
      </div>

      {searchParams.error ? <div className="empty">{searchParams.error}</div> : null}

      <form action={createSubmissionAction} className="stack">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" placeholder="Free couch in good condition" required />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" placeholder="Add pickup notes, condition, and timing." />
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="source_url">Original post URL</label>
            <input id="source_url" name="source_url" placeholder="https://..." />
          </div>
          <div className="field">
            <label htmlFor="image_url">Image URL</label>
            <input id="image_url" name="image_url" placeholder="https://..." />
          </div>
        </div>

        <div className="grid-3">
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue="other">
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
          <div className="field">
            <label htmlFor="city">City</label>
            <input id="city" name="city" placeholder="Queens" />
          </div>
          <div className="field">
            <label htmlFor="state">State</label>
            <input id="state" name="state" placeholder="NY" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="zip">ZIP code</label>
          <input id="zip" name="zip" placeholder="11368" />
        </div>

        <button type="submit" className="button">
          Submit listing
        </button>
      </form>
    </div>
  );
}
