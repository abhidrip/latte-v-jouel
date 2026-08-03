import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { useEffect } from "react";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

type Product = {
  id: string;
  name: string;
  price?: number;
  was?: number;
  img?: string;
  sold?: boolean;
  category: string;
  description?: string;
};

function ProductPage() {
  const { id } = Route.useParams();
  const { addItem, count } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!supabase.supabaseUrl) return null;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq(isUUID ? 'id' : 'name', id)
        .single();
        
      if (error) {
        console.error("Supabase fetch error:", error);
        return null;
      }
      return data as Product;
    }
  });

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div style={{ background: "#E8B98A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "2px solid rgba(107,115,38,0.3)", borderTopColor: "var(--color-gold)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ background: "#E8B98A", color: "#3D3416", minHeight: "100vh", padding: "10rem 2rem", textAlign: "center" }}>
        <h1 className="font-display" style={{ fontSize: "2rem" }}>Product not found.</h1>
        <Link to="/shop" className="liquid-glass-btn" style={{ display: "inline-block", marginTop: "2rem" }}>
          ← Return to Collection
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--background)", color: "var(--foreground)", minHeight: "100vh" }}>
      {/* ── Nav ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "1.15rem 2rem",
          background: "rgba(232,185,138,0.82)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(107,115,38,0.18)",
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
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
              style={{ height: "clamp(40px, 4vw, 56px)", width: "auto", display: "block" }}
            />
          </Link>
          <Link
            to="/cart"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.62rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
            }}
          >
            Cart ({count})
          </Link>
        </div>
      </nav>

      {/* ── Body ── */}
      <section style={{ paddingTop: "6rem", minHeight: "100vh" }}>
        <div className="grid md:grid-cols-2 gap-0 items-stretch min-h-[calc(100vh-6rem)]">
          {/* Left: Image */}
          <div style={{ position: "relative", minHeight: "50vh", background: "var(--background)" }}>
            {product.img ? (
              <img 
                src={product.img} 
                alt={product.name}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.3 }}>
                <span style={{ fontFamily: "'DM Sans'", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.8rem" }}>Archive Piece</span>
              </div>
            )}
            {product.sold && (
              <div style={{ position: "absolute", top: "2rem", left: "2rem", background: "rgba(107,115,38,0.9)", color: "white", padding: "0.4rem 1.2rem", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.2em", borderRadius: "100px" }}>
                Sold Out
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div style={{ padding: "4rem 3rem", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 600, margin: "0 auto" }}>
            <div className="uppercase tracking-luxe font-semibold" style={{ color: "var(--color-gold-soft)", marginBottom: "1.5rem", fontSize: "0.75rem" }}>
              {product.category}
            </div>
            
            <h1 className="font-display" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1.1, color: "var(--color-ivory)", marginBottom: "1rem", fontWeight: 300 }}>
              {product.name}
            </h1>
            
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1.1rem", color: "var(--color-ivory)", opacity: 0.9, marginBottom: "2rem" }}>
              {product.price ? (
                <span>
                  ₹{product.price.toLocaleString("en-IN")}
                  {product.was && <span style={{ textDecoration: "line-through", opacity: 0.5, marginLeft: "0.75rem", fontSize: "0.9em" }}>₹{product.was.toLocaleString("en-IN")}</span>}
                </span>
              ) : (
                <span>Price upon request</span>
              )}
            </div>

            {product.description && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--color-ivory)", opacity: 0.8, marginBottom: "3rem", borderTop: "1px solid rgba(232,185,138,0.2)", paddingTop: "2rem" }}>
                {product.description}
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "auto" }}>
              {!product.sold && product.price ? (
                <button 
                  onClick={() => addItem({ name: product.name, price: product.price!, img: product.img, href: `/product/${product.id}` })}
                  className="liquid-glass-btn"
                  style={{ width: "100%", textAlign: "center", background: "var(--color-gold)", color: "white", padding: "1.2rem", border: "none" }}
                >
                  + Add to Cart
                </button>
              ) : null}

              <a 
                href="https://instagram.com/lattevjouel" 
                target="_blank" 
                rel="noopener noreferrer"
                className="liquid-glass-btn"
                style={{ width: "100%", textAlign: "center", background: "transparent", color: "var(--color-ivory)", border: "1px solid rgba(232,185,138,0.4)" }}
              >
                DM @lattevjouel to Buy
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
