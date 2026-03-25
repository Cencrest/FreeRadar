import { signInWithGoogle } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="auth-card card">
      <h1 className="page-title">Log in</h1>
      <p className="page-subtitle">
        Sign in to save favorites, manage alerts, and submit listings.
      </p>

      {error ? (
        <div className="notice" style={{ marginBottom: 16 }}>
          {error}
        </div>
      ) : null}

      <form action={signInWithGoogle} className="stack">
        <button type="submit" className="button google-button">
          Continue with Google
        </button>
      </form>
    </div>
  );
}        <div className="field">
          <label htmlFor="email-signup">Email</label>
          <input id="email-signup" name="email" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="password-signup">Password</label>
          <input id="password-signup" name="password" type="password" required />
        </div>
        <button className="button secondary" type="submit">
          Create account
        </button>
      </form>
    </div>
  );
}
