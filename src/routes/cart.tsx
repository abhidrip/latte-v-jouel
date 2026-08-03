import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "../context/CartContext";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Selection — Lattév Jouel" },
      {
        name: "description",
        content: "Review your selected pieces from Lattév Jouel.",
      },
    ],
  }),
  component: CartPage,
});

// ─── Cart Page ────────────────────────────────────────────────────────────────

function CartPage() {
  const { items, total, count, removeItem, setQty } = useCart();

  return (
    <div style={{ background: "#E8B98A", color: "#3D3416", minHeight: "100vh" }}>
      {/* ── Nav ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "1.15rem 2rem",
          background: "rgba(232,185,138,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(107,115,38,0.18)",
        }}
      >
        <div
          className="flex items-center justify-between max-w-7xl mx-auto"
          style={{ gap: "1rem" }}
        >
          <Link
            to="/shop"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.62rem",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              opacity: 0.8,
            }}
            className="hover:opacity-100 transition-opacity"
          >
            ← Collection
          </Link>
          <Link to="/" aria-label="Lattév Jouel home">
            <img
              src="/lattev_transparent.png"
              alt="Lattév Jouel"
              style={{
                height: "clamp(40px, 4vw, 56px)",
                width: "auto",
                display: "block",
              }}
            />
          </Link>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.62rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--color-ivory)",
              opacity: 0.5,
            }}
          >
            {count} {count === 1 ? "Piece" : "Pieces"}
          </div>
        </div>
      </nav>

      {/* ── Header ── */}
      <header
        style={{
          padding: "8rem 1.5rem 2.5rem",
          textAlign: "center",
          background:
            "radial-gradient(ellipse at top, #DFB088 0%, #E8B98A 65%)",
        }}
      >
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.58rem",
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
            opacity: 0.78,
          }}
        >
          Maison Selection
        </div>
        <h1
          className="font-display"
          style={{
            fontWeight: 300,
            fontSize: "clamp(2.6rem, 6vw, 5rem)",
            lineHeight: 1.05,
            marginTop: "0.6rem",
          }}
        >
          Your{" "}
          <span
            style={{
              background:
                "linear-gradient(110deg, #4F5820 15%, #6B7326 30%, #B8C057 50%, #6B7326 70%, #4F5820 85%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            Selection
          </span>
        </h1>
      </header>

      {/* ── Empty State ── */}
      {items.length === 0 ? (
        <div
          style={{ padding: "5rem 1.5rem 7rem", textAlign: "center" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 88,
              borderRadius: "50%",
              border: "1px solid rgba(107,115,38,0.28)",
              marginBottom: "2rem",
            }}
          >
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="1"
              opacity={0.55}
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: "1.65rem",
              color: "var(--color-ivory)",
              letterSpacing: "0.04em",
            }}
          >
            Your selection is empty
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem",
              color: "var(--color-ivory)",
              opacity: 0.5,
              marginTop: "0.75rem",
            }}
          >
            Discover pieces made to be worn.
          </p>
          <Link
            to="/shop"
            className="liquid-glass-btn"
            style={{ marginTop: "2.5rem", display: "inline-flex" }}
          >
            Explore the Collection
          </Link>
        </div>
      ) : (
        /* ── Cart Items + Summary ── */
        <section style={{ padding: "2rem 1.5rem 7rem" }}>
          <div className="cart-checkout-grid">
            {/* Left: Items */}
            <div>
              {items.map((item) => (
                <div key={item.name} className="cart-item-row">
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 10,
                      overflow: "hidden",
                      flexShrink: 0,
                      background:
                        "linear-gradient(135deg,#DBAF7C,#E8C69E)",
                    }}
                  >
                    {item.img && (
                      <img
                        src={item.img}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        fontSize: "1.05rem",
                        color: "var(--color-ivory)",
                        letterSpacing: "0.05em",
                        marginBottom: "0.22rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.78rem",
                        color: "var(--color-gold)",
                        marginBottom: "0.7rem",
                      }}
                    >
                      ₹{item.price.toLocaleString("en-IN")} each
                    </p>
                    {/* Qty stepper */}
                    <div className="cart-qty-stepper">
                      <button
                        type="button"
                        className="cart-qty-btn"
                        onClick={() => setQty(item.name, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                          fontSize: "0.88rem",
                          minWidth: "1.6rem",
                          textAlign: "center",
                          color: "var(--color-ivory)",
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="cart-qty-btn"
                        onClick={() => setQty(item.name, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price + Remove */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.98rem",
                        color: "var(--color-ivory)",
                      }}
                    >
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => removeItem(item.name)}
                      style={{ marginTop: "0.5rem" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: "2.5rem" }}>
                <Link
                  to="/shop"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.58rem",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "var(--color-gold)",
                    opacity: 0.65,
                  }}
                  className="hover:opacity-100 transition-opacity"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="order-summary-card">
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 400,
                  fontSize: "1.3rem",
                  color: "var(--color-ivory)",
                  letterSpacing: "0.05em",
                  marginBottom: "1.4rem",
                }}
              >
                Order Summary
              </h2>

              {/* Item list */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  marginBottom: "1.25rem",
                }}
              >
                {items.map((item) => (
                  <div
                    key={item.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.76rem",
                        color: "var(--color-ivory)",
                        opacity: 0.68,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name} × {item.quantity}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.76rem",
                        fontWeight: 500,
                        color: "var(--color-ivory)",
                        flexShrink: 0,
                      }}
                    >
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal / Shipping */}
              <div
                style={{
                  borderTop: "1px solid rgba(107,115,38,0.18)",
                  paddingTop: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.45rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.72rem",
                      color: "var(--color-ivory)",
                      opacity: 0.55,
                    }}
                  >
                    Subtotal
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      color: "var(--color-ivory)",
                    }}
                  >
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.72rem",
                      color: "var(--color-ivory)",
                      opacity: 0.55,
                    }}
                  >
                    Shipping
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.72rem",
                      color: "var(--color-gold)",
                    }}
                  >
                    Free
                  </span>
                </div>
              </div>

              {/* Total */}
              <div
                style={{
                  borderTop: "1px solid rgba(107,115,38,0.28)",
                  paddingTop: "1.2rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.75rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    fontSize: "1.1rem",
                    color: "var(--color-ivory)",
                    letterSpacing: "0.04em",
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.18rem",
                    color: "var(--color-ivory)",
                  }}
                >
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <a
                href="https://instagram.com/lattevjouel"
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-glass-btn"
                style={{
                  display: "block",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                DM @lattevjouel to Buy →
              </a>

              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.56rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-ivory)",
                  opacity: 0.35,
                  textAlign: "center",
                  marginTop: "0.9rem",
                }}
              >
                Checkout is currently offline. Please DM us to place an order.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
