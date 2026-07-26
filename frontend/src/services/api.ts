import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// In development, require VITE_API_URL to be set or use local default
let API_URL: string;
if (import.meta.env.DEV) {
  if (!import.meta.env.VITE_API_URL) {
    // Use local development URL by default
    API_URL = 'http://localhost:8000/api';
    console.warn('[api] VITE_API_URL not set — using local development URL:', API_URL);
  } else {
    API_URL = import.meta.env.VITE_API_URL;
  }
} else {
  // In production, VITE_API_URL must be set
  if (!import.meta.env.VITE_API_URL) {
    throw new Error('VITE_API_URL environment variable is required in production');
  }
  API_URL = import.meta.env.VITE_API_URL;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens - let the auth store handle redirect
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
