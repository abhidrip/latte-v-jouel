import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

// ── Route ─────────────────────────────────────────────────────────────────────
type SearchSearch = { q: string };

export const Route = createFileRoute("/search")({
  validateSearch: (raw: Record<string, unknown>): SearchSearch => ({
    q: typeof raw.q === "string" ? raw.q : "",
  }),
  head: ({ match }) => {
    const q = (match.search as SearchSearch).q;
    return {
      meta: [
        { title: `"${q}" — Lattév Jouel Search` },
        { name: "description", content: `Search results for "${q}" on Lattév Jouel.` },
      ],
    };
  },
  component: SearchPage,
});

type Product = {
  id: string;
  name: string;
  price?: number;
  was?: number;
  img?: string;
  sold?: boolean;
  category: string;
};

// ── Fetch all products once, filter client-side ────────────────────────────────
// This avoids a round-trip on every keystroke and lets us do fuzzy matching.
function useSearchProducts(q: string) {
  const { data: all = [], isLoading } = useQuery({
    queryKey: ["products_search_all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, was, img, sold, category")
        .order("name");
      return (data ?? []) as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 min — search index doesn't change often
  });

  const results = useMemo(() => {
    if (!q.trim() || q.trim().length < 2) return [];
    const lower = q.toLowerCase();
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
    );
  }, [all, q]);

  return { results, isLoading };
}

function SearchPage() {
  const { q } = Route.useSearch() as SearchSearch;
  const navigate = useNavigate();
  const [localQ, setLocalQ] = useState(q);
  const { results, isLoading } = useSearchProducts(q);

  // Sync URL when user finishes typing (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQ !== q) {
        navigate({ to: "/search", search: { q: localQ } });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localQ]);

  const categoryMap = useMemo(() => {
    const map: Record<string, Product[]> = {};
    results.forEach((p) => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map;
  }, [results]);

  return (
    <div style={{ background: "var(--background)", color: "var(--foreground)", minHeight: "100vh" }}>
      {/* ── Sticky header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(232,185,138,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(107,115,38,0.18)",
          padding: "1rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Link
            to="/"
            aria-label="Home"
            style={{ flexShrink: 0 }}
          >
            <img
              src="/lattev_transparent.webp"
              alt="Lattév Jouel"
              width={40}
              height={40}
              style={{ height: 40, width: "auto" }}
            />
          </Link>

          {/* Search input */}
          <div style={{ flex: 1, position: "relative" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", opacity: 0.45, pointerEvents: "none" }}
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="search-input"
              autoFocus
              type="search"
              value={localQ}
              onChange={(e) => setLocalQ(e.target.value)}
              placeholder="Search rings, cuffs, bracelets…"
              style={{
                width: "100%",
                padding: "0.7rem 1rem 0.7rem 2.5rem",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.95rem",
                color: "var(--color-umber)",
                background: "rgba(255,248,228,0.6)",
                border: "1.5px solid rgba(107,115,38,0.25)",
                borderRadius: 999,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(107,115,38,0.6)"; }}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(107,115,38,0.25)"; }}
            />
          </div>

          <Link
            to="/shop"
            search={{ category: "all" }}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              opacity: 0.8,
              flexShrink: 0,
            }}
          >
            ← All
          </Link>
        </div>
      </header>

      {/* ── Results ── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        {/* Empty query state */}
        {!q.trim() && (
          <div style={{ textAlign: "center", paddingTop: "4rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✦</div>
            <p className="font-display" style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--color-umber)", opacity: 0.5 }}>
              What are you looking for?
            </p>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.5rem" }}>
              {["rings", "cuffs", "bangles", "bracelets", "pendants"].map((cat) => (
                <Link
                  key={cat}
                  to="/shop"
                  search={{ category: cat as "rings" | "cuffs" | "bangles" | "bracelets" | "pendants" }}
                  style={{
                    padding: "0.4rem 1rem",
                    borderRadius: 999,
                    border: "1px solid rgba(107,115,38,0.3)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.72rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-umber)",
                    textDecoration: "none",
                    opacity: 0.7,
                    transition: "opacity 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(232,185,138,0.2)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.7"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {q.trim() && isLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1.25rem", marginTop: "1rem" }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ borderRadius: 10, overflow: "hidden" }}>
                <div style={{ aspectRatio: "4/5", background: "rgba(232,185,138,0.2)", animation: "skeletonPulse 1.5s ease-in-out infinite" }} />
                <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ height: 14, borderRadius: 6, background: "rgba(232,185,138,0.3)", animation: "skeletonPulse 1.5s ease-in-out infinite" }} />
                  <div style={{ height: 10, width: "60%", borderRadius: 6, background: "rgba(232,185,138,0.2)", animation: "skeletonPulse 1.5s ease-in-out infinite" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {q.trim() && !isLoading && results.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: "4rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔍</div>
            <p className="font-display" style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--color-umber)", opacity: 0.5 }}>
              No pieces found for "{q}"
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", opacity: 0.45, marginTop: "0.5rem" }}>
              Try a different word, or browse the full collection below.
            </p>
            <Link
              to="/shop"
              search={{ category: "all" }}
              className="liquid-glass-btn"
              style={{ display: "inline-block", marginTop: "1.5rem" }}
            >
              Browse Everything
            </Link>
          </div>
        )}

        {/* Results — grouped by category */}
        {q.trim() && !isLoading && results.length > 0 && (
          <div>
            {/* Result count */}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.12em", color: "var(--color-umber)", opacity: 0.5, textTransform: "uppercase", marginBottom: "2rem" }}>
              {results.length} {results.length === 1 ? "piece" : "pieces"} for "{q}"
            </p>

            {Object.entries(categoryMap).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: "3rem" }}>
                {/* Category heading */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--color-gold)", opacity: 0.85 }}>
                    {cat}
                  </div>
                  <div style={{ flex: 1, height: 1, background: "rgba(232,185,138,0.3)" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1.25rem" }}>
                  {items.map((product) => (
                    <SearchResultCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`@keyframes skeletonPulse { 0%,100%{opacity:1}50%{opacity:0.45} }`}</style>
    </div>
  );
}

function SearchResultCard({ product }: { product: Product }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          background: "rgba(232,185,138,0.06)",
          border: "1px solid rgba(232,185,138,0.18)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(107,115,38,0.1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        {/* Image */}
        <div style={{ aspectRatio: "4/5", overflow: "hidden", position: "relative" }}>
          {product.img ? (
            <img
              src={product.img}
              alt={product.name}
              width={400}
              height={500}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "rgba(232,185,138,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ opacity: 0.3, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "'DM Sans'" }}>No image</span>
            </div>
          )}
          {product.sold && (
            <div style={{ position: "absolute", top: "0.6rem", left: "0.6rem", background: "rgba(160,60,60,0.85)", color: "white", padding: "0.2rem 0.6rem", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.12em", borderRadius: 999, fontFamily: "'DM Sans'" }}>
              Sold Out
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "0.85rem 1rem" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "var(--color-umber)", marginBottom: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.name}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "var(--color-gold)" }}>
            {product.price ? `₹${product.price.toLocaleString("en-IN")}` : "Price on request"}
            {product.was && <span style={{ marginLeft: "0.4rem", fontSize: "0.65rem", textDecoration: "line-through", opacity: 0.4, color: "var(--color-umber)" }}>₹{product.was.toLocaleString("en-IN")}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
