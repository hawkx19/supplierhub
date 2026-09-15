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

    const { data, error } = await supabase.rpc('place_order', {
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
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <header style={{ marginBottom: '40px' }}>
          <h1>SupplierHub Store</h1>

          <p>
            {storeSlug
              ? `Store: ${storeSlug}`
              : 'Public supplier store'}
          </p>
        </header>

        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <div
            style={{
              padding: '25px',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '12px',
            }}
          >
            <h2>Store unavailable</h2>
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <h2>No products available</h2>
            <p>This store currently has no products in stock.</p>
          </div>
        ) : (
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
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                }}
              >
                <p
                  style={{
                    fontSize: '13px',
                    color: '#666',
                  }}
                >
                  {product.category || 'Product'}
                </p>

                <h2>{product.name}</h2>

                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  ₹
                  {Number(product.price || 0).toLocaleString(
                    'en-IN'
                  )}
                </p>

                <p>{Number(product.stock)} in stock</p>

                <button
                  onClick={() => openOrderForm(product)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '10px',
                    border: 'none',
                    borderRadius: '10px',
                    background: '#111827',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 'bold',
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

      {selectedProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
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
              background: '#fff',
              borderRadius: '18px',
              padding: '25px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            {orderSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <h2>Order Placed Successfully 🎉</h2>

                <p>
                  Your order for{' '}
                  <strong>{selectedProduct.name}</strong> has
                  been placed.
                </p>

                <p>
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
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2>Place Order</h2>

                <p
                  style={{
                    marginBottom: '20px',
                    color: '#555',
                  }}
                >
                  {selectedProduct.name}
                </p>

                <label>Customer Name</label>

                <input
                  value={customerName}
                  onChange={(e) =>
                    setCustomerName(e.target.value)
                  }
                  placeholder="Enter your name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '6px',
                    marginBottom: '15px',
                    border: '1px solid #ccc',
                    borderRadius: '9px',
                    boxSizing: 'border-box',
                  }}
                />

                <label>Email (optional)</label>

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
                    marginTop: '6px',
                    marginBottom: '15px',
                    border: '1px solid #ccc',
                    borderRadius: '9px',
                    boxSizing: 'border-box',
                  }}
                />

                <label>Quantity</label>

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
                    marginTop: '6px',
                    marginBottom: '15px',
                    border: '1px solid #ccc',
                    borderRadius: '9px',
                    boxSizing: 'border-box',
                  }}
                />

                <div
                  style={{
                    padding: '15px',
                    background: '#f5f5f5',
                    borderRadius: '10px',
                    marginBottom: '15px',
                  }}
                >
                  <strong>
                    Total: ₹
                    {totalAmount.toLocaleString('en-IN')}
                  </strong>
                </div>

                {orderError && (
                  <p
                    style={{
                      color: '#d00',
                      marginBottom: '15px',
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
                    borderRadius: '10px',
                    background: placingOrder
                      ? '#888'
                      : '#111827',
                    color: '#fff',
                    fontWeight: 'bold',
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
                    border: '1px solid #ccc',
                    borderRadius: '10px',
                    background: '#fff',
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
