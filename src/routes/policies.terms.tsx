import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

const logoAsset = { url: "/lattev_transparent.png" };

export const Route = createFileRoute("/policies/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Lattév Jouel" },
      { name: "description", content: "Lattév Jouel Terms & Conditions and Frequently Asked Questions." },
    ],
  }),
  component: TermsPage,
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
const h3Style: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "1.15rem", color: "var(--color-gold)", marginTop: "1.75rem", marginBottom: "0.5rem" };
const liStyle: React.CSSProperties = { ...prose, marginBottom: "0.5rem", paddingLeft: "0.25rem" };
const qaStyle: React.CSSProperties = { borderBottom: "1px solid rgba(107,115,38,0.12)", paddingBottom: "1.25rem", marginBottom: "1.25rem" };

function TermsPage() {
  return (
    <PolicyLayout title="Terms & Conditions" eyebrow="Lattév Jouel">
      <p style={prose}>Welcome to Lattév. By accessing our website and placing an order, you agree to the following Terms & Conditions. Please read them carefully before making a purchase.</p>

      {[
        { n: "1. General", items: ["These Terms & Conditions govern the use of the Lattév website and all purchases made through it.", "By placing an order, you confirm that you have read, understood, and agreed to these terms."] },
        { n: "2. Product Information", items: ["We strive to display our products as accurately as possible. However, slight variations in colour may occur due to differences in screen settings, lighting, and photography.", "Product dimensions are approximate and may vary slightly."] },
        { n: "3. Pricing & Payments", items: ["All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.", "Full payment must be received before an order is processed.", "We reserve the right to modify product prices at any time without prior notice."] },
        { n: "4. Order Acceptance", items: ["Placing an order does not guarantee its acceptance.", "Lattév reserves the right to refuse or cancel any order due to product unavailability, pricing errors, suspected fraudulent activity, or other unforeseen circumstances.", "If your order is cancelled after payment, a full refund will be processed to the original payment method."] },
        { n: "5. Shipping", items: ["Orders are processed within 2 working days.", "Estimated delivery time is 5–10 business days.", "Please refer to our Shipping Policy for complete details."] },
        { n: "6. Cancellations, Returns & Exchanges", items: ["Orders may be cancelled within 12 hours by contacting us via our official Instagram DM.", "We do not accept returns or exchanges except for damaged or incorrect items meeting the criteria in our Returns Policy."] },
        { n: "7. Customer Responsibilities", items: ["Customers are responsible for providing accurate shipping and contact information.", "Lattév will not be responsible for delays or failed deliveries due to incorrect information provided by the customer."] },
        { n: "8. Intellectual Property", items: ["All content on this website — photographs, product images, logos, graphics, text, and designs — is the property of Lattév.", "No content may be copied, reproduced, or used without prior written permission from Lattév."] },
        { n: "9. Limitation of Liability", items: ["Lattév shall not be liable for any indirect, incidental, or consequential damages.", "Our liability shall be limited to the purchase price of the product in question."] },
        { n: "10. Privacy", items: ["Your personal information is handled in accordance with our Privacy Policy. By using our website, you consent to the collection and use of your information as described therein."] },
        { n: "11. Governing Law", items: ["These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Bareilly, Uttar Pradesh."] },
        { n: "12. Changes to These Terms", items: ["Lattév reserves the right to update or modify these Terms at any time. Changes will be effective immediately upon being published on the website."] },
      ].map(({ n, items }) => (
        <div key={n}>
          <h2 style={h2Style}>{n}</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((i) => <li key={i} style={liStyle}>· {i}</li>)}
          </ul>
        </div>
      ))}

      {/* FAQs */}
      <h2 style={{ ...h2Style, marginTop: "4rem" }}>Frequently Asked Questions</h2>

      {[
        { q: "What kind of jewellery does Lattév offer?", a: "Lattév offers thoughtfully curated fashion jewellery designed to elevate your everyday style. Our collection includes anti-tarnish pieces that are stylish, lightweight, and made to complement every occasion." },
        { q: "Is your jewellery anti-tarnish?", a: "Most of our collections are made using anti-tarnish stainless steel. Product specifications are mentioned on each product page, so please check the description before purchasing." },
        { q: "Is the jewellery waterproof?", a: "Our anti-tarnish collections are designed to withstand everyday wear. However, to extend the life and shine of your jewellery, we recommend avoiding prolonged exposure to perfumes, harsh chemicals, chlorine, and salt water." },
        { q: "Is your jewellery hypoallergenic?", a: "Most of our anti-tarnish jewellery is skin-friendly and suitable for sensitive skin. If you have specific allergies, please refer to the product description or contact us before placing your order." },
        { q: "How long does shipping take?", a: "Orders are processed within 2 working days and are usually delivered within 5–10 business days, depending on your location." },
        { q: "Do you offer free shipping?", a: "Yes. We offer free shipping on all orders above ₹1,000." },
        { q: "Can I cancel my order?", a: "Yes. Orders can be cancelled within 12 hours of placing them by sending us a DM on our official Instagram page. Orders that have already been processed or shipped cannot be cancelled." },
        { q: "Do you accept returns or exchanges?", a: "We do not accept returns or exchanges once an order has been delivered. If you receive a damaged or incorrect item, please contact us within 24 hours with an uninterrupted unboxing video." },
        { q: "How can I track my order?", a: "Once your order is shipped, you'll receive a tracking link via email or WhatsApp (if provided)." },
        { q: "How should I care for my jewellery?", a: "Store it in a dry place, away from perfumes and harsh chemicals. Wipe gently with a soft cloth after use, and store in its pouch or box when not in use." },
        { q: "Will the product look exactly like the photos?", a: "We make every effort to display our jewellery as accurately as possible. However, slight colour variations may occur due to lighting and different screen settings." },
        { q: "How can I contact Lattév?", a: "You can reach us through our Contact section or send us a DM on Instagram. We're happy to help with any questions before or after your purchase." },
      ].map(({ q, a }) => (
        <div key={q} style={qaStyle}>
          <h3 style={h3Style}>{q}</h3>
          <p style={prose}>{a}</p>
        </div>
      ))}
    </PolicyLayout>
  );
}
