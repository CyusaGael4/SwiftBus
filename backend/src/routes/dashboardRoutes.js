const { Router } = require('express');
const { getDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = Router();

router.use(protect);
router.get('/', getDashboard);

module.exports = router;
