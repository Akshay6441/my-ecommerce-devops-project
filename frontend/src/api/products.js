import api from './client';

export const getProducts = (params) => api.get('/api/products', { params });
export const getProduct = (slug) => api.get(`/api/products/${slug}`);
export const createProduct = (data) => api.post('/api/products', data);
export const updateProduct = (id, data) => api.put(`/api/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/api/products/${id}`);

export const getCategories = () => api.get('/api/categories');
export const createCategory = (data) => api.post('/api/categories', data);

export const getReviews = (productId) => api.get(`/api/products/${productId}/reviews`);
export const createReview = (productId, data) => api.post(`/api/products/${productId}/reviews`, data);
