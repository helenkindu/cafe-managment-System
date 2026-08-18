import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE
});

// ---------- AUTH HEADER MANAGEMENT ----------
export const setAuthHeader = (userId) => {
  if (userId) {
    api.defaults.headers.common['x-user-id'] = userId;
  } else {
    delete api.defaults.headers.common['x-user-id'];
  }
};

// ---------- AUTH API ----------
export const seedUsers = () => api.post('/auth/seed');
export const loginUser = (username, password) => api.post('/auth/login', { username, password });
export const getUsers = () => api.get('/auth/users');
export const updateUser = (id, data) => api.put(`/auth/users/${id}`, data);

// ---------- WAITER API ----------
export const getWaiters = () => api.get('/waiters');
// This endpoint already creates the user on the backend – no separate registration needed
export const addWaiter = (data) => api.post('/waiters', data);
export const deleteWaiter = (id) => api.delete(`/waiters/${id}`);

// ---------- CATEGORY API ----------
export const getCategories = () => api.get('/categories');
export const addCategory = (data) => api.post('/categories', data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ---------- PRODUCT API ----------
export const getProducts = (categoryId) => api.get('/products', { params: { categoryId } });
export const addProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ---------- ORDER API ----------
export const getOrders = (status, waiterId) => api.get('/orders', { params: { status, waiterId } });
export const createOrder = (orderData) => api.post('/orders', orderData);
export const approveOrder = (orderId) => api.put(`/orders/${orderId}/approve`);
export const cancelOrder = (orderId) => api.put(`/orders/${orderId}/cancel`);
export const updateOrderItemStatus = (orderId, itemId, dept, isReady) =>
  api.put(`/orders/${orderId}/item-status`, { itemId, dept, isReady });

// ---------- SETTINGS API ----------
export const getSetting = (key) => api.get(`/settings/${key}`);
export const updateSetting = (key, value) => api.put(`/settings/${key}`, { value });

// ---------- PREPARED ITEMS API ----------
export const getPreparedItems = (category, targetDept) =>
  api.get('/prepared-items', { params: { category, targetDept } });
export const getPreparedItem = (id) => api.get(`/prepared-items/${id}`);
export const addPreparedItem = (data) => api.post('/prepared-items', data);
export const updatePreparedItem = (id, data) => api.put(`/prepared-items/${id}`, data);
export const deletePreparedItem = (id) => api.delete(`/prepared-items/${id}`);
export const updatePreparedItemQuantity = (id, quantity, action) =>
  api.put(`/prepared-items/${id}/quantity`, { quantity, action });
export const seedPreparedItems = () => api.post('/prepared-items/seed');

// ---------- DASHBOARD API ----------
export const getDashboardOverview = () => api.get('/dashboard/overview');
export const getPreparedItemsSummary = () => api.get('/dashboard/prepared-items-summary');

export default api;