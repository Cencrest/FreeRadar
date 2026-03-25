import { signInAction, signUpAction } from "./actions";

export default async function LoginPage(props: any) {
  const searchParams = (await props.searchParams) ?? {};

  return (
    <div className="auth-card card stack">
      <div>
        <h1 className="page-title">Log in or create an account</h1>
        <p className="page-subtitle">
          FreeRadar uses Supabase Auth for sign up, sign in, and session handling.
        </p>
      </div>

      {searchParams.error ? <div className="empty">{searchParams.error}</div> : null}
      {searchParams.message ? <div className="notice">{searchParams.message}</div> : null}

      <form action={signInAction} className="stack">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>
        <button className="button" type="submit">
          Log in
        </button>
      </form>

      <div className="notice">
        New here? Use the same form details below to create your account.
      </div>

      <form action={signUpAction} className="stack">
        <div className="field">
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
