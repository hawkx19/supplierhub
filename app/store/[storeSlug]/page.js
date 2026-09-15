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
        padding: '40px 20px',
        fontFamily: 'Arial, sans-serif',
        background: '#f7f8fa',
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
            marginBottom: '40px',
            padding: '25px',
            background: '#111827',
            borderRadius: '16px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
          }}
        >
          <h1
            style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '30px',
              fontWeight: '800',
            }}
          >
            SupplierHub Store
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              color: '#d1d5db',
              fontSize: '15px',
            }}
          >
            {storeSlug
              ? `Store: ${storeSlug}`
              : 'Public supplier store'}
          </p>
        </header>

        {/* LOADING */}
        {loading ? (
          <div
            style={{
              padding: '40px',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#374151',
                fontSize: '16px',
              }}
            >
              Loading products...
            </p>
          </div>
        ) : error ? (
          /* ERROR */
          <div
            style={{
              padding: '30px',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
            }}
          >
            <h2
              style={{
                color: '#111827',
                marginTop: 0,
              }}
            >
              Store unavailable
            </h2>

            <p
              style={{
                color: '#4b5563',
              }}
            >
              {error}
            </p>
          </div>
        ) : products.length === 0 ? (
          /* EMPTY STORE */
          <div
            style={{
              padding: '45px 20px',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: '#111827',
              }}
            >
              No products available
            </h2>

            <p
              style={{
                color: '#6b7280',
              }}
            >
              This store currently has no products in stock.
            </p>
          </div>
        ) : (
          /* PRODUCTS */
          <section
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            {products.map((product) => (
              <article
                key={product.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.06)',
                }}
              >
                {/* CATEGORY */}
                <p
                  style={{
                    margin: '0 0 12px',
                    fontSize: '13px',
                    color: '#4b5563',
                    fontWeight: '600',
                  }}
                >
                  {product.category || 'Product'}
                </p>

                {/* PRODUCT NAME */}
                <h2
                  style={{
                    margin: '0 0 14px',
                    fontSize: '23px',
                    fontWeight: '800',
                    lineHeight: '1.25',
                    color: '#111827',
                  }}
                >
                  {product.name}
                </h2>

                {/* PRICE */}
                <p
                  style={{
                    margin: '0 0 10px',
                    fontSize: '21px',
                    fontWeight: '800',
                    color: '#111827',
                  }}
                >
                  ₹
                  {Number(product.price || 0).toLocaleString(
                    'en-IN'
                  )}
                </p>

                {/* STOCK */}
                <p
                  style={{
                    margin: '0 0 18px',
                    fontSize: '14px',
                    color: '#4b5563',
                    fontWeight: '500',
                  }}
                >
                  {Number(product.stock)} in stock
                </p>

                {/* ORDER BUTTON */}
                <button
                  onClick={() => openOrderForm(product)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '4px',
                    border: 'none',
                    borderRadius: '10px',
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
            background: 'rgba(0,0,0,0.60)',
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
              borderRadius: '18px',
              padding: '25px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              color: '#111827',
            }}
          >
            {orderSuccess ? (
              /* SUCCESS */
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '58px',
                    height: '58px',
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
                    margin: '0 0 12px',
                    color: '#111827',
                  }}
                >
                  Order Placed Successfully!
                </h2>

                <p
                  style={{
                    color: '#4b5563',
                  }}
                >
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
                    padding: '12px',
                    marginTop: '15px',
                    border: 'none',
                    borderRadius: '10px',
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
              /* ORDER FORM */
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
                    margin: '0 0 22px',
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
                    borderRadius: '9px',
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
                    borderRadius: '9px',
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
                    borderRadius: '9px',
                    boxSizing: 'border-box',
                    color: '#111827',
                    background: '#ffffff',
                    fontSize: '15px',
                  }}
                />

                {/* TOTAL */}
                <div
                  style={{
                    padding: '15px',
                    marginBottom: '18px',
                    background: '#f3f4f6',
                    borderRadius: '10px',
                    color: '#111827',
                    fontSize: '17px',
                    fontWeight: '800',
                  }}
                >
                  Total: ₹
                  {totalAmount.toLocaleString('en-IN')}
                </div>

                {/* ERROR */}
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

                {/* CONFIRM */}
                <button
                  onClick={placeOrder}
                  disabled={placingOrder}
                  style={{
                    width: '100%',
                    padding: '13px',
                    border: 'none',
                    borderRadius: '10px',
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

                {/* CANCEL */}
                <button
                  onClick={closeOrderForm}
                  disabled={placingOrder}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    background: '#ffffff',
                    color: '#374151',
                    fontWeight: '600',
                    cursor: placingOrder
                      ? 'not-allowed'
                      : 'pointer',
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
