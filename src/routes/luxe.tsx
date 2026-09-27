import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLuxuryPieces } from "../hooks/useLuxuryPieces";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { WHATSAPP_URL } from "../lib/constants";
import { Heart, ShoppingBag, Search, Menu, X } from "lucide-react";
import { LiquidGlassCard } from "../components/ui/liquid-glass-card";
import { useProductSecondaryImages } from "../hooks/useProductSecondaryImages";

export const Route = createFileRoute("/luxe")({
  head: () => ({
    meta: [
      { title: "Lattev Luxe - The Luxury Edit" },
      { name: "description", content: "Lattev Luxe: extraordinary high-jewellery pieces, handcrafted in India." },
      { property: "og:title", content: "Lattev Luxe - The Luxury Edit" },
      { property: "og:description", content: "Extraordinary pieces for extraordinary moments." },
    ],
  }),
  component: LuxePage,
});

function LuxeNavbar() {
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {menuOpen && (
        <div className="luxe-mobile-overlay" onClick={() => setMenuOpen(false)}>
          <div className="luxe-mobile-menu" onClick={(e) => e.stopPropagation()}>
            <button className="luxe-mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X size={22} />
            </button>
            <div className="luxe-mobile-links">
              <Link to="/luxe" onClick={() => setMenuOpen(false)}>Luxe Collection</Link>
              <Link to="/shop" onClick={() => setMenuOpen(false)}>All Pieces</Link>
              <Link to="/" onClick={() => setMenuOpen(false)}>Maison</Link>
              <a href={WHATSAPP_URL.general} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Concierge</a>
              <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>
            </div>
            <div className="luxe-mobile-handle">@lattevjouel</div>
          </div>
        </div>
      )}

      <nav className={`luxe-nav${scrolled ? " luxe-nav--scrolled" : ""}`}>
        <div className="luxe-nav__inner">
          <button className="luxe-nav__hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className="luxe-nav__left">
            <Link to="/" className="luxe-nav__link">← Maison</Link>
            <Link to="/shop" className="luxe-nav__link">Collection</Link>
          </div>
          <Link to="/luxe" className="luxe-nav__wordmark">
            Lattev <span className="luxe-nav__luxe-label">Luxe</span>
          </Link>
          <div className="luxe-nav__right">
            <button
              type="button"
              className="luxe-nav__icon"
              aria-label="Search"
              onClick={() => navigate({ to: "/search", search: { q: "" } })}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit" }}
            >
              <Search size={17} strokeWidth={1.6} />
            </button>
            <Link to="/wishlist" className="luxe-nav__icon" aria-label={`Wishlist (${wishlistCount})`}>
              <Heart size={17} strokeWidth={1.5} fill={wishlistCount > 0 ? "#C9A96E" : "none"} stroke="currentColor" />
              {wishlistCount > 0 && <span className="luxe-badge">{wishlistCount}</span>}
            </Link>
            <Link to="/cart" className="luxe-nav__icon" aria-label={`Cart (${count})`}>
              <ShoppingBag size={17} strokeWidth={1.6} />
              {count > 0 && <span className="luxe-badge">{count}</span>}
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}

function LuxePage() {
  const { data: pieces = [], isLoading } = useLuxuryPieces();
  const { addItem } = useCart();
  const { data: secondaryImagesMap } = useProductSecondaryImages();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup = () => {};
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
  }, [pieces]);

  return (
    <div className="luxe-page">
      <LuxeNavbar />

      <header className="luxe-shop-header">
        <div className="luxe-kicker">Maison Selection</div>
        <h1 className="luxe-shop-headline">
          The <em>Luxury</em> Edit
        </h1>
        <p className="luxe-shop-tagline">
          Extraordinary pieces, crafted for extraordinary moments.
        </p>
      </header>

      <section className="luxe-shop-section" ref={sectionRef}>
        <div className="luxe-shop-inner">
          {isLoading ? (
            <div className="luxe-shop-loading">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="luxe-shop-skeleton" />
              ))}
            </div>
          ) : pieces.length === 0 ? (
            <div className="luxe-empty-state">
              <p className="luxe-empty-state__text">The Luxury Edit is being curated.</p>
              <p className="luxe-empty-state__sub">Our pieces are individually selected for extraordinary craftsmanship.</p>
              <a href={WHATSAPP_URL.general} target="_blank" rel="noopener noreferrer" className="luxe-btn luxe-btn--gold" style={{ marginTop: "2rem", display: "inline-block" }}>
                Contact Concierge
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-7 lg:gap-10">
              {pieces.map((p) => (
                <LiquidGlassCard
                  key={p.id}
                  productId={p.id}
                  name={p.name}
                  img={p.img ?? undefined}
                  price={p.price ?? undefined}
                  was={p.was ?? undefined}
                  description={p.description ?? undefined}
                  secondaryImg={secondaryImagesMap?.get(p.id)}
                  onAddToCart={
                    p.price
                      ? () => addItem({ name: p.name, price: p.price!, img: p.img ?? undefined, href: `/product/${p.id}` })
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="luxe-footer">
        <div className="luxe-footer__rule" aria-hidden="true" />
        <div className="luxe-footer__inner">
          <div className="luxe-footer__brand">
            <div className="luxe-footer__wordmark">Lattev Jouel</div>
            <p className="luxe-footer__tagline">Fine contemporary jewellery · Mumbai</p>
          </div>
          <div className="luxe-footer__links">
            <Link to="/" className="luxe-footer__link">Back to Maison</Link>
            <Link to="/shop" className="luxe-footer__link">Full Collection</Link>
            <a href="https://instagram.com/lattevjouel" target="_blank" rel="noopener noreferrer" className="luxe-footer__link">@lattevjouel</a>
            <a href={WHATSAPP_URL.general} target="_blank" rel="noopener noreferrer" className="luxe-footer__link">Concierge</a>
          </div>
          <div className="luxe-footer__legal">
            <Link to="/policies/terms" className="luxe-footer__link luxe-footer__link--sm">Terms</Link>
            <Link to="/policies/returns" className="luxe-footer__link luxe-footer__link--sm">Returns</Link>
            <Link to="/policies/shipping" className="luxe-footer__link luxe-footer__link--sm">Shipping</Link>
          </div>
        </div>
        <p className="luxe-footer__copy">© {new Date().getFullYear()} Lattev Jouel. All rights reserved.</p>
      </footer>
    </div>
  );
}
