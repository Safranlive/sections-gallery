import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sections-gallery_token');
    const shop = localStorage.getItem('sections-gallery_shop');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (shop && !config.params?.shop) {
      config.params = { ...config.params, shop };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('sections-gallery_token');
      localStorage.removeItem('sections-gallery_shop');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Sections API
export const sectionsApi = {
  getAll: () => api.get('/api/sections'),
  getBySlug: (slug) => api.get(`/api/sections/${slug}`),
  install: (slug) => api.post(`/api/sections/${slug}/install`),
  uninstall: (slug) => api.delete(`/api/sections/${slug}/uninstall`),
  getInstalled: () => api.get('/api/sections/installed/list'),
};

// Subscriptions API
export const subscriptionsApi = {
  getCurrent: () => api.get('/api/subscriptions/current'),
  getTiers: () => api.get('/api/subscriptions/tiers'),
  createCheckout: (tier) => api.post('/api/subscriptions/checkout', { tier }),
  confirmCheckout: (sessionId) => api.post('/api/subscriptions/checkout/success', { sessionId }),
  cancel: () => api.post('/api/subscriptions/cancel'),
  reactivate: () => api.post('/api/subscriptions/reactivate'),
};

// Analytics API
export const analyticsApi = {
  getOverview: (startDate, endDate) => 
    api.get('/api/analytics/overview', { params: { startDate, endDate } }),
  getTimeline: (days = 30) => 
    api.get('/api/analytics/timeline', { params: { days } }),
  track: (eventType, eventData, sectionId) => 
    api.post('/api/analytics/track', { eventType, eventData, sectionId }),
  getSectionUsage: () => api.get('/api/analytics/sections/usage'),
};

// Shopify API
export const shopifyApi = {
  getStore: () => api.get('/api/shopify/store'),
  getThemes: () => api.get('/api/shopify/themes'),
  getThemeAssets: (themeId, key) => 
    api.get(`/api/shopify/themes/${themeId}/assets`, { params: { key } }),
  installSection: (themeId, sectionSlug) => 
    api.post(`/api/shopify/themes/${themeId}/install-section`, { sectionSlug }),
  removeSection: (themeId, slug) => 
    api.delete(`/api/shopify/themes/${themeId}/remove-section/${slug}`),
};

export default api;