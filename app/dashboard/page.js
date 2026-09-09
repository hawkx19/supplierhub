'use client';

import { useState } from 'react';

const initial = [
  ['12W LED Bulb', 'Electrical', '₹120', '84'],
  ['6A Modular Switch', 'Electrical', '₹45', '120'],
  ['Copper Wire 1.5mm', 'Wires', '₹82/m', '18'],
  ['Ceiling Fan 1200mm', 'Fans', '₹2,499', '0'],
  ['PVC Insulation Tape', 'Accessories', '₹35', '46']
];

export default function Dashboard() {
  const [products, setProducts] = useState(initial);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const add = () => {
    if (!name) return;

    setProducts((p) => [
      [name, 'New', '₹' + (price || '0'), '1'],
      ...p
    ]);

    setName('');
    setPrice('');
    setOpen(false);
  };

  return (
    <main className="dash">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-dot" />
          Supplier<span>Hub</span>
        </div>

        <div className="side-section">
          <small>WORKSPACE</small>
          <b>⌂ Overview</b>
          <b className="selected">▦ Products</b>
          <b>◫ Inventory</b>
          <b>◉ Orders <i>6</i></b>
          <b>◌ Analytics</b>
        </div>

        <div className="side-section bottom">
          <small>STORE</small>
          <b>↗ Public store</b>
          <b>⚙ Settings</b>
        </div>
      </aside>

      <section className="dash-main">
        <header className="dash-head">
          <div>
            <span className="muted">Wednesday, September 9</span>
            <h1>Products</h1>
          </div>

          <button
            className="button primary"
            onClick={() => setOpen(true)}
          >
            + Add product
          </button>
        </header>

        <div className="dash-stats">
          <div>
            <span>Total products</span>
            <strong>{products.length}</strong>
            <small>+12 this month</small>
          </div>

          <div>
            <span>In stock</span>
            <strong>
              {products.filter((p) => +p[3] > 0).length}
            </strong>
            <small>Healthy inventory</small>
          </div>

          <div>
            <span>Low stock</span>
            <strong>
              {products.filter(
                (p) => +p[3] > 0 && +p[3] < 25
              ).length}
            </strong>
            <small>Needs attention</small>
          </div>

          <div>
            <span>Orders today</span>
            <strong>36</strong>
            <small>+18.4%</small>
          </div>
        </div>

        <div className="table-card">
          <div className="table-toolbar">
            <input placeholder="⌕  Search products..." />
            <span>All categories ▾</span>
          </div>

          <div className="table-head">
            <span>PRODUCT</span>
            <span>CATEGORY</span>
            <span>PRICE</span>
            <span>STOCK</span>
            <span>STATUS</span>
          </div>

          {products.map((p) => (
            <div className="product-row" key={p[0]}>
              <div>
                <div className="product-thumb">
                  {p[0].slice(0, 1)}
                </div>
                <b>{p[0]}</b>
              </div>

              <span>{p[1]}</span>
              <span>{p[2]}</span>
              <span>{p[3]}</span>

              <span
                className={
                  +p[3] === 0
                    ? 'status out'
                    : 'status'
                }
              >
                {+p[3] === 0
                  ? 'Out of stock'
                  : +p[3] < 25
                  ? 'Low stock'
                  : 'In stock'}
              </span>
            </div>
          ))}
        </div>

        {open && (
          <div className="modal-backdrop">
            <div className="modal">
              <button
                className="modal-close"
                onClick={() => setOpen(false)}
              >
                ×
              </button>

              <div className="eyebrow">NEW PRODUCT</div>

              <h2>Add to catalog</h2>

              <label>
                Product name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 12W LED Bulb"
                />
              </label>

              <label>
                Price
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="120"
                />
              </label>

              <button
                className="button primary"
                onClick={add}
              >
                Add product →
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
    }
