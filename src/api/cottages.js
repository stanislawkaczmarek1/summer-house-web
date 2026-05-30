import api from './client';

export const cottagesApi = {
  // Public
  getAll:           (params)          => api.get('/cottages', { params }),
  getById:          (id)              => api.get(`/cottages/${id}`),
  getAvailability:  (id, params)      => api.get(`/cottages/${id}/availability`, { params }),

  // Admin
  create:           (data)            => api.post('/cottages', data),
  update:           (id, data)        => api.put(`/cottages/${id}`, data),
  patch:            (id, data)        => api.patch(`/cottages/${id}`, data),
  remove:           (id)              => api.delete(`/cottages/${id}`),

  // Images
  addImage:         (id, data)        => api.post(`/cottages/${id}/images`, data),
  addImagesBulk:    (id, data)        => api.post(`/cottages/${id}/images/bulk`, data),
  deleteImage:      (id, imageId)     => api.delete(`/cottages/${id}/images/${imageId}`),
  reorderImages:    (id, data)        => api.patch(`/cottages/${id}/images`, data),
};
