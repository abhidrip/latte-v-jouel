import React from "react";


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
      </div>
      <div className="lg-card__body">
        <h3 className="lg-card__name">{name}</h3>
        {description && (
          <p className="lg-card__desc" style={{ fontSize: "0.75rem", color: "var(--color-ivory)", opacity: 0.7, margin: "0.5rem 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
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
