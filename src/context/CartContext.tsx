import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CartItem = {
  name: string;
  price: number;
  img?: string;
  href?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (name: string) => void;
  setQty: (name: string, qty: number) => void;
  clearCart: () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const CartCtx = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "lattev_cart_v1";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  // Load from localStorage after mount — SSR-safe (never runs on server)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore parse errors */
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage whenever items change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items, loaded]);

  // ── Actions ─────────────────────────────────────────────────

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    
    toast("Added to Cart", {
      description: `${item.name} has been added to your cart.`,
      action: {
        label: "View Cart",
        onClick: () => navigate({ to: "/cart" }),
      },
    });
  }, [navigate]);

  const removeItem = useCallback((name: string) => {
    setItems((prev) => prev.filter((i) => i.name !== name));
  }, []);

  const setQty = useCallback((name: string, qty: number) => {
    setItems((prev) => {
      if (qty < 1) return prev.filter((i) => i.name !== name);
      return prev.map((i) => (i.name === name ? { ...i, quantity: qty } : i));
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  // ── Derived ─────────────────────────────────────────────────

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartCtx.Provider
      value={{ items, count, total, addItem, removeItem, setQty, clearCart }}
    >
      {children}
    </CartCtx.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
