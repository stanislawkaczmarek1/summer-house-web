import api from './client';

export const authApi = {
  login:   (credentials) => api.post('/auth/login', credentials),
  logout:  ()            => api.post('/auth/logout'),
  refresh: ()            => api.post('/auth/refresh'),
};
