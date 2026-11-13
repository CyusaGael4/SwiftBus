const { Router } = require('express');
const {
  getTrip,
  getTripSeats,
  holdSeats,
  listDestinations,
  searchTrips,
} = require('../controllers/publicTripController');

const router = Router();

router.get('/destinations', listDestinations);
router.get('/trips', searchTrips);
router.get('/trips/:id', getTrip);
router.get('/trips/:id/seats', getTripSeats);
router.post('/trips/:id/hold', holdSeats);

module.exports = router;
