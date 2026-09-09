import Link from 'next/link';

const items = [
  ['Digital storefront', 'Give customers one clean place to browse your catalog.'],
  ['Inventory control', 'Track stock and spot low-stock products before customers do.'],
  ['Order workflow', 'Collect clear order requests with quantities and customer details.'],
  ['Smart catalog', 'Keep categories, prices and product information organized.'],
  ['Analytics', 'See what is moving and where your business is growing.'],
  ['AI assistant', 'Later, turn a product photo and rough notes into polished catalog data.']
];

export default function Features() {
  return (
    <main className="inner-page">
      <nav className="nav shell">
        <Link href="/" className="brand">
          <span className="brand-dot" />
          Supplier<span>Hub</span>
        </Link>

        <Link href="/signup" className="button small primary">
          Get Started →
        </Link>
      </nav>

      <section className="shell page-head">
        <div className="eyebrow">THE TOOLKIT</div>
        <h1>Everything your local supply business needs.</h1>
        <p>
          Designed around the messy reality of local commerce — inventory,
          products, customers and orders in one place.
        </p>
      </section>

      <section className="feature-grid shell">
        {items.map((x, i) => (
          <article key={x[0]} className="feature-card">
            <span>0{i + 1}</span>
            <h2>{x[0]}</h2>
            <p>{x[1]}</p>
            <div className="card-arrow">↗</div>
          </article>
        ))}
      </section>
    </main>
  );
    }
