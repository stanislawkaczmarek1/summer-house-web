import api from './client';

export const cottagesApi = {
  getAll: (params) => api.get('/cottages', { params }),
  getById: (id) => api.get(`/cottages/${id}`),
  getAvailability: (id, params) => api.get(`/cottages/${id}/availability`, {
    params: {
      startDate: params.start_date ?? params.startDate,
      endDate: params.end_date ?? params.endDate,
    }
  }),

  create: (data) => api.post('/cottages', data),
  update: (id, data) => api.put(`/cottages/${id}`, data),
  patch: (id, data) => {
    if ('visible' in data || 'is_visible' in data) {
      const visible = data.visible ?? data.is_visible;
      return api.patch(`/cottages/${id}`, null, { params: { visible } });
    }
    return api.patch(`/cottages/${id}`, data);
  },
  remove: (id) => api.delete(`/cottages/${id}`),

  addImage: (id, data) => api.post(`/cottages/${id}/images`, data),
  addImagesBulk: (id, urls) => api.post(`/cottages/${id}/images/bulk`, urls),
  deleteImage: (id, imageId) => api.delete(`/cottages/${id}/images/${imageId}`),
  reorderImages: (id, data) => api.patch(`/cottages/${id}/images`, data),
};
