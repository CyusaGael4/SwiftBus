const { Router } = require('express');
const {
  createRoute,
  deleteRoute,
  getRoute,
  listRoutes,
  updateRoute,
} = require('../controllers/routeController');
const { protect, restrictTo } = require('../middleware/auth');

const router = Router();

router.use(protect);

router.get('/', listRoutes);
router.get('/:id', getRoute);
router.post('/', restrictTo('admin', 'booking_agent'), createRoute);
router.put('/:id', restrictTo('admin', 'booking_agent'), updateRoute);
router.delete('/:id', restrictTo('admin'), deleteRoute);

module.exports = router;
