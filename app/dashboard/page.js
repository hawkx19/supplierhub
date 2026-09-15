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

  const [storeSlug, setStoreSlug] = useState('');
  const [storeName, setStoreName] = useState('Your Store');
  const [copied, setCopied] = useState(false);

  // EDIT PRODUCT
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

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

  const loadStore = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('store_profiles')
      .select('store_slug, store_name')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setStoreSlug(data.store_slug);
      setStoreName(data.store_name || 'Your Store');
    }
  };

  useEffect(() => {
    loadProducts();
    loadStore();
  }, []);

  // ADD PRODUCT
  const add = async () => {
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }

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

  // OPEN EDIT MODAL
  const openEdit = (product) => {
    setEditingProduct(product);

    setEditName(product.name || '');
    setEditCategory(product.category || '');
    setEditPrice(String(product.price ?? ''));
    setEditStock(String(product.stock ?? '0'));

    setError('');
  };

  // CLOSE EDIT MODAL
  const closeEdit = () => {
    if (savingEdit) return;

    setEditingProduct(null);
    setEditName('');
    setEditCategory('');
    setEditPrice('');
    setEditStock('');
  };

  // SAVE EDIT
  const saveEdit = async () => {
    if (!editingProduct) return;

    if (!editName.trim()) {
      setError('Product name is required.');
      return;
    }

    if (Number(editPrice) < 0 || Number(editStock) < 0) {
      setError('Price and stock cannot be negative.');
      return;
    }

    setSavingEdit(true);
    setError('');

    const { data, error } = await supabase.rpc('update_product', {
      p_product_id: editingProduct.id,
      p_name: editName.trim(),
      p_category: editCategory.trim(),
      p_price: Number(editPrice) || 0,
      p_stock: Number(editStock) || 0,
    });

    if (error) {
      setError(error.message);
      setSavingEdit(false);
      return;
    }

    setProducts((current) =>
      current.map((product) =>
        product.id === editingProduct.id ? data : product
      )
    );

    closeEdit();
    setSavingEdit(false);
  };

  const copyStoreLink = async () => {
    if (!storeSlug) return;

    const url = `${window.location.origin}/store/${storeSlug}`;

    await navigator.clipboard.writeText(url);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const inStock = products.filter(
    (p) => Number(p.stock) > 0
  ).length;

  const lowStock = products.filter(
    (p) => Number(p.stock) > 0 && Number(p.stock) < 25
  ).length;

  const storeUrl = storeSlug
    ? `${
        typeof window !== 'undefined'
          ? window.location.origin
          : ''
      }/store/${storeSlug}`
    : '';

  return (
    <main className="dash">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-dot" />
          Supplier<span>Hub</span>
        </div>

        <div className="side-section">
          <small>WORKSPACE</small>

          <a href="/overview">⌂ Overview</a>

          <a href="/dashboard" className="selected">
            ▦ Products
          </a>

          <a href="/inventory">◫ Inventory</a>

          <a href="/orders">◉ Orders</a>

          <a href="/analytics">◌ Analytics</a>
        </div>

        <div className="side-section bottom">
          <small>STORE</small>

          <a href={storeSlug ? `/store/${storeSlug}` : '#'}>
            ↗ Public store
          </a>

          <a href="/settings">
            ⚙ Settings
          </a>
        </div>
      </aside>

      {/* MAIN */}
      <section className="dash-main">

        {/* HEADER */}
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

        {/* PUBLIC STORE */}
        <div
          className="table-card"
          style={{ marginBottom: '20px' }}
        >
          <div
            style={{
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div className="eyebrow">
                YOUR PUBLIC STORE
              </div>

              <h2 style={{ margin: '6px 0' }}>
                {storeName}
              </h2>

              {storeUrl ? (
                <p
                  className="muted"
                  style={{
                    margin: 0,
                    wordBreak: 'break-all',
                  }}
                >
                  {storeUrl}
                </p>
              ) : (
                <p className="muted">
                  Loading your store link...
                </p>
              )}
            </div>

            {storeSlug && (
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <a
                  href={`/store/${storeSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="button"
                  style={{
                    textDecoration: 'none',
                  }}
                >
                  Open Store ↗
                </a>

                <button
                  className="button primary"
                  onClick={copyStoreLink}
                >
                  {copied
                    ? 'Copied ✓'
                    : 'Copy Store Link'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* STATS */}
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

        {/* PRODUCT TABLE */}
        <div className="table-card">

          <div className="table-toolbar">
            <input
              placeholder="⌕  Search products..."
            />

            <span>
              All categories ▾
            </span>
          </div>

          <div
            className="table-head"
            style={{
              gridTemplateColumns:
                '2fr 1fr 1fr 1fr 1fr 90px',
            }}
          >
            <span>PRODUCT</span>
            <span>CATEGORY</span>
            <span>PRICE</span>
            <span>STOCK</span>
            <span>STATUS</span>
            <span>ACTION</span>
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
              <div
                className="product-row"
                key={p.id}
                style={{
                  gridTemplateColumns:
                    '2fr 1fr 1fr 1fr 1fr 90px',
                }}
              >

                {/* PRODUCT */}
                <div>
                  <div className="product-thumb">
                    {p.name?.slice(0, 1)}
                  </div>

                  <b>{p.name}</b>
                </div>

                {/* CATEGORY */}
                <span>
                  {p.category || 'New'}
                </span>

                {/* PRICE */}
                <span>
                  ₹
                  {Number(
                    p.price
                  ).toLocaleString('en-IN')}
                </span>

                {/* STOCK */}
                <span>
                  {p.stock}
                </span>

                {/* STATUS */}
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

                {/* EDIT */}
                <button
                  className="button"
                  onClick={() => openEdit(p)}
                  style={{
                    padding: '7px 10px',
                    fontSize: '13px',
                  }}
                >
                  Edit
                </button>

              </div>
            ))
          )}

        </div>

        {/* ADD PRODUCT MODAL */}
        {open && (
          <div className="modal-backdrop">

            <div className="modal">

              <button
                className="modal-close"
                onClick={() => setOpen(false)}
              >
                ×
              </button>

              <div className="eyebrow">
                NEW PRODUCT
              </div>

              <h2>
                Add to catalog
              </h2>

              <label>
                Product name

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="e.g. 12W LED Bulb"
                />
              </label>

              <label>
                Price

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  placeholder="120"
                />
              </label>

              <label>
                Stock

                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) =>
                    setStock(e.target.value)
                  }
                  placeholder="10"
                />
              </label>

              <button
                className="button primary"
                onClick={add}
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : 'Add product →'}
              </button>

            </div>
          </div>
        )}

        {/* EDIT PRODUCT MODAL */}
        {editingProduct && (
          <div className="modal-backdrop">

            <div className="modal">

              <button
                className="modal-close"
                onClick={closeEdit}
              >
                ×
              </button>

              <div className="eyebrow">
                EDIT PRODUCT
              </div>

              <h2>
                Update product
              </h2>

              <label>
                Product name

                <input
                  value={editName}
                  onChange={(e) =>
                    setEditName(e.target.value)
                  }
                  placeholder="Product name"
                />
              </label>

              <label>
                Category

                <input
                  value={editCategory}
                  onChange={(e) =>
                    setEditCategory(e.target.value)
                  }
                  placeholder="e.g. Electronics"
                />
              </label>

              <label>
                Price

                <input
                  type="number"
                  min="0"
                  value={editPrice}
                  onChange={(e) =>
                    setEditPrice(e.target.value)
                  }
                  placeholder="120"
                />
              </label>

              <label>
                Stock

                <input
                  type="number"
                  min="0"
                  value={editStock}
                  onChange={(e) =>
                    setEditStock(e.target.value)
                  }
                  placeholder="10"
                />
              </label>

              <button
                className="button primary"
                onClick={saveEdit}
                disabled={savingEdit}
              >
                {savingEdit
                  ? 'Saving...'
                  : 'Save changes →'}
              </button>

            </div>
          </div>
        )}

      </section>
    </main>
  );
            }
