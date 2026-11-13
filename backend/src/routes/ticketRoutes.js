const { Router } = require('express');
const { verifyTicket } = require('../controllers/passengerController');
const { protect, restrictTo } = require('../middleware/auth');

const router = Router();

// Ticket verification is a staff action, so only staff roles can scan a ticket.
router.get(
  '/verify/:code',
  protect,
  restrictTo('admin', 'booking_agent'),
  verifyTicket
);

module.exports = router;
