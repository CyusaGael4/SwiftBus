import { cachedGet } from './http.js';

export const dashboardApi = {
  get: () => cachedGet('/dashboard').then((response) => response.data),
};
