'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Please login again.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const add = async () => {
    if (!name.trim()) return;

    setSaving(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Please login again.');
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: name.trim(),
        category: 'New',
        price: Number(price) || 0,
        stock: Number(stock) || 0,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setProducts((p) => [data, ...p]);

    setName('');
    setPrice('');
    setStock('1');
    setOpen(false);
    setSaving(false);
  };

  const inStock = products.filter((p) => Number(p.stock) > 0).length;

  const lowStock = products.filter(
    (p) => Number(p.stock) > 0 && Number(p.stock) < 25
  ).length;

  return (
    <main className="dash">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-dot" />
          Supplier<span>Hub</span>
        </div>

        <div className="side-section">
          <small>WORKSPACE</small>
          <a href="/dashboard">⌂ Overview</a>
<a href="/dashboard" className="selected">▦ Products</a>
<a href="/inventory">◫ Inventory</a>
<a href="/orders">◉ Orders</a>
<a href="/analytics">◌ Analytics</a>
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
            <span className="muted">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <h1>Products</h1>
          </div>

          <button
            className="button primary"
            onClick={() => setOpen(true)}
          >
            + Add product
          </button>
        </header>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div className="dash-stats">
          <div>
            <span>Total products</span>
            <strong>{products.length}</strong>
            <small>Your catalog</small>
          </div>

          <div>
            <span>In stock</span>
            <strong>{inStock}</strong>
            <small>Healthy inventory</small>
          </div>

          <div>
            <span>Low stock</span>
            <strong>{lowStock}</strong>
            <small>Needs attention</small>
          </div>

          <div>
            <span>Orders today</span>
            <strong>0</strong>
            <small>Coming soon</small>
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

          {loading ? (
            <div style={{ padding: '30px' }}>
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: '30px' }}>
              No products yet. Add your first product.
            </div>
          ) : (
            products.map((p) => (
              <div className="product-row" key={p.id}>
                <div>
                  <div className="product-thumb">
                    {p.name?.slice(0, 1)}
                  </div>
                  <b>{p.name}</b>
                </div>

                <span>{p.category || 'New'}</span>
                <span>₹{Number(p.price).toLocaleString('en-IN')}</span>
                <span>{p.stock}</span>

                <span
                  className={
                    Number(p.stock) === 0
                      ? 'status out'
                      : 'status'
                  }
                >
                  {Number(p.stock) === 0
                    ? 'Out of stock'
                    : Number(p.stock) < 25
                    ? 'Low stock'
                    : 'In stock'}
                </span>
              </div>
            ))
          )}
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
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="120"
                />
              </label>

              <label>
                Stock
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                />
              </label>

              <button
                className="button primary"
                onClick={add}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Add product →'}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
                  }
