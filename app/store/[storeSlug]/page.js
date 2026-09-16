"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams } from "next/navigation";

export default function StorePage() {
  const params = useParams();
  const storeSlug = params?.storeSlug;

  const [products, setProducts] = useState([]);
  const [storeName, setStoreName] = useState("Supplier Store");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState("");

  useEffect(() => {
    if (!storeSlug) return;

    loadStore();
    loadProducts();
    trackStoreView();
  }, [storeSlug]);

  async function trackStoreView() {
    try {
      let visitorId = localStorage.getItem(
        "supplierhub_visitor_id"
      );

      if (!visitorId) {
        visitorId = crypto.randomUUID();

        localStorage.setItem(
          "supplierhub_visitor_id",
          visitorId
        );
      }

      await supabase.from("analytics_events").insert({
        event_type: "store_view",
        visitor_id: visitorId,
        user_id: null,
        path: `/store/${storeSlug}`,
        metadata: {
          store_slug: storeSlug,
        },
      });
    } catch (trackingError) {
      console.error(
        "Store view tracking error:",
        trackingError
      );
    }
  }

  async function loadStore() {
    const { data, error } = await supabase
      .from("store_profiles")
      .select("store_name")
      .eq("store_slug", storeSlug)
      .single();

    if (!error && data) {
      setStoreName(data.store_name || "Supplier Store");
    }
  }

  async function loadProducts() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, category, price, stock, image_url, image_urls"
      )
      .eq("store_slug", storeSlug)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  function openOrderForm(product) {
    if (Number(product.stock) <= 0) return;

    setSelectedProduct(product);
    setCustomerName("");
    setCustomerPhone("");
    setQuantity(1);
    setOrderSuccess("");
  }

  function closeOrderForm() {
    if (placingOrder) return;

    setSelectedProduct(null);
    setCustomerName("");
    setCustomerPhone("");
    setQuantity(1);
    setOrderSuccess("");
  }

  async function placeOrder() {
    if (!selectedProduct) return;

    const name = customerName.trim();
    const phone = customerPhone.trim();

    if (!name) {
      alert("Please enter your name.");
      return;
    }

    if (!phone) {
      alert("Please enter your phone number.");
      return;
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      alert("Please enter a valid phone number.");
      return;
    }

    if (quantity < 1) {
      alert("Quantity must be at least 1.");
      return;
    }

    if (quantity > Number(selectedProduct.stock)) {
      alert(
        "Requested quantity is greater than available stock."
      );
      return;
    }

    setPlacingOrder(true);
    setOrderSuccess("");

    const { error } = await supabase.rpc("place_order", {
      p_store_slug: storeSlug,
      p_product_id: selectedProduct.id,
      p_customer_name: name,
      p_customer_phone: phone,
      p_quantity: Number(quantity),
    });

    setPlacingOrder(false);

    if (error) {
      alert(error.message);
      return;
    }

    setOrderSuccess(
      "Order placed successfully! The supplier will process your order."
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #070b14 0%, #0d1424 50%, #111827 100%)",
        color: "#fff",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* STORE HEADER */}
        <div
          style={{
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "42px",
              fontWeight: "800",
              marginBottom: "10px",
            }}
          >
            {storeName}
          </h1>

          <p
            style={{
              color: "#9ca3af",
              fontSize: "16px",
            }}
          >
            Browse products and place your order
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            style={{
              background: "#3f1d1d",
              border: "1px solid #7f1d1d",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "25px",
              color: "#fecaca",
            }}
          >
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "#9ca3af",
            }}
          >
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "#9ca3af",
            }}
          >
            <h2
              style={{
                color: "#fff",
                marginBottom: "8px",
              }}
            >
              No products available
            </h2>

            <p>
              This store hasn't added any products yet.
            </p>
          </div>
        ) : (
          /* PRODUCTS */
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "22px",
            }}
          >
            {products.map((product) => {
              const stock = Number(product.stock) || 0;
              const outOfStock = stock <= 0;

              return (
                <div
                  key={product.id}
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(31,41,55,.95), rgba(17,24,39,.95))",
                    border:
                      "1px solid rgba(255,255,255,.08)",
                    borderRadius: "18px",
                    padding: "22px",
                    boxShadow:
                      "0 15px 40px rgba(0,0,0,.25)",
                  }}
                >
                  {/* PRODUCT PHOTOS */}
                  <ProductGallery product={product} />

                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "13px",
                      marginBottom: "8px",
                    }}
                  >
                    {product.category || "New"}
                  </div>

                  <h2
                    style={{
                      fontSize: "22px",
                      margin: "0 0 12px",
                      fontWeight: "700",
                    }}
                  >
                    {product.name}
                  </h2>

                  <div
                    style={{
                      fontSize: "25px",
                      fontWeight: "800",
                      marginBottom: "14px",
                    }}
                  >
                    ₹
                    {Number(
                      product.price || 0
                    ).toLocaleString("en-IN")}
                  </div>

                  {outOfStock ? (
                    <div
                      style={{
                        color: "#f87171",
                        fontWeight: "700",
                        marginBottom: "16px",
                      }}
                    >
                      Out of Stock
                    </div>
                  ) : (
                    <div
                      style={{
                        color: "#4ade80",
                        fontWeight: "600",
                        marginBottom: "16px",
                      }}
                    >
                      {stock} in stock
                    </div>
                  )}

                  <button
                    onClick={() =>
                      openOrderForm(product)
                    }
                    disabled={outOfStock}
                    style={{
                      width: "100%",
                      padding: "13px",
                      borderRadius: "10px",
                      border: "none",
                      background: outOfStock
                        ? "#374151"
                        : "#2563eb",
                      color: outOfStock
                        ? "#9ca3af"
                        : "#fff",
                      fontWeight: "700",
                      cursor: outOfStock
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {outOfStock
                      ? "Out of Stock"
                      : "Place Order"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ORDER MODAL */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "#111827",
              border:
                "1px solid rgba(255,255,255,.1)",
              borderRadius: "18px",
              padding: "25px",
              boxShadow:
                "0 25px 80px rgba(0,0,0,.5)",
            }}
          >
            <h2
              style={{
                fontSize: "25px",
                marginBottom: "5px",
              }}
            >
              Place Order
            </h2>

            <p
              style={{
                color: "#9ca3af",
                marginBottom: "22px",
              }}
            >
              {selectedProduct.name}
            </p>

            {orderSuccess ? (
              <div>
                <div
                  style={{
                    background: "#12351f",
                    border: "1px solid #166534",
                    color: "#86efac",
                    padding: "16px",
                    borderRadius: "12px",
                    lineHeight: "1.5",
                    marginBottom: "18px",
                  }}
                >
                  {orderSuccess}
                </div>

                <button
                  onClick={closeOrderForm}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#2563eb",
                    color: "#fff",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#d1d5db",
                  }}
                >
                  Customer Name
                </label>

                <input
                  value={customerName}
                  onChange={(e) =>
                    setCustomerName(e.target.value)
                  }
                  placeholder="Enter your name"
                  style={inputStyle}
                />

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#d1d5db",
                  }}
                >
                  Phone Number *
                </label>

                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) =>
                    setCustomerPhone(e.target.value)
                  }
                  placeholder="Enter your phone number"
                  required
                  style={inputStyle}
                />

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#d1d5db",
                  }}
                >
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  max={Number(
                    selectedProduct.stock
                  )}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(
                          Number(
                            selectedProduct.stock
                          ),
                          Number(e.target.value) || 1
                        )
                      )
                    )
                  }
                  style={inputStyle}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginTop: "18px",
                    marginBottom: "20px",
                    fontSize: "18px",
                  }}
                >
                  <span>Total</span>

                  <strong>
                    ₹
                    {(
                      Number(
                        selectedProduct.price || 0
                      ) *
                      Number(quantity || 1)
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <button
                    onClick={closeOrderForm}
                    disabled={placingOrder}
                    style={{
                      flex: 1,
                      padding: "13px",
                      borderRadius: "10px",
                      border:
                        "1px solid #374151",
                      background: "#1f2937",
                      color: "#fff",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={placeOrder}
                    disabled={placingOrder}
                    style={{
                      flex: 1,
                      padding: "13px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#2563eb",
                      color: "#fff",
                      fontWeight: "700",
                      cursor: placingOrder
                        ? "wait"
                        : "pointer",
                    }}
                  >
                    {placingOrder
                      ? "Placing..."
                      : "Place Order"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================
   PRODUCT IMAGE GALLERY
========================= */

function ProductGallery({ product }) {
  const images =
    Array.isArray(product.image_urls) &&
    product.image_urls.length > 0
      ? product.image_urls
      : product.image_url
      ? [product.image_url]
      : [];

  const [currentIndex, setCurrentIndex] =
    useState(0);

  if (images.length === 0) {
    return null;
  }

  const nextImage = () => {
    setCurrentIndex(
      (currentIndex + 1) % images.length
    );
  };

  const previousImage = () => {
    setCurrentIndex(
      (currentIndex - 1 + images.length) %
        images.length
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "190px",
        borderRadius: "14px",
        overflow: "hidden",
        marginBottom: "18px",
        background: "#0b1220",
      }}
    >
      <img
        src={images[currentIndex]}
        alt={product.name || "Product"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      {images.length > 1 && (
        <>
          {/* PREVIOUS */}
          <button
            onClick={previousImage}
            aria-label="Previous photo"
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform:
                "translateY(-50%)",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border:
                "1px solid rgba(255,255,255,.2)",
              background: "rgba(0,0,0,.6)",
              color: "#fff",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            ‹
          </button>

          {/* NEXT */}
          <button
            onClick={nextImage}
            aria-label="Next photo"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform:
                "translateY(-50%)",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border:
                "1px solid rgba(255,255,255,.2)",
              background: "rgba(0,0,0,.6)",
              color: "#fff",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            ›
          </button>

          {/* COUNTER */}
          <div
            style={{
              position: "absolute",
              right: "10px",
              bottom: "10px",
              padding: "5px 9px",
              borderRadius: "20px",
              background: "rgba(0,0,0,.65)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "600",
              backdropFilter: "blur(8px)",
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>

          {/* DOTS */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "10px",
              transform:
                "translateX(-50%)",
              display: "flex",
              gap: "5px",
            }}
          >
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() =>
                  setCurrentIndex(index)
                }
                aria-label={`View photo ${
                  index + 1
                }`}
                style={{
                      width:
                    index === currentIndex
                      ? "18px"
                      : "6px",
                  height: "6px",
                  padding: 0,
                  border: "none",
                  borderRadius: "10px",
                  background:
                    index === currentIndex
                      ? "#fff"
                      : "rgba(255,255,255,.5)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  marginBottom: "16px",
  borderRadius: "10px",
  border: "1px solid #374151",
  background: "#0b1220",
  color: "#fff",
  outline: "none",
  fontSize: "15px",
};
