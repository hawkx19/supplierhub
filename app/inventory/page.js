'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInventory = async () => {
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

    loadInventory();
  }, []);

  const total = products.length;
  const inStock = products.filter((p) => Number(p.stock) > 0).length;
  const lowStock = products.filter(
    (p) => Number(p.stock) > 0 && Number(p.stock) < 25
  ).length;
  const outOfStock = products.filter(
    (p) => Number(p.stock) <= 0
  ).length;

  return (
    <main style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Inventory</h1>
      <p>Manage and monitor your product stock.</p>

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: '20px',
          margin: '30px 0',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3>Total Products</h3>
          <strong>{total}</strong>
        </div>

        <div>
          <h3>In Stock</h3>
          <strong>{inStock}</strong>
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

      {loading ? (
        <p>Loading inventory...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px' }}>Product</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Price</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Stock</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const stock = Number(product.stock);

              let status = 'In Stock';

              if (stock <= 0) {
                status = 'Out of Stock';
              } else if (stock < 25) {
                status = 'Low Stock';
              }

              return (
                <tr key={product.id}>
                  <td style={{ padding: '12px' }}>{product.name}</td>
                  <td style={{ padding: '12px' }}>
                    {product.category || 'New'}
                  </td>
                  <td style={{ padding: '12px' }}>₹{product.price}</td>
                  <td style={{ padding: '12px' }}>{stock}</td>
                  <td style={{ padding: '12px' }}>{status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
                                                }
