import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { useEffect, useState, useRef, useCallback } from "react";
import { useProductImages } from "../hooks/useProductImages";
import { useRelatedProducts } from "../hooks/useRelatedProducts";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Lattév Jouel — Product" },
    ],
  }),
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
  material?: string;
  stock?: number | null;
  sizes?: string[] | null;
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div style={{ background: "var(--background)", minHeight: "100vh", paddingTop: "6rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 6rem)" }}>
        <div style={{ background: "rgba(232,185,138,0.3)", minHeight: "50vh", animation: "skeletonPulse 1.5s ease-in-out infinite" }} />
        <div style={{ padding: "4rem 3rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {[80, "70%", 100, 120, "auto"].map((w, i) => (
            <div key={i} style={{ height: i === 3 ? 120 : i === 4 ? 52 : 22, width: typeof w === "number" ? w : w, borderRadius: i === 4 ? 999 : 8, background: i === 3 || i === 4 ? "rgba(107,115,38,0.2)" : "rgba(232,185,138,0.5)", animation: "skeletonPulse 1.5s ease-in-out infinite", marginTop: i === 4 ? "auto" : 0 }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes skeletonPulse { 0%,100%{opacity:1}50%{opacity:0.45} }`}</style>
    </div>
  );
}

// ── JSON-LD for Google Shopping ───────────────────────────────────────────────
function ProductJsonLd({ product, images }: { product: Product; images: string[] }) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} — fine handcrafted jewellery by Lattév Jouel`,
    image: images.length ? images : product.img ? [product.img] : [],
    brand: { "@type": "Brand", name: "Lattév Jouel" },
    category: product.category,
    material: product.material,
    offers: {
      "@type": "Offer",
      url: `https://lattevjouel.com/product/${product.id}`,
      priceCurrency: "INR",
      price: product.price ?? 0,
      availability: (product.sold || product.stock === 0)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Lattév Jouel" },
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

// ── Image Gallery ─────────────────────────────────────────────────────────────
function ImageGallery({ images, productName }: { images: string[]; productName: string }) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback(() => setActive(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive(i => (i + 1) % images.length), [images.length]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40) next();
    else if (dx > 40) prev();
    touchStartX.current = null;
  };

  if (images.length === 0) {
    return (
      <div style={{ position: "relative", minHeight: "60vh", background: "rgba(232,185,138,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.75rem", opacity: 0.35 }}>Archive Piece</span>
      </div>
    );
  }

  return (
    <div style={{ position: "sticky", top: "5.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Main image */}
      <div
        style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden", background: "var(--background)", cursor: images.length > 1 ? "grab" : "default" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          key={active}
          src={images[active]}
          alt={`${productName} — view ${active + 1}`}
          width={800}
          height={1000}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", animation: "galleryFade 0.3s ease" }}
        />
        {/* Prev/next chevrons — only when > 1 image */}
        {images.length > 1 && (
          <>
            <button
              aria-label="Previous image"
              onClick={prev}
              style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,248,230,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", zIndex: 2 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              aria-label="Next image"
              onClick={next}
              style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,248,230,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", zIndex: 2 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              style={{
                flexShrink: 0,
                width: 64,
                height: 80,
                padding: 0,
                border: `2px solid ${i === active ? "var(--color-gold)" : "transparent"}`,
                borderRadius: 4,
                overflow: "hidden",
                cursor: "pointer",
                background: "none",
                transition: "border-color 0.2s",
              }}
            >
              <img src={url} alt={`Thumbnail ${i + 1}`} width={64} height={80} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}

      {/* Dot indicator for mobile */}
      {images.length > 1 && (
        <div className="md:hidden" style={{ display: "flex", gap: "0.35rem", justifyContent: "center" }}>
          {images.map((_, i) => (
            <div key={i} onClick={() => setActive(i)} style={{ width: i === active ? 18 : 6, height: 6, borderRadius: 999, background: "var(--color-gold)", opacity: i === active ? 1 : 0.3, cursor: "pointer", transition: "width 0.2s, opacity 0.2s" }} />
          ))}
        </div>
      )}
      <style>{`@keyframes galleryFade { from{opacity:0;transform:scale(1.02)} to{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}

// ── Size Selector ─────────────────────────────────────────────────────────────
function SizeSelector({ sizes, selected, onSelect }: { sizes: string[]; selected: string | null; onSelect: (s: string) => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-umber)", opacity: 0.6 }}>
          Size {selected && <span style={{ color: "var(--color-gold)", opacity: 1 }}>— {selected}</span>}
        </span>
        <a
          href="https://wa.me/918077762221?text=Hi%2C+can+you+help+me+find+my+ring+size%3F"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", color: "var(--color-gold)", textDecoration: "underline", opacity: 0.8 }}
        >
          Size Guide
        </a>
      </div>
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {sizes.map(size => (
          <button
            key={size}
            onClick={() => onSelect(size)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              border: `1.5px solid ${selected === size ? "var(--color-gold)" : "rgba(107,115,38,0.22)"}`,
              background: selected === size ? "rgba(107,115,38,0.1)" : "transparent",
              color: "var(--color-umber)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.78rem",
              fontWeight: selected === size ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Stock badge ───────────────────────────────────────────────────────────────
function StockBadge({ stock, sold }: { stock?: number | null; sold?: boolean }) {
  if (sold || stock === 0) {
    return <span style={{ display: "inline-block", padding: "0.25rem 0.75rem", background: "rgba(160,60,60,0.12)", color: "#a03c3c", borderRadius: 999, fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Sold Out</span>;
  }
  if (stock !== null && stock !== undefined && stock <= 3) {
    return <span style={{ display: "inline-block", padding: "0.25rem 0.75rem", background: "rgba(185,120,40,0.12)", color: "#b97828", borderRadius: 999, fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Only {stock} left</span>;
  }
  return null;
}

// ── Trust badges ──────────────────────────────────────────────────────────────
function TrustRow() {
  const badges = [
    { icon: "🔒", label: "Secure Checkout" },
    { icon: "📦", label: "Handpacked in India" },
    { icon: "↩️", label: "Easy Returns" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", flexWrap: "wrap" }}>
      {badges.map(b => (
        <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "var(--color-umber)", opacity: 0.55, letterSpacing: "0.06em" }}>
          <span>{b.icon}</span><span>{b.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Related Products strip ────────────────────────────────────────────────────
function RelatedProducts({ productId, category }: { productId: string; category: string }) {
  const { data: related = [], isLoading } = useRelatedProducts(productId, category);

  if (isLoading || related.length === 0) return null;

  return (
    <section style={{ padding: "4rem 2rem", background: "var(--background)", borderTop: "1px solid rgba(232,185,138,0.2)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--color-gold)", opacity: 0.8, marginBottom: "0.5rem" }}>
            From the Collection
          </div>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300, color: "var(--color-umber)", margin: 0 }}>
            You May Also Like
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {related.map(p => (
            <Link
              key={p.id}
              to="/product/$id"
              params={{ id: p.id }}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div style={{ overflow: "hidden", borderRadius: 8, background: "rgba(232,185,138,0.08)", border: "1px solid rgba(232,185,138,0.15)", transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(107,115,38,0.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div style={{ aspectRatio: "4/5", overflow: "hidden" }}>
                  {p.img ? (
                    <img src={p.img} alt={p.name} width={400} height={500} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "rgba(232,185,138,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ opacity: 0.3, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "'DM Sans'" }}>No image</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: "0.9rem 1rem" }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "var(--color-umber)", marginBottom: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "var(--color-gold)" }}>{p.price ? `₹${p.price.toLocaleString("en-IN")}` : "—"}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main product page ─────────────────────────────────────────────────────────
function ProductPage() {
  const { id } = Route.useParams();
  const { addItem, count } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq(isUUID ? "id" : "name", id)
        .single();
      if (error) throw error;
      return data as Product;
    },
  });

  const { data: productImages = [] } = useProductImages(product?.id);
  const imageUrls = productImages.map(i => i.url);
  // Fallback: if product_images table is empty (migration not run yet), use img
  const galleryImages = imageUrls.length > 0 ? imageUrls : product?.img ? [product.img] : [];

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    addItem({
      name: product.name + (selectedSize ? ` (Size ${selectedSize})` : ""),
      price: product.price!,
      img: product.img,
      href: `/product/${product.id}`,
    });
  };

  if (isLoading) return <ProductSkeleton />;

  if (isError || !product) {
    return (
      <div style={{ background: "var(--background)", color: "var(--foreground)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✦</div>
        <h1 className="font-display" style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
          {isError ? "Something went wrong" : "Piece not found"}
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", opacity: 0.6, marginBottom: "2rem", maxWidth: 320 }}>
          {isError ? "We couldn't connect right now. Please try again." : "This piece may have sold out or been removed."}
        </p>
        <Link to="/shop" search={{ category: "all" }} className="liquid-glass-btn">← Back to Collection</Link>
      </div>
    );
  }

  const isSoldOut = product.sold || product.stock === 0;

  return (
    <div style={{ background: "var(--background)", color: "var(--foreground)", minHeight: "100vh" }}>
      {/* SEO */}
      <ProductJsonLd product={product} images={galleryImages} />

      {/* ── Nav ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "1.15rem 2rem", background: "rgba(232,185,138,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(107,115,38,0.18)" }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/shop" search={{ category: "all" }} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--color-gold)", opacity: 0.8 }} className="hover:opacity-100 transition-opacity">
            ← Collection
          </Link>
          <Link to="/" aria-label="Lattév Jouel home">
            <img src="/lattev_transparent.webp" alt="Lattév Jouel" width={56} height={56} style={{ height: "clamp(40px,4vw,56px)", width: "auto", display: "block" }} />
          </Link>
          <Link to="/cart" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--color-gold)" }}>
            Cart ({count})
          </Link>
        </div>
      </nav>

      {/* ── Body ── */}
      <div style={{ paddingTop: "5.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 5.5rem)", alignItems: "start" }} className="product-layout">

          {/* Left: Gallery */}
          <div style={{ padding: "2rem 2rem 2rem 2rem" }}>
            <ImageGallery images={galleryImages} productName={product.name} />
          </div>

          {/* Right: Details */}
          <div style={{ padding: "3rem 3rem 3rem 1rem", display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 560 }}>

            {/* Category + stock */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--color-gold)", opacity: 0.85 }}>
                {product.category}
              </div>
              <StockBadge stock={product.stock} sold={product.sold} />
            </div>

            {/* Name */}
            <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.1, color: "var(--color-umber)", fontWeight: 300, margin: 0 }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1.15rem", fontWeight: 600, color: "var(--color-umber)" }}>
              {product.price ? (
                <>
                  ₹{product.price.toLocaleString("en-IN")}
                  {product.was && (
                    <span style={{ fontWeight: 400, textDecoration: "line-through", opacity: 0.4, marginLeft: "0.75rem", fontSize: "0.9em" }}>
                      ₹{product.was.toLocaleString("en-IN")}
                    </span>
                  )}
                  {product.was && product.price && (
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.72rem", background: "rgba(107,115,38,0.12)", color: "var(--color-gold)", padding: "0.15rem 0.5rem", borderRadius: 999 }}>
                      {Math.round((1 - product.price / product.was) * 100)}% off
                    </span>
                  )}
                </>
              ) : (
                <span style={{ opacity: 0.5 }}>Price upon request</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem", lineHeight: 1.85, color: "var(--color-umber)", opacity: 0.78, margin: 0 }}>
                {product.description}
              </p>
            )}

            {/* Size selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <SizeSelector sizes={product.sizes} selected={selectedSize} onSelect={s => { setSelectedSize(s); setSizeError(false); }} />
                {sizeError && (
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#a03c3c", marginTop: "0.4rem" }}>
                    Please select a size to continue.
                  </p>
                )}
              </div>
            )}

            {/* Material */}
            {product.material && (
              <div style={{ borderTop: "1px solid rgba(232,185,138,0.2)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-gold)", opacity: 0.75 }}>Material</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "var(--color-umber)", opacity: 0.8 }}>{product.material}</div>
              </div>
            )}

            {/* Care note */}
            <div style={{ background: "rgba(232,185,138,0.1)", border: "1px solid rgba(232,185,138,0.2)", borderRadius: 10, padding: "0.85rem 1rem" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gold)", marginBottom: "0.3rem", opacity: 0.8 }}>Care</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "var(--color-umber)", opacity: 0.7, lineHeight: 1.7 }}>
                Avoid contact with water, perfume, and chemicals. Store in the pouch provided. Wipe gently with a soft cloth.
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.5rem" }}>
              {!isSoldOut && product.price ? (
                <button
                  onClick={handleAddToCart}
                  style={{
                    width: "100%",
                    padding: "1.1rem",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.75rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: "#fff",
                    background: sizeError ? "rgba(160,60,60,0.8)" : "linear-gradient(135deg, #4F5820 0%, #6B7326 100%)",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "opacity 0.2s, transform 0.15s, background 0.2s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                >
                  + Add to Selection
                </button>
              ) : (
                <div style={{ width: "100%", padding: "1.1rem", textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-umber)", opacity: 0.4, border: "1px solid rgba(107,115,38,0.2)", borderRadius: 10 }}>
                  Sold Out
                </div>
              )}

              {/* WhatsApp enquiry */}
              <a
                href={`https://wa.me/918077762221?text=${encodeURIComponent(`Hi! I'm interested in "${product.name}" on lattevjouel.com — could you tell me more?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.9rem", borderRadius: 10, border: "1px solid rgba(107,115,38,0.25)", background: "transparent", color: "var(--color-umber)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", transition: "background 0.2s, border-color 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(37,211,102,0.08)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(37,211,102,0.4)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(107,115,38,0.25)"; }}
              >
                <WhatsAppIcon /> Ask on WhatsApp
              </a>
            </div>

            <TrustRow />
          </div>
        </div>
      </div>

      {/* ── Related Products ── */}
      <RelatedProducts productId={product.id} category={product.category} />

      {/* Responsive layout */}
      <style>{`
        @media (max-width: 768px) {
          .product-layout {
            grid-template-columns: 1fr !important;
          }
          .product-layout > div:first-child {
            padding: 1rem !important;
          }
          .product-layout > div:last-child {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
