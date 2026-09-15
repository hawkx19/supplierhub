'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Overview() {
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: storeData } = await supabase
        .from('store_profiles')
        .select('store_slug, store_name')
        .eq('user_id', user.id)
        .single();

      setProducts(productData || []);
      setStore(storeData || null);
      setLoading(false);
    };

    loadOverview();
  }, []);

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, p) => sum + Number(p.stock || 0),
    0
  );

  const lowStock = products.filter(
    (p) => Number(p.stock) > 0 && Number(p.stock) < 25
  ).length;

  const outOfStock = products.filter(
    (p) => Number(p.stock) === 0
  ).length;

  const inventoryValue = products.reduce(
    (sum, p) =>
      sum + Number(p.price || 0) * Number(p.stock || 0),
    0
  );

  if (loading) {
    return (
      <main className="dash">
        <section className="dash-main">
          <div style={{ padding: '40px' }}>
            Loading overview...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="dash">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-dot" />
          Supplier<span>Hub</span>
        </div>

        <div className="side-section">
          <small>WORKSPACE</small>

          <a href="/overview" className="selected">
            ⌂ Overview
          </a>

          <a href="/dashboard">
            ▦ Products
          </a>

          <a href="/inventory">
            ◫ Inventory
          </a>

          <a href="/orders">
            ◉ Orders
          </a>

          <a href="/analytics">
            ◌ Analytics
          </a>
        </div>

        <div className="side-section bottom">
          <small>STORE</small>

          <a
            href={
              store?.store_slug
                ? `/store/${store.store_slug}`
                : '#'
            }
          >
            ↗ Public store
          </a>

          <a href="/settings">
            ⚙ Settings
          </a>
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

            <h1>Overview</h1>
          </div>

          <a
            href="/dashboard"
            className="button primary"
            style={{ textDecoration: 'none' }}
          >
            + Add product
          </a>
        </header>

        <div className="dash-stats">
          <div>
            <span>Total products</span>
            <strong>{totalProducts}</strong>
            <small>Your catalog</small>
          </div>

          <div>
            <span>Total stock</span>
            <strong>{totalStock}</strong>
            <small>Units available</small>
          </div>

          <div>
            <span>Low stock</span>
            <strong>{lowStock}</strong>
            <small>Needs attention</small>
          </div>

          <div>
            <span>Inventory value</span>
            <strong>
              ₹{inventoryValue.toLocaleString('en-IN')}
            </strong>
            <small>Current stock value</small>
          </div>
        </div>

        <div
          className="table-card"
          style={{ marginBottom: '20px' }}
        >
          <div style={{ padding: '24px' }}>
            <div className="eyebrow">
              STORE
            </div>

            <h2 style={{ margin: '6px 0' }}>
              {store?.store_name || 'Your Store'}
            </h2>

            {store?.store_slug ? (
              <p className="muted">
                Your public store is live at:
                <br />
                {window.location.origin}/store/
                {store.store_slug}
              </p>
            ) : (
              <p className="muted">
                Store link is being prepared...
              </p>
            )}

            {store?.store_slug && (
              <a
                href={`/store/${store.store_slug}`}
                target="_blank"
                rel="noreferrer"
                className="button"
                style={{ textDecoration: 'none' }}
              >
                Open Public Store ↗
              </a>
            )}
          </div>
        </div>

        <div className="table-card">
          <div className="table-toolbar">
            <div>
              <h2 style={{ margin: 0 }}>
                Recent Products
              </h2>
              <span className="muted">
                Latest products added to your catalog
              </span>
            </div>
          </div>

          <div className="table-head">
            <span>PRODUCT</span>
            <span>CATEGORY</span>
            <span>PRICE</span>
            <span>STOCK</span>
            <span>STATUS</span>
          </div>

          {products.length === 0 ? (
            <div style={{ padding: '30px' }}>
              No products yet.
            </div>
          ) : (
            products.slice(0, 5).map((p) => (
              <div
                className="product-row"
                key={p.id}
              >
                <div>
                  <div className="product-thumb">
                    {p.name?.slice(0, 1)}
                  </div>

                  <b>{p.name}</b>
                </div>

                <span>
                  {p.category || 'New'}
                </span>

                <span>
                  ₹{Number(p.price).toLocaleString('en-IN')}
                </span>

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

        {outOfStock > 0 && (
          <div
            className="auth-error"
            style={{ marginTop: '20px' }}
          >
            ⚠️ You have {outOfStock} product
            {outOfStock > 1 ? 's' : ''} out of stock.
          </div>
        )}
      </section>
    </main>
  );
    }
