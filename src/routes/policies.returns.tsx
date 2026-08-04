import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

const logoAsset = { url: "/lattev_transparent.png" };

export const Route = createFileRoute("/policies/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Cancellation — Lattév Jouel" },
      { name: "description", content: "Lattév Jouel cancellation, returns and exchange policy." },
    ],
  }),
  component: ReturnsPolicy,
});

function PolicyLayout({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fafaf7", color: "var(--color-umber)" }}>
      <nav style={{ background: "rgba(240,213,180,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(107,115,38,0.15)", padding: "1.2rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link to="/" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gold)", textDecoration: "none" }}>← Home</Link>
        <img src={logoAsset.url} alt="Lattév Jouel" style={{ height: 44, width: "auto" }} />
        <Link to="/shop" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gold)", textDecoration: "none" }}>Shop</Link>
      </nav>
      <div style={{ background: "#E8B98A", padding: "5rem 1.5rem 3.5rem", textAlign: "center", borderBottom: "1px solid rgba(107,115,38,0.15)" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--color-gold)", marginBottom: "0.75rem" }}>{eyebrow}</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(2.2rem, 5vw, 3.8rem)", lineHeight: 1.1, color: "var(--color-umber)" }}>{title}</h1>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 1.5rem 8rem" }}>{children}</div>
      <div style={{ background: "#E8B98A", borderTop: "1px solid rgba(107,115,38,0.15)", padding: "3rem 1.5rem", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <Link to="/policies/shipping" style={{ color: "var(--color-gold)", textDecoration: "none" }}>Shipping</Link>
          <Link to="/policies/returns" style={{ color: "var(--color-gold)", textDecoration: "none" }}>Returns</Link>
          <Link to="/policies/terms" style={{ color: "var(--color-gold)", textDecoration: "none" }}>Terms & FAQs</Link>
        </div>
        <div style={{ marginTop: "1.5rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", opacity: 0.4 }}>© {new Date().getFullYear()} Lattév Jouel</div>
      </div>
    </div>
  );
}

const prose: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.85, color: "var(--color-umber)", opacity: 0.8 };
const h2Style: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "1.5rem", color: "var(--color-umber)", marginTop: "2.5rem", marginBottom: "0.75rem", letterSpacing: "0.03em" };
const liStyle: React.CSSProperties = { ...prose, marginBottom: "0.5rem", paddingLeft: "0.25rem" };

function ReturnsPolicy() {
  return (
    <PolicyLayout title="Returns & Cancellation" eyebrow="Lattév Jouel">
      <h2 style={{ ...h2Style, marginTop: 0 }}>Order Cancellation</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li style={liStyle}>· Orders may be cancelled within 12 hours of placing the order.</li>
        <li style={liStyle}>· To request a cancellation, please send us a DM on our official Instagram page with your order details.</li>
        <li style={liStyle}>· Once an order has been processed or shipped, it cannot be cancelled.</li>
      </ul>

      <h2 style={h2Style}>Returns & Exchange</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li style={liStyle}>· We do not accept returns or exchanges for any products once they have been delivered.</li>
        <li style={liStyle}>· Returns or exchanges due to change of mind, personal preference, or incorrect orders placed by the customer will not be accepted.</li>
      </ul>

      <h2 style={h2Style}>Damaged or Incorrect Items</h2>
      <p style={prose}>In the unlikely event that you receive a damaged, defective, or incorrect item, please contact us within 24 hours of delivery.</p>
      <p style={{ ...prose, marginTop: "0.75rem" }}>To be eligible for a replacement or resolution, you must provide:</p>
      <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0" }}>
        <li style={liStyle}>· An uninterrupted unboxing video starting before the sealed package is opened.</li>
        <li style={liStyle}>· The video must continue without any cuts or edits until all contents are fully shown.</li>
        <li style={liStyle}>· Clear photographs of the damaged or incorrect item.</li>
      </ul>
      <p style={{ ...prose, marginTop: "0.75rem" }}>Claims submitted without a continuous unboxing video will not be eligible for replacement or resolution.</p>
      <p style={{ ...prose, marginTop: "0.75rem" }}>Lattév reserves the right to verify all claims before approving a replacement.</p>
    </PolicyLayout>
  );
}
