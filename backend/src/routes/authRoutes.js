const { Router } = require('express');
const {
  getMe,
  login,
  register,
  registerAgent,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = Router();

router.post('/register', register);
router.post('/agent/register', registerAgent);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
