import React from "react";
import { useWishlist } from "../../context/WishlistContext";

interface LiquidGlassCardProps {
  href?: string;
  productId?: string;
  img?: string;
  name: string;
  price?: number;
  was?: number;
  sold?: boolean;
  description?: string;
  /** Optional: called when the user clicks "Add to Cart" */
  onAddToCart?: () => void;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  href,
  productId,
  img,
  name,
  price,
  was,
  sold,
  description,
  onAddToCart,
}) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = productId ? isWishlisted(productId) : false;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;
    toggleWishlist({ id: productId, name, price, was, img, href: productId ? `/product/${productId}` : href });
  };

  const inner = (
    <div className="lg-card">
      <div className="lg-card__glow" />
      <div className="lg-card__sheen" />
      <div className="lg-card__border" />
      <div className="lg-card__media">
        {img ? (
          <img src={img} alt={name} loading="lazy" />
        ) : (
          <div className="lg-card__placeholder" />
        )}
        {sold && <span className="lg-card__ribbon">Sold</span>}

        {/* Wishlist heart button */}
        {productId && (
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            style={{
              position: "absolute",
              top: "0.6rem",
              right: "0.6rem",
              zIndex: 5,
              background: "rgba(232,185,138,0.75)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(107,115,38,0.25)",
              borderRadius: "50%",
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.25s ease, background 0.25s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.15)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          >
            {wishlisted ? (
              // Filled heart
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#6B7326" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
              </svg>
            ) : (
              // Outline heart
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F5820" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="lg-card__body">
        <h3 className="lg-card__name">{name}</h3>
        {description && (
          <p className="lg-card__desc" style={{ fontSize: "0.75rem", color: "var(--color-umber)", opacity: 0.7, margin: "0.5rem 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {description}
          </p>
        )}
        {price != null ? (
          <p className="lg-card__price">
            <span>₹{price.toLocaleString('en-IN')}</span>
            {was != null && <em>₹{was.toLocaleString('en-IN')}</em>}
          </p>
        ) : sold ? (
          <p className="lg-card__price"><span>Sold out</span></p>
        ) : null}
        {!sold && (productId || href) && <span className="lg-card__cta">View Piece →</span>}
        {!sold && onAddToCart && (
          <button
            type="button"
            className="lg-card__add-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart();
            }}
            aria-label={`Add ${name} to cart`}
          >
            + Add to Cart
          </button>
        )}
      </div>
    </div>
  );
  if (!sold) {
    if (productId) {
      return (
        <a href={`/product/${productId}`} className="lg-card__link">
          {inner}
        </a>
      );
    }
    if (href) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="lg-card__link">
          {inner}
        </a>
      );
    }
  }
  return <div className="lg-card__link lg-card__link--static">{inner}</div>;
};
