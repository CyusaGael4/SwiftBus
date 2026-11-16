import http from './http.js';

// Staff booking data is shared with the passenger portal and changes whenever a
// passenger reserves, so it is always read fresh rather than cached.
export const bookingsApi = {
  list: (params) => http.get('/bookings', { params }).then((response) => response.data),
  get: (reference) =>
    http.get(`/bookings/${reference}`).then((response) => response.data),
};
