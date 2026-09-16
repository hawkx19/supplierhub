"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PlatformAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error: analyticsError } =
        await supabase.rpc("get_platform_analytics");

      if (analyticsError) {
        throw analyticsError;
      }

      setAnalytics(data);
    } catch (err) {
      console.error("Platform analytics error:", err);

      if (
        err?.message
          ?.toLowerCase()
          .includes("access denied")
      ) {
        setError(
          "Access denied. This dashboard is only available to the SupplierHub owner."
        );
      } else {
        setError(
          err?.message ||
            "Unable to load platform analytics."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={loadingStyle}>
            Loading platform analytics...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={headerStyle}>
            <div>
              <div style={eyebrowStyle}>
                SUPPLIERHUB OWNER
              </div>

              <h1 style={titleStyle}>
                Growth Analytics
              </h1>

              <p style={subtitleStyle}>
                Platform-wide growth and activity overview.
              </p>
            </div>
          </div>

          <div style={errorCardStyle}>
            <div style={errorIconStyle}>!</div>

            <h2 style={{ margin: "0 0 8px" }}>
              Analytics unavailable
            </h2>

            <p
              style={{
                margin: 0,
                color: "#9ca3af",
                lineHeight: 1.6,
              }}
            >
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const daily = Array.isArray(analytics?.daily)
    ? analytics.daily
    : [];

  const topStores = Array.isArray(
    analytics?.top_stores
  )
    ? analytics.top_stores
    : [];

  const topReferrers = Array.isArray(
    analytics?.top_referrers
  )
    ? analytics.top_referrers
    : [];

  const recentActivity = Array.isArray(
    analytics?.recent_activity
  )
    ? analytics.recent_activity
    : [];

  const maxVisitors = Math.max(
    ...daily.map((item) =>
      Number(item.visitors || 0)
    ),
    1
  );

  const maxPageViews = Math.max(
    ...daily.map((item) =>
      Number(item.page_views || 0)
    ),
    1
  );

  const maxStoreViews = Math.max(
    ...daily.map((item) =>
      Number(item.store_views || 0)
    ),
    1
  );

  const maxSales = Math.max(
    ...daily.map((item) =>
      Number(item.sales || 0)
    ),
    1
  );

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  const formatTime = (value) => {
    if (!value) return "";

    return new Date(value).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatEventName = (eventType) => {
    const names = {
      page_view: "Page View",
      store_view: "Store View",
      signup_started: "Signup Started",
      signup_completed: "Signup Completed",
      order_placed: "Order Placed",
      store_created: "Store Created",
    };

    return (
      names[eventType] ||
      String(eventType || "Activity")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        )
    );
  };

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        {/* HEADER */}
        <div style={headerStyle}>
          <div>
            <div style={eyebrowStyle}>
              SUPPLIERHUB OWNER
            </div>

            <h1 style={titleStyle}>
              Growth Analytics
            </h1>

            <p style={subtitleStyle}>
              Platform-wide growth, visitors, stores,
              accounts and activity.
            </p>
          </div>

          <button
            onClick={() => loadAnalytics(true)}
            disabled={refreshing}
            style={{
              ...refreshButtonStyle,
              opacity: refreshing ? 0.6 : 1,
              cursor: refreshing
                ? "wait"
                : "pointer",
            }}
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>
        </div>

        {/* MAIN STATS */}
        <section style={statsGridStyle}>
          <StatCard
            icon="👀"
            label="Total Visitors"
            value={formatNumber(
              analytics.total_visitors
            )}
            description="Unique visitors tracked"
          />

          <StatCard
            icon="📄"
            label="Page Views"
            value={formatNumber(
              analytics.total_page_views
            )}
            description="All tracked page visits"
          />

          <StatCard
            icon="🏪"
            label="Store Views"
            value={formatNumber(
              analytics.total_store_views
            )}
            description="Public store visits"
          />

          <StatCard
            icon="👤"
            label="Accounts"
            value={formatNumber(
              analytics.total_accounts
            )}
            description="Registered accounts"
          />

          <StatCard
            icon="🏬"
            label="Stores"
            value={formatNumber(
              analytics.total_stores
            )}
            description="Created supplier stores"
          />

          <StatCard
            icon="📦"
            label="Products"
            value={formatNumber(
              analytics.total_products
            )}
            description="Products in all stores"
          />

          <StatCard
            icon="🛒"
            label="Orders"
            value={formatNumber(
              analytics.total_orders
            )}
            description="All platform orders"
          />

          <StatCard
            icon="💰"
            label="Completed Sales"
            value={formatMoney(
              analytics.completed_sales
            )}
            description="Completed orders only"
          />
        </section>

        {/* SECONDARY STATS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          <MiniStat
            label="Signup Started"
            value={formatNumber(
              analytics.signup_started
            )}
          />

          <MiniStat
            label="Signup Completed"
            value={formatNumber(
              analytics.signup_completed
            )}
          />

          <MiniStat
            label="Unique Store Visitors"
            value={formatNumber(
              analytics.unique_store_visitors
            )}
          />

          <MiniStat
            label="Units Sold"
            value={formatNumber(
              analytics.units_sold
            )}
          />

          <MiniStat
            label="Pending Orders"
            value={formatNumber(
              analytics.pending_orders
            )}
          />

          <MiniStat
            label="Completed Orders"
            value={formatNumber(
              analytics.completed_orders
            )}
          />

          <MiniStat
            label="Rejected Orders"
            value={formatNumber(
              analytics.rejected_orders
            )}
          />

          <MiniStat
            label="Signup Conversion"
            value={`${Number(
              analytics.signup_conversion || 0
            ).toFixed(2)}%`}
          />
        </section>

        {/* 30 DAY ACTIVITY */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>
                30-Day Growth
              </h2>

              <p style={sectionSubtitleStyle}>
                Visitor, page-view, store-view and
                sales activity.
              </p>
            </div>

            <div style={legendStyle}>
              <span>
                <i
                  style={{
                    ...legendDotStyle,
                    background: "#60a5fa",
                  }}
                />
                Visitors
              </span>

              <span>
                <i
                  style={{
                    ...legendDotStyle,
                    background: "#34d399",
                  }}
                />
                Store Views
              </span>

              <span>
                <i
                  style={{
                    ...legendDotStyle,
                    background: "#f59e0b",
                  }}
                />
                Sales
              </span>
            </div>
          </div>

          <div
            style={{
              overflowX: "auto",
              paddingBottom: "8px",
            }}
          >
            <div
              style={{
                minWidth: "760px",
                display: "flex",
                alignItems: "flex-end",
                gap: "8px",
                height: "260px",
                padding:
                  "25px 10px 35px",
                borderRadius: "14px",
                background:
                  "rgba(2, 6, 23, .45)",
                border:
                  "1px solid rgba(255,255,255,.05)",
              }}
            >
              {daily.map((item, index) => {
                const visitorHeight =
                  (Number(item.visitors || 0) /
                    maxVisitors) *
                  150;

                const storeHeight =
                  (Number(item.store_views || 0) /
                    maxStoreViews) *
                  150;

                const salesHeight =
                  (Number(item.sales || 0) /
                    maxSales) *
                  150;

                return (
                  <div
                    key={`${item.day}-${index}`}
                    style={{
                      flex: 1,
                      minWidth: "18px",
                      height: "100%",
                      display: "flex",
                      flexDirection:
                        "column",
                      justifyContent:
                        "flex-end",
                      alignItems: "center",
                      gap: "3px",
                      position: "relative",
                    }}
                  >
                    <div
                      title={`Visitors: ${formatNumber(
                        item.visitors
                      )}`}
                      style={{
                        width: "30%",
                        minWidth: "4px",
                        height: `${Math.max(
                          visitorHeight,
                          Number(
                            item.visitors
                          ) > 0
                            ? 4
                            : 0
                        )}px`,
                        background:
                          "#60a5fa",
                        borderRadius:
                          "5px 5px 0 0",
                        opacity: 0.9,
                      }}
                    />

                    <div
                      title={`Store views: ${formatNumber(
                        item.store_views
                      )}`}
                      style={{
                        width: "30%",
                        minWidth: "4px",
                        height: `${Math.max(
                          storeHeight,
                          Number(
                            item.store_views
                          ) > 0
                            ? 4
                            : 0
                        )}px`,
                        background:
                          "#34d399",
                        borderRadius:
                          "5px 5px 0 0",
                        opacity: 0.9,
                      }}
                    />

                    <div
                      title={`Sales: ${formatMoney(
                        item.sales
                      )}`}
                      style={{
                        width: "30%",
                        minWidth: "4px",
                        height: `${Math.max(
                          salesHeight,
                          Number(item.sales) >
                            0
                            ? 4
                            : 0
                        )}px`,
                        background:
                          "#f59e0b",
                        borderRadius:
                          "5px 5px 0 0",
                        opacity: 0.9,
                      }}
                    />

                    <span
                      style={{
                        position:
                          "absolute",
                        bottom: "-27px",
                        fontSize: "10px",
                        color: "#6b7280",
                        whiteSpace:
                          "nowrap",
                        transform:
                          "rotate(-45deg)",
                        transformOrigin:
                          "top center",
                      }}
                    >
                      {formatDate(
                        item.day
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TRAFFIC + STORES */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "22px",
            marginBottom: "28px",
          }}
        >
          {/* TOP STORES */}
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>
                  Most Viewed Stores
                </h2>

                <p style={sectionSubtitleStyle}>
                  Public store links receiving views.
                </p>
              </div>
            </div>

            {topStores.length === 0 ? (
              <EmptyState text="No store views recorded yet." />
            ) : (
              <div>
                {topStores.map(
                  (store, index) => (
                    <div
                      key={`${store.store_slug}-${index}`}
                      style={listRowStyle}
                    >
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "10px",
                          background:
                            "rgba(37,99,235,.15)",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          color: "#93c5fd",
                          fontWeight: "800",
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "700",
                            color: "#fff",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          /store/
                          {store.store_slug}
                        </div>

                        <div
                          style={{
                            color:
                              "#6b7280",
                            fontSize:
                              "12px",
                            marginTop:
                              "3px",
                          }}
                        >
                          {
                            formatNumber(
                              store.unique_visitors
                            )
                          }{" "}
                          unique visitors
                        </div>
                      </div>

                      <strong
                        style={{
                          color: "#60a5fa",
                        }}
                      >
                        {formatNumber(
                          store.views
                        )}
                      </strong>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* REFERRERS */}
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>
                  Traffic Sources
                </h2>

                <p style={sectionSubtitleStyle}>
                  Where tracked page visitors came from.
                </p>
              </div>
            </div>

            {topReferrers.length === 0 ? (
              <EmptyState text="No referral data recorded yet." />
            ) : (
              <div>
                {topReferrers.map(
                  (source, index) => (
                    <div
                      key={`${source.referrer}-${index}`}
                      style={listRowStyle}
                    >
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "10px",
                          background:
                            "rgba(16,185,129,.12)",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          color: "#6ee7b7",
                          fontWeight: "800",
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </div>

                      <div
                        style={{
                                         flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "700",
                            color: "#fff",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {source.referrer || "Direct"}
                        </div>

                        <div
                          style={{
                            color: "#6b7280",
                            fontSize: "12px",
                            marginTop: "3px",
                          }}
                        >
                          {formatNumber(source.visitors)} visitors
                        </div>
                      </div>

                      <strong
                        style={{
                          color: "#34d399",
                        }}
                      >
                        {formatNumber(source.views)}
                      </strong>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>

        {/* RECENT ACTIVITY */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>
                Recent Activity
              </h2>

              <p style={sectionSubtitleStyle}>
                Latest tracked platform events.
              </p>
            </div>
          </div>

          {recentActivity.length === 0 ? (
            <EmptyState text="No recent activity recorded yet." />
          ) : (
            <div>
              {recentActivity.map((activity, index) => (
                <div
                  key={`${activity.created_at}-${index}`}
                  style={activityRowStyle}
                >
                  <div style={activityIconStyle}>
                    {activity.event_type === "order_placed"
                      ? "🛒"
                      : activity.event_type === "signup_completed"
                      ? "👤"
                      : activity.event_type === "store_created"
                      ? "🏪"
                      : activity.event_type === "store_view"
                      ? "🏬"
                      : "📊"}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: "14px",
                      }}
                    >
                      {formatEventName(
                        activity.event_type
                      )}
                    </div>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      {activity.description ||
                        activity.email ||
                        activity.store_slug ||
                        "Platform activity"}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        color: "#9ca3af",
                        fontSize: "12px",
                      }}
                    >
                      {formatDate(activity.created_at)}
                    </div>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "11px",
                        marginTop: "3px",
                      }}
                    >
                      {formatTime(activity.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <div
          style={{
            marginTop: "28px",
            padding: "18px 20px",
            borderRadius: "16px",
            background: "rgba(15,23,42,.65)",
            border: "1px solid rgba(255,255,255,.06)",
            color: "#6b7280",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          SupplierHub Platform Analytics
        </div>
      </div>
    </main>
  );
}

/* =========================
   COMPONENTS
========================= */

function StatCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div style={statCardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "18px",
        }}
      >
        <div style={statIconStyle}>{icon}</div>

        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#34d399",
            boxShadow: "0 0 12px rgba(52,211,153,.45)",
          }}
        />
      </div>

      <div
        style={{
          color: "#9ca3af",
          fontSize: "13px",
          marginBottom: "7px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#fff",
          fontSize: "28px",
          fontWeight: "800",
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#6b7280",
          fontSize: "11px",
          marginTop: "7px",
        }}
      >
        {description}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div
      style={{
        padding: "18px 20px",
        borderRadius: "14px",
        background: "rgba(15,23,42,.65)",
        border: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div
        style={{
          color: "#6b7280",
          fontSize: "12px",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#fff",
          fontSize: "20px",
          fontWeight: "800",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div
      style={{
        padding: "35px 20px",
        textAlign: "center",
        color: "#6b7280",
        fontSize: "13px",
        borderRadius: "12px",
        background: "rgba(2,6,23,.35)",
        border: "1px dashed rgba(255,255,255,.07)",
      }}
    >
      {text}
    </div>
  );
}

/* =========================
   STYLES
========================= */

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top right, rgba(37,99,235,.12), transparent 30%), #020617",
  color: "#fff",
  padding: "32px 20px 50px",
  boxSizing: "border-box",
};

const containerStyle = {
  width: "100%",
  maxWidth: "1400px",
  margin: "0 auto",
};

const headerStyle = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "20px",
  marginBottom: "28px",
  flexWrap: "wrap",
};

const eyebrowStyle = {
  color: "#60a5fa",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "1.8px",
  marginBottom: "8px",
};

const titleStyle = {
  margin: 0,
  fontSize: "clamp(28px, 4vw, 42px)",
  fontWeight: "850",
  letterSpacing: "-1px",
};

const subtitleStyle = {
  margin: "8px 0 0",
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: 1.6,
};

const refreshButtonStyle = {
  border: "1px solid rgba(96,165,250,.25)",
  background: "rgba(37,99,235,.12)",
  color: "#93c5fd",
  borderRadius: "12px",
  padding: "11px 16px",
  fontWeight: "700",
  fontSize: "13px",
};

const loadingStyle = {
  minHeight: "70vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9ca3af",
  fontSize: "14px",
};

const errorCardStyle = {
  padding: "28px",
  borderRadius: "18px",
  background: "rgba(127,29,29,.15)",
  border: "1px solid rgba(248,113,113,.2)",
  marginTop: "30px",
};

const errorIconStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(248,113,113,.12)",
  color: "#fca5a5",
  fontWeight: "900",
  marginBottom: "15px",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "18px",
  marginBottom: "28px",
};

const statCardStyle = {
  padding: "20px",
  borderRadius: "16px",
  background:
    "linear-gradient(145deg, rgba(15,23,42,.92), rgba(15,23,42,.62))",
  border: "1px solid rgba(255,255,255,.06)",
  boxShadow: "0 15px 35px rgba(0,0,0,.18)",
};

const statIconStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(37,99,235,.12)",
  fontSize: "19px",
};

const sectionStyle = {
  padding: "22px",
  borderRadius: "18px",
  background:
    "linear-gradient(145deg, rgba(15,23,42,.88), rgba(15,23,42,.58))",
  border: "1px solid rgba(255,255,255,.06)",
  boxShadow: "0 15px 35px rgba(0,0,0,.16)",
  marginBottom: "28px",
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "20px",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "18px",
  fontWeight: "800",
};

const sectionSubtitleStyle = {
  margin: "6px 0 0",
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: 1.5,
};

const legendStyle = {
  display: "flex",
  gap: "15px",
  flexWrap: "wrap",
  color: "#9ca3af",
  fontSize: "11px",
};

const legendDotStyle = {
  display: "inline-block",
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  marginRight: "5px",
};

const listRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "13px 0",
  borderBottom:
    "1px solid rgba(255,255,255,.05)",
};

const activityRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "13px",
  padding: "14px 0",
  borderBottom:
    "1px solid rgba(255,255,255,.05)",
};

const activityIconStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(37,99,235,.10)",
  flexShrink: 0,
};
