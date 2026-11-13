import http, { cachedGet } from './http.js';

export const usersApi = {
  list: (params) =>
    cachedGet('/users', { params }).then((response) => response.data),
  drivers: () => cachedGet('/users/drivers').then((response) => response.data),
  invite: (payload) => http.post('/users', payload).then((response) => response.data),
  resend: (id) => http.post(`/users/${id}/resend`).then((response) => response.data),
  update: (id, payload) =>
    http.put(`/users/${id}`, payload).then((response) => response.data),
  remove: (id) => http.delete(`/users/${id}`).then((response) => response.data),
};
