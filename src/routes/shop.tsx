import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { LiquidGlassCard } from "../components/ui/liquid-glass-card";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { DiscountBanner } from "../components/ui/DiscountBanner";
import { Heart } from "lucide-react";
const logoAsset = { url: "/lattev_transparent.png" };

const CATEGORIES = ["all", "rings", "cuffs", "bangles", "bracelets", "pendants"] as const;
type Category = (typeof CATEGORIES)[number];

type ShopSearch = { category: Category };

export const Route = createFileRoute("/shop")({
  validateSearch: (raw: Record<string, unknown>): ShopSearch => {
    const c = raw.category;
    return {
      category: typeof c === "string" && (CATEGORIES as readonly string[]).includes(c)
        ? (c as Category)
        : "all",
    };
  },
  head: ({ match }) => {
    const cat = (match.search as ShopSearch).category;
    const label = cat === "all" ? "The Collection" : cat[0].toUpperCase() + cat.slice(1);
    return {
      meta: [
        { title: `${label} — Lattév Jouel` },
        { name: "description", content: `Shop ${label.toLowerCase()} from Lattév Jouel — handcrafted in India.` },
        { property: "og:title", content: `${label} — Lattév Jouel` },
        { property: "og:description", content: "Each piece, a story. Handcrafted in India." },
      ],
    };
  },
  component: ShopPage,
});

type Product = {
  id: string;
  name: string;
  price?: number;
  was?: number;
  img?: string;
  link?: string;
  sold?: boolean;
  category: Category;
  has_image: boolean;
  description?: string;
};

const CATEGORY_LABEL: Record<Category, string> = {
  all: "The Collection",
  rings: "Rings",
  cuffs: "Cuffs",
  bangles: "Bangles",
  bracelets: "Bracelets",
  pendants: "Pendants",
};

const CATEGORY_TAGLINE: Record<Category, string> = {
  all: "Each piece, a story.",
  rings: "Sculpted circles, quiet devotion.",
  cuffs: "For wrists that speak first.",
  bangles: "Stacked, layered, eternal.",
  bracelets: "Linked light. Endless line.",
  pendants: "Worn close to the heart.",
};

function ShopPage() {
  const { category } = Route.useSearch() as ShopSearch;
  const sectionRef = useRef<HTMLDivElement>(null);
  const { addItem, count } = useCart();
  const { count: wishlistCount } = useWishlist();

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!supabase.supabaseUrl) return []; // Fallback if no keys
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
      if (error) {
        console.error("Supabase fetch error:", error);
        return [];
      }
      return data as Product[];
    }
  });

  const filtered = useMemo(() => {
    const filter = (list: Product[]) =>
      category === "all" ? list : list.filter((p) => p.category === category);
    return {
      photo: filter(allProducts.filter(p => p.has_image)),
      archive: filter(allProducts.filter(p => !p.has_image))
    };
  }, [category, allProducts]);

  useEffect(() => {
    let cleanup = () => { };
    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray<HTMLElement>(".lg-card__link").forEach((c, i) => {
        gsap.fromTo(c, { opacity: 0, y: 40, scale: 0.94 }, {
          opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out",
          delay: (i % 3) * 0.08,
          scrollTrigger: { trigger: c, start: "top 90%" },
        });
      });
      cleanup = () => ScrollTrigger.getAll().forEach((t) => t.kill());
    })();
    return () => cleanup();
  }, [category]);

  return (
    <div ref={sectionRef} style={{ background: "#E8B98A", color: "var(--foreground)", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(232,185,138,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(201,169,110,0.3)" }}>
        {/* Banner sits at the very top of the fixed nav — avoids overlap */}
        <DiscountBanner />
        <div style={{ padding: "1.2rem 2rem" }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
          <Link to="/" className="tracking-luxe uppercase hover:text-[var(--color-gold)] transition-colors font-medium">← Maison</Link>
          <div className="hidden md:flex items-center gap-8 tracking-luxe uppercase font-medium">
            <div className="nav-dropdown">
              <button type="button" className="nav-dropdown__trigger hover:text-[var(--color-gold)] transition-colors">
                Collections <span aria-hidden="true">▾</span>
              </button>
              <div className="nav-dropdown__menu" role="menu">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c}
                    to="/shop"
                    search={{ category: c }}
                    className="nav-dropdown__item"
                    data-active={c === category}
                  >
                    {CATEGORY_LABEL[c]}
                  </Link>
                ))}
              </div>
            </div>
            <a href="https://instagram.com/lattevjouel" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-gold)] transition-colors">@lattevjouel</a>
            {/* Wishlist icon */}
            <Link to="/wishlist" className="cart-nav-link" aria-label={`Wishlist (${wishlistCount})`} style={{ position: "relative" }}>
              <Heart size={17} strokeWidth={1.5} fill={wishlistCount > 0 ? "var(--color-gold)" : "none"} stroke="currentColor" style={{ display: "block" }} />
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
            </Link>
            {/* Cart icon */}
            <Link to="/cart" className="cart-nav-link" aria-label={`Cart (${count} item${count !== 1 ? 's' : ''})`}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: "block" }}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
          </div>
          <Link to="/" aria-label="Lattév Jouel home" className="hidden sm:block">
            <img src={logoAsset.url} alt="Lattév Jouel" style={{ height: "clamp(44px, 4vw, 64px)", width: "auto", display: "block" }} />
          </Link>
        </div>
        </div>
      </nav>

      {/* Header */}
      <header style={{ textAlign: "center", padding: "10rem 1.5rem 4rem", background: "#ffffff" }}>
        <div className="uppercase tracking-luxe font-semibold" style={{ color: "var(--color-gold)", fontSize: "0.75rem" }}>The Edit</div>
        <h1 className="font-display mt-4" style={{ fontWeight: 300, fontSize: "clamp(2.8rem, 7vw, 6rem)", lineHeight: 1 }}>
          {category === "all" ? <>The <span className="gold-shine">Collection</span></> : <span className="gold-shine">{CATEGORY_LABEL[category]}</span>}
        </h1>
        <p className="mt-6 max-w-xl mx-auto uppercase tracking-luxe" style={{ color: "var(--color-gold)", opacity: 0.8, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.8rem" }}>
          {CATEGORY_TAGLINE[category]}
        </p>
      </header>

      <section style={{ padding: "5rem 1.5rem 8rem", background: "#ffffff" }}>
        <div className="max-w-5xl mx-auto px-6 mb-10">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                to="/shop"
                search={{ category: c }}
                className="category-chip"
                data-active={c === category}
              >
                {CATEGORY_LABEL[c]}
              </Link>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto">
          {filtered.photo.length === 0 && filtered.archive.length === 0 ? (
            <div className="text-center py-24 opacity-70">
              <p className="italic font-display text-2xl" style={{ color: "var(--color-gold)" }}>No pieces in this collection yet.</p>
              <Link to="/shop" search={{ category: "all" }} className="liquid-glass-btn mt-8 inline-flex">View All Pieces</Link>
            </div>
          ) : (
            <>
              {filtered.photo.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-7 lg:gap-10">
                  {filtered.photo.map((p) => (
                    <LiquidGlassCard
                      key={p.name}
                      {...p}
                      productId={p.id}
                      onAddToCart={p.price && !p.sold ? () => addItem({ name: p.name, price: p.price!, img: p.img, href: `/product/${p.id}` }) : undefined}
                    />
                  ))}
                </div>
              )}

              {filtered.archive.length > 0 && (
                <>
                  <div className="mt-28 mb-12 text-center">
                    <div className="uppercase tracking-luxe font-semibold" style={{ color: "var(--color-gold)", opacity: 0.8, fontSize: "0.75rem" }}>
                      Coming to the Archive
                    </div>
                    <p className="mt-3 uppercase tracking-luxe" style={{ color: "var(--color-umber)", opacity: 0.5, fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem" }}>
                      Photographed soon — DM to enquire.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-7 lg:gap-10">
                    {filtered.archive.map((p) => (
                      <LiquidGlassCard
                        key={p.name}
                        {...p}
                        productId={p.id}
                        onAddToCart={p.price && !p.sold ? () => addItem({ name: p.name, price: p.price!, img: p.img, href: `/product/${p.id}` }) : undefined}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <footer style={{ background: "#E8B98A", color: "var(--color-umber)", padding: "4rem 1.5rem 2rem", borderTop: "1px solid rgba(201,169,110,0.2)", textAlign: "center" }}>
        <img src={logoAsset.url} alt="Lattév Jouel" style={{ height: 84, width: "auto", margin: "0 auto", display: "block" }} />
        <p className="mt-4 text-sm opacity-70">DM <a className="underline" href="https://instagram.com/lattevjouel" target="_blank" rel="noopener noreferrer">@lattevjouel</a> to order</p>
        {/* Policy links */}
        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.55 }}>
          <Link to="/policies/shipping" style={{ color: "inherit", textDecoration: "none" }}>Shipping</Link>
          <Link to="/policies/returns" style={{ color: "inherit", textDecoration: "none" }}>Returns</Link>
          <Link to="/policies/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms & FAQs</Link>
        </div>
        <div className="mt-6 text-[0.65rem] tracking-wider-luxe uppercase opacity-60">© {new Date().getFullYear()} Lattév Jouel</div>
      </footer>
    </div>
  );
}
