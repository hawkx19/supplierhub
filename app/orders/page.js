'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
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

      // Orders table will be connected here once it is created in Supabase.
      setOrders([]);

      setLoading(false);
    };

    loadOrders();
  }, []);

  return (
    <main
      style={{
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>Orders</h1>
      <p>View and manage orders from your store.</p>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          margin: '30px 0',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3>Total Orders</h3>
          <strong>{orders.length}</strong>
        </div>

        <div>
          <h3>Pending</h3>
          <strong>0</strong>
        </div>

        <div>
          <h3>Completed</h3>
          <strong>0</strong>
        </div>

        <div>
          <h3>Cancelled</h3>
          <strong>0</strong>
        </div>
      </div>

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div
          style={{
            marginTop: '30px',
            padding: '30px',
            border: '1px solid #ddd',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <h2>No orders yet</h2>
          <p>
            Orders placed through your public store will appear here.
          </p>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id}>
              {order.id}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
