// services/api.js
import axios from 'axios';

const API_BASE_URL = '/api';
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Assets API
export const assetsAPI = {
  getAll: (filters = {}) => api.get('/assets', { params: filters }),
  getById: (id) => api.get(`/assets/${id}`),
  create: (assetData) => api.post('/assets', assetData),
  update: (id, assetData) => api.put(`/assets/${id}`, assetData),
  delete: (id) => api.delete(`/assets/${id}`),
  getStats: () => api.get('/assets/stats/summary'),
};

// Maintenance API - Make sure ALL endpoints are here
export const maintenanceAPI = {
  getAll: () => api.get('/maintenance'),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (maintenanceData) => api.post('/maintenance', maintenanceData),
  update: (id, maintenanceData) =>
    api.put(`/maintenance/${id}`, maintenanceData),
  updateStatus: (id, status) =>
    api.patch(`/maintenance/${id}/status`, { status }),
  delete: (id) => api.delete(`/maintenance/${id}`),
};

// Spare Parts API
export const sparePartsAPI = {
  getAll: (filters = {}) => api.get('/spare-parts', { params: filters }),
  getById: (partNumber) => api.get(`/spare-parts/${partNumber}`),
  create: (sparePartData) => api.post('/spare-parts', sparePartData),
  update: (partNumber, sparePartData) =>
    api.put(`/spare-parts/${partNumber}`, sparePartData),
  delete: (partNumber) => api.delete(`/spare-parts/${partNumber}`),
  getUsage: () => api.get('/spare-parts/usage'), // Optional: For usage history
};

// Purchase Requests API
export const purchaseRequestsAPI = {
  getAll: (filters = {}) => api.get('/purchase-requests', { params: filters }),
  getById: (id) => api.get(`/purchase-requests/${id}`),
  create: (requestData) => api.post('/purchase-requests', requestData),
  update: (id, requestData) => api.put(`/purchase-requests/${id}`, requestData),
  delete: (id) => api.delete(`/purchase-requests/${id}`),
  getStats: () => api.get('/purchase-requests/stats/summary'), // Optional: For pending counts, etc.
};