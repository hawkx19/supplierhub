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
               
