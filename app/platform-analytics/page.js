"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PlatformAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [storesCount, setStoresCount] = useState(0);

  const [period, setPeriod] = useState("30");

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  async function checkAccessAndLoad() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_platform_admin");

      if (adminError) {
        throw adminError;
      }

      if (!isAdmin) {
        setAuthorized(false);
        setError(
          "You do not have permission to view platform analytics."
        );
        setLoading(false);
        return;
      }

      setAuthorized(true);
      await loadAnalytics();
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Something went wrong while loading platform analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics() {
    setError("");

    const days = Number(period) || 30;

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceIso = since.toISOString();

    const [
      eventsResult,
      productsResult,
      ordersResult,
      storesResult,
    ] = await Promise.all([
      supabase
        .from("analytics_events")
        .select(
          "id, event_type, visitor_id, user_id, path, metadata, created_at"
        )
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false }),

      supabase
        .from("products")
        .select(
          "id, user_id, name, price, stock, store_slug, created_at"
        ),

      supabase
        .from("orders")
        .select(
          "id, store_owner_id, product_id, customer_name, quantity, total_amount, status, created_at"
        )
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false }),

      supabase
        .from("store_profiles")
        .select("user_id, store_slug, store_name, created_at"),
    ]);

    if (eventsResult.error) {
      throw eventsResult.error;
    }

    if (productsResult.error) {
      throw productsResult.error;
    }

    if (ordersResult.error) {
      throw ordersResult.error;
    }

    if (storesResult.error) {
      throw storesResult.error;
    }

    setEvents(eventsResult.data || []);
    setProducts(productsResult.data || []);
    setOrders(ordersResult.data || []);

    const uniqueUsers = new Set(
      (eventsResult.data || [])
        .map((event) => event.user_id)
        .filter(Boolean)
    );

    setUsersCount(uniqueUsers.size);

    setStoresCount((storesResult.data || []).length);
  }

  async function refreshAnalytics() {
    setRefreshing(true);

    try {
      await loadAnalytics();
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to refresh platform analytics."
      );
    } finally {
      setRefreshing(false);
    }
  }

  const pageViews = useMemo(() => {
    return events.filter(
      (event) => event.event_type === "page_view"
    ).length;
  }, [events]);

  const uniqueVisitors = useMemo(() => {
    return new Set(
      events
        .map((event) => event.visitor_id)
        .filter(Boolean)
    ).size;
  }, [events]);

  const storeViews = useMemo(() => {
    return events.filter(
      (event) => event.event_type === "store_view"
    ).length;
  }, [events]);

  const signupStarted = useMemo(() => {
    return events.filter(
      (event) => event.event_type === "signup_started"
    ).length;
  }, [events]);

  const signupCompleted = useMemo(() => {
    return events.filter(
      (event) => event.event_type === "signup_completed"
    ).length;
  }, [events]);

  const completedOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "completed"
    );
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "pending"
    );
  }, [orders]);

  const rejectedOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "cancelled"
    );
  }, [orders]);

  const totalSales = useMemo(() => {
    return completedOrders.reduce(
      (sum, order) =>
        sum + Number(order.total_amount || 0),
      0
    );
  }, [completedOrders]);

  const unitsSold = useMemo(() => {
    return completedOrders.reduce(
      (sum, order) =>
        sum + Number(order.quantity || 0),
      0
    );
  }, [completedOrders]);

  const storeViewVisitors = useMemo(() => {
    return new Set(
      events
        .filter(
          (event) => event.event_type === "store_view"
        )
        .map((event) => event.visitor_id)
        .filter(Boolean)
    ).size;
  }, [events]);

  const signupConversion = useMemo(() => {
    if (signupStarted === 0) return 0;

    return Math.round(
      (signupCompleted / signupStarted) * 100
    );
  }, [signupStarted, signupCompleted]);
    const topStores = useMemo(() => {
    const counts = {};

    events
      .filter(
        (event) => event.event_type === "store_view"
      )
      .forEach((event) => {
        const slug =
          event.metadata?.store_slug ||
          event.path?.split("/store/")[1] ||
          "unknown";

        if (!counts[slug]) {
          counts[slug] = {
            slug,
            views: 0,
            visitors: new Set(),
          };
        }

        counts[slug].views += 1;

        if (event.visitor_id) {
          counts[slug].visitors.add(
            event.visitor_id
          );
        }
      });

    return Object.values(counts)
      .map((store) => ({
        slug: store.slug,
        views: store.views,
        visitors: store.visitors.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);
  }, [events]);

  const dailyGrowth = useMemo(() => {
    const days = Number(period) || 30;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayEvents = events.filter((event) => {
        const created = new Date(event.created_at);

        return (
          created >= date &&
          created < nextDate
        );
      });

      const visitors = new Set(
        dayEvents
          .map((event) => event.visitor_id)
          .filter(Boolean)
      ).size;

      const views = dayEvents.filter(
        (event) => event.event_type === "page_view"
      ).length;

      const storeViewsForDay = dayEvents.filter(
        (event) => event.event_type === "store_view"
      ).length;

      const signups = dayEvents.filter(
        (event) =>
          event.event_type === "signup_completed"
      ).length;

      result.push({
        label: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        visitors,
        views,
        storeViews: storeViewsForDay,
        signups,
      });
    }

    return result;
  }, [events, period]);

  const maxGrowthValue = useMemo(() => {
    const values = dailyGrowth.flatMap((day) => [
      day.visitors,
      day.views,
      day.storeViews,
      day.signups,
    ]);

    return Math.max(...values, 1);
  }, [dailyGrowth]);

  const recentEvents = useMemo(() => {
    return events.slice(0, 10);
  }, [events]);

  const recentOrders = useMemo(() => {
    return orders.slice(0, 8);
  }, [orders]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={loadingCardStyle}>
            <div style={loadingSpinnerStyle}>
              ↻
            </div>

            <h2 style={{ marginBottom: "8px" }}>
              Loading Growth Analytics
            </h2>

            <p style={mutedStyle}>
              Collecting platform-wide growth data...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={errorCardStyle}>
            <div style={errorIconStyle}>!</div>

            <h1 style={{ marginBottom: "10px" }}>
              Access Denied
            </h1>

            <p style={mutedStyle}>
              {error ||
                "Only the SupplierHub owner can view this dashboard."}
            </p>

            <button
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              style={secondaryButtonStyle}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>

        {/* HEADER */}

        <div style={headerStyle}>
          <div>
            <div style={eyebrowStyle}>
              OWNER CONTROL CENTER
            </div>

            <h1 style={headingStyle}>
              Growth Analytics
            </h1>

            <p style={subheadingStyle}>
              Platform-wide SupplierHub growth,
              traffic and activity overview.
            </p>
          </div>

          <div style={headerActionsStyle}>
            <select
              value={period}
              onChange={async (e) => {
                setPeriod(e.target.value);
              }}
              style={selectStyle}
            >
              <option value="7">
                Last 7 Days
              </option>

              <option value="30">
                Last 30 Days
              </option>

              <option value="90">
                Last 90 Days
              </option>
            </select>

            <button
              onClick={refreshAnalytics}
              disabled={refreshing}
              style={primaryButtonStyle}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div style={errorBannerStyle}>
            {error}
          </div>
        )}

        {/* MAIN STATS */}

        <div style={statsGridStyle}>

          <StatCard
            title="Unique Visitors"
            value={uniqueVisitors}
            description="Distinct visitors tracked"
            icon="◉"
          />

          <StatCard
            title="Page Views"
            value={pageViews}
            description="Total pages viewed"
            icon="◫"
          />

          <StatCard
            title="Store Views"
            value={storeViews}
            description="Public store visits"
            icon="⌂"
          />

          <StatCard
            title="Accounts"
            value={usersCount}
            description="Unique signed-in users"
            icon="◎"
          />

          <StatCard
            title="Stores"
            value={storesCount}
            description="Supplier stores created"
            icon="▣"
          />

          <StatCard
            title="Completed Signups"
            value={signupCompleted}
            description="Accounts created"
            icon="✓"
          />

          <StatCard
            title="Orders"
            value={orders.length}
            description="Orders in selected period"
            icon="▤"
          />

          <StatCard
            title="Sales"
            value={`₹${totalSales.toLocaleString(
              "en-IN"
            )}`}
            description="Completed-order sales"
            icon="₹"
          />

        </div>

        {/* GROWTH OVERVIEW */}

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>
                Growth Overview
              </h2>

              <p style={mutedStyle}>
                Visitor and signup activity over the
                selected period.
              </p>
            </div>
          </div>

          <div style={chartContainerStyle}>
            <div style={chartYAxisStyle}>
              <span>
                {maxGrowthValue}
              </span>

              <span>
                {Math.round(
                  maxGrowthValue * 0.75
                )}
              </span>

              <span>
                {Math.round(
                  maxGrowthValue * 0.5
                )}
              </span>

              <span>
                {Math.round(
                  maxGrowthValue * 0.25
                )}
              </span>

              <span>0</span>
            </div>

            <div style={chartStyle}>
              {dailyGrowth.map((day, index) => {
                const visitorHeight =
                  Math.max(
                    4,
                    (day.visitors /
                      maxGrowthValue) *
                      100
                  );

                const viewHeight =
                  Math.max(
                    4,
                    (day.views /
                      maxGrowthValue) *
                      100
                  );

                return (
                  <div
                    key={`${day.label}-${index}`}
                    style={chartColumnStyle}
                    title={`${day.label} — ${day.visitors} visitors, ${day.views} page views, ${day.signups} signups`}
                  >
                    <div
                      style={barGroupStyle}
                    >
                      <div
                        style={{
                          ...barStyle,
                          height: `${visitorHeight}%`,
                          opacity: 0.95,
                        }}
                      />

                      <div
                        style={{
                          ...barStyle,
                          height: `${viewHeight}%`,
                          opacity: 0.45,
                        }}
                      />
                    </div>

                    {(index === 0 ||
                      index ===
                        dailyGrowth.length - 1 ||
                      index %
                        Math.max(
                          1,
                          Math.floor(
                            dailyGrowth.length /
                              6
                          )
                        ) ===
                        0) && (
                      <span
                        style={
                          chartLabelStyle
                        }
                      >
                        {day.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={legendStyle}>
            <div style={legendItemStyle}>
              <span
                style={{
                  ...legendDotStyle,
                  opacity: 0.95,
                }}
              />
              Visitors
            </div>

            <div style={legendItemStyle}>
              <span
                style={{
                  ...legendDotStyle,
                  opacity: 0.45,
                }}
              />
              Page Views
            </div>
          </div>
        </section>
        {/* CONVERSION + ACTIVITY */}

        <div style={twoColumnGridStyle}>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              Signup Funnel
            </h2>

            <p style={mutedStyle}>
              Visitor-to-account creation activity.
            </p>

            <div style={funnelListStyle}>

              <FunnelRow
                title="Signup Started"
                value={signupStarted}
                percentage={
                  signupStarted > 0 ? 100 : 0
              }
              />

              <FunnelRow
                title="Signup Completed"
                value={signupCompleted}
                percentage={
                  signupStarted > 0
                    ? Math.round(
                        (signupCompleted /
                          signupStarted) *
                          100
                      )
                    : 0
                }
              />

              <div style={conversionBoxStyle}>
                <div>
                  <span style={mutedStyle}>
                    Signup Conversion
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "28px",
                      marginTop: "4px",
                    }}
                  >
                    {signupConversion}%
                  </strong>
                </div>

                <span
                  style={{
                    fontSize: "30px",
                  }}
                >
                  %
                </span>
              </div>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              Order Overview
            </h2>

            <p style={mutedStyle}>
              Platform order activity in the selected
              period.
            </p>

            <div style={orderStatsGridStyle}>

              <MiniStat
                title="Pending"
                value={pendingOrders.length}
              />

              <MiniStat
                title="Completed"
                value={completedOrders.length}
              />

              <MiniStat
                title="Rejected"
                value={rejectedOrders.length}
              />

              <MiniStat
                title="Units Sold"
                value={unitsSold}
              />

            </div>
          </section>

        </div>

        {/* TOP STORES */}

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>
                Most Viewed Stores
              </h2>

              <p style={mutedStyle}>
                Public store traffic during the
                selected period.
              </p>
            </div>

            <span style={smallBadgeStyle}>
              {storeViewVisitors} unique visitors
            </span>
          </div>

          {topStores.length === 0 ? (
            <EmptyState text="No public store views tracked yet." />
          ) : (
            <div style={tableStyle}>
              <div style={tableHeaderStyle}>
                <span>Store</span>
                <span>Views</span>
                <span>Visitors</span>
              </div>

              {topStores.map((store, index) => (
                <div
                  key={store.slug}
                  style={tableRowStyle}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={rankStyle}
                    >
                      {index + 1}
                    </span>

                    <div>
                      <strong>
                        {store.slug}
                      </strong>

                      <div
                        style={{
                          color: "#6b7280",
                          fontSize: "12px",
                          marginTop: "3px",
                        }}
                      >
                        /store/{store.slug}
                      </div>
                    </div>
                  </div>

                  <strong>
                    {store.views}
                  </strong>

                  <span style={mutedStyle}>
                    {store.visitors}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RECENT ORDERS */}

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>
                Recent Orders
              </h2>

              <p style={mutedStyle}>
                Latest platform order activity.
              </p>
            </div>
          </div>

          {recentOrders.length === 0 ? (
            <EmptyState text="No orders found in this period." />
          ) : (
            <div style={tableStyle}>
              <div style={orderTableHeaderStyle}>
                <span>Customer</span>
                <span>Quantity</span>
                <span>Total</span>
                <span>Status</span>
                <span>Date</span>
              </div>

              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  style={orderTableRowStyle}
                >
                  <div>
                    <strong>
                      {order.customer_name ||
                        "Customer"}
                    </strong>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "12px",
                        marginTop: "3px",
                      }}
                    >
                      Order #{order.id.slice(0, 8)}
                    </div>
                  </div>

                  <span>
                    {order.quantity}
                  </span>

                  <strong>
                    ₹
                    {Number(
                      order.total_amount || 0
                    ).toLocaleString("en-IN")}
                  </strong>

                  <StatusBadge
                    status={order.status}
                  />

                  <span style={mutedStyle}>
                    {new Date(
                      order.created_at
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TRACKING ACTIVITY */}

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>
                Recent Tracking Activity
              </h2>

              <p style={mutedStyle}>
                Latest analytics events recorded by
                SupplierHub.
              </p>
            </div>

            <span style={smallBadgeStyle}>
              {events.length} events
            </span>
          </div>

          {recentEvents.length === 0 ? (
            <EmptyState text="No analytics events recorded yet." />
          ) : (
            <div style={activityListStyle}>
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  style={activityItemStyle}
                >
                  <div
                    style={
                      activityIconStyle
                    }
                  >
                    {event.event_type ===
                    "store_view"
                      ? "⌂"
                      : event.event_type ===
                        "signup_completed"
                      ? "✓"
                      : event.event_type ===
                        "signup_started"
                      ? "→"
                      : "•"}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <strong>
                      {formatEventName(
                        event.event_type
                      )}
                    </strong>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {event.path ||
                        "Unknown page"}
                    </div>
                  </div>

                  <span
                    style={activityTimeStyle}
                  >
                    {formatRelativeTime(
                      event.created_at
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER NOTE */}

        <div style={footerNoteStyle}>
          <strong>
            Owner-only analytics
          </strong>

          <span>
            This dashboard is restricted to the
            SupplierHub platform administrator.
          </span>
        </div>

      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div style={statCardStyle}>
      <div style={statTopStyle}>
        <span style={statIconStyle}>
          {icon}
        </span>

        <span style={statTitleStyle}>
          {title}
        </span>
      </div>

      <div style={statValueStyle}>
        {value}
      </div>

      <div style={statDescriptionStyle}>
        {description}
      </div>
    </div>
  );
}

function MiniStat({ title, value }) {
  return (
    <div style={miniStatStyle}>
      <span style={mutedStyle}>
        {title}
      </span>

      <strong
        style={{
          fontSize: "25px",
          marginTop: "5px",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function FunnelRow({
  title,
  value,
  percentage,
}) {
  return (
    <div style={funnelRowStyle}>
      <div style={funnelHeaderStyle}>
        <span>{title}</span>

        <strong>{value}</strong>
      </div>

      <div style={progressTrackStyle}>
        <div
          style={{
            ...progressFillStyle,
            width: `${Math.min(
              100,
              Math.max(0, percentage)
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  let label = "Pending";

  if (status === "completed") {
    label = "Completed";
  } else if (status === "cancelled") {
    label = "Rejected";
  }

  return (
    <span
      style={{
        ...statusBadgeStyle,
        background:
          status === "completed"
            ? "rgba(34,197,94,.12)"
            : status === "cancelled"
            ? "rgba(239,68,68,.12)"
            : "rgba(234,179,8,.12)",
        color:
          status === "completed"
            ? "#86efac"
            : status === "cancelled"
            ? "#fca5a5"
            : "#fde68a",
      }}
    >
      {label}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div style={emptyStateStyle}>
      {text}
    </div>
  );
}

function formatEventName(eventType) {
  if (!eventType) return "Unknown Event";

  return eventType
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const diffSeconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (diffSeconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    diffSeconds / 60
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 30) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-IN");
                  }
const pageStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg, #05070d 0%, #0b1020 50%, #111827 100%)",
  color: "#fff",
  padding: "35px 20px 60px",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const containerStyle = {
  maxWidth: "1250px",
  margin: "0 auto",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "20px",
  marginBottom: "30px",
  flexWrap: "wrap",
};

const headerActionsStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  flexWrap: "wrap",
};

const eyebrowStyle = {
  color: "#60a5fa",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "2px",
  marginBottom: "8px",
};

const headingStyle = {
  fontSize: "42px",
  lineHeight: "1.05",
  margin: 0,
  fontWeight: "800",
};

const subheadingStyle = {
  color: "#9ca3af",
  marginTop: "10px",
  fontSize: "15px",
};

const selectStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #374151",
  background: "#111827",
  color: "#fff",
  fontWeight: "600",
  outline: "none",
};

const primaryButtonStyle = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  marginTop: "20px",
  padding: "12px 20px",
  borderRadius: "10px",
  border: "1px solid #374151",
  background: "#1f2937",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "20px",
};

const statCardStyle = {
  padding: "20px",
  borderRadius: "16px",
  background:
    "linear-gradient(145deg, rgba(17,24,39,.96), rgba(11,18,32,.96))",
  border:
    "1px solid rgba(255,255,255,.08)",
  boxShadow:
    "0 18px 45px rgba(0,0,0,.25)",
};

const statTopStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const statIconStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(37,99,235,.15)",
  color: "#60a5fa",
  fontWeight: "800",
};

const statTitleStyle = {
  color: "#d1d5db",
  fontSize: "14px",
  fontWeight: "600",
};

const statValueStyle = {
  fontSize: "30px",
  fontWeight: "800",
  marginTop: "18px",
};

const statDescriptionStyle = {
  color: "#6b7280",
  fontSize: "12px",
  marginTop: "6px",
};

const sectionStyle = {
  marginBottom: "20px",
  padding: "22px",
  borderRadius: "16px",
  background:
    "rgba(17,24,39,.82)",
  border:
    "1px solid rgba(255,255,255,.07)",
  boxShadow:
    "0 15px 40px rgba(0,0,0,.2)",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "21px",
  fontWeight: "800",
};

const mutedStyle = {
  color: "#9ca3af",
  fontSize: "13px",
};

const chartContainerStyle = {
  display: "flex",
  height: "260px",
  marginTop: "20px",
};

const chartYAxisStyle = {
  width: "45px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  color: "#6b7280",
  fontSize: "10px",
  paddingBottom: "25px",
};

const chartStyle = {
  flex: 1,
  display: "flex",
  alignItems: "stretch",
  gap: "4px",
  borderBottom:
    "1px solid rgba(255,255,255,.08)",
  overflow: "hidden",
};

const chartColumnStyle = {
  flex: 1,
  minWidth: "5px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  position: "relative",
};

const barGroupStyle = {
  height: "210px",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  gap: "2px",
};

const barStyle = {
  width: "45%",
  minHeight: "4px",
  borderRadius: "4px 4px 0 0",
  background:
    "linear-gradient(180deg, #60a5fa, #2563eb)",
};

const chartLabelStyle = {
  color: "#6b7280",
  fontSize: "9px",
  textAlign: "center",
  marginTop: "6px",
  whiteSpace: "nowrap",
};

const legendStyle = {
  display: "flex",
  gap: "20px",
  marginTop: "14px",
};

const legendItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  color: "#9ca3af",
  fontSize: "12px",
};

const legendDotStyle = {
  width: "9px",
  height: "9px",
  borderRadius: "3px",
  background: "#60a5fa",
};

const twoColumnGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
};

const funnelListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  marginTop: "22px",
};

const funnelRowStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const funnelHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  color: "#d1d5db",
  fontSize: "14px",
};

const progressTrackStyle = {
  width: "100%",
  height: "8px",
  borderRadius: "10px",
  background: "#1f2937",
  overflow: "hidden",
};

const progressFillStyle = {
  height: "100%",
  borderRadius: "10px",
  background:
    "linear-gradient(90deg, #2563eb, #60a5fa)",
};

const conversionBoxStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  borderRadius: "12px",
  background: "rgba(37,99,235,.08)",
  border:
    "1px solid rgba(37,99,235,.18)",
};

const orderStatsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, 1fr)",
  gap: "12px",
  marginTop: "22px",
};

const miniStatStyle = {
  padding: "16px",
  borderRadius: "12px",
  background: "#0b1220",
  border:
    "1px solid rgba(255,255,255,.06)",
  display: "flex",
  flexDirection: "column",
};

const tableStyle = {
  borderRadius: "12px",
  overflow: "hidden",
  border:
    "1px solid rgba(255,255,255,.06)",
};

const tableHeaderStyle = {
  display: "grid",
  gridTemplateColumns:
    "1fr 120px 120px",
  gap: "15px",
  padding: "13px 15px",
  background: "#0b1220",
  color: "#6b7280",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const tableRowStyle = {
  display: "grid",
  gridTemplateColumns:
    "1fr 120px 120px",
  gap: "15px",
  padding: "15px",
  alignItems: "center",
  borderTop:
    "1px solid rgba(255,255,255,.05)",
};

const rankStyle = {
  width: "28px",
  height: "28px",
  borderRadius: "8px",
  background: "#1f2937",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9ca3af",
  fontSize: "12px",
  fontWeight: "800",
};

const smallBadgeStyle = {
  padding: "7px 10px",
  borderRadius: "20px",
  background: "rgba(37,99,235,.1)",
  color: "#93c5fd",
  fontSize: "11px",
  fontWeight: "700",
};

const orderTableHeaderStyle = {
  display: "grid",
  gridTemplateColumns:
    "1.5fr .6fr .9fr .9fr 1fr",
  gap: "12px",
  padding: "13px 15px",
  background: "#0b1220",
  color: "#6b7280",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const orderTableRowStyle = {
  display: "grid",
  gridTemplateColumns:
    "1.5fr .6fr .9fr .9fr 1fr",
  gap: "12px",
  padding: "15px",
  alignItems: "center",
  borderTop:
    "1px solid rgba(255,255,255,.05)",
  fontSize: "13px",
};

const statusBadgeStyle = {
  display: "inline-flex",
  width: "fit-content",
  padding: "6px 9px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: "700",
};

const activityListStyle = {
  display: "flex",
  flexDirection: "column",
};

const activityItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "13px 0",
  borderBottom:
    "1px solid rgba(255,255,255,.05)",
};

const activityIconStyle = {
  width: "34px",
  height: "34px",
  flexShrink: 0,
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#1f2937",
  color: "#93c5fd",
  fontWeight: "800",
};

const activityTimeStyle = {
  color: "#6b7280",
  fontSize: "11px",
};

const emptyStateStyle = {
  padding: "35px 15px",
  textAlign: "center",
  color: "#6b7280",
  fontSize: "13px",
};

const footerNoteStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  padding: "18px",
  borderRadius: "14px",
  background: "rgba(37,99,235,.06)",
  border:
    "1px solid rgba(37,99,235,.12)",
  color: "#9ca3af",
  fontSize: "12px",
};

const loadingCardStyle = {
  minHeight: "70vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const loadingSpinnerStyle = {
  fontSize: "40px",
  marginBottom: "15px",
  color: "#60a5fa",
};

const errorCardStyle = {
  minHeight: "70vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "20px",
};

const errorIconStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(239,68,68,.12)",
  color: "#f87171",
  fontSize: "30px",
  fontWeight: "800",
  marginBottom: "18px",
};

const errorBannerStyle = {
  padding: "13px 15px",
  marginBottom: "20px",
  borderRadius: "10px",
  background: "#3f1d1d",
  border: "1px solid #7f1d1d",
  color: "#fecaca",
  fontSize: "13px",
};
