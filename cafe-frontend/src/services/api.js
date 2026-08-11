import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE
});

// Waiters API
export const getWaiters = () => api.get('/waiters');
export const addWaiter = (data) => api.post('/waiters', data);
export const deleteWaiter = (id) => api.delete(`/waiters/${id}`);

// Categories API
export const getCategories = () => api.get('/categories');
export const addCategory = (data) => api.post('/categories', data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Products API
export const getProducts = (categoryId) => api.get('/products', { params: { categoryId } });
export const addProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Orders API
export const getOrders = (status, waiterId) => api.get('/orders', { params: { status, waiterId } });
export const createOrder = (orderData) => api.post('/orders', orderData);
export const approveOrder = (orderId) => api.put(`/orders/${orderId}/approve`);
export const cancelOrder = (orderId) => api.put(`/orders/${orderId}/cancel`);
export const updateOrderItemStatus = (orderId, itemId, dept, isReady) => 
  api.put(`/orders/${orderId}/item-status`, { itemId, dept, isReady });

// Settings API (Cashier PIN stored in DB)
export const getSetting = (key) => api.get(`/settings/${key}`);
export const updateSetting = (key, value) => api.put(`/settings/${key}`, { value });

export default api;