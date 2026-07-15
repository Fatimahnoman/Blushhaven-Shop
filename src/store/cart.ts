import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  price: number;
  image_key: string;
  category_slug?: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  couponCode: string | null;
  couponPercent: number;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  applyCoupon: (code: string, percent: number) => void;
  removeCoupon: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: null,
      couponPercent: 0,
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: s.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + qty } : i)),
            };
          }
          return { items: [...s.items, { ...item, quantity: qty }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)),
        })),
      clear: () => set({ items: [], couponCode: null, couponPercent: 0 }),
      applyCoupon: (code, percent) => set({ couponCode: code, couponPercent: percent }),
      removeCoupon: () => set({ couponCode: null, couponPercent: 0 }),
    }),
    { name: "lumiere-cart" }
  )
);

export function cartTotals(items: CartItem[], discountPercent: number) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = subtotal * (discountPercent / 100);
  const shipping = subtotal > 75 || subtotal === 0 ? 0 : 8;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;
  return { subtotal, discount, shipping, tax, total };
}
