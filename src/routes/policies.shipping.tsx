import { createFileRoute, Link } from "@tanstack/react-router";

const logoAsset = { url: "/lattev_transparent.png" };

export const Route = createFileRoute("/policies/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — Lattév Jouel" },
      { name: "description", content: "Lattév Jouel shipping policy: processing times, delivery estimates, charges, and tracking." },
    ],
  }),
  component: ShippingPolicy,
});

function PolicyLayout({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fafaf7", color: "var(--color-umber)" }}>
      {/* Nav */}
      <nav style={{ background: "rgba(240,213,180,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(107,115,38,0.15)", padding: "1.2rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link to="/" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gold)", textDecoration: "none" }}>
          ← Home
        </Link>
        <img src={logoAsset.url} alt="Lattév Jouel" style={{ height: 44, width: "auto" }} />
        <Link to="/shop" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gold)", textDecoration: "none" }}>
          Shop
        </Link>
      </nav>

      {/* Header */}
      <div style={{ background: "#E8B98A", padding: "5rem 1.5rem 3.5rem", textAlign: "center", borderBottom: "1px solid rgba(107,115,38,0.15)" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--color-gold)", marginBottom: "0.75rem" }}>{eyebrow}</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(2.2rem, 5vw, 3.8rem)", lineHeight: 1.1, color: "var(--color-umber)" }}>{title}</h1>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 1.5rem 8rem" }}>
        {children}
      </div>

      {/* Footer */}
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

const prose: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.95rem",
  lineHeight: 1.85,
  color: "var(--color-umber)",
  opacity: 0.8,
};

const h2Style: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 400,
  fontSize: "1.5rem",
  color: "var(--color-umber)",
  marginTop: "2.5rem",
  marginBottom: "0.75rem",
  letterSpacing: "0.03em",
};

const liStyle: React.CSSProperties = {
  ...prose,
  marginBottom: "0.5rem",
  paddingLeft: "0.25rem",
};

import React from "react";

function ShippingPolicy() {
  return (
    <PolicyLayout title="Shipping Policy" eyebrow="Lattév Jouel">
      <p style={prose}>At Lattév, every order is carefully packed to ensure your jewellery reaches you safely and beautifully.</p>

      <h2 style={h2Style}>Order Processing</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li style={liStyle}>· Orders are processed within 2 working days after they are confirmed.</li>
        <li style={liStyle}>· Orders placed on weekends or public holidays will be processed on the next working day.</li>
      </ul>

      <h2 style={h2Style}>Shipping Timeline</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li style={liStyle}>· Estimated delivery time is 5–10 business days, depending on your location.</li>
        <li style={liStyle}>· Delivery timelines may vary slightly for remote areas or due to unforeseen courier delays.</li>
      </ul>

      <h2 style={h2Style}>Shipping Charges</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li style={liStyle}>· Free shipping on all orders above ₹1,000.</li>
        <li style={liStyle}>· Shipping charges for orders below ₹1,000 will be calculated and displayed at checkout.</li>
      </ul>

      <h2 style={h2Style}>Order Tracking</h2>
      <p style={prose}>Once your order has been shipped, you'll receive a tracking link via email or WhatsApp (if provided), allowing you to track your package until it reaches you.</p>

      <h2 style={h2Style}>Delivery Delays</h2>
      <p style={prose}>While we aim to deliver every order within the estimated timeframe, delays may occasionally occur due to weather conditions, public holidays, courier issues, or other unforeseen circumstances. We appreciate your patience and understanding.</p>

      <h2 style={h2Style}>Damaged, Missing or Incorrect Items</h2>
      <p style={prose}>We take great care while packing every order. However, if you receive a damaged package, an incorrect item, or find any item missing, please contact us within 24 hours of delivery.</p>
      <p style={{ ...prose, marginTop: "0.75rem" }}>To process your claim, an uninterrupted unboxing video is mandatory. The video must:</p>
      <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0" }}>
        <li style={liStyle}>· Begin before the package is opened, clearly showing the sealed parcel.</li>
        <li style={liStyle}>· Continue without any cuts, pauses, or edits until all contents are removed and shown.</li>
        <li style={liStyle}>· Clearly display the shipping label and the condition of the products received.</li>
      </ul>
      <p style={{ ...prose, marginTop: "0.75rem" }}>Claims submitted without a continuous unboxing video may not be eligible for replacement or resolution.</p>

      <h2 style={h2Style}>Incorrect Shipping Information</h2>
      <p style={prose}>Please ensure your shipping address and contact details are accurate before placing your order. Lattév cannot be held responsible for delays or failed deliveries due to incorrect or incomplete information provided by the customer.</p>

      <h2 style={h2Style}>Need Help?</h2>
      <p style={prose}>If you have any questions regarding your order or shipping, feel free to reach out to us through our <a href="/#contact" style={{ color: "var(--color-gold)" }}>Contact page</a> or <a href="https://instagram.com/lattevjouel" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-gold)" }}>Instagram DM</a>. We're always happy to help.</p>
    </PolicyLayout>
  );
}
