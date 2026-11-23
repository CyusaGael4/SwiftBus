const { Router } = require('express');
const {
  getMe,
  login,
  register,
  registerAgent,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/security');

const router = Router();

router.post('/register', registerLimiter, register);
router.post('/agent/register', registerLimiter, registerAgent);
router.post('/login', loginLimiter, login);
router.get('/me', protect, getMe);

module.exports = router;
