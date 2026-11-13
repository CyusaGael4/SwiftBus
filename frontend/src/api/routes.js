import http, { cachedGet } from './http.js';

export const routesApi = {
  list: (params) =>
    cachedGet('/routes', { params }).then((response) => response.data),
  create: (payload) => http.post('/routes', payload).then((response) => response.data),
  update: (id, payload) =>
    http.put(`/routes/${id}`, payload).then((response) => response.data),
  remove: (id) => http.delete(`/routes/${id}`).then((response) => response.data),
};
