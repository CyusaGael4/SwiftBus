const { Router } = require('express');
const { getBooking, listBookings } = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');

const router = Router();

// Reservations are staff-only data: passengers read their own bookings through
// /api/passenger, which scopes every query to the signed-in account.
router.use(protect, restrictTo('admin', 'booking_agent'));

router.get('/', listBookings);
router.get('/:reference', getBooking);

module.exports = router;
