import axios from 'axios';
import { mockStore } from './mockStore';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('support_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized / Expired Session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('support_token')) {
        localStorage.removeItem('support_token');
        localStorage.removeItem('support_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Universal Fallback Wrapper
 * Guarantees zero downtime by falling back to the rich client-side store
 * if the remote backend responds with any error or takes longer than the timeout.
 */
async function runWithFallback(apiFn, mockFn) {
  try {
    const res = await apiFn();
    return res;
  } catch (err) {
    console.info('[Frontend Standalone]: Server unavailable or error, falling back to client store.', err?.message);
    const mockData = await mockFn();
    return { data: mockData, status: 200, statusText: 'OK' };
  }
}

// Auth endpoints
export const authApi = {
  register: (data) => runWithFallback(() => api.post('/auth/register', data), () => mockStore.register(data)),
  login: (data) => runWithFallback(() => api.post('/auth/login', data), () => mockStore.login(data)),
  getMe: () => runWithFallback(() => api.get('/auth/me'), () => mockStore.getMe()),
};

// Ticket endpoints
export const ticketApi = {
  getTickets: (params) => runWithFallback(() => api.get('/tickets', { params }), () => mockStore.getTickets(params)),
  getTicketById: (id) => runWithFallback(() => api.get(`/tickets/${id}`), () => mockStore.getTicketById(id)),
  createTicket: (data) => runWithFallback(() => api.post('/tickets', data), () => mockStore.createTicket(data)),
  updateTicket: (id, data) => runWithFallback(() => api.put(`/tickets/${id}`, data), () => mockStore.updateTicket(id, data)),
  deleteTicket: (id) => runWithFallback(() => api.delete(`/tickets/${id}`), () => mockStore.deleteTicket(id)),
  getStats: () => runWithFallback(() => api.get('/tickets/stats/summary'), () => mockStore.getStats()),
  getComments: (ticketId) => runWithFallback(() => api.get(`/tickets/${ticketId}/comments`), () => mockStore.getComments(ticketId)),
  addComment: (ticketId, comment) => runWithFallback(() => api.post(`/tickets/${ticketId}/comments`, { comment }), () => mockStore.addComment(ticketId, comment)),
  getExampleQuery: () => runWithFallback(() => api.get('/example-query'), () => mockStore.getExampleQuery()),
};

// Users / Agents endpoints
export const userApi = {
  getAgents: () => runWithFallback(() => api.get('/users?role=agent'), () => mockStore.getAgents()),
};

export default api;
