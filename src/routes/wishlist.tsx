import { createFileRoute, Link } from "@tanstack/react-router";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";

const logoAsset = { url: "/lattev_transparent.webp" };

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Lattév Jouel" },
      { name: "description", content: "Your saved pieces from Lattév Jouel." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { items, removeItem, clearWishlist, count } = useWishlist();
  const { addItem } = useCart();

  return (
    <div style={{ minHeight: "100vh", background: "#E8B98A", color: "var(--color-umber)" }}>
      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(240,213,180,0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(107,115,38,0.2)",
        padding: "1.2rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link to="/shop" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gold)", textDecoration: "none" }}>
          <ArrowLeft size={14} />
          Collection
        </Link>
        <img src={logoAsset.url} alt="Lattév Jouel" style={{ height: 48, width: "auto" }} />
        <Link to="/cart" style={{ color: "var(--color-gold-soft)" }}>
          <ShoppingBag size={20} strokeWidth={1.5} />
        </Link>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "4rem 1.5rem 8rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--color-gold)", marginBottom: "0.5rem" }}>
            Your Saves
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1.05 }}>
            Wishlist
          </h1>
          {count > 0 && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", opacity: 0.5, marginTop: "0.5rem" }}>
              {count} {count === 1 ? "piece" : "pieces"} saved
            </p>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign: "center", paddingTop: "4rem" }}>
            <Heart size={48} strokeWidth={1} style={{ color: "var(--color-gold)", opacity: 0.4, margin: "0 auto 1.5rem" }} />
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 300, opacity: 0.6 }}>
              Nothing saved yet.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", opacity: 0.45, marginTop: "0.5rem" }}>
              Tap the heart on any piece to save it here.
            </p>
            <Link to="/shop" className="liquid-glass-btn" style={{ display: "inline-block", marginTop: "2.5rem" }}>
              Explore Collection
            </Link>
          </div>
        ) : (
          <>
            {/* Wishlist grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}>
              {items.map((item) => (
                <div key={item.id} style={{
                  background: "rgba(255,248,228,0.3)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(107,115,38,0.2)",
                  borderRadius: 16,
                  overflow: "hidden",
                  position: "relative",
                }}>
                  {/* Image */}
                  <a href={item.href || `/product/${item.id}`} style={{ display: "block", aspectRatio: "1", overflow: "hidden" }}>
                    {item.img ? (
                      <img src={item.img} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "rgba(107,115,38,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "var(--color-gold)", opacity: 0.4, fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>No Image</span>
                      </div>
                    )}
                  </a>

                  {/* Remove button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name} from wishlist`}
                    style={{
                      position: "absolute", top: "0.6rem", right: "0.6rem",
                      background: "rgba(232,185,138,0.85)", backdropFilter: "blur(8px)",
                      border: "1px solid rgba(107,115,38,0.25)", borderRadius: "50%",
                      width: 32, height: 32, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Heart size={15} fill="#6B7326" color="#6B7326" />
                  </button>

                  {/* Info */}
                  <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 400, letterSpacing: "0.04em" }}>
                      {item.name}
                    </div>
                    {item.price && (
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", marginTop: "0.3rem", color: "var(--color-gold)" }}>
                        ₹{item.price.toLocaleString("en-IN")}
                        {item.was && <span style={{ marginLeft: "0.4rem", opacity: 0.45, textDecoration: "line-through", fontSize: "0.78rem" }}>₹{item.was.toLocaleString("en-IN")}</span>}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                      {item.price && (
                        <button
                          onClick={() => addItem({ name: item.name, price: item.price!, img: item.img, href: item.href })}
                          className="liquid-glass-btn"
                          style={{ flex: 1, textAlign: "center", fontSize: "0.7rem", padding: "0.65rem 1rem" }}
                        >
                          + Add to Cart
                        </button>
                      )}
                      <a
                        href={item.href || `/product/${item.id}`}
                        style={{
                          flex: 1, textAlign: "center",
                          fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem",
                          letterSpacing: "0.12em", textTransform: "uppercase",
                          color: "var(--color-umber)", opacity: 0.6,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          textDecoration: "none",
                        }}
                      >
                        View →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear all */}
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <button
                onClick={clearWishlist}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem",
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "var(--color-umber)", opacity: 0.35,
                }}
              >
                Clear Wishlist
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
