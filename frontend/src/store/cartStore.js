import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getCart as apiGetCart,
  addToCart as apiAdd,
  updateCartItem as apiUpdate,
  removeCartItem as apiRemove,
  clearCart as apiClear,
} from '../api/cart';
import toast from 'react-hot-toast';

/**
 * Cart store supports two modes:
 *  - Authenticated: syncs with backend API
 *  - Guest: persisted locally in localStorage
 */
const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],          // [{ id, product_id, quantity, product }]
      loading: false,
      synced: false,      // true once fetched from backend

      // ── Helpers ──────────────────────────────────────────────
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0),

      // ── Fetch from backend (call after login) ─────────────────
      fetchCart: async () => {
        set({ loading: true });
        try {
          const res = await apiGetCart();
          set({ items: res.data, synced: true });
        } catch {
          // silently fail – stay with local
        } finally {
          set({ loading: false });
        }
      },

      // ── Add to cart ───────────────────────────────────────────
      addItem: async (product, quantity = 1, isAuth = false) => {
        if (isAuth) {
          try {
            await apiAdd({ product_id: product.id, quantity });
            // Re-fetch to stay in sync
            const cart = await apiGetCart();
            set({ items: cart.data });
            toast.success(`${product.name} added to cart`);
          } catch (e) {
            toast.error(e.response?.data?.detail || 'Failed to add to cart');
          }
        } else {
          // Guest mode – local only
          set((state) => {
            const existing = state.items.find((i) => i.product_id === product.id);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.product_id === product.id
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
                ),
              };
            }
            return {
              items: [
                ...state.items,
                { id: Date.now(), product_id: product.id, quantity, product },
              ],
            };
          });
          toast.success(`${product.name} added to cart`);
        }
      },

      // ── Update quantity ───────────────────────────────────────
      updateQty: async (itemId, quantity, isAuth = false) => {
        if (quantity < 1) { get().removeItem(itemId, isAuth); return; }
        if (isAuth) {
          try {
            await apiUpdate(itemId, { quantity });
            set((state) => ({
              items: state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
            }));
          } catch (e) {
            toast.error('Failed to update quantity');
          }
        } else {
          set((state) => ({
            items: state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
          }));
        }
      },

      // ── Remove item ───────────────────────────────────────────
      removeItem: async (itemId, isAuth = false) => {
        if (isAuth) {
          try {
            await apiRemove(itemId);
          } catch { /* ignore */ }
        }
        set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }));
        toast.success('Item removed from cart');
      },

      // ── Clear ─────────────────────────────────────────────────
      clearCart: async (isAuth = false) => {
        if (isAuth) {
          try { await apiClear(); } catch { /* ignore */ }
        }
        set({ items: [] });
      },

      // ── Merge guest cart into backend after login ─────────────
      mergeGuestCart: async (guestItems) => {
        for (const item of guestItems) {
          try {
            await apiAdd({ product_id: item.product_id, quantity: item.quantity });
          } catch { /* skip duplicates */ }
        }
        const cart = await apiGetCart();
        set({ items: cart.data, synced: true });
      },
    }),
    {
      name: 'shopvibe-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;
