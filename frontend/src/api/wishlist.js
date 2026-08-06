import api from './client';

export const getWishlist = () => api.get('/api/wishlist');
export const addToWishlist = (productId) => api.post(`/api/wishlist/${productId}`);
export const removeFromWishlist = (productId) => api.delete(`/api/wishlist/${productId}`);
export const checkWishlist = (productId) => api.get(`/api/wishlist/check/${productId}`);
export const getRelated = (productId, limit = 4) =>
  api.get(`/api/products/${productId}/related`, { params: { limit } });
export const getSearchSuggestions = (q) =>
  api.get('/api/search/suggestions', { params: { q } });
