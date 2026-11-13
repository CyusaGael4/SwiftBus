const { Router } = require('express');
const {
  cancelBooking,
  changePassword,
  createBooking,
  getBooking,
  getDashboard,
  getTicket,
  listBookings,
  listTickets,
  updateProfile,
} = require('../controllers/passengerController');
const { protect, restrictTo } = require('../middleware/auth');

const router = Router();

// Every passenger endpoint is scoped to the authenticated passenger. RBAC is
// enforced here and queries are always filtered by req.user._id.
router.use(protect, restrictTo('passenger'));

router.get('/dashboard', getDashboard);

router.get('/bookings', listBookings);
router.post('/bookings', createBooking);
router.get('/bookings/:reference', getBooking);
router.post('/bookings/:reference/cancel', cancelBooking);

router.get('/tickets', listTickets);
router.get('/tickets/:id', getTicket);

router.patch('/profile', updateProfile);
router.post('/profile/password', changePassword);

module.exports = router;
