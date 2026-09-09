import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Digital Store",
    text: "Turn your local inventory into a clean, shareable online catalog."
  },
  {
    number: "02",
    title: "Live Inventory",
    text: "Know what is in stock, low stock, or sold out at a glance."
  },
  {
    number: "03",
    title: "Order Requests",
    text: "Let customers build an order instead of sending endless product photos."
  }
];

export default function Home() {
  return (
    <main>
      <nav className="nav shell">
        <Link href="/" className="brand">
          <span className="brand-dot" />
          Supplier<span>Hub</span>
        </Link>

        <div className="navlinks">
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Login</Link>
          <Link href="/signup" className="nav-cta">
            Get Started ↗
          </Link>
        </div>
      </nav>

      <section className="hero shell">
        <div className="orb orb-a" />
        <div className="orb orb-b" />

        <div className="eyebrow">
          LOCAL COMMERCE • REIMAGINED
        </div>

        <h1>
          Local supply,
          <br />
          <em>upgraded.</em>
        </h1>

        <p className="hero-copy">
          One modern hub for products, inventory, customer orders and
          your digital storefront.
        </p>

        <div className="actions">
          <Link href="/signup" className="button primary">
            Create your store <span>→</span>
          </Link>

          <Link href="/shop/demo" className="button ghost">
            Explore demo store
          </Link>
        </div>

        <div className="hero-stage">
          <div className="glow-card mini-card card-one">
            <small>ORDERS TODAY</small>
            <strong>36</strong>
            <span className="positive">+18.4%</span>
          </div>

          <div className="dashboard-mock">
            <div className="mock-top">
              <span className="window-dot" />
              <span className="window-dot" />
              <span className="window-dot" />

              <b>Overview</b>

              <span className="mock-date">
                Sep 09, 2026
              </span>
            </div>

            <div className="mock-body">
              <aside>
                <div className="mock-logo">SH</div>

                <div className="side-active">
                  Overview
                </div>

                <div>Products</div>
                <div>Inventory</div>
                <div>Orders</div>
                <div>Analytics</div>
              </aside>

              <div className="mock-main">
                <p className="muted">
                  Good evening
                </p>

                <h3>
                  Your business overview
                </h3>

                <div className="stat-grid">
                  <div>
                    <span>Products</span>
                    <b>248</b>
                  </div>

                  <div>
                    <span>Orders</span>
                    <b>36</b>
                  </div>

                  <div>
                    <span>Revenue</span>
                    <b>₹84.2K</b>
                  </div>
                </div>

                <div className="chart">
                  <div className="bars">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>

                  <div className="chart-line" />
                </div>
              </div>
            </div>
          </div>

          <div className="glow-card mini-card card-two">
            <small>STORE STATUS</small>
            <strong>Live</strong>
            <span>● accepting orders</span>
          </div>
        </div>
      </section>

      <section className="feature-strip shell">
        {features.map((feature) => (
          <div className="feature" key={feature.number}>
            <span>{feature.number}</span>

            <h3>{feature.title}</h3>

            <p>{feature.text}</p>
          </div>
        ))}
      </section>

      <section className="cta shell">
        <div>
          <div className="eyebrow">
            BUILT FOR LOCAL BUSINESS
          </div>

          <h2>
            Stop managing your business
            <br />
            from scattered chats.
          </h2>
        </div>

        <Link href="/signup" className="button primary">
          Build my store →
        </Link>
      </section>

      <footer className="footer shell">
        <span>
          SupplierHub © 2026
        </span>

        <span>
          Built for suppliers who want to move faster.
        </span>
      </footer>
    </main>
  );
    }
