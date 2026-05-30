import api from './client';

export const amenitiesApi = {
  // Public
  getAll:     ()          => api.get('/amenities'),

  // Admin
  create:     (data)      => api.post('/amenities', data),
  createBulk: (data)      => api.post('/amenities/bulk', data),
  update:     (id, data)  => api.patch(`/amenities/${id}`, data),
  remove:     (id)        => api.delete(`/amenities/${id}`),
};
