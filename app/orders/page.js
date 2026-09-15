'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

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

    const { data, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        customer_email,
        quantity,
        total_amount,
        status,
        created_at,
        products (
          name
        )
      `)
      .eq('store_owner_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      setError(ordersError.message);
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const completeOrder = async (orderId) => {
    setActionLoading(orderId);
    setError('');

    const { error: rpcError } = await supabase.rpc('complete_order', {
      p_order_id: orderId,
    });

    if (rpcError) {
      setError(rpcError.message);
    } else {
      await loadOrders();
    }

    setActionLoading(null);
  };

  const rejectOrder = async (orderId) => {
    setActionLoading(orderId);
    setError('');

    const { error: rpcError } = await supabase.rpc('reject_order', {
      p_order_id: orderId,
    });

    if (rpcError) {
      setError(rpcError.message);
    } else {
      await loadOrders();
    }

    setActionLoading(null);
  };

  const pendingCount = orders.filter(
    (order) => order.status === 'pending'
  ).length;

  const completedCount = orders.filter(
    (order) => order.status === 'completed'
  ).length;

  const cancelledCount = orders.filter(
    (order) => order.status === 'cancelled'
  ).length;

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '40px',
        background: '#f7f8fa',
        color: '#111827',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ marginBottom: '8px' }}>Orders</h1>

          <p style={{ color: '#6b7280', margin: 0 }}>
            View and manage orders from your store.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '30px',
          }}
        >
          <StatCard title="Total Orders" value={orders.length} />
          <StatCard title="Pending" value={pendingCount} />
          <StatCard title="Completed" value={completedCount} />
          <StatCard title="Rejected" value={cancelledCount} />
        </div>

        {error && (
          <div
            style={{
              marginBottom: '20px',
              padding: '14px 16px',
              borderRadius: '10px',
              background: '#fee2e2',
              color: '#991b1b',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              padding: '40px',
              background: '#fff',
              borderRadius: '14px',
              textAlign: 'center',
            }}
          >
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              padding: '50px 30px',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ marginTop: 0 }}>No orders yet</h2>

            <p style={{ color: '#6b7280' }}>
              Orders placed through your public store will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '14px',
                  padding: '22px',
                  boxShadow:
                    '0 4px 14px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '15px',
                    flexWrap: 'wrap',
                    marginBottom: '18px',
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: '0 0 6px',
                        fontSize: '20px',
                      }}
                    >
                      {order.products?.name || 'Product'}
                    </h2>

                    <div
                      style={{
                        color: '#6b7280',
                        fontSize: '14px',
                      }}
                    >
                      Ordered by {order.customer_name}
                    </div>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '14px',
                    marginBottom: '20px',
                  }}
                >
                  <Info
                    label="Quantity"
                    value={order.quantity}
                  />

                  <Info
                    label="Total"
                    value={`₹${Number(
                      order.total_amount
                    ).toFixed(2)}`}
                  />

                  <Info
                    label="Customer Email"
                    value={
                      order.customer_email ||
                      'Not provided'
                    }
                  />

                  <Info
                    label="Date"
                    value={new Date(
                      order.created_at
                    ).toLocaleString()}
                  />
                </div>

                {order.status === 'pending' && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={() =>
                        completeOrder(order.id)
                      }
                      disabled={
                        actionLoading === order.id
                      }
                      style={{
                        padding: '11px 18px',
                        border: 'none',
                        borderRadius: '9px',
                        background: '#16a34a',
                        color: '#fff',
                        cursor:
                          actionLoading === order.id
                            ? 'wait'
                            : 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      {actionLoading === order.id
                        ? 'Processing...'
                        : 'Order Done'}
                    </button>

                    <button
                      onClick={() =>
                        rejectOrder(order.id)
                      }
                      disabled={
                        actionLoading === order.id
                      }
                      style={{
                        padding: '11px 18px',
                        border: 'none',
                        borderRadius: '9px',
                        background: '#dc2626',
                        color: '#fff',
                        cursor:
                          actionLoading === order.id
                            ? 'wait'
                            : 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      {actionLoading === order.id
                        ? 'Processing...'
                        : 'Order Rejected'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        padding: '20px',
      }}
    >
      <div
        style={{
          color: '#6b7280',
          fontSize: '14px',
          marginBottom: '8px',
        }}
      >
        {title}
      </div>

      <strong style={{ fontSize: '28px' }}>
        {value}
      </strong>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div
        style={{
          color: '#6b7280',
          fontSize: '13px',
          marginBottom: '4px',
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 600,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const isPending = status === 'pending';
  const isCompleted = status === 'completed';

  return (
    <span
      style={{
        alignSelf: 'flex-start',
        padding: '6px 11px',
        borderRadius: '999px',
        fontSize: '13px',
        fontWeight: 700,
        background: isPending
          ? '#fef3c7'
          : isCompleted
          ? '#dcfce7'
          : '#fee2e2',
        color: isPending
          ? '#92400e'
          : isCompleted
          ? '#166534'
          : '#991b1b',
      }}
    >
      {isPending
        ? 'Pending'
        : isCompleted
        ? 'Completed'
        : 'Rejected'}
    </span>
  );
}
