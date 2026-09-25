import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
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
      // If token expired, remove it so UI triggers redirect
      if (localStorage.getItem('support_token')) {
        localStorage.removeItem('support_token');
        localStorage.removeItem('support_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Ticket endpoints
export const ticketApi = {
  getTickets: (params) => api.get('/tickets', { params }),
  getTicketById: (id) => api.get(`/tickets/${id}`),
  createTicket: (data) => api.post('/tickets', data),
  updateTicket: (id, data) => api.put(`/tickets/${id}`, data),
  deleteTicket: (id) => api.delete(`/tickets/${id}`),
  getStats: () => api.get('/tickets/stats/summary'),
  getComments: (ticketId) => api.get(`/tickets/${ticketId}/comments`),
  addComment: (ticketId, comment) => api.post(`/tickets/${ticketId}/comments`, { comment }),
};

// Users / Agents endpoints
export const userApi = {
  getAgents: () => api.get('/users?role=agent'),
};

export default api;
