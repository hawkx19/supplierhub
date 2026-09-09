import Link from 'next/link';

export default function Signup() {
  return (
    <main className="auth-page">
      <Link href="/" className="brand auth-brand">
        <span className="brand-dot" />
        Supplier<span>Hub</span>
      </Link>

      <div className="auth-card">
        <div className="eyebrow">EARLY ACCESS</div>

        <h1>Build your digital store.</h1>

        <p>
          Set up your supplier hub and start sharing your catalog.
        </p>

        <form>
          <label>
            Business name
            <input
              placeholder="Sharma Electricals"
            />
          </label>

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
              placeholder="Create a password"
            />
          </label>

          <button className="button primary" type="button">
            Create store →
          </button>
        </form>

        <small>
          Already have an account? <Link href="/login">Sign in</Link>
        </small>
      </div>
    </main>
  );
}
