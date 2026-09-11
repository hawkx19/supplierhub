'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Analytics() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
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
        .eq('user_id', user.id);

      if (error) {
        setError(error.message);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    loadAnalytics();
  }, []);

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + (Number(product.stock) || 0),
    0
  );

  const inventoryValue = products.reduce(
    (sum, product) =>
      sum +
      (Number(product.price) || 0) *
        (Number(product.stock) || 0),
    0
  );

  const lowStock = products.filter(
    (product) =>
      Number(product.stock) > 0 &&
      Number(product.stock) < 25
  ).length;

  const outOfStock = products.filter(
    (product) => Number(product.stock) <= 0
  ).length;

  return (
    <main
      style={{
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>Analytics</h1>
      <p>Track your store and inventory performance.</p>

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px',
              marginTop: '30px',
            }}
          >
            <div>
              <h3>Total Products</h3>
              <strong>{totalProducts}</strong>
            </div>

            <div>
              <h3>Total Stock</h3>
              <strong>{totalStock}</strong>
            </div>

            <div>
              <h3>Inventory Value</h3>
              <strong>
                ₹{inventoryValue.toLocaleString('en-IN')}
              </strong>
            </div>

            <div>
              <h3>Low Stock</h3>
              <strong>{lowStock}</strong>
            </div>

            <div>
              <h3>Out of Stock</h3>
              <strong>{outOfStock}</strong>
            </div>
          </div>

          <div
            style={{
              marginTop: '40px',
              padding: '25px',
              border: '1px solid #ddd',
              borderRadius: '12px',
            }}
          >
            <h2>Product Overview</h2>

            {products.length === 0 ? (
              <p>No product data available yet.</p>
            ) : (
              <p>
                You currently have <strong>{totalProducts}</strong>{' '}
                products with a total stock of{' '}
                <strong>{totalStock}</strong> units.
              </p>
            )}
          </div>
        </>
      )}
    </main>
  );
}
