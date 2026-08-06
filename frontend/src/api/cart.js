import api from './client';

export const getCart = () => api.get('/api/cart');
export const addToCart = (data) => api.post('/api/cart', data);
export const updateCartItem = (itemId, data) => api.put(`/api/cart/${itemId}`, data);
export const removeCartItem = (itemId) => api.delete(`/api/cart/${itemId}`);
export const clearCart = () => api.delete('/api/cart');
