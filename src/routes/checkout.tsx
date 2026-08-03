import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Lattév Jouel" },
      {
        name: "description",
        content: "Complete your order from Lattév Jouel.",
      },
    ],
  }),
  component: CheckoutPage,
});

// ─── Checkout Page ───────────────────────────────────────────────────────────

function CheckoutPage() {
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
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link
            to="/cart"
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
            ← Cart
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
              color: "var(--color-gold)",
            }}
          >
            Offline
          </div>
        </div>
      </nav>

      {/* ── Body ── */}
      <section
        style={{
          padding: "8rem 1.5rem 6rem",
          background: "var(--background)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", color: "var(--color-gold)", marginBottom: "1rem" }}>
            Online Checkout is Offline
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "var(--color-ivory)", opacity: 0.8, marginBottom: "2rem", lineHeight: 1.6 }}>
            Our online payment gateway is currently down for maintenance. Please DM us on Instagram to finalize your order and arrange payment.
          </p>
          <a
            href="https://instagram.com/lattevjouel"
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass-btn"
            style={{ display: "inline-block" }}
          >
            DM @lattevjouel to Buy →
          </a>
        </div>
      </section>
    </div>
  );
}
