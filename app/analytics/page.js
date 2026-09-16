'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Analytics() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('monthly');

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

      const [productsResult, ordersResult] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id),

        supabase
          .from('orders')
          .select(
            'id, product_id, customer_name, customer_phone, quantity, total_amount, status, created_at'
          )
          .eq('store_owner_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (productsResult.error) {
        setError(productsResult.error.message);
        setLoading(false);
        return;
      }

      if (ordersResult.error) {
        setError(ordersResult.error.message);
        setLoading(false);
        return;
      }

      setProducts(productsResult.data || []);
      setOrders(ordersResult.data || []);

      setLoading(false);
    };

    loadAnalytics();
  }, []);

  /* =========================
     INVENTORY ANALYTICS
  ========================= */

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

  /* =========================
     ORDER ANALYTICS
  ========================= */

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === 'pending'
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === 'completed'
  ).length;

  const rejectedOrders = orders.filter(
    (order) => order.status === 'cancelled'
  ).length;

  const totalSales = orders
    .filter((order) => order.status === 'completed')
    .reduce(
      (sum, order) =>
        sum + (Number(order.total_amount) || 0),
      0
    );

  const totalUnitsSold = orders
    .filter((order) => order.status === 'completed')
    .reduce(
      (sum, order) =>
        sum + (Number(order.quantity) || 0),
      0
    );

  /* =========================
     BEST SELLING PRODUCTS
  ========================= */

  const bestSellingProducts = useMemo(() => {
    const salesMap = {};

    orders
      .filter((order) => order.status === 'completed')
      .forEach((order) => {
        if (!salesMap[order.product_id]) {
          salesMap[order.product_id] = {
            productId: order.product_id,
            quantity: 0,
            revenue: 0,
          };
        }

        salesMap[order.product_id].quantity +=
          Number(order.quantity) || 0;

        salesMap[order.product_id].revenue +=
          Number(order.total_amount) || 0;
      });

    return Object.values(salesMap)
      .map((sale) => {
        const product = products.find(
          (p) => p.id === sale.productId
        );

        return {
          ...sale,
          name: product?.name || 'Unknown Product',
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders, products]);

  /* =========================
     SALES TREND
  ========================= */

  const salesTrend = useMemo(() => {
    const completedOrdersData = orders.filter(
      (order) => order.status === 'completed'
    );

    const now = new Date();
    const days =
      period === 'daily'
        ? 7
        : period === 'weekly'
        ? 8
        : 30;

    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const dateKey = date.toISOString().split('T')[0];

      const amount = completedOrdersData
        .filter((order) => {
          const orderDate = new Date(order.created_at);
          const orderKey = orderDate
            .toISOString()
            .split('T')[0];

          return orderKey === dateKey;
        })
        .reduce(
          (sum, order) =>
            sum + (Number(order.total_amount) || 0),
          0
        );

      result.push({
        date: dateKey,
        amount,
      });
    }

    return result;
  }, [orders, period]);

  const maxTrendValue = Math.max(
    ...salesTrend.map((item) => item.amount),
    1
  );

  /* =========================
     UI
  ========================= */

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        background:
          'linear-gradient(135deg, #070b14 0%, #0d1424 50%, #111827 100%)',
        color: '#fff',
      }}
    >
      <div
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: '38px',
            marginBottom: '8px',
          }}
        >
          Analytics
        </h1>

        <p
          style={{
            color: '#9ca3af',
            marginBottom: '35px',
          }}
        >
          Track your store, sales and inventory performance.
        </p>

        {error && (
          <div
            style={{
              padding: '15px',
              marginBottom: '25px',
              borderRadius: '12px',
              background: '#3f1d1d',
              border: '1px solid #7f1d1d',
              color: '#fecaca',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <p
            style={{
              color: '#9ca3af',
              padding: '40px 0',
            }}
          >
            Loading analytics...
          </p>
        ) : (
          <>
            {/* =========================
                SALES STATS
            ========================= */}

            <h2
              style={{
                marginBottom: '18px',
                fontSize: '24px',
              }}
            >
              Sales Overview
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '18px',
              }}
            >
              <StatCard
                title="Total Sales"
                value={`₹${totalSales.toLocaleString(
                  'en-IN'
                )}`}
              />

              <StatCard
                title="Total Orders"
                value={totalOrders}
              />

              <StatCard
                title="Pending Orders"
                value={pendingOrders}
              />

              <StatCard
                title="Completed Orders"
                value={completedOrders}
              />

              <StatCard
                title="Rejected Orders"
                value={rejectedOrders}
              />

              <StatCard
                title="Units Sold"
                value={totalUnitsSold}
              />
            </div>

            {/* =========================
                SALES TREND
            ========================= */}

            <div
              style={{
                marginTop: '35px',
                padding: '25px',
                borderRadius: '16px',
                background:
                  'rgba(17, 24, 39, 0.75)',
                border:
                  '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '15px',
                  flexWrap: 'wrap',
                  marginBottom: '25px',
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      marginBottom: '5px',
                    }}
                  >
                    Sales Trend
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: '#9ca3af',
                      fontSize: '14px',
                    }}
                  >
                    Completed order revenue
                  </p>
                </div>

                <select
                  value={period}
                  onChange={(e) =>
                    setPeriod(e.target.value)
                  }
                  style={{
                    padding: '10px 14px',
                    borderRadius: '9px',
                    border:
                      '1px solid #374151',
                    background: '#111827',
                    color: '#fff',
                    outline: 'none',
                  }}
                >
                  <option value="daily">
                    Last 7 Days
                  </option>

                  <option value="weekly">
                    Last 8 Days
                  </option>

                  <option value="monthly">
                    Last 30 Days
                  </option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px',
                  height: '230px',
                  overflowX: 'auto',
                  paddingBottom: '5px',
                }}
              >
                {salesTrend.map((item) => {
                  const height =
                    item.amount === 0
                      ? 4
                      : Math.max(
                          8,
                          (item.amount /
                            maxTrendValue) *
                            190
                        );

                  return (
                    <div
                      key={item.date}
                      style={{
                        minWidth: '18px',
                        height: '210px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                      }}
                      title={`${
                        item.date
                      } — ₹${item.amount.toLocaleString(
                        'en-IN'
                      )}`}
                    >
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '30px',
                          height: `${height}px`,
                          borderRadius:
                            '6px 6px 2px 2px',
                          background:
                            'linear-gradient(180deg, #60a5fa, #2563eb)',
                          transition:
                            'height 0.25s ease',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  color: '#6b7280',
                  fontSize: '11px',
                  marginTop: '5px',
                }}
              >
                <span>
                  {salesTrend[0]?.date}
                </span>

                <span>
                  {salesTrend[
                    salesTrend.length - 1
                  ]?.date}
                </span>
              </div>
            </div>

            {/* =========================
                BEST SELLING
            ========================= */}

            <div
              style={{
                marginTop: '35px',
                padding: '25px',
                borderRadius: '16px',
                background:
                  'rgba(17, 24, 39, 0.75)',
                border:
                  '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: '20px',
                }}
              >
                Best-Selling Products
              </h2>

              {bestSellingProducts.length === 0 ? (
                <p
                  style={{
                    color: '#9ca3af',
                  }}
                >
                  No completed sales yet.
                </p>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {bestSellingProducts.map(
                    (product, index) => (
                      <div
                        key={product.productId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent:
                            'space-between',
                          gap: '15px',
                          padding: '15px',
                          borderRadius: '12px',
                          background:
                            'rgba(255,255,255,0.04)',
                        }}
                      >
                        <div>
                          <strong>
                            #{index + 1}{' '}
                            {product.name}
                          </strong>

                          <div
                            style={{
                              color: '#9ca3af',
                              fontSize: '13px',
                              marginTop: '5px',
                            }}
                          >
                            {product.quantity}{' '}
                            units sold
                          </div>
                        </div>

                        <strong>
                          ₹
                          {product.revenue.toLocaleString(
                            'en-IN'
                          )}
                        </strong>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* =========================
                INVENTORY STATS
            ========================= */}

            <h2
              style={{
                marginTop: '40px',
                marginBottom: '18px',
                fontSize: '24px',
              }}
            >
              Inventory Overview
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '18px',
              }}
            >
              <StatCard
                title="Total Products"
                value={totalProducts}
              />

              <StatCard
                title="Total Stock"
                value={totalStock}
              />

              <StatCard
                title="Inventory Value"
                value={`₹${inventoryValue.toLocaleString(
                  'en-IN'
                )}`}
              />

              <StatCard
                title="Low Stock"
                value={lowStock}
              />

              <StatCard
                title="Out of Stock"
                value={outOfStock}
              />
            </div>

            {/* =========================
                PRODUCT OVERVIEW
            ========================= */}

            <div
              style={{
                marginTop: '35px',
                padding: '25px',
                borderRadius: '16px',
                background:
                  'rgba(17, 24, 39, 0.75)',
                border:
                  '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                }}
              >
                Product Overview
              </h2>

              {products.length === 0 ? (
                <p
                  style={{
                    color: '#9ca3af',
                  }}
                >
                  No product data available yet.
                </p>
              ) : (
                <p
                  style={{
                    color: '#d1d5db',
                    lineHeight: '1.6',
                  }}
                >
                  You currently have{' '}
                  <strong>{totalProducts}</strong>{' '}
                  products with a total stock of{' '}
                  <strong>{totalStock}</strong>{' '}
                  units and inventory worth{' '}
                  <strong>
                    ₹
                    {inventoryValue.toLocaleString(
                      'en-IN'
                    )}
                  </strong>
                  .
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({ title, value }) {
  return (
    <div
      style={{
        padding: '22px',
        borderRadius: '15px',
        background:
          'linear-gradient(145deg, rgba(31,41,55,.95), rgba(17,24,39,.95))',
        border:
          '1px solid rgba(255,255,255,.08)',
        boxShadow:
          '0 12px 35px rgba(0,0,0,.22)',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px',
          color: '#9ca3af',
          fontSize: '14px',
          fontWeight: '600',
        }}
      >
        {title}
      </h3>

      <strong
        style={{
          fontSize: '26px',
        }}
      >
        {value}
      </strong>
    </div>
  );
                }
