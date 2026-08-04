import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
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

// ─── Razorpay types ──────────────────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: new (opts: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;        // paise
  currency: string;
  name: string;
  description: string;
  image?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: { ondismiss?: () => void };
  notes?: Record<string, string>;
  // Explicitly list payment methods (ensures UPI is always shown)
  method?: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
    emi?: boolean;
    paylater?: boolean;
  };
  config?: {
    display?: {
      blocks?: Record<string, { name: string; instruments: { method: string }[] }>;
      sequence?: string[];
      preferences?: { show_default_blocks?: boolean };
    };
  };
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
}

// ─── Load Razorpay SDK lazily ─────────────────────────────────────────────────

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID as string;

// ─── Cart Page ────────────────────────────────────────────────────────────────

type CheckoutState = "idle" | "collecting" | "processing" | "success" | "error";

function CartPage() {
  const { items, total, count, removeItem, setQty, clearCart } = useCart();

  // Checkout flow state
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const handleCheckout = useCallback(async () => {
    setCheckoutState("processing");
    setErrorMsg("");

    const loaded = await loadRazorpay();
    if (!loaded) {
      setErrorMsg("Could not load payment gateway. Please check your connection.");
      setCheckoutState("error");
      return;
    }

    const itemsSummary = items.map((i) => `${i.name} ×${i.quantity}`).join(", ");

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY,
      amount: total * 100, // paise (₹1 = 100 paise)
      currency: "INR",
      name: "Lattév Jouel",
      description: itemsSummary,
      image: "/lattev_transparent.png",
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      theme: { color: "#4F5820" },
      // Explicitly enable all methods including UPI
      // In test mode UPI may be limited; all methods activate with live keys
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
        emi: false,
        paylater: false,
      },
      // Show UPI first in the payment method list
      config: {
        display: {
          blocks: {
            upi_block: {
              name: "Pay via UPI",
              instruments: [{ method: "upi" }],
            },
            other: {
              name: "Other Methods",
              instruments: [
                { method: "card" },
                { method: "netbanking" },
                { method: "wallet" },
              ],
            },
          },
          sequence: ["block.upi_block", "block.other"],
          preferences: { show_default_blocks: false },
        },
      },
      notes: {
        items: itemsSummary,
        customer_name: customerName,
        customer_email: customerEmail,
      },
      handler: (response: RazorpayPaymentResponse) => {
        setPaymentId(response.razorpay_payment_id);
        clearCart();
        setCheckoutState("success");
      },
      modal: {
        ondismiss: () => {
          setCheckoutState("collecting");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }, [items, total, customerName, customerEmail, customerPhone, clearCart]);

  // ── Success screen ─────────────────────────────────────────────────────────
  if (checkoutState === "success") {
    return (
      <div style={{ background: "#E8B98A", color: "#3D3416", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
        <div style={{ background: "rgba(255,248,228,0.5)", backdropFilter: "blur(20px)", border: "1px solid rgba(107,115,38,0.2)", borderRadius: 24, padding: "3.5rem 3rem", maxWidth: 480, width: "100%" }}>
          {/* Checkmark */}
          <div style={{ width: 72, height: 72, borderRadius: "50%", border: "1.5px solid rgba(107,115,38,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B7326" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--color-gold)", marginBottom: "0.75rem", opacity: 0.7 }}>
            Payment Confirmed
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "2.4rem", lineHeight: 1.1, marginBottom: "1rem" }}>
            Thank you, {customerName || "dear customer"}.
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", opacity: 0.6, lineHeight: 1.7, marginBottom: "1.5rem" }}>
            Your payment was received. We'll be in touch shortly to confirm your order and arrange delivery.
          </p>

          {paymentId && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", opacity: 0.4, letterSpacing: "0.08em", marginBottom: "2rem", wordBreak: "break-all" }}>
              Payment ID: {paymentId}
            </div>
          )}

          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "normal", fontSize: "1.15rem", color: "var(--color-gold-soft)", letterSpacing: "0.05em", marginBottom: "2rem" }}>
            Love, Lattév.
          </p>

          <Link to="/shop" className="liquid-glass-btn" style={{ display: "inline-block" }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

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

              {/* ── Customer Details Form ── */}
              {(checkoutState === "idle" || checkoutState === "collecting") && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-gold)", opacity: 0.8, marginBottom: "0.85rem" }}>
                    Your Details
                  </div>
                  {[
                    { id: "cust-name", label: "Full Name", value: customerName, setter: setCustomerName, type: "text", placeholder: "Lavanya Pahwa", required: true },
                    { id: "cust-email", label: "Email", value: customerEmail, setter: setCustomerEmail, type: "email", placeholder: "hello@example.com", required: false },
                    { id: "cust-phone", label: "Phone", value: customerPhone, setter: setCustomerPhone, type: "tel", placeholder: "+91 98765 43210", required: true },
                  ].map(({ id, label, value, setter, type, placeholder, required }) => (
                    <div key={id} style={{ marginBottom: "0.75rem" }}>
                      <label htmlFor={id} style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-umber)", opacity: 0.5, marginBottom: "0.3rem" }}>
                        {label}{required && " *"}
                      </label>
                      <input
                        id={id}
                        type={type}
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={placeholder}
                        style={{
                          width: "100%",
                          padding: "0.65rem 0.85rem",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.82rem",
                          color: "var(--color-umber)",
                          background: "rgba(255,248,228,0.4)",
                          border: "1px solid rgba(107,115,38,0.25)",
                          borderRadius: 8,
                          outline: "none",
                          boxSizing: "border-box",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(107,115,38,0.6)"; }}
                        onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(107,115,38,0.25)"; }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Error message */}
              {checkoutState === "error" && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#c0392b", marginBottom: "1rem", lineHeight: 1.5 }}>
                  {errorMsg}
                </p>
              )}

              {/* ── Pay Button ── */}
              <button
                type="button"
                disabled={checkoutState === "processing" || !customerName.trim() || !customerPhone.trim()}
                onClick={handleCheckout}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "1rem",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.78rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "#fff",
                  background: checkoutState === "processing"
                    ? "rgba(79,88,32,0.5)"
                    : "linear-gradient(135deg, #4F5820 0%, #6B7326 100%)",
                  border: "none",
                  borderRadius: 10,
                  cursor: checkoutState === "processing" || !customerName.trim() || !customerPhone.trim() ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s, transform 0.15s",
                  opacity: (!customerName.trim() || !customerPhone.trim()) ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (customerName.trim() && customerPhone.trim() && checkoutState !== "processing") {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    (e.currentTarget as HTMLElement).style.opacity = "0.92";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.opacity = (!customerName.trim() || !customerPhone.trim()) ? "0.5" : "1";
                }}
              >
                {checkoutState === "processing" ? "Opening Payment…" : `Pay ₹${total.toLocaleString("en-IN")} →`}
              </button>

              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", color: "var(--color-umber)", opacity: 0.4, textAlign: "center", marginTop: "0.85rem", lineHeight: 1.6 }}>
                Secured by Razorpay · UPI, Cards, NetBanking &amp; more
              </p>

              {/* Razorpay logo row */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem", opacity: 0.3 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem", letterSpacing: "0.1em" }}>SSL Encrypted</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
