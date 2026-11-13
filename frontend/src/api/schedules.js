import http, { cachedGet } from './http.js';

export const schedulesApi = {
  list: (params) =>
    cachedGet('/schedules', { params }).then((response) => response.data),
  create: (payload) =>
    http.post('/schedules', payload).then((response) => response.data),
  update: (id, payload) =>
    http.put(`/schedules/${id}`, payload).then((response) => response.data),
  remove: (id) => http.delete(`/schedules/${id}`).then((response) => response.data),
};
