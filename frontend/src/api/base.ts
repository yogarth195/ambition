import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://overenvious-joyce-unaccommodating.ngrok-free.dev/api',
  headers: {
    'Content-Type': 'application/json',
    // Free ngrok tunnels serve an HTML interstitial (no CORS headers) to
    // real browser traffic instead of proxying through — this header is
    // ngrok's documented bypass. Harmless against any non-ngrok backend.
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
