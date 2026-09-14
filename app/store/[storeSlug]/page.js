'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function PublicStore({ params }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [storeSlug, setStoreSlug] = useState('');

  useEffect(() => {
    const loadStore = async () => {
      setLoading(true);
      setError('');

      const resolvedParams = await params;
      const slug = resolvedParams?.storeSlug;

      setStoreSlug(slug || '');

      if (!slug) {
        setError('Store not found.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, price, stock')
        .eq('store_slug', slug)
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
  }, [params]);

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '40px 20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <header
          style={{
            marginBottom: '40px',
          }}
        >
          <h1 style={{ marginBottom: '8px' }}>
            SupplierHub Store
          </h1>

          <p style={{ margin: 0 }}>
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
                  border: '1px solid #ddd',
                  borderRadius: '14px',
                  padding: '20px',
                }}
              >
                <p
                  style={{
                    fontSize: '13px',
                    marginBottom: '8px',
                  }}
                >
                  {product.category || 'Product'}
                </p>

                <h2
                  style={{
                    margin: '0 0 12px',
                  }}
                >
                  {product.name}
                </h2>

                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    margin: '0 0 8px',
                  }}
                >
                  ₹{Number(product.price || 0).toLocaleString('en-IN')}
                </p>

                <p style={{ margin: 0 }}>
                  {Number(product.stock)} in stock
                </p>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
