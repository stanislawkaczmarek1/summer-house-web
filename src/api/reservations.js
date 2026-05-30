import api from './client';

export const reservationsApi = {
  // Public
  create:   (data)      => api.post('/reservations', data),

  // Admin
  getAll:   (params)    => api.get('/reservations', { params }),
  getById:  (id)        => api.get(`/reservations/${id}`),
  update:   (id, data)  => api.patch(`/reservations/${id}`, data),
  remove:   (id)        => api.delete(`/reservations/${id}`),
};
