'use client';

import { useMemo, useState } from 'react';

const products = [
  ['12W LED Bulb', 'Electrical', '₹120', '84'],
  ['6A Modular Switch', 'Electrical', '₹45', '120'],
  ['Copper Wire 1.5mm', 'Wires', '₹82/m', '18'],
  ['Ceiling Fan 1200mm', 'Fans', '₹2,499', '0'],
  ['PVC Insulation Tape', 'Accessories', '₹35', '46'],
  ['Modular Socket 6A', 'Electrical', '₹65', '72']
];

export default function Shop() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [cart, setCart] = useState([]);

  const cats = [
    'All',
    'Electrical',
    'Wires',
    'Fans',
    'Accessories'
  ];

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === 'All' || p[1] === cat) &&
          p[0].toLowerCase().includes(q.toLowerCase())
      ),
    [q, cat]
  );

  return (
    <main className="shop">
      <header className="shop-nav">
        <div className="shop-brand">
          <span className="store-avatar">SE</span>

          <div>
            <b>Sharma Electricals</b>
            <small>
              Kaithal, Haryana • Local supplier
            </small>
          </div>
        </div>

        <button className="cart">
          Cart <strong>{cart.length}</strong>
        </button>
      </header>

      <section className="shop-hero">
        <div className="eyebrow">OFFICIAL CATALOG</div>

        <h1>
          Everything you need,
          <br />
          <em>right here.</em>
        </h1>

        <p>
          Browse our latest electrical products and send
          an order request in minutes.
        </p>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="⌕  Search products..."
        />
      </section>

      <div className="category-row">
        {cats.map((c) => (
          <button
            className={cat === c ? 'active' : ''}
            key={c}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <section className="shop-grid">
        {filtered.map((p) => (
          <article
            className="shop-product"
            key={p[0]}
          >
            <div className="product-art">
              <span>{p[0].slice(0, 1)}</span>
            </div>

            <div className="product-info">
              <small>{p[1]}</small>

              <h3>{p[0]}</h3>

              <div>
                <strong>{p[2]}</strong>

                <button
                  disabled={p[3] === '0'}
                  onClick={() =>
                    setCart([...cart, p])
                  }
                >
                  {p[3] === '0'
                    ? 'Sold out'
                    : '+ Add'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {cart.length > 0 && (
        <div className="cart-bar">
          <span>
            <b>{cart.length}</b>{' '}
            item{cart.length > 1 ? 's' : ''} ready
            to order
          </span>

          <button
            className="button primary"
            onClick={() =>
              alert('Demo order created!')
            }
          >
            Send order request →
          </button>
        </div>
      )}
    </main>
  );
    }
