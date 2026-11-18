import http from './http.js';

export const authApi = {
  login: (payload) => http.post('/auth/login', payload).then((response) => response.data),
  register: (payload) =>
    http.post('/auth/register', payload).then((response) => response.data),
  registerAgent: (payload) =>
    http
      .post('/auth/agent/register', payload)
      .then((response) => response.data),
  me: () => http.get('/auth/me').then((response) => response.data),
};
