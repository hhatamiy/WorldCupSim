import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001',
});

// Add JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized) - token expired or invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for 401 errors from auth endpoints
    // Don't redirect for betting API errors (they might be quota/rate limit issues)
    if (error.response?.status === 401 && error.config?.url?.includes('/auth')) {
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

