import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAppReady } from "../context/AppReadyContext";
import { useWishlist } from "../context/WishlistContext";
import { Scene3D } from "../components/Scene3D";
import { LogoHero3D } from "../components/LogoHero3D";
import { useSiteContent } from "../hooks/useSiteContent";
import { useReviews } from "../hooks/useReviews";
import { useReels } from "../hooks/useReels";
import { DiscountBanner } from "../components/ui/DiscountBanner";
import heroVideoUrl from "../assets/hero-video.mp4?url";
const boothAsset = { url: "/lattev-booth.png" };
const heroVideoAsset = { url: heroVideoUrl };
const logoAsset = { url: "/lattev_transparent.png" };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lattév Jouel — Fine Contemporary Jewellery" },
      { name: "description", content: "Lattév Jouel: fine contemporary jewellery handcrafted in India. Rings, cuffs, bangles, bracelets and pendants." },
      { property: "og:title", content: "Lattév Jouel" },
      { property: "og:description", content: "Crafted for the bold. Made to be worn." },
    ],
  }),
  component: Index,
});

function SplitText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="split-word" style={{ marginRight: "0.25em" }}>
          <span data-word>{w}</span>
        </span>
      ))}
    </span>
  );
}

// Self-hosted reel video player — pure autoplay, no Instagram UI
// Clicking opens the Instagram reel in a new tab
function ReelVideo({ src, instagramUrl }: { src: string; instagramUrl: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => { setIsHovered(true); videoRef.current?.pause(); };
  const handleMouseLeave = () => { setIsHovered(false); videoRef.current?.play(); };

  return (
    <a
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "block", textDecoration: "none" }}
      aria-label="Watch on Instagram"
    >
      <div
        className="reel-embed-container"
        style={{ position: "relative", aspectRatio: "9 / 16", overflow: "hidden", borderRadius: 18, cursor: "pointer" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "filter 0.4s ease",
            filter: isHovered ? "brightness(0.65)" : "brightness(1)",
          }}
        />
        {/* Hover overlay */}
        {isHovered && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Instagram icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="white"/>
              </svg>
            </div>
          </div>
        )}
        {/* Bottom gradient */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "linear-gradient(to top, rgba(61,52,22,0.35), transparent)", pointerEvents: "none" }} />
      </div>
    </a>
  );
}

function InstagramReels() {
  const { data: reels = [] } = useReels();

  return (
    <div className="community-reels-grid">
      {reels.map((reel) => (
        <ReelVideo key={reel.id} src={reel.video_url} instagramUrl={reel.instagram_url} />
      ))}
    </div>
  );
}


function Index() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const marqueeRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLElement>(null);
  const { count } = useCart();
  const { isAppReady } = useAppReady();
  const { count: wishlistCount } = useWishlist();
  const { data: content } = useSiteContent();
  const { data: reviews = [] } = useReviews();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Trigger video play the moment the loading screen exits.
  // This solves autoplay on iOS Safari and other restrictive browsers.
  useEffect(() => {
    if (!isAppReady || !heroVideoRef.current) return;
    heroVideoRef.current.play().catch(() => {
      // Autoplay still blocked — nothing we can do without a user gesture
    });
  }, [isAppReady]);


  // GSAP + Lenis
  useEffect(() => {
    let cleanup = () => { };
    (async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
      function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      lenis.on("scroll", ScrollTrigger.update);

      // Word reveals
      gsap.utils.toArray<HTMLElement>("[data-word]").forEach((w) => {
        gsap.fromTo(w, { yPercent: 110 }, {
          yPercent: 0, duration: 1, ease: "expo.out",
          scrollTrigger: { trigger: w, start: "top 90%" },
        });
      });

      // Hero parallax
      if (heroTextRef.current) {
        gsap.to(heroTextRef.current, {
          yPercent: -40, ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
        });
      }

      // Nav background on scroll
      ScrollTrigger.create({
        trigger: heroRef.current, start: "bottom top",
        onEnter: () => navRef.current?.classList.add("nav-solid"),
        onLeaveBack: () => navRef.current?.classList.remove("nav-solid"),
      });

      // Product cards stagger
      gsap.utils.toArray<HTMLElement>(".product-card").forEach((c, i) => {
        gsap.fromTo(c, { opacity: 0, scale: 0.92, y: 30 }, {
          opacity: 1, scale: 1, y: 0, duration: 1, ease: "power3.out", delay: (i % 3) * 0.08,
          scrollTrigger: { trigger: c, start: "top 88%" },
        });
      });




      // Showcase scroll progress → drives 3D + panel crossfade
      if (showcaseRef.current) {
        const dots = Array.from(document.querySelectorAll<HTMLElement>("[data-progress-dot]"));
        const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-panel]"));
        ScrollTrigger.create({
          trigger: showcaseRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            (window as any).__lattevShowcaseScroll = self.progress;
            const idx = Math.min(panels.length - 1, Math.floor(self.progress * panels.length * 0.999));
            panels.forEach((p, i) => p.classList.toggle("is-active", i === idx));
            dots.forEach((d, i) => d.classList.toggle("on", i === idx));
          },
        });
      }


      gsap.utils.toArray<HTMLElement>("[data-slide-left]").forEach((el) => {
        gsap.fromTo(el, { x: -80, opacity: 0 }, {
          x: 0, opacity: 1, duration: 1.4, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 80%" },
        });
        const curtains = el.querySelectorAll<HTMLElement>(".about-curtain");
        if (curtains.length) {
          gsap.to(curtains, {
            scaleY: 0, duration: 1.3, ease: "expo.inOut", stagger: 0.05,
            scrollTrigger: { trigger: el, start: "top 75%" }
          });
        }
      });
      gsap.utils.toArray<HTMLElement>("[data-fade-right]").forEach((el) => {
        gsap.fromTo(el, { x: 60, opacity: 0 }, {
          x: 0, opacity: 1, duration: 1.4, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });


      cleanup = () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
        lenis.destroy();
      };
    })();
    return () => cleanup();
  }, []);

  // Marquee
  useEffect(() => {
    if (!marqueeRef.current) return;
    const el = marqueeRef.current;
    let x = 0;
    let raf = 0;
    const step = () => {
      x -= 0.5;
      const w = el.scrollWidth / 2;
      if (-x >= w) x = 0;
      el.style.transform = `translate3d(${x}px,0,0)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const marqueeText = content?.marquee_text || "RINGS · BRACELETS · CUFFS · BANGLES · PENDANTS · EARRINGS · ";

  return (
    <div style={{ background: "#E8B98A", color: "#3D3416" }}>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col p-6" style={{ background: "var(--background)", color: "var(--color-umber)" }}>
          <div className="flex justify-between items-center mb-12">
            <div className="font-display italic text-2xl" style={{ color: "var(--color-umber)" }}>Lattév Jouel</div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
              className="p-2 -mr-2"
            >
              <X size={28} strokeWidth={2} />
            </button>
          </div>
          <div className="flex flex-col gap-8 text-xl uppercase tracking-widest font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Collection</Link>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a>
            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
            <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              Wishlist
              {wishlistCount > 0 && (
                <span style={{ background: "var(--color-gold)", color: "white", fontSize: "0.65rem", fontWeight: 700, minWidth: 20, height: 20, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{wishlistCount}</span>
              )}
            </Link>
            <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              Cart
              {count > 0 && (
                <span style={{ background: "var(--color-gold)", color: "white", fontSize: "0.65rem", fontWeight: 700, minWidth: 20, height: 20, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{count}</span>
              )}
            </Link>
          </div>
          <div className="mt-auto pb-8 uppercase text-sm tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
            @lattevjouel
          </div>
        </div>
      )}


      {/* Nav */}
      <nav ref={navRef} style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        transition: "background-color 0.6s ease, border-color 0.6s ease, backdrop-filter 0.6s ease",
        background: "transparent",
      }}>
        {/* Banner sits at the very top of the fixed nav — this avoids overlap */}
        <DiscountBanner />
        <div style={{ padding: "1.4rem 2rem" }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          {/* Mobile Menu Toggle (Top Left) */}
          <button
            className="md:hidden flex items-center p-2 -ml-2"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            style={{ color: "var(--color-onyx)", filter: "drop-shadow(0px 1px 4px rgba(255,255,255,0.4))" }}
          >
            <Menu size={24} strokeWidth={2} />
          </button>

          <div className="hidden md:flex gap-10 uppercase items-center" style={{ color: "var(--color-onyx)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.15em", fontWeight: 700, textShadow: "0px 1px 4px rgba(255, 255, 255, 0.4)" }}>
            <div className="nav-dropdown">
              <Link to="/shop" className="hover:text-[var(--color-gold)] transition-colors story-link nav-dropdown__trigger">
                Collection <span aria-hidden="true">▾</span>
              </Link>
              <div className="nav-dropdown__menu" role="menu">
                <Link to="/shop" search={{ category: "all" }} className="nav-dropdown__item">All Pieces</Link>
                <Link to="/shop" search={{ category: "rings" }} className="nav-dropdown__item">Rings</Link>
                <Link to="/shop" search={{ category: "cuffs" }} className="nav-dropdown__item">Cuffs</Link>
                <Link to="/shop" search={{ category: "bangles" }} className="nav-dropdown__item">Bangles</Link>
                <Link to="/shop" search={{ category: "bracelets" }} className="nav-dropdown__item">Bracelets</Link>
                <Link to="/shop" search={{ category: "pendants" }} className="nav-dropdown__item">Pendants</Link>
              </div>
            </div>
            <a href="#about" className="hover:text-[var(--color-gold)] transition-colors story-link">About</a>
            <a href="#contact" className="hover:text-[var(--color-gold)] transition-colors story-link">Contact</a>
          </div>


          <div className="flex items-center gap-5 ml-auto md:ml-0" style={{ color: "var(--color-onyx)", filter: "drop-shadow(0px 1px 4px rgba(255,255,255,0.4))" }}>
            {/* Wishlist icon */}
            <Link to="/wishlist" className="cart-nav-link" aria-label={`Wishlist (${wishlistCount})`}>
              <Heart size={17} strokeWidth={1.5} fill={wishlistCount > 0 ? "var(--color-gold)" : "none"} stroke="currentColor" style={{ display: "block" }} />
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
            </Link>
            {/* Cart bag icon */}
            <Link to="/cart" className="cart-nav-link" aria-label={`Cart (${count} items)`}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "block" }}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
            <div className="hidden md:block uppercase" style={{ color: "var(--color-onyx)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.15em", fontWeight: 700, textShadow: "0px 1px 4px rgba(255, 255, 255, 0.4)" }}>
              @lattevjouel
            </div>
          </div>
        </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} style={{ position: "relative", height: "100vh", minHeight: 600, overflow: "hidden", background: "var(--background)" }}>
        <video
          ref={heroVideoRef}
          src={content?.hero_video_url || heroVideoAsset.url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        />
        {/* Subtle gradient overlay so text reads clearly */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,15,8,0.15) 0%, rgba(20,15,8,0.05) 50%, rgba(20,15,8,0.75) 100%)", pointerEvents: "none", zIndex: 1 }} />

        {/* 3D logo — top 65% */}
        <div className="hero-mega-logo">
          <LogoHero3D className="w-full h-full" />
        </div>

        {/* Text block — bottom 38%, absolutely pinned */}
        <div
          ref={heroTextRef}
          style={{
            position: "absolute",
            bottom: "8%",
            left: 0,
            right: 0,
            height: "38%",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 1.5rem 3rem",
            pointerEvents: "none",
            gap: "0.6rem",
          }}
        >
          <div className="uppercase tracking-luxe font-semibold" style={{ color: "var(--color-gold)", fontSize: "0.75rem" }}>
            <SplitText text={content?.hero_kicker || "— Maison Lattév Jouel —"} />
          </div>
          <h1 className="font-display font-bold" style={{ color: "var(--color-umber)", fontWeight: 700, fontSize: "clamp(1.8rem, 4.5vw, 4.2rem)", lineHeight: 1.1, letterSpacing: "0.02em", margin: 0 }}>
            <div><SplitText text={content?.hero_title_1 || "Crafted for the Bold"} /></div>
            <div style={{ color: "var(--color-gold)" }}><SplitText text={content?.hero_title_2 || "Made to be Worn"} /></div>
          </h1>
          <div className="uppercase tracking-luxe font-semibold" style={{ color: "var(--color-umber)", opacity: 0.85, fontSize: "0.78rem" }}>
            {content?.hero_subtitle || "Fine contemporary jewellery · Mumbai"}
          </div>
          <Link to="/shop" className="liquid-glass-btn font-bold" style={{ pointerEvents: "auto", marginTop: "0.5rem" }}>Explore Collection</Link>
        </div>

        <div style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", color: "var(--color-gold)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.75, animation: "scrollHint 2.4s ease-in-out infinite", zIndex: 3 }}>
          Scroll ↓
        </div>
      </section>

      {/* Marquee */}
      <section style={{ background: "#E8B98A", borderTop: "1px solid rgba(107,115,38,0.2)", borderBottom: "1px solid rgba(107,115,38,0.2)", overflow: "hidden", padding: "1.8rem 0" }}>
        <div ref={marqueeRef} style={{ whiteSpace: "nowrap", willChange: "transform" }}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="font-display tracking-wider-luxe uppercase" style={{ color: "var(--color-gold)", fontSize: "1.4rem", paddingRight: "2rem" }}>
              {marqueeText}
            </span>
          ))}
        </div>
      </section>
      {/* 3D Showcase — pinned, scroll-interactive */}
      <section
        ref={showcaseRef}
        style={{ position: "relative", height: "200vh", background: "#E8B98A", borderBottom: "1px solid rgba(107,115,38,0.2)" }}
      >
        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
          <Scene3D variant="showcase" />
          {/* vignette to keep text readable */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 35%, rgba(240,213,180,0.85) 90%)", pointerEvents: "none" }} />

          <div className="showcase-progress">
            {[0, 1, 2].map((i) => (
              <span key={i} data-progress-dot={i} />
            ))}
          </div>

          {/* Mobile skip button — visible only on small screens */}
          <button
            className="md:hidden"
            onClick={() => showcaseRef.current?.scrollIntoView({ block: "end", behavior: "smooth" })}
            style={{
              position: "absolute",
              bottom: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 6,
              background: "rgba(232,185,138,0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(107,115,38,0.35)",
              borderRadius: "999px",
              color: "var(--color-gold)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              padding: "0.6rem 1.4rem",
              cursor: "pointer",
            }}
          >
            Skip ↓
          </button>

          <div className="showcase-panel" data-panel={0}>
            <div className="uppercase tracking-luxe font-semibold" style={{ color: "var(--color-gold)", fontSize: "0.75rem" }}>{content?.showcase_1_kicker || "The Métier"}</div>
            <h2 className="font-display mt-6" style={{ fontWeight: 300, color: "var(--color-umber)", fontSize: "clamp(2.4rem, 6vw, 5.5rem)", lineHeight: 1.05 }} dangerouslySetInnerHTML={{ __html: content?.showcase_1_title || "Sculpted in light." }} />
            <p className="mt-6 max-w-lg text-sm leading-relaxed" style={{ color: "rgba(61,52,22,0.7)" }}>
              {content?.showcase_1_desc || "Every contour shaped by hand — 22k gold reflections cast through the prism of intention."}
            </p>
          </div>

          <div className="showcase-panel" data-panel={1}>
            <div className="uppercase tracking-luxe font-semibold" style={{ color: "var(--color-gold)", fontSize: "0.75rem" }}>{content?.showcase_2_kicker || "The Geometry"}</div>
            <h2 className="font-display mt-6" style={{ fontWeight: 300, color: "var(--color-umber)", fontSize: "clamp(2.4rem, 6vw, 5.5rem)", lineHeight: 1.05 }} dangerouslySetInnerHTML={{ __html: content?.showcase_2_title || "Circles that <span style=\"color: var(--color-gold)\">spiral</span><br /> into devotion." }} />
            <p className="mt-6 max-w-lg text-sm leading-relaxed" style={{ color: "rgba(61,52,22,0.7)" }}>
              {content?.showcase_2_desc || "Seven rings, one orbit. A meditation in concentric symmetry, drawn from the maison's first archive."}
            </p>
          </div>

          <div className="showcase-panel" data-panel={2}>
            <div className="uppercase tracking-luxe font-semibold" style={{ color: "var(--color-gold)", fontSize: "0.75rem" }}>{content?.showcase_3_kicker || "The Maison"}</div>
            <h2 className="font-display mt-6" style={{ fontWeight: 300, color: "var(--color-umber)", fontSize: "clamp(2.4rem, 6vw, 5.5rem)", lineHeight: 1.05 }} dangerouslySetInnerHTML={{ __html: content?.showcase_3_title || "A ring, <span class=\"gold-shine\">awakened.</span>" }} />
            <p className="mt-6 max-w-lg text-sm leading-relaxed" style={{ color: "rgba(61,52,22,0.7)" }}>
              {content?.showcase_3_desc || "Forged in 22k gold, polished by hand — an heirloom drawn from the maison's first archive."}
            </p>
            <Link to="/shop" className="liquid-glass-btn mt-10" style={{ pointerEvents: "auto" }}>Enter the Boutique</Link>
          </div>

        </div>
      </section>


      {/* About */}
      <section id="about" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <div className="grid md:grid-cols-2 gap-0 items-stretch min-h-screen">
          <div data-slide-left className="overflow-hidden relative" style={{ minHeight: "60vh" }}>
            <img src={content?.about_image_url || boothAsset.url} alt="Lattév Jouel pop-up boutique with handcrafted jewellery displays" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <span className="about-curtain about-curtain--top" />
            <span className="about-curtain about-curtain--bottom" />
          </div>
          <div data-fade-right className="flex items-center justify-center p-10 md:p-20">
            <div>
              <div className="uppercase tracking-luxe font-semibold" style={{ color: "var(--color-gold-soft)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>{content?.about_kicker || "Our Ethos"}</div>
              <h2 className="font-display mt-6" style={{ fontWeight: 300, fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.15 }}>
                {content?.about_title_1 || "Jewellery is not decoration."}
                <br />
                <span style={{ color: "var(--color-gold-soft)" }}>{content?.about_title_2 || "It is identity."}</span>
              </h2>
              <p className="mt-8 leading-relaxed max-w-md text-base" style={{ color: "#3D3416" }}>
                {content?.about_desc || "Lattév Jouel is crafted in India, by hand, for those who wear meaning. Each piece draws from the cosmos and the feminine form — silhouettes that hold memory, motion, and the quiet power of being seen."}
              </p>
              <p className="mt-4 uppercase tracking-luxe" style={{ color: "var(--color-gold-soft)", opacity: 0.8, fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem" }}>
                {content?.about_tagline || "— Founded in Mumbai"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community — Live Instagram Reels (official embed) */}
      <section id="community" className="community-section">
        <div className="community-inner">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="uppercase tracking-luxe font-semibold" style={{ color: "var(--color-gold)", opacity: 0.8, fontSize: "0.75rem", marginBottom: "0.5rem" }}>Follow Along</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontStyle: "normal", fontSize: "clamp(2rem, 4vw, 3rem)", marginTop: "0.5rem", color: "var(--color-umber)", letterSpacing: "0.03em" }}>As Seen on Instagram</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "var(--color-umber)", opacity: 0.5, marginTop: "0.75rem" }}>Live reels · Updated automatically</p>
          </div>
          <InstagramReels />
        </div>
      </section>

      {/* Reviews — customer screenshots, editable from admin app */}
      {reviews.length > 0 && (
        <section style={{ background: "var(--background)", padding: "6rem 0", overflow: "hidden" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem", padding: "0 1.5rem" }}>
            <div className="uppercase tracking-luxe font-semibold" style={{ color: "var(--color-gold)", opacity: 0.8, fontSize: "0.75rem", marginBottom: "0.5rem" }}>Real Love</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--color-umber)", letterSpacing: "0.03em" }}>
              {content?.reviews_heading || "What they're saying"}
            </h2>
          </div>
          {/* Grid: 2 cols on mobile, 4 on desktop */}
          <div style={{ padding: "0 1rem" }}>
            <div className="reviews-grid">
              {reviews.map((review) => (
                <div key={review.id}>
                  <div style={{ background: "rgba(255,248,228,0.4)", backdropFilter: "blur(12px)", border: "1px solid rgba(107,115,38,0.18)", borderRadius: 16, overflow: "hidden" }}>
                    <img
                      src={review.screenshot_url}
                      alt={`Review by ${review.customer_name}`}
                      loading="lazy"
                      style={{ width: "100%", display: "block", objectFit: "cover" }}
                    />
                    <div style={{ padding: "0.65rem 0.85rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "var(--color-umber)", opacity: 0.7, letterSpacing: "0.04em" }}>
                      — {review.customer_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer id="contact" style={{ background: "#E8B98A", color: "var(--color-umber)", padding: "5rem 1.5rem 2rem", borderTop: "1px solid rgba(107,115,38,0.2)" }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div>
            <img src={logoAsset.url} alt="Lattév Jouel" style={{ height: 96, width: "auto", display: "block" }} />
            <p className="mt-4 text-sm opacity-70 max-w-xs leading-relaxed">Fine contemporary jewellery. Handcrafted in India for the bold and the becoming.</p>
          </div>
          <div>
            <div className="uppercase tracking-luxe font-semibold" style={{ color: "var(--color-gold)", fontSize: "0.75rem", marginBottom: "1.25rem" }}>Navigate</div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop" className="hover:text-[var(--color-gold)] transition-colors">Collection</Link></li>
              <li><a href="#about" className="hover:text-[var(--color-gold)] transition-colors">About</a></li>
              <li><a href="#contact" className="hover:text-[var(--color-gold)] transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="uppercase tracking-luxe font-semibold" style={{ color: "var(--color-gold)", fontSize: "0.75rem", marginBottom: "1.25rem" }}>Contact</div>
            <p className="font-display text-2xl" style={{ color: "var(--color-umber)" }}>Lavanya Pahwa</p>
            <ul className="mt-4 space-y-2 text-sm opacity-80">
              <li>
                <a href="https://instagram.com/lattevjouel" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-gold)] transition-colors">
                  Instagram · <em className="font-display italic">@lattevjouel</em>
                </a>
              </li>
              <li>
                <a href="mailto:lavanyapahwa717@gmail.com" className="hover:text-[var(--color-gold)] transition-colors break-all">lavanyapahwa717@gmail.com</a>
              </li>
            </ul>
            <p className="mt-5 text-base" style={{ color: "var(--color-gold)", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontStyle: "normal", letterSpacing: "0.05em" }}>Love, Lattév.</p>
          </div>
        </div>
        {/* Policy links */}
        <div className="max-w-7xl mx-auto mt-10" style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5 }}>
          <Link to="/policies/shipping" style={{ color: "var(--color-umber)", textDecoration: "none" }}>Shipping Policy</Link>
          <Link to="/policies/returns" style={{ color: "var(--color-umber)", textDecoration: "none" }}>Returns</Link>
          <Link to="/policies/terms" style={{ color: "var(--color-umber)", textDecoration: "none" }}>Terms & FAQs</Link>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[rgba(107,115,38,0.15)] text-center text-[0.65rem] tracking-wider-luxe uppercase opacity-60">
          © {new Date().getFullYear()} Lattév Jouel. All pieces handcrafted in India.
        </div>
      </footer>
    </div>
  );
}
