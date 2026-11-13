const { Router } = require('express');
const {
  createBus,
  deleteBus,
  getBus,
  listBuses,
  updateBus,
} = require('../controllers/busController');
const { protect, restrictTo } = require('../middleware/auth');

const router = Router();

router.use(protect);

router.get('/', listBuses);
router.get('/:id', getBus);
router.post('/', restrictTo('admin', 'booking_agent'), createBus);
router.put('/:id', restrictTo('admin', 'booking_agent'), updateBus);
router.delete('/:id', restrictTo('admin'), deleteBus);

module.exports = router;
