"use client";

import Link from "next/link";

const demoProducts = [
  { name: "Premium Basmati Rice", category: "Grocery", price: 1250, stock: 42 },
  { name: "Refined Cooking Oil", category: "Grocery", price: 1680, stock: 28 },
  { name: "Wholesale Sugar", category: "Grocery", price: 920, stock: 64 },
  { name: "Organic Wheat Flour", category: "Grocery", price: 780, stock: 19 },
  { name: "Fresh Dairy Pack", category: "Dairy", price: 560, stock: 0 },
  { name: "Premium Tea Box", category: "Beverages", price: 690, stock: 35 },
];

export default function DemoStore() {
  return (
    <main style={{ minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            marginBottom: 50,
          }}
        >
          <div>
            <p style={{ margin: 0, opacity: 0.6, fontSize: 13, letterSpacing: 2 }}>
              SUPPLIERHUB DEMO
            </p>

            <h1 style={{ margin: "8px 0 0", fontSize: 42 }}>
              Demo Store
            </h1>

            <p style={{ opacity: 0.65, marginTop: 8 }}>
              Explore how a supplier's public storefront can look.
            </p>
          </div>

          <Link href="/signup" className="button primary">
            Create your store →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          {demoProducts.map((product) => (
            <div
              key={product.name}
              style={{
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 18,
                padding: 22,
                background: "rgba(255,255,255,.03)",
              }}
            >
              <div style={{ opacity: 0.55, fontSize: 12, marginBottom: 12 }}>
                {product.category}
              </div>

              <h2 style={{ fontSize: 20, margin: "0 0 16px" }}>
                {product.name}
              </h2>

              <div style={{ fontSize: 25, fontWeight: 700, marginBottom: 8 }}>
                ₹{product.price.toLocaleString("en-IN")}
              </div>

              <div style={{ fontSize: 13, opacity: 0.7 }}>
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </div>

              <button
                disabled={product.stock === 0}
                style={{
                  width: "100%",
                  marginTop: 20,
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: 0,
                  cursor: product.stock ? "pointer" : "not-allowed",
                  opacity: product.stock ? 1 : 0.45,
                }}
              >
                {product.stock > 0 ? "Place Order" : "Out of Stock"}
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 55,
            opacity: 0.65,
          }}
        >
          This is a demo storefront. Create an account to launch your own.
        </div>

      </div>
    </main>
  );
}
