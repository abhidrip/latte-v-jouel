import { useState } from 'react';
import { useBanner } from '../../hooks/useBanner';

/**
 * DiscountBanner
 *
 * Sits BELOW the fixed nav as a sticky top bar.
 * Supabase-driven, session-dismissible.
 * Keyframes are in styles.css (avoids OXC template-literal parse issues).
 */
export function DiscountBanner() {
  const { data: banner } = useBanner();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('banner_dismissed') === '1';
    } catch {
      return false;
    }
  });

  if (!banner?.enabled || dismissed) return null;

  const dismiss = () => {
    try { sessionStorage.setItem('banner_dismissed', '1'); } catch { /* ignore */ }
    setDismissed(true);
  };

  return (
    <div
      role="banner"
      className="discount-banner"
    >
      <span className="discount-banner__text">{banner.text}</span>

      {banner.link && (
        <a
          href={banner.link}
          className="discount-banner__link"
        >
          {banner.link_label || 'Shop Now'} →
        </a>
      )}

      <button
        onClick={dismiss}
        aria-label="Dismiss banner"
        className="discount-banner__close"
      >
        ×
      </button>
    </div>
  );
}
