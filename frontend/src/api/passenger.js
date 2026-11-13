import http from './http.js';

// Trip and seat data is intentionally not cached: availability changes as other
// passengers reserve seats, so every screen reads the current inventory.
export const passengerApi = {
  destinations: () => http.get('/public/destinations').then((response) => response.data),
  searchTrips: (params) =>
    http.get('/public/trips', { params }).then((response) => response.data),
  trip: (id) => http.get(`/public/trips/${id}`).then((response) => response.data),
  seats: (id, params) =>
    http.get(`/public/trips/${id}/seats`, { params }).then((response) => response.data),
  holdSeats: (id, payload) =>
    http.post(`/public/trips/${id}/hold`, payload).then((response) => response.data),

  dashboard: () => http.get('/passenger/dashboard').then((response) => response.data),
  bookings: (params) =>
    http.get('/passenger/bookings', { params }).then((response) => response.data),
  booking: (reference) =>
    http.get(`/passenger/bookings/${reference}`).then((response) => response.data),
  createBooking: (payload) =>
    http.post('/passenger/bookings', payload).then((response) => response.data),
  cancelBooking: (reference) =>
    http
      .post(`/passenger/bookings/${reference}/cancel`)
      .then((response) => response.data),

  tickets: () => http.get('/passenger/tickets').then((response) => response.data),
  updateProfile: (payload) =>
    http.patch('/passenger/profile', payload).then((response) => response.data),
  changePassword: (payload) =>
    http.post('/passenger/profile/password', payload).then((response) => response.data),
};
