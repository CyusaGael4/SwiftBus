import http, { cachedGet } from './http.js';

export const busesApi = {
  list: (params) =>
    cachedGet('/buses', { params }).then((response) => response.data),
  get: (id) => cachedGet(`/buses/${id}`).then((response) => response.data),
  create: (payload) => http.post('/buses', payload).then((response) => response.data),
  update: (id, payload) =>
    http.put(`/buses/${id}`, payload).then((response) => response.data),
  remove: (id) => http.delete(`/buses/${id}`).then((response) => response.data),
};
