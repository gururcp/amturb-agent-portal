import axios from 'axios';
// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('agent');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  changePin: (data) => api.post('/auth/change-pin', data),
  getMe: () => api.get('/auth/me')
};
// Agent APIs
export const agentAPI = {
  getAll: () => api.get('/agents'),
  create: (data) => api.post('/agents', data),
  toggleStatus: (id) => api.patch(`/agents/${id}/toggle-status`),
  resetPin: (id, newPin) => api.post(`/agents/${id}/reset-pin`, { newPin })
};
// Merchant APIs
export const merchantAPI = {
  getAll: (params) => api.get('/merchants', { params }),
  getOne: (id) => api.get(`/merchants/${id}`),
  create: (data) => api.post('/merchants', data),
  update: (id, data) => api.patch(`/merchants/${id}`, data),
  addVisitNote: (id, note) => api.post(`/merchants/${id}/visit-note`, { note }),
  addOwnerNote: (id, note) => api.post(`/merchants/${id}/owner-note`, { note }),
  updateStatus: (id, status) => api.patch(`/merchants/${id}/status`, { status })
};
// Service APIs
export const serviceAPI = {
  getAll: () => api.get('/services'),
  getMerchantsByService: (slug) => api.get(`/services/${slug}/merchants`),
  create: (data) => api.post('/services', data)
};
// Dashboard APIs
export const dashboardAPI = {
  getAgentStats: () => api.get('/dashboard/agent-stats'),
  getOwnerStats: () => api.get('/dashboard/owner-stats'),
  getFollowUps: () => api.get('/dashboard/follow-ups'),
  getYesterdaySoundBox: () => api.get('/dashboard/yesterday-soundbox')
};
export default api;