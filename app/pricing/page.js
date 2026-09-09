import Link from 'next/link';

export default function Pricing() {
  return (
    <main className="inner-page">
      <nav className="nav shell">
        <Link href="/" className="brand">
          <span className="brand-dot" />
          Supplier<span>Hub</span>
        </Link>

        <Link href="/signup" className="button small primary">
          Start free →
        </Link>
      </nav>

      <section className="shell page-head centered">
        <div className="eyebrow">SIMPLE PRICING</div>
        <h1>Start small. Scale when you need to.</h1>
        <p>
          No complicated plans for the MVP. We’ll keep the core supplier
          workflow simple.
        </p>
      </section>

      <section className="pricing-card shell">
        <div>
          <span className="plan-label">EARLY ACCESS</span>
          <h2>Free</h2>
          <p>Everything needed to test your digital supplier store.</p>
        </div>

        <div className="price">
          ₹0<span>/month</span>
        </div>

        <ul>
          <li>✓ Product catalog</li>
          <li>✓ Inventory tracking</li>
          <li>✓ Public store</li>
          <li>✓ Order requests</li>
          <li>✓ Mobile dashboard</li>
        </ul>

        <Link href="/signup" className="button primary">
          Create your store →
        </Link>
      </section>
    </main>
  );
}
