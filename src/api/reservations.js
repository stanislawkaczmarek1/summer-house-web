import api from './client';

export const reservationsApi = {
  create: (data) => api.post('/reservations', data),

  getAll: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  update: (id, data) => api.patch(`/reservations/${id}`, data),
  cancel: (id) => api.patch(`/reservations/${id}/cancel`),
  remove: (id) => api.delete(`/reservations/${id}`),
};
