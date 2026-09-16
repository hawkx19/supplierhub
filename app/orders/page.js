'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

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
        customer_phone,
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

    const { error: rpcError } = await supabase.rpc(
      'complete_order',
      {
        p_order_id: orderId,
      }
    );

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

    const { error: rpcError } = await supabase.rpc(
      'reject_order',
      {
        p_order_id: orderId,
      }
    );

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

  const filteredOrders = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return orders.filter((order) => {
      /* =========================
         SEARCH
      ========================= */

      const productName =
        order.products?.name || '';

      const customerName =
        order.customer_name || '';

      const customerPhone =
        order.customer_phone || '';

      const matchesSearch =
        !searchText ||
        customerName
          .toLowerCase()
          .includes(searchText) ||
        customerPhone
          .toLowerCase()
          .includes(searchText) ||
        productName
          .toLowerCase()
          .includes(searchText);

      /* =========================
         STATUS FILTER
      ========================= */

      const matchesStatus =
        statusFilter === 'all' ||
        order.status === statusFilter;

      /* =========================
         DATE FILTER
      ========================= */

      let matchesDate = true;

      if (dateFilter !== 'all') {
        const orderDate = new Date(order.created_at);
        const now = new Date();

        if (dateFilter === 'today') {
          matchesDate =
            orderDate.toDateString() ===
            now.toDateString();
        }

        if (dateFilter === '7days') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(
            now.getDate() - 7
          );

          matchesDate =
            orderDate >= sevenDaysAgo;
        }

        if (dateFilter === '30days') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(
            now.getDate() - 30
          );

          matchesDate =
            orderDate >= thirtyDaysAgo;
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    dateFilter,
  ]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDateFilter('all');
  };

  const hasFilters =
    search ||
    statusFilter !== 'all' ||
    dateFilter !== 'all';

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
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >

        {/* =========================
            HEADER
        ========================= */}

        <div
          style={{
            marginBottom: '30px',
          }}
        >
          <h1
            style={{
              marginBottom: '8px',
              fontSize: '34px',
            }}
          >
            Orders
          </h1>

          <p
            style={{
              color: '#6b7280',
              margin: 0,
            }}
          >
            View and manage orders from your store.
          </p>
        </div>

        {/* =========================
            STATS
        ========================= */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '25px',
          }}
        >
          <StatCard
            title="Total Orders"
            value={orders.length}
          />

          <StatCard
            title="Pending"
            value={pendingCount}
          />

          <StatCard
            title="Completed"
            value={completedCount}
          />

          <StatCard
            title="Rejected"
            value={cancelledCount}
          />
        </div>

        {/* =========================
            FILTERS
        ========================= */}

        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            padding: '18px',
            marginBottom: '20px',
            boxShadow:
              '0 4px 14px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(220px, 1fr) 180px 180px auto',
              gap: '12px',
              alignItems: 'center',
            }}
          >

            {/* SEARCH */}

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search customer, phone or product..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                borderRadius: '9px',
                border:
                  '1px solid #d1d5db',
                outline: 'none',
                fontSize: '14px',
                color: '#111827',
                background: '#fff',
              }}
            />

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              style={selectStyle}
            >
              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="cancelled">
                Rejected
              </option>
            </select>

            {/* DATE */}

            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value)
              }
              style={selectStyle}
            >
              <option value="all">
                All Dates
              </option>

              <option value="today">
                Today
              </option>

              <option value="7days">
                Last 7 Days
              </option>

              <option value="30days">
                Last 30 Days
              </option>
            </select>

            {/* CLEAR */}

            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '12px 16px',
                  borderRadius: '9px',
                  border:
                    '1px solid #d1d5db',
                  background: '#fff',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                }}
              >
                Clear
              </button>
            )}
          </div>

          <div
            style={{
              marginTop: '12px',
              color: '#6b7280',
              fontSize: '13px',
            }}
          >
            Showing {filteredOrders.length} of{' '}
            {orders.length} orders
          </div>
        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div
            style={{
              marginBottom: '20px',
              padding: '14px 16px',
              borderRadius: '10px',
              background: '#fee2e2',
              color: '#991b1b',
              border:
                '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        {/* =========================
            LOADING
        ========================= */}

        {loading ? (
          <div
            style={{
              padding: '40px',
              background: '#fff',
              borderRadius: '14px',
              textAlign: 'center',
              border:
                '1px solid #e5e7eb',
            }}
          >
            Loading orders...
          </div>
        ) : orders.length === 0 ? (

          /* =========================
             NO ORDERS
          ========================= */

          <div
            style={{
              padding: '50px 30px',
              background: '#fff',
              border:
                '1px solid #e5e7eb',
              borderRadius: '14px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '42px',
                marginBottom: '12px',
              }}
            >
              📦
            </div>

            <h2
              style={{
                marginTop: 0,
              }}
            >
              No orders yet
            </h2>

            <p
              style={{
                color: '#6b7280',
              }}
            >
              Orders placed through your public
              store will appear here.
            </p>
          </div>

        ) : filteredOrders.length === 0 ? (

          /* =========================
             NO FILTER RESULTS
          ========================= */

          <div
            style={{
              padding: '50px 30px',
              background: '#fff',
              border:
                '1px solid #e5e7eb',
              borderRadius: '14px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '42px',
                marginBottom: '12px',
              }}
            >
              🔎
            </div>

            <h2
              style={{
                marginTop: 0,
              }}
            >
              No matching orders
            </h2>

            <p
              style={{
                color: '#6b7280',
              }}
            >
              Try changing your search or filters.
            </p>

            <button
              onClick={clearFilters}
              style={{
                marginTop: '8px',
                padding: '11px 18px',
                border: 'none',
                borderRadius: '9px',
                background: '#2563eb',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '700',
              }}
            >
              Clear Filters
            </button>
          </div>

        ) : (

          /* =========================
             ORDER LIST
          ========================= */

          <div
            style={{
              display: 'grid',
              gap: '16px',
            }}
          >
            {filteredOrders.map((order) => {

              const isProcessing =
                actionLoading === order.id;

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#fff',
                    border:
                      '1px solid #e5e7eb',
                    borderRadius: '14px',
                    padding: '22px',
                    boxShadow:
                      '0 4px 14px rgba(0,0,0,0.04)',
                  }}
                >

                  {/* ORDER HEADER */}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      gap: '15px',
                      flexWrap: 'wrap',
                      marginBottom: '18px',
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          margin:
                            '0 0 6px',
                          fontSize: '20px',
                        }}
                      >
                        {order.products?.name ||
                          'Product'}
                      </h2>

                      <div
                        style={{
                          color: '#6b7280',
                          fontSize: '14px',
                        }}
                      >
                        Ordered by{' '}
                        <strong
                          style={{
                            color: '#374151',
                          }}
                        >
                          {order.customer_name}
                        </strong>
                      </div>
                    </div>

                    <StatusBadge
                      status={order.status}
                    />
                  </div>

                  {/* ORDER INFO */}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '14px',
                      marginBottom: '20px',
                      padding:
                        '16px',
                      background:
                        '#f9fafb',
                      borderRadius:
                        '10px',
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
                      label="Customer Phone"
                      value={
                        order.customer_phone ||
                        'Not provided'
                      }
                    />

                    <Info
                      label="Order Date"
                      value={new Date(
                        order.created_at
                      ).toLocaleDateString(
                        undefined,
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    />

                    <Info
                      label="Order Time"
                      value={new Date(
                        order.created_at
                      ).toLocaleTimeString(
                        undefined,
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    />
                  </div>

                  {/* ACTIONS */}

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
                          completeOrder(
                            order.id
                          )
                        }
                        disabled={
                          isProcessing
                        }
                        style={{
                          padding:
                            '11px 18px',
                          border: 'none',
                          borderRadius:
                            '9px',
                          background:
                            isProcessing
                              ? '#86efac'
                              : '#16a34a',
                          color: '#fff',
                          cursor:
                            isProcessing
                              ? 'wait'
                              : 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        {isProcessing
                          ? 'Processing...'
                          : '✓ Order Done'}
                      </button>

                      <button
                        onClick={() =>
                          rejectOrder(
                            order.id
                          )
                        }
                        disabled={
                          isProcessing
                        }
                        style={{
                          padding:
                            '11px 18px',
                          border: 'none',
                          borderRadius:
                            '9px',
                          background:
                            isProcessing
                              ? '#fca5a5'
                              : '#dc2626',
                          color: '#fff',
                          cursor:
                            isProcessing
                              ? 'wait'
                              : 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        {isProcessing
                          ? 'Processing...'
                          : '✕ Order Rejected'}
                      </button>
                    </div>
                  )}

                  {order.status === 'completed' && (
                    <div
                      style={{
                        padding:
                          '11px 14px',
                        borderRadius:
                          '9px',
                        background:
                          '#f0fdf4',
                        color:
                          '#166534',
                        fontSize:
                          '14px',
                
