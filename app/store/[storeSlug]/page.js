'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function PublicStore() {
  const params = useParams();
  const storeSlug = params?.storeSlug;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    if (!storeSlug) return;

    const loadStore = async () => {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, price, stock')
        .eq('store_slug', storeSlug)
        .gt('stock', 0)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    loadStore();
  }, [storeSlug]);

  const openOrderForm = (product) => {
    setSelectedProduct(product);
    setCustomerName('');
    setCustomerEmail('');
    setQuantity(1);
    setOrderError('');
    setOrderSuccess(false);
  };

  const closeOrderForm = () => {
    if (placingOrder) return;

    setSelectedProduct(null);
    setOrderError('');
    setOrderSuccess(false);
  };

  const placeOrder = async () => {
    if (!selectedProduct) return;

    if (!customerName.trim()) {
      setOrderError('Please enter your name.');
      return;
    }

    if (quantity < 1 || quantity > selectedProduct.stock) {
      setOrderError('Invalid quantity.');
      return;
    }

    setPlacingOrder(true);
    setOrderError('');

    const { error } = await supabase.rpc('place_order', {
      p_store_slug: storeSlug,
      p_product_id: selectedProduct.id,
      p_customer_name: customerName.trim(),
      p_customer_email: customerEmail.trim(),
      p_quantity: Number(quantity),
    });

    if (error) {
      setOrderError(error.message);
      setPlacingOrder(false);
      return;
    }

    setProducts((currentProducts) =>
      currentProducts
        .map((product) =>
          product.id === selectedProduct.id
            ? {
                ...product,
                stock: product.stock - Number(quantity),
              }
            : product
        )
        .filter((product) => product.stock > 0)
    );

    setOrderSuccess(true);
    setPlacingOrder(false);
  };

  const totalAmount = selectedProduct
    ? Number(selectedProduct.price || 0) * Number(quantity || 1)
    : 0;

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '45px 20px',
        fontFamily: 'Arial, sans-serif',
        background: '#f4f6f8',
        color: '#111827',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* STORE HEADER */}
        <header
          style={{
            marginBottom: '35px',
            padding: '28px',
            borderRadius: '18px',
            background: '#111827',
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: '800',
              color: '#ffffff',
            }}
          >
            SupplierHub Store
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              fontSize: '15px',
              color: '#d1d5db',
            }}
          >
            {storeSlug
              ? `Store: ${storeSlug}`
              : 'Public supplier store'}
          </p>
        </header>

        {loading ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '16px',
              color: '#374151',
            }}
          >
            Loading products...
          </div>
        ) : error ? (
          <div
            style={{
              padding: '30px',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              color: '#111827',
            }}
          >
            <h2 style={{ color: '#111827' }}>Store unavailable</h2>
            <p style={{ color: '#4b5563' }}>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              padding: '50px 20px',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              No products available
            </h2>

            <p
              style={{
                color: '#6b7280',
                margin: 0,
              }}
            >
              This store currently has no products in stock.
            </p>
          </div>
        ) : (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '22px',
            }}
          >
            {products.map((product) => (
              <article
                key={product.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '18px',
                  padding: '24px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.07)',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '6px 10px',
                    borderRadius: '20px',
                    background: '#eef2ff',
                    color: '#4338ca',
                    fontSize: '12px',
                    fontWeight: '700',
                    marginBottom: '14px',
                  }}
                >
                  {product.category || 'Product'}
                </div>

                <h2
                  style={{
                    margin: '0 0 14px',
                    fontSize: '23px',
                    fontWeight: '800',
                    color: '#111827',
                    lineHeight: '1.25',
                  }}
                >
                  {product.name}
                </h2>

                <p
                  style={{
                    margin: '0 0 10px',
                    fontSize: '25px',
                    fontWeight: '800',
                    color: '#111827',
                  }}
                >
                  ₹
                  {Number(product.price || 0).toLocaleString(
                    'en-IN'
                  )}
                </p>

                <p
                  style={{
                    margin: '0 0 22px',
                    fontSize: '14px',
                    color: '#4b5563',
                  }}
                >
                  {Number(product.stock)} in stock
                </p>

                <button
                  onClick={() => openOrderForm(product)}
                  style={{
                    width: '100%',
                    padding: '13px',
                    border: 'none',
                    borderRadius: '11px',
                    background: '#111827',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Place Order
                </button>
              </article>
            ))}
          </section>
        )}
      </div>

      {/* ORDER MODAL */}
      {selectedProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,24,39,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '450px',
              background: '#ffffff',
              borderRadius: '20px',
              padding: '26px',
              boxShadow: '0 25px 70px rgba(0,0,0,0.25)',
              color: '#111827',
            }}
          >
            {orderSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    margin: '0 auto 18px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: '800',
                  }}
                >
                  ✓
                </div>

                <h2
                  style={{
                    color: '#111827',
                    marginBottom: '10px',
                  }}
                >
                  Order Placed Successfully!
                </h2>

                <p style={{ color: '#4b5563' }}>
                  Your order for{' '}
                  <strong style={{ color: '#111827' }}>
                    {selectedProduct.name}
                  </strong>{' '}
                  has been placed.
                </p>

                <p
                  style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#111827',
                  }}
                >
                  Total: ₹
                  {totalAmount.toLocaleString('en-IN')}
                </p>

                <button
                  onClick={closeOrderForm}
                  style={{
                    width: '100%',
                    padding: '13px',
                    marginTop: '15px',
                    border: 'none',
                    borderRadius: '11px',
                    background: '#111827',
                    color: '#ffffff',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2
                  style={{
                    margin: '0 0 6px',
                    color: '#111827',
                  }}
                >
                  Place Order
                </h2>

                <p
                  style={{
                    marginBottom: '22px',
                    color: '#6b7280',
                  }}
                >
                  {selectedProduct.name}
                </p>

                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    color: '#374151',
                    fontWeight: '600',
                  }}
                >
                  Customer Name
                </label>

                <input
                  value={customerName}
                  onChange={(e) =>
                    setCustomerName(e.target.value)
                  }
                  placeholder="Enter your name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    boxSizing: 'border-box',
                    color: '#111827',
                    background: '#ffffff',
                    fontSize: '15px',
                  }}
                />

                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    color: '#374151',
                    fontWeight: '600',
                  }}
                >
                  Email (optional)
                </label>

                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) =>
                    setCustomerEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    boxSizing: 'border-box',
                    color: '#111827',
                    background: '#ffffff',
                    fontSize: '15px',
                  }}
                />

                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    color: '#374151',
                    fontWeight: '600',
                  }}
                >
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  max={selectedProduct.stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Number(e.target.value))
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '18px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    boxSizing: 'border-box',
                    color: '#111827',
                    background: '#ffffff',
                    fontSize: '15px',
                  }}
                />

                <div
                  style={{
                    padding: '15px',
                    marginBottom: '18px',
                    background: '#f3f4f6',
                    borderRadius: '11px',
                    color: '#111827',
                    fontSize: '17px',
                    fontWeight: '800',
                  }}
                >
                  Total: ₹
                  {totalAmount.toLocaleString('en-IN')}
                </div>

                {orderError && (
                  <p
                    style={{
                      color: '#dc2626',
                      background: '#fef2f2',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  >
                    {orderError}
                  </p>
                )}

                <button
                  onClick={placeOrder}
                  disabled={placingOrder}
                  style={{
                    width: '100%',
                    padding: '13px',
                    border: 'none',
                    borderRadius: '11px',
                    background: placingOrder
                      ? '#9ca3af'
                      : '#111827',
                    color: '#ffffff',
                    fontWeight: '700',
                    cursor: placingOrder
                      ? 'not-allowed'
                      : 'pointer',
                  }}
                >
                  {placingOrder
                    ? 'Placing Order...'
                    : 'Confirm Order'}
                </button>

                <button
                  onClick={closeOrderForm}
                  disabled={placingOrder}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '11px',
                    background: '#ffffff',
                    color: '#374151',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
              }
