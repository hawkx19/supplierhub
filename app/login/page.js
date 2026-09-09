import Link from 'next/link';

export default function Login() {
  return (
    <main className="auth-page">
      <Link href="/" className="brand auth-brand">
        <span className="brand-dot" />
        Supplier<span>Hub</span>
      </Link>

      <div className="auth-card">
        <div className="eyebrow">WELCOME BACK</div>

        <h1>Sign in to your hub.</h1>

        <p>Manage products, inventory and orders.</p>

        <form>
          <label>
            Email
            <input
              type="email"
              placeholder="you@business.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
            />
          </label>

          <button className="button primary" type="button">
            Sign in →
          </button>
        </form>

        <small>
          New here? <Link href="/signup">Create an account</Link>
        </small>
      </div>
    </main>
  );
}
