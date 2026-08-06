import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlist';
import toast from 'react-hot-toast';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],        // [{ id, product_id, product, created_at }]
      loading: false,

      // IDs only for quick lookup
      ids: () => new Set(get().items.map((i) => i.product_id)),

      isWishlisted: (productId) => get().items.some((i) => i.product_id === productId),

      fetchWishlist: async () => {
        set({ loading: true });
        try {
          const res = await getWishlist();
          set({ items: res.data });
        } catch { /* not logged in — stay empty */ }
        finally { set({ loading: false }); }
      },

      toggle: async (product, isAuth) => {
        if (!isAuth) {
          toast.error('Please log in to save items to your wishlist');
          return;
        }
        const already = get().isWishlisted(product.id);
        if (already) {
          try {
            await removeFromWishlist(product.id);
            set((s) => ({ items: s.items.filter((i) => i.product_id !== product.id) }));
            toast.success(`${product.name} removed from wishlist`);
          } catch { toast.error('Failed to update wishlist'); }
        } else {
          try {
            await addToWishlist(product.id);
            // Optimistically add a minimal item; full data loaded on page visit
            set((s) => ({
              items: [
                { id: Date.now(), product_id: product.id, product, created_at: new Date().toISOString() },
                ...s.items,
              ],
            }));
            toast.success(`${product.name} added to wishlist ❤️`);
          } catch { toast.error('Failed to update wishlist'); }
        }
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'shopvibe-wishlist',
      partialize: (s) => ({ items: s.items }),
    }
  )
);

export default useWishlistStore;
