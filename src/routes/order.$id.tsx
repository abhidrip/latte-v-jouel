import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [{ title: "Order Confirmed — Lattév Jouel" }],
  }),
  component: OrderConfirmPage,
});

type OrderItem = { name: string; price: number; quantity: number; img?: string };
type Order = {
  id: string;
  status: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  shipping_address: { line1: string; line2?: string; city: string; state: string; pincode: string };
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  razorpay_payment_id?: string;
  created_at: string;
};

function OrderConfirmPage() {
  const { id } = Route.useParams();
  const confettiRef = useRef<HTMLDivElement>(null);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Order;
    },
  });

  // Simple confetti burst on mount
  useEffect(() => {
    const el = confettiRef.current;
    if (!el) return;
    const colors = ["#6B7326","#E8B98A","#C9A96E","#4F5820","#fff"];
    for (let i = 0; i < 48; i++) {
      const dot = document.createElement("div");
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 6 + Math.random() * 8;
      const angle = Math.random() * 360;
      const dist  = 80 + Math.random() * 120;
      dot.style.cssText = `
        position:absolute; width:${size}px; height:${size}px;
        border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
        background:${color}; left:50%; top:50%;
        pointer-events:none; opacity:0;
        animation: confetti-${i} 0.9s ease-out forwards;
        animation-delay: ${Math.random() * 0.2}s;
      `;
      const keyframes = `
        @keyframes confetti-${i} {
          0%   { transform: translate(-50%,-50%) scale(0); opacity:1; }
          100% { transform: translate(calc(-50% + ${Math.cos(angle * Math.PI / 180) * dist}px), calc(-50% + ${Math.sin(angle * Math.PI / 180) * dist}px)) scale(0.5); opacity:0; }
        }
      `;
      const style = document.createElement("style");
      style.textContent = keyframes;
      document.head.appendChild(style);
      el.appendChild(dot);
    }
    return () => { while (el.firstChild) el.removeChild(el.firstChild); };
  }, [order?.id]);

  const isCOD = order?.status === "cod_pending";

  if (isLoading) {
    return (
      <div style={{ background: "var(--background)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4 }}>Loading your order…</div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div style={{ background: "var(--background)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", opacity: 0.5 }}>Order not found.</div>
        <Link to="/" className="liquid-glass-btn" style={{ display: "inline-block" }}>Back to Home</Link>
      </div>
    );
  }

  const addr = order.shipping_address;

  return (
    <div style={{ background: "var(--background)", color: "var(--foreground)", minHeight: "100vh" }}>
      {/* Minimal nav */}
      <nav style={{ padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(232,185,138,0.2)" }}>
        <Link to="/" aria-label="Home">
          <img src="/lattev_transparent.webp" alt="Lattév Jouel" width={48} height={48} style={{ height: 48, width: "auto" }} />
        </Link>
      </nav>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "4rem 1.5rem 6rem" }}>
        {/* Confetti burst */}
        <div ref={confettiRef} style={{ position: "relative", width: 1, height: 1, margin: "0 auto 3rem" }} />

        {/* Hero confirmation */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #4F5820, #6B7326)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "1.8rem" }}>
            ✓
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 6vw, 3.2rem)", fontWeight: 300, color: "var(--color-umber)", lineHeight: 1.1, marginBottom: "0.75rem" }}>
            {isCOD ? "Order Placed!" : "Payment Confirmed!"}
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", color: "var(--color-umber)", opacity: 0.65, lineHeight: 1.8, maxWidth: 420, margin: "0 auto" }}>
            {isCOD
              ? `Thank you, ${order.customer_name.split(" ")[0]}. Your COD order has been placed and will be packed soon.`
              : `Thank you, ${order.customer_name.split(" ")[0]}. Your payment was received and we're packing your order now.`
            }
          </p>
        </div>

        {/* Order reference */}
        <div style={{ background: "rgba(107,115,38,0.06)", border: "1px solid rgba(107,115,38,0.15)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-gold)", opacity: 0.8, marginBottom: "0.2rem" }}>Order ID</div>
            <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--color-umber)", opacity: 0.6 }}>{order.id.split("-")[0].toUpperCase()}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-gold)", opacity: 0.8, marginBottom: "0.2rem" }}>Status</div>
            <StatusPill status={order.status} />
          </div>
        </div>

        {/* Items */}
        <div style={{ background: "rgba(232,185,138,0.08)", border: "1px solid rgba(232,185,138,0.18)", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 400, color: "var(--color-umber)", marginBottom: "1rem" }}>Items Ordered</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {item.img && <img src={item.img} alt={item.name} width={44} height={44} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-umber)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", color: "var(--color-umber)", opacity: 0.45 }}>Qty {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</div>
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-umber)", flexShrink: 0 }}>
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(107,115,38,0.12)", marginTop: "1rem", paddingTop: "0.85rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "var(--color-umber)", opacity: 0.55 }}>
              <span>Shipping</span><span>{order.shipping_fee === 0 ? "Free" : `₹${order.shipping_fee}`}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--color-umber)" }}>
              <span>Total</span><span>₹{order.total_amount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div style={{ background: "rgba(232,185,138,0.08)", border: "1px solid rgba(232,185,138,0.18)", borderRadius: 12, padding: "1.25rem", marginBottom: "2.5rem" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 400, color: "var(--color-umber)", marginBottom: "0.6rem" }}>Delivering To</h3>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "var(--color-umber)", opacity: 0.7, lineHeight: 1.9 }}>
            <strong>{order.customer_name}</strong><br />
            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
            {addr.city}, {addr.state} — {addr.pincode}<br />
            India · {order.customer_phone}
          </div>
        </div>

        {/* What's next */}
        <div style={{ background: "rgba(107,115,38,0.05)", border: "1px solid rgba(107,115,38,0.12)", borderRadius: 12, padding: "1.5rem", marginBottom: "2.5rem" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 400, color: "var(--color-umber)", marginBottom: "1rem" }}>What Happens Next</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {(isCOD ? [
              { icon: "📦", text: "We'll pack your order within 1-2 business days." },
              { icon: "🚚", text: "You'll receive a tracking link on WhatsApp once shipped." },
              { icon: "💵", text: "Pay the delivery agent when your order arrives." },
            ] : [
              { icon: "✅", text: "Payment received. We're preparing your order now." },
              { icon: "📦", text: "Your order will be packed within 1-2 business days." },
              { icon: "🚚", text: "You'll receive a tracking link on WhatsApp once shipped." },
            ]).map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{step.icon}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "var(--color-umber)", opacity: 0.7, lineHeight: 1.7 }}>{step.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
          <Link
            to="/shop"
            search={{ category: "all" }}
            className="liquid-glass-btn"
            style={{ display: "inline-block" }}
          >
            Continue Shopping
          </Link>
          <a
            href={`https://wa.me/918077762221?text=${encodeURIComponent(`Hi! I just placed order ${order.id.split("-")[0].toUpperCase()} on lattevjouel.com. Looking forward to it! 💛`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-gold)", opacity: 0.7 }}
          >
            💬 Message us on WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    paid:        { label: "Paid",         bg: "rgba(40,167,69,0.12)",  color: "#2a7a1f" },
    cod_pending: { label: "COD Pending",  bg: "rgba(185,120,40,0.12)", color: "#b97828" },
    pending:     { label: "Pending",      bg: "rgba(107,115,38,0.1)",  color: "#4f5820" },
    processing:  { label: "Processing",   bg: "rgba(40,100,200,0.1)",  color: "#2864c8" },
    shipped:     { label: "Shipped",      bg: "rgba(40,100,200,0.12)", color: "#2864c8" },
    delivered:   { label: "Delivered",    bg: "rgba(40,167,69,0.15)",  color: "#2a7a1f" },
    cancelled:   { label: "Cancelled",    bg: "rgba(160,60,60,0.1)",   color: "#a03c3c" },
  };
  const s = map[status] ?? { label: status, bg: "rgba(107,115,38,0.1)", color: "#4f5820" };
  return (
    <span style={{ display: "inline-block", padding: "0.2rem 0.65rem", borderRadius: 999, background: s.bg, color: s.color, fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {s.label}
    </span>
  );
}
