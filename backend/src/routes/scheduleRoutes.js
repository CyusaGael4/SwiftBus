const { Router } = require('express');
const {
  createSchedule,
  deleteSchedule,
  getSchedule,
  listSchedules,
  updateSchedule,
} = require('../controllers/scheduleController');
const { protect, restrictTo } = require('../middleware/auth');

const router = Router();

router.use(protect);

router.get('/', listSchedules);
router.get('/:id', getSchedule);
router.post('/', restrictTo('admin', 'booking_agent'), createSchedule);
router.put('/:id', restrictTo('admin', 'booking_agent'), updateSchedule);
router.delete('/:id', restrictTo('admin'), deleteSchedule);

module.exports = router;
