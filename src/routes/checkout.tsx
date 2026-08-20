import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Lattév Jouel" },
      { name: "description", content: "Complete your order from Lattév Jouel." },
    ],
  }),
  component: CheckoutPage,
});

// ── Types ─────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: new (opts: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string; amount: number; currency: string;
  name: string; description: string; order_id: string;
  image?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (r: { razorpay_payment_id: string; razorpay_order_id: string }) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance { open(): void; }

type Step = "contact" | "address" | "review" | "payment";
type PayMethod = "razorpay" | "cod";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS: { id: Step; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "address", label: "Address" },
  { id: "review",  label: "Review"  },
  { id: "payment", label: "Payment" },
];

function StepBar({ current }: { current: Step }) {
  const idx = STEPS.findIndex(s => s.id === current);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: "2.5rem" }}>
      {STEPS.map((s, i) => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: i <= idx ? "var(--color-gold)" : "rgba(107,115,38,0.15)",
              color: i <= idx ? "#fff" : "var(--color-umber)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.72rem", fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              transition: "background 0.3s",
            }}>
              {i < idx ? "✓" : i + 1}
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: i <= idx ? "var(--color-gold)" : "var(--color-umber)", opacity: i <= idx ? 1 : 0.4 }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 1.5, background: i < idx ? "var(--color-gold)" : "rgba(107,115,38,0.15)", margin: "0 0.5rem", marginBottom: "1.2rem", transition: "background 0.3s" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Form field ────────────────────────────────────────────────────────────────
function Field({ id, label, value, onChange, type = "text", placeholder, required, hint }: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; type?: string;
  placeholder?: string; required?: boolean; hint?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label htmlFor={id} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-umber)", opacity: 0.55 }}>
        {label}{required && " *"}
      </label>
      <input
        id={id} type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ padding: "0.75rem 1rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "var(--color-umber)", background: "rgba(255,248,228,0.5)", border: "1.5px solid rgba(107,115,38,0.22)", borderRadius: 8, outline: "none", transition: "border-color 0.2s", width: "100%", boxSizing: "border-box" }}
        onFocus={e  => { (e.target as HTMLElement).style.borderColor = "rgba(107,115,38,0.6)"; }}
        onBlur={e   => { (e.target as HTMLElement).style.borderColor = "rgba(107,115,38,0.22)"; }}
      />
      {hint && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "var(--color-umber)", opacity: 0.4 }}>{hint}</span>}
    </div>
  );
}

// ── Order summary sidebar ─────────────────────────────────────────────────────
function OrderSidebar({ items, subtotal, shipping }: { items: { name: string; price: number; quantity: number; img?: string }[]; subtotal: number; shipping: number }) {
  return (
    <div style={{ background: "rgba(232,185,138,0.12)", border: "1px solid rgba(232,185,138,0.25)", borderRadius: 12, padding: "1.5rem" }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontWeight: 400, color: "var(--color-umber)", marginBottom: "1.25rem" }}>Your Order</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.25rem" }}>
        {items.map(item => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {item.img && <img src={item.img} alt={item.name} width={48} height={48} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-umber)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "var(--color-umber)", opacity: 0.5 }}>Qty {item.quantity}</div>
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "var(--color-umber)", flexShrink: 0 }}>
              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid rgba(107,115,38,0.15)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "var(--color-umber)", opacity: 0.6 }}>
          <span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "var(--color-umber)", opacity: 0.6 }}>
          <span>Shipping</span>
          <span style={{ color: shipping === 0 ? "var(--color-gold)" : undefined }}>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--color-umber)", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(107,115,38,0.15)" }}>
          <span>Total</span><span>₹{(subtotal + shipping).toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  // Form state
  const [step,        setStep]        = useState<Step>("contact");
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [line1,       setLine1]       = useState("");
  const [line2,       setLine2]       = useState("");
  const [city,        setCity]        = useState("");
  const [state,       setState]       = useState("");
  const [pincode,     setPincode]     = useState("");
  const [payMethod,   setPayMethod]   = useState<PayMethod>("razorpay");
  const [processing,  setProcessing]  = useState(false);
  const [errorMsg,    setErrorMsg]    = useState("");

  const shipping = total >= 1000 ? 0 : 99;
  const grandTotal = total + shipping;

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) navigate({ to: "/cart" });
  }, [items.length]);

  // ── Pincode auto-fill ──
  useEffect(() => {
    if (pincode.length !== 6) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();
        if (data[0]?.Status === "Success") {
          const p = data[0].PostOffice[0];
          setCity(prev => prev || p.Division);
          setState(prev => prev || p.State);
        }
      } catch { /* silent */ }
    }, 400);
    return () => clearTimeout(timer);
  }, [pincode]);

  // ── Save order to Supabase ──
  const saveOrder = async (razorpayOrderId: string | null, razorpayPaymentId: string | null, status: string) => {
    const { data, error } = await supabase.from("orders").insert({
      razorpay_order_id:   razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      customer_name:   name.trim(),
      customer_email:  email.trim() || null,
      customer_phone:  phone.trim(),
      shipping_address: { line1, line2, city, state, pincode, country: "India" },
      items: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, img: i.img })),
      subtotal:     total,
      shipping_fee: shipping,
      total_amount: grandTotal,
      status,
    }).select("id").single();
    if (error) throw error;
    return data.id as string;
  };

  // ── Razorpay payment ──
  const handleRazorpay = async () => {
    setProcessing(true);
    setErrorMsg("");
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Could not load payment gateway. Check your internet connection.");

      // Create order via Supabase Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/create-razorpay-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` },
        body: JSON.stringify({ amount: grandTotal * 100, currency: "INR", receipt: `lj_${Date.now()}` }),
      });
      const rzpData = await res.json();
      if (!res.ok || !rzpData.order_id) throw new Error(rzpData.error ?? "Payment setup failed. Please try again.");

      // Open Razorpay modal
      const rzp = new window.Razorpay({
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID as string,
        amount:      rzpData.amount,
        currency:    rzpData.currency,
        order_id:    rzpData.order_id,
        name:        "Lattév Jouel",
        description: `Order of ${items.length} piece${items.length > 1 ? "s" : ""}`,
        image:       "/lattev_transparent.webp",
        prefill:     { name, email, contact: phone },
        theme:       { color: "#6B7326" },
        handler: async (response) => {
          try {
            const orderId = await saveOrder(rzpData.order_id, response.razorpay_payment_id, "paid");
            clearCart();
            navigate({ to: "/order/$id", params: { id: orderId } });
          } catch {
            setErrorMsg("Payment succeeded but we couldn't save your order. Please WhatsApp us immediately.");
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      rzp.open();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  // ── COD order ──
  const handleCOD = async () => {
    setProcessing(true);
    setErrorMsg("");
    try {
      const orderId = await saveOrder(null, null, "cod_pending");
      clearCart();
      navigate({ to: "/order/$id", params: { id: orderId } });
    } catch {
      setErrorMsg("Could not place your order. Please try again or WhatsApp us.");
      setProcessing(false);
    }
  };

  // ── Step validation ──
  const contactOk = name.trim().length >= 2 && phone.trim().length >= 10;
  const addressOk = line1.trim() && city.trim() && state.trim() && pincode.trim().length === 6;

  const nextStep = () => {
    if (step === "contact" && contactOk) setStep("address");
    else if (step === "address" && addressOk) setStep("review");
    else if (step === "review") setStep("payment");
  };
  const prevStep = () => {
    if (step === "address") setStep("contact");
    else if (step === "review") setStep("address");
    else if (step === "payment") setStep("review");
  };

  return (
    <div style={{ background: "var(--background)", color: "var(--foreground)", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "1rem 2rem", background: "rgba(232,185,138,0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(107,115,38,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 900, margin: "0 auto" }}>
          <Link to="/cart" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--color-gold)", opacity: 0.8 }} className="hover:opacity-100 transition-opacity">
            ← Cart
          </Link>
          <Link to="/" aria-label="Home">
            <img src="/lattev_transparent.webp" alt="Lattév Jouel" width={44} height={44} style={{ height: 44, width: "auto" }} />
          </Link>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--color-gold)", opacity: 0.55 }}>
            Secure Checkout
          </div>
        </div>
      </nav>

      {/* Body */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "7rem 1.5rem 4rem" }}>
        <h1 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 300, color: "var(--color-umber)", marginBottom: "0.5rem" }}>Checkout</h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "var(--color-umber)", opacity: 0.45, marginBottom: "2.5rem", letterSpacing: "0.05em" }}>
          Secured by 256-bit SSL encryption
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2.5rem", alignItems: "start" }} className="checkout-grid">
          {/* Left: Steps */}
          <div>
            <StepBar current={step} />

            {/* ── Step 1: Contact ── */}
            {step === "contact" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <Field id="checkout-name"  label="Full Name"    value={name}  onChange={setName}  placeholder="Lavanya Pahwa" required />
                <Field id="checkout-phone" label="Phone"        value={phone} onChange={setPhone} type="tel" placeholder="+91 98765 43210" required hint="We'll send order updates on WhatsApp" />
                <Field id="checkout-email" label="Email"        value={email} onChange={setEmail} type="email" placeholder="you@example.com" hint="Optional — for order confirmation email" />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                  <button onClick={nextStep} disabled={!contactOk} style={{ padding: "0.9rem 2rem", background: contactOk ? "linear-gradient(135deg,#4F5820,#6B7326)" : "rgba(107,115,38,0.2)", color: contactOk ? "#fff" : "var(--color-umber)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, border: "none", borderRadius: 8, cursor: contactOk ? "pointer" : "not-allowed", opacity: contactOk ? 1 : 0.5, transition: "all 0.2s" }}>
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Address ── */}
            {step === "address" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <Field id="checkout-line1"   label="Address Line 1" value={line1}   onChange={setLine1}   placeholder="Flat / House No, Building, Street" required />
                <Field id="checkout-line2"   label="Address Line 2" value={line2}   onChange={setLine2}   placeholder="Area, Landmark (optional)" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <Field id="checkout-pincode" label="Pincode" value={pincode} onChange={setPincode} type="tel" placeholder="400001" required hint="City & state auto-fill" />
                  <Field id="checkout-city"    label="City"    value={city}    onChange={setCity}    placeholder="Mumbai" required />
                </div>
                <Field id="checkout-state" label="State" value={state} onChange={setState} placeholder="Maharashtra" required />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                  <button onClick={prevStep} style={{ padding: "0.9rem 1.5rem", background: "transparent", color: "var(--color-umber)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, border: "1px solid rgba(107,115,38,0.25)", borderRadius: 8, cursor: "pointer" }}>
                    ← Back
                  </button>
                  <button onClick={nextStep} disabled={!addressOk} style={{ padding: "0.9rem 2rem", background: addressOk ? "linear-gradient(135deg,#4F5820,#6B7326)" : "rgba(107,115,38,0.2)", color: addressOk ? "#fff" : "var(--color-umber)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, border: "none", borderRadius: 8, cursor: addressOk ? "pointer" : "not-allowed", opacity: addressOk ? 1 : 0.5, transition: "all 0.2s" }}>
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Review ── */}
            {step === "review" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Contact summary */}
                <ReviewBlock title="Contact" onEdit={() => setStep("contact")}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "var(--color-umber)", opacity: 0.75, lineHeight: 1.8 }}>
                    {name} · {phone}{email && ` · ${email}`}
                  </div>
                </ReviewBlock>
                {/* Address summary */}
                <ReviewBlock title="Ship to" onEdit={() => setStep("address")}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "var(--color-umber)", opacity: 0.75, lineHeight: 1.8 }}>
                    {line1}{line2 ? `, ${line2}` : ""}<br />{city}, {state} — {pincode}<br />India
                  </div>
                </ReviewBlock>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                  <button onClick={prevStep} style={{ padding: "0.9rem 1.5rem", background: "transparent", color: "var(--color-umber)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, border: "1px solid rgba(107,115,38,0.25)", borderRadius: 8, cursor: "pointer" }}>
                    ← Back
                  </button>
                  <button onClick={nextStep} style={{ padding: "0.9rem 2rem", background: "linear-gradient(135deg,#4F5820,#6B7326)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer" }}>
                    Choose Payment →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 4: Payment ── */}
            {step === "payment" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Payment method selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <PayMethodCard
                    id="pay-razorpay"
                    selected={payMethod === "razorpay"}
                    onSelect={() => setPayMethod("razorpay")}
                    title="Pay Now"
                    subtitle="UPI · Cards · Net Banking · Wallets"
                    badge="🔒 Secured by Razorpay"
                  >
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
                      {["UPI", "VISA", "MC", "RuPay", "NetBanking"].map(b => (
                        <span key={b} style={{ padding: "0.15rem 0.5rem", borderRadius: 4, border: "1px solid rgba(107,115,38,0.2)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-umber)", opacity: 0.55 }}>{b}</span>
                      ))}
                    </div>
                  </PayMethodCard>

                  <PayMethodCard
                    id="pay-cod"
                    selected={payMethod === "cod"}
                    onSelect={() => setPayMethod("cod")}
                    title="Cash on Delivery"
                    subtitle="Pay when your order arrives"
                    badge="📦 Available across India"
                  />
                </div>

                {errorMsg && (
                  <div style={{ background: "rgba(160,60,60,0.08)", border: "1px solid rgba(160,60,60,0.2)", borderRadius: 8, padding: "0.75rem 1rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "#a03c3c" }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button onClick={prevStep} disabled={processing} style={{ padding: "0.9rem 1.5rem", background: "transparent", color: "var(--color-umber)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, border: "1px solid rgba(107,115,38,0.25)", borderRadius: 8, cursor: "pointer" }}>
                    ← Back
                  </button>
                  <button
                    onClick={payMethod === "cod" ? handleCOD : handleRazorpay}
                    disabled={processing}
                    style={{ flex: 1, padding: "0.9rem 1.5rem", background: processing ? "rgba(79,88,32,0.4)" : "linear-gradient(135deg,#4F5820,#6B7326)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, border: "none", borderRadius: 8, cursor: processing ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                  >
                    {processing
                      ? "Processing…"
                      : payMethod === "cod"
                      ? `Place COD Order — ₹${grandTotal.toLocaleString("en-IN")}`
                      : `Pay ₹${grandTotal.toLocaleString("en-IN")} →`
                    }
                  </button>
                </div>

                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "var(--color-umber)", opacity: 0.38, textAlign: "center" }}>
                  By placing your order you agree to our <Link to="/policies/terms" style={{ color: "var(--color-gold)", textDecoration: "underline" }}>Terms</Link> and <Link to="/policies/returns" style={{ color: "var(--color-gold)", textDecoration: "underline" }}>Returns Policy</Link>.
                </p>
              </div>
            )}
          </div>

          {/* Right: Order sidebar */}
          <div className="checkout-sidebar">
            <OrderSidebar items={items} subtotal={total} shipping={shipping} />
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 700px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
          .checkout-sidebar { order: -1; }
        }
      `}</style>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────
function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(232,185,138,0.08)", border: "1px solid rgba(232,185,138,0.2)", borderRadius: 10, padding: "1rem 1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-gold)", opacity: 0.8 }}>{title}</span>
        <button onClick={onEdit} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-gold)", background: "none", border: "none", cursor: "pointer", opacity: 0.7 }}>Edit</button>
      </div>
      {children}
    </div>
  );
}

function PayMethodCard({ id, selected, onSelect, title, subtitle, badge, children }: {
  id: string; selected: boolean; onSelect: () => void;
  title: string; subtitle: string; badge: string; children?: React.ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onSelect}
      style={{
        width: "100%", textAlign: "left", padding: "1rem 1.25rem", borderRadius: 10, cursor: "pointer",
        background: selected ? "rgba(107,115,38,0.07)" : "rgba(232,185,138,0.05)",
        border: `2px solid ${selected ? "var(--color-gold)" : "rgba(107,115,38,0.18)"}`,
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", fontWeight: 700, color: "var(--color-umber)", marginBottom: "0.2rem" }}>{title}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "var(--color-umber)", opacity: 0.55 }}>{subtitle}</div>
        </div>
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${selected ? "var(--color-gold)" : "rgba(107,115,38,0.3)"}`, background: selected ? "var(--color-gold)" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
          {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
        </div>
      </div>
      <div style={{ marginTop: "0.5rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem", color: "var(--color-gold)", opacity: 0.7 }}>{badge}</div>
      {children}
    </button>
  );
}
