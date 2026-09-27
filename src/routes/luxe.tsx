import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLuxuryPieces } from "../hooks/useLuxuryPieces";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { WHATSAPP_URL, BRAND, WHATSAPP } from "../lib/constants";
import { Heart, ShoppingBag, Search, Menu, X, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/luxe")({
  head: () => ({
    meta: [
      { title: "Lattév Luxe — The Luxury Edit" },
      {
        name: "description",
        content:
          "Lattév Luxe: extraordinary high-jewellery pieces, handcrafted in India. The finest selection from Maison Lattév Jouel.",
      },
      { property: "og:title", content: "Lattév Luxe — The Luxury Edit" },
      {
        property: "og:description",
        content: "Extraordinary pieces for extraordinary moments.",
      },
    ],
  }),
  component: LuxePage,
});

// ── Concierge WhatsApp message ─────────────────────────────────────────────────
const CONCIERGE_MSG = encodeURIComponent(
  "Hi, I'm interested in the Lattév Luxe collection and would like a personal consultation."
);
const CONCIERGE_URL = `https://wa.me/${WHATSAPP.phone}?text=${CONCIERGE_MSG}`;

// ── Navbar ─────────────────────────────────────────────────────────────────────
function LuxeNavbar() {
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="luxe-mobile-overlay"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="luxe-mobile-menu"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="luxe-mobile-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
            <div className="luxe-mobile-links">
              <Link to="/luxe" onClick={() => setMenuOpen(false)}>
                Luxe Collection
              </Link>
              <Link to="/shop" onClick={() => setMenuOpen(false)}>
                All Pieces
              </Link>
              <Link to="/" onClick={() => setMenuOpen(false)}>
                Maison
              </Link>
              <a
                href={WHATSAPP_URL.general}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                Concierge
              </a>
              <Link to="/wishlist" onClick={() => setMenuOpen(false)}>
                Wishlist
              </Link>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>
                Cart
              </Link>
            </div>
            <div className="luxe-mobile-handle">@lattevjouel</div>
          </div>
        </div>
      )}

      <nav className={`luxe-nav${scrolled ? " luxe-nav--scrolled" : ""}`}>
        <div className="luxe-nav__inner">
          {/* Mobile hamburger */}
          <button
            className="luxe-nav__hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Desktop left links */}
          <div className="luxe-nav__left">
            <Link to="/" className="luxe-nav__link">
              ← Maison
            </Link>
            <Link to="/shop" className="luxe-nav__link">
              Collection
            </Link>
          </div>

          {/* Centre wordmark */}
          <Link to="/luxe" className="luxe-nav__wordmark">
            Lattév <span className="luxe-nav__luxe-label">Luxe</span>
          </Link>

          {/* Right icons */}
          <div className="luxe-nav__right">
            <Link to="/search" search={{ q: "" }} className="luxe-nav__icon" aria-label="Search">
              <Search size={17} strokeWidth={1.6} />
            </Link>
            <Link to="/wishlist" className="luxe-nav__icon" aria-label={`Wishlist (${wishlistCount})`}>
              <Heart
                size={17}
                strokeWidth={1.5}
                fill={wishlistCount > 0 ? "#C9A96E" : "none"}
                stroke="currentColor"
              />
              {wishlistCount > 0 && (
                <span className="luxe-badge">{wishlistCount}</span>
              )}
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

// ── Hero ───────────────────────────────────────────────────────────────────────
function LuxeHero({ firstPiece }: { firstPiece?: { img: string | null; name: string } }) {
  return (
    <section className="luxe-hero">
      {/* Animated radial gold glow */}
      <div className="luxe-hero__glow" aria-hidden="true" />

      <div className="luxe-hero__inner">
        {/* Left: editorial copy */}
        <div className="luxe-hero__copy">
          <div className="luxe-kicker">Maison Sélection</div>
          <h1 className="luxe-hero__headline">
            The<br />
            <em>Luxury</em><br />
            Edit
          </h1>
          <p className="luxe-hero__sub">
            Extraordinary pieces,<br />crafted for extraordinary moments.
          </p>
          <div className="luxe-hero__cta-row">
            <a href="#collection" className="luxe-btn luxe-btn--gold">
              Explore Collection
            </a>
            <a
              href={WHATSAPP_URL.general}
              target="_blank"
              rel="noopener noreferrer"
              className="luxe-btn luxe-btn--outline"
            >
              Concierge
            </a>
          </div>
        </div>

        {/* Right: product frame */}
        {firstPiece?.img && (
          <div className="luxe-hero__frame">
            <img
              src={firstPiece.img}
              alt={firstPiece.name}
              className="luxe-hero__img"
            />
            <div className="luxe-hero__frame-shimmer" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Scroll cue */}
      <div className="luxe-scroll-cue" aria-hidden="true">
        <span>Scroll</span>
        <div className="luxe-scroll-cue__line" />
      </div>
    </section>
  );
}

// ── Editorial Intro Strip ──────────────────────────────────────────────────────
function LuxeIntroStrip() {
  return (
    <div className="luxe-intro-strip">
      <div className="luxe-intro-strip__vertical luxe-intro-strip__vertical--left">
        Handcrafted in India
      </div>
      <blockquote className="luxe-intro-strip__quote">
        "Jewellery is the only piece of art<br />
        <em>you can wear closest to your skin."</em>
      </blockquote>
      <div className="luxe-intro-strip__vertical luxe-intro-strip__vertical--right">
        Each piece limited
      </div>
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────────
function LuxeProductCard({ piece }: { piece: ReturnType<typeof useLuxuryPieces>["data"] extends (infer T)[] | undefined ? T : never }) {
  const { addItem } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(piece.id);

  const categoryLabel: Record<string, string> = {
    rings: "Ring",
    cuffs: "Cuff",
    bangles: "Bangle",
    bracelets: "Bracelet",
    pendants: "Pendant",
    necklaces: "Neckpiece",
    earrings: "Earrings",
    special: "High Jewellery",
  };

  return (
    <div className="luxe-card">
      <div className="luxe-card__img-wrap">
        {piece.img ? (
          <img src={piece.img} alt={piece.name} className="luxe-card__img" />
        ) : (
          <div className="luxe-card__img-placeholder">
            <span>Lattév</span>
          </div>
        )}
        <button
          className={`luxe-card__heart${inWishlist ? " active" : ""}`}
          onClick={() => toggle({ id: piece.id, name: piece.name, price: piece.price ?? 0, img: piece.img ?? "" })}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} strokeWidth={1.5} fill={inWishlist ? "#C9A96E" : "none"} stroke="#C9A96E" />
        </button>
        <div className="luxe-card__category-pill">
          {categoryLabel[piece.category] ?? piece.category}
        </div>
      </div>

      <div className="luxe-card__body">
        <div className="luxe-card__kicker">Maison Sélection</div>
        <h3 className="luxe-card__name">{piece.name}</h3>
        {piece.material && (
          <p className="luxe-card__material">{piece.material}</p>
        )}
        <div className="luxe-card__footer">
          <div className="luxe-card__price-row">
            {piece.price && (
              <span className="luxe-card__price">
                ₹{piece.price.toLocaleString("en-IN")}
              </span>
            )}
            {piece.was && (
              <span className="luxe-card__was">
                ₹{piece.was.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <div className="luxe-card__actions">
            <Link to="/product/$id" params={{ id: piece.id }} className="luxe-btn luxe-btn--gold luxe-btn--sm">
              Discover
            </Link>
            <a
              href={WHATSAPP_URL.product(piece.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="luxe-btn luxe-btn--outline luxe-btn--sm"
            >
              Enquire
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Luxury Collection Grid ─────────────────────────────────────────────────────
function LuxeCollection({ pieces }: { pieces: NonNullable<ReturnType<typeof useLuxuryPieces>["data"]> }) {
  return (
    <section id="collection" className="luxe-collection">
      <div className="luxe-section-header">
        <div className="luxe-kicker">The Edit</div>
        <h2 className="luxe-section-title">High Jewellery</h2>
        <div className="luxe-section-rule" aria-hidden="true" />
      </div>

      {pieces.length === 0 ? (
        <div className="luxe-empty">
          <p>The Luxury Edit is being curated.</p>
          <p className="luxe-empty__sub">
            Our pieces are individually selected for extraordinary craftsmanship.
            Please check back soon or contact our concierge.
          </p>
          <a
            href={WHATSAPP_URL.general}
            target="_blank"
            rel="noopener noreferrer"
            className="luxe-btn luxe-btn--gold"
            style={{ marginTop: "2rem" }}
          >
            Contact Concierge
          </a>
        </div>
      ) : (
        <div className="luxe-grid">
          {pieces.map((piece) => (
            <LuxeProductCard key={piece.id} piece={piece} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Editorial Row ──────────────────────────────────────────────────────────────
function LuxeEditorialRow({
  reversed,
  kicker,
  headline,
  body,
  img,
  imgAlt,
  cta,
  ctaHref,
}: {
  reversed?: boolean;
  kicker: string;
  headline: string;
  body: string;
  img?: string | null;
  imgAlt?: string;
  cta?: string;
  ctaHref?: string;
}) {
  return (
    <div className={`luxe-editorial-row${reversed ? " luxe-editorial-row--reversed" : ""}`}>
      <div className="luxe-editorial-row__img-wrap">
        {img ? (
          <img src={img} alt={imgAlt ?? headline} className="luxe-editorial-row__img" />
        ) : (
          <div className="luxe-editorial-row__img-placeholder">
            <div className="luxe-editorial-row__placeholder-text">Lattév</div>
          </div>
        )}
      </div>
      <div className="luxe-editorial-row__copy">
        <div className="luxe-kicker">{kicker}</div>
        <h3 className="luxe-editorial-row__headline" dangerouslySetInnerHTML={{ __html: headline }} />
        <p className="luxe-editorial-row__body">{body}</p>
        {cta && ctaHref && (
          <a href={ctaHref} className="luxe-editorial-row__cta">
            {cta} <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Material Stories Section ───────────────────────────────────────────────────
function LuxeMaterialStories({ pieces }: { pieces: NonNullable<ReturnType<typeof useLuxuryPieces>["data"]> }) {
  const rows = [
    {
      kicker: "The Craft",
      headline: "22k Gold,<br /><em>shaped by hand.</em>",
      body: "Every curve, every edge is the result of hours of patient craft. No machine can replicate the warmth pressed into gold by a skilled hand in our atelier.",
      img: pieces[0]?.img,
      imgAlt: pieces[0]?.name,
      cta: "Shop Rings",
      ctaHref: "/shop?category=rings",
    },
    {
      kicker: "The Material",
      headline: "Skin-safe.<br /><em>Forever-safe.</em>",
      body: "Our pieces are crafted from hypoallergenic materials — designed for everyday wear that doesn't ask you to choose between beauty and comfort.",
      img: pieces[1]?.img,
      imgAlt: pieces[1]?.name,
      cta: "Discover Cuffs",
      ctaHref: "/shop?category=cuffs",
      reversed: true,
    },
    {
      kicker: "The Archive",
      headline: "Limited editions.<br /><em>Unlimited feeling.</em>",
      body: "Each Luxe piece is produced in limited quantities. When it's gone, it belongs only to those who were there.",
      img: pieces[2]?.img,
      imgAlt: pieces[2]?.name,
      cta: "View All",
      ctaHref: "/shop",
    },
  ];

  return (
    <section className="luxe-material-stories">
      <div className="luxe-section-header">
        <div className="luxe-kicker">The Story</div>
        <h2 className="luxe-section-title">Material & Craft</h2>
        <div className="luxe-section-rule" aria-hidden="true" />
      </div>
      {rows.map((row, i) => (
        <LuxeEditorialRow key={i} {...row} />
      ))}
    </section>
  );
}

// ── Concierge CTA ──────────────────────────────────────────────────────────────
function LuxeCTA() {
  return (
    <section className="luxe-concierge">
      <div className="luxe-concierge__glow" aria-hidden="true" />
      <div className="luxe-concierge__inner">
        <div className="luxe-kicker">By Appointment</div>
        <h2 className="luxe-concierge__headline">
          Bespoke.<br />
          <em>By Appointment.</em>
        </h2>
        <p className="luxe-concierge__body">
          Each Lattév Luxe piece is available for personal consultation.
          Speak with our jewellery concierge to reserve a viewing, discuss
          sizing, or commission a bespoke design.
        </p>
        <div className="luxe-concierge__cta-row">
          <a
            href={CONCIERGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="luxe-btn luxe-btn--gold luxe-btn--lg"
          >
            WhatsApp Concierge
          </a>
          <a
            href={`mailto:${BRAND.email}`}
            className="luxe-btn luxe-btn--outline luxe-btn--lg"
          >
            Request Lookbook
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function LuxeFooter() {
  return (
    <footer className="luxe-footer">
      <div className="luxe-footer__rule" aria-hidden="true" />
      <div className="luxe-footer__inner">
        <div className="luxe-footer__brand">
          <div className="luxe-footer__wordmark">Lattév Jouel</div>
          <p className="luxe-footer__tagline">Fine contemporary jewellery · Mumbai</p>
        </div>
        <div className="luxe-footer__links">
          <Link to="/" className="luxe-footer__link">← Back to Maison</Link>
          <Link to="/shop" className="luxe-footer__link">Full Collection</Link>
          <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="luxe-footer__link">
            @lattevjouel
          </a>
          <a href={WHATSAPP_URL.general} target="_blank" rel="noopener noreferrer" className="luxe-footer__link">
            Concierge
          </a>
        </div>
        <div className="luxe-footer__legal">
          <Link to="/policies/terms" className="luxe-footer__link luxe-footer__link--sm">Terms</Link>
          <Link to="/policies/returns" className="luxe-footer__link luxe-footer__link--sm">Returns</Link>
          <Link to="/policies/shipping" className="luxe-footer__link luxe-footer__link--sm">Shipping</Link>
        </div>
      </div>
      <p className="luxe-footer__copy">© {new Date().getFullYear()} Lattév Jouel. All rights reserved.</p>
    </footer>
  );
}

// ── Page Skeleton ──────────────────────────────────────────────────────────────
function LuxeSkeleton() {
  return (
    <div className="luxe-page">
      <LuxeNavbar />
      <div className="luxe-skeleton">
        <div className="luxe-skeleton__hero" />
        <div className="luxe-skeleton__strip">
          {[1, 2, 3].map((i) => (
            <div key={i} className="luxe-skeleton__block" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
function LuxePage() {
  const { data: pieces = [], isLoading } = useLuxuryPieces();
  const pageRef = useRef<HTMLDivElement>(null);

  // Staggered card entrance via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    const cards = pageRef.current?.querySelectorAll<HTMLElement>(".luxe-card");
    cards?.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(48px)";
      card.style.transition = `opacity 0.7s ease ${i * 0.1}s, transform 0.7s ease ${i * 0.1}s`;
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [pieces]);

  if (isLoading) return <LuxeSkeleton />;

  return (
    <div className="luxe-page" ref={pageRef}>
      <LuxeNavbar />
      <LuxeHero firstPiece={pieces[0]} />
      <LuxeIntroStrip />
      <LuxeCollection pieces={pieces} />
      <LuxeMaterialStories pieces={pieces} />
      <LuxeCTA />
      <LuxeFooter />
    </div>
  );
}
