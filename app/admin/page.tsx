import { approveSubmissionAction, rejectSubmissionAction } from "./actions";
import { getAlertRunPreview, getAdminQueue } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default async function AdminPage(props: any) {
  const searchParams = (await props.searchParams) ?? {};
  const profile = await getCurrentProfile();

  if (!profile?.is_admin) {
    return <div className="empty">Admin access required.</div>;
  }

  const queue = await getAdminQueue();
  const alertPreview = await getAlertRunPreview();

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">Admin</h1>
        <p className="page-subtitle">
          Review submissions and monitor alert configuration.
        </p>
      </div>

      {searchParams.error ? <div className="empty">{searchParams.error}</div> : null}

      <section className="card panel stack">
        <h3>Pending submission queue</h3>

        {queue.length ? (
          <div className="table-list">
            {queue.map((submission: any) => (
              <div className="table-item" key={submission.id}>
                <div className="spread">
                  <div>
                    <strong>{submission.title}</strong>
                    <div className="muted">
                      {submission.profiles?.email || "unknown user"} • {formatDate(submission.created_at)}
                    </div>
                    <p className="muted">{submission.description || "No description"}</p>
                  </div>
                  <div className="split-actions">
                    <form action={approveSubmissionAction}>
                      <input type="hidden" name="submission_id" value={submission.id} />
                      <button className="button small" type="submit">
                        Approve
                      </button>
                    </form>
                    <form action={rejectSubmissionAction}>
                      <input type="hidden" name="submission_id" value={submission.id} />
                      <button className="button warning small" type="submit">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">No pending submissions.</div>
        )}
      </section>

      <section className="card panel stack">
        <h3>Alert preview</h3>
        {alertPreview.length ? (
          <div className="table-list">
            {alertPreview.map((alert: any) => (
              <div className="table-item" key={alert.id}>
                <strong>{alert.keyword}</strong>
                <div className="muted">
                  {alert.profiles?.email || "no email"} • {alert.category || "all"} • {alert.zip || "any ZIP"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">No alerts yet.</div>
        )}
      </section>
    </div>
  );
}
