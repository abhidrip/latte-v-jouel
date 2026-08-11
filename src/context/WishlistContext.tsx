import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WishlistItem = {
  id: string;
  name: string;
  price?: number;
  was?: number;
  img?: string;
  href?: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const WishlistCtx = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = 'lattev_wishlist_v1';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  // Persist whenever items change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* ignore */ }
  }, [items, loaded]);

  // ── Actions ──────────────────────────────────────────────────

  const isWishlisted = useCallback((id: string) => {
    return items.some((i) => i.id === id);
  }, [items]);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    const exists = items.some((i) => i.id === item.id);
    
    setItems((prev) => {
      if (exists) return prev.filter((i) => i.id !== item.id);
      return [...prev, item];
    });

    if (!exists) {
      toast("Added to Wishlist", {
        description: `${item.name} has been added to your wishlist.`,
        action: {
          label: "View Wishlist",
          onClick: () => navigate({ to: "/wishlist" }),
        },
      });
    } else {
      toast("Removed from Wishlist", {
        description: `${item.name} has been removed from your wishlist.`,
      });
    }
  }, [items, navigate]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearWishlist = useCallback(() => setItems([]), []);

  const count = items.length;

  return (
    <WishlistCtx.Provider value={{ items, count, isWishlisted, toggleWishlist, removeItem, clearWishlist }}>
      {children}
    </WishlistCtx.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistCtx);
  if (!ctx) throw new Error('useWishlist must be used within <WishlistProvider>');
  return ctx;
}
