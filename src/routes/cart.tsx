import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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


// ─── Trust badge components ───────────────────────────────────────────────────

function PayBadge({ label, color, mono }: { label: string; color: string; mono?: boolean }) {
  return (
    <div style={{
      padding: "0.2rem 0.55rem",
      borderRadius: 4,
      border: `1.5px solid ${color}22`,
      background: `${color}12`,
      fontFamily: mono ? "monospace" : "'DM Sans', sans-serif",
      fontSize: "0.58rem",
      fontWeight: 700,
      letterSpacing: mono ? "0.05em" : "0.06em",
      color,
      opacity: 0.85,
      userSelect: "none",
    }}>
      {label}
    </div>
  );
}

function MastercardBadge() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#EB001B", opacity: 0.85 }} />
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#F79E1B", opacity: 0.85, marginLeft: -5 }} />
    </div>
  );
}

function CartPage() {
  const { items, total, count, removeItem, setQty } = useCart();
  const navigate = useNavigate();

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
              src="/lattev_transparent.webp"
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
              color: "var(--color-umber)",
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
          background: "radial-gradient(ellipse at top, #DFB088 0%, #E8B98A 65%)",
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
              background: "linear-gradient(110deg, #4F5820 15%, #6B7326 30%, #B8C057 50%, #6B7326 70%, #4F5820 85%)",
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
        <div style={{ padding: "5rem 1.5rem 7rem", textAlign: "center" }}>
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
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1" opacity={0.55}>
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "1.65rem", color: "var(--color-umber)", letterSpacing: "0.04em" }}>
            Your selection is empty
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "var(--color-umber)", opacity: 0.5, marginTop: "0.75rem" }}>
            Discover pieces made to be worn.
          </p>
          <Link to="/shop" className="liquid-glass-btn" style={{ marginTop: "2.5rem", display: "inline-flex" }}>
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
                  <div style={{ width: 88, height: 88, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#DBAF7C,#E8C69E)" }}>
                    {item.img && (
                      <img src={item.img} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontStyle: "normal", fontSize: "1.05rem", color: "var(--color-umber)", letterSpacing: "0.05em", marginBottom: "0.22rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.name}
                    </h3>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "var(--color-gold)", marginBottom: "0.7rem" }}>
                      ₹{item.price.toLocaleString("en-IN")} each
                    </p>
                    {/* Qty stepper */}
                    <div className="cart-qty-stepper">
                      <button type="button" className="cart-qty-btn" onClick={() => setQty(item.name, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.88rem", minWidth: "1.6rem", textAlign: "center", color: "var(--color-umber)" }}>
                        {item.quantity}
                      </span>
                      <button type="button" className="cart-qty-btn" onClick={() => setQty(item.name, item.quantity + 1)} aria-label="Increase quantity">+</button>
                    </div>
                  </div>

                  {/* Price + Remove */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.98rem", color: "var(--color-umber)" }}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                    <button type="button" className="cart-remove-btn" onClick={() => removeItem(item.name)} style={{ marginTop: "0.5rem" }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: "2.5rem" }}>
                <Link to="/shop" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.58rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--color-gold)", opacity: 0.65 }} className="hover:opacity-100 transition-opacity">
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="order-summary-card">
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "1.3rem", color: "var(--color-umber)", letterSpacing: "0.05em", marginBottom: "1.4rem" }}>
                Order Summary
              </h2>

              {/* Item list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
                {items.map((item) => (
                  <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.76rem", color: "var(--color-umber)", opacity: 0.68, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name} × {item.quantity}
                    </span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.76rem", fontWeight: 500, color: "var(--color-umber)", flexShrink: 0 }}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal / Shipping */}
              <div style={{ borderTop: "1px solid rgba(107,115,38,0.18)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "var(--color-umber)", opacity: 0.55 }}>Subtotal</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", fontWeight: 500, color: "var(--color-umber)" }}>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "var(--color-umber)", opacity: 0.55 }}>Shipping</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "var(--color-gold)" }}>
                    {total >= 1000 ? "Free" : "Calculated at checkout"}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div style={{ borderTop: "1px solid rgba(107,115,38,0.28)", paddingTop: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "1.1rem", color: "var(--color-umber)", letterSpacing: "0.04em" }}>Total</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "1.18rem", color: "var(--color-umber)" }}>₹{total.toLocaleString("en-IN")}</span>
              </div>


              {/* ── Proceed to Checkout ── */}
              <Link
                to="/checkout"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "1.05rem",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.78rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "#fff",
                  background: "linear-gradient(135deg, #4F5820 0%, #6B7326 100%)",
                  border: "none",
                  borderRadius: 10,
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "opacity 0.2s, transform 0.15s",
                  boxSizing: "border-box",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.opacity = "0.92"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                Proceed to Checkout →
              </Link>

              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem", color: "var(--color-umber)", opacity: 0.35, textAlign: "center", marginTop: "0.75rem" }}>
                UPI · Cards · COD · 256-bit SSL
              </p>

              {/* ── Trust & payment badges ── */}
              <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {/* Payment methods */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  {/* UPI */}
                  <PayBadge label="UPI" color="#5f259f" />
                  {/* Visa */}
                  <PayBadge label="VISA" color="#1a1f71" mono />
                  {/* Mastercard */}
                  <MastercardBadge />
                  {/* RuPay */}
                  <PayBadge label="RuPay" color="#016938" />
                  {/* NetBanking */}
                  <PayBadge label="Net Banking" color="#2d4a8a" />
                </div>

                {/* SSL + shipping */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", opacity: 0.45 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    256-bit SSL
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    {total >= 1000 ? "Free shipping applied" : `Free shipping over ₹1,000`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

      )}
    </div>
  );
}
