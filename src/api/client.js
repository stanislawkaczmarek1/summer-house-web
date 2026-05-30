import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,         // send httpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// If backend returns 401 and we're on an admin route, redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAdminRoute = window.location.pathname.startsWith('/admin');

    if (status === 401 && isAdminRoute) {
      window.location.href = '/admin/login';
    }

    return Promise.reject(error);
  }
);

export default api;
