const { Router } = require('express');
const {
  deleteUser,
  inviteUser,
  listDrivers,
  listUsers,
  resendInvite,
  updateUser,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

const router = Router();

router.use(protect);

router.get('/drivers', listDrivers);

router.use(restrictTo('admin'));

router.get('/', listUsers);
router.post('/', inviteUser);
router.post('/:id/resend', resendInvite);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
