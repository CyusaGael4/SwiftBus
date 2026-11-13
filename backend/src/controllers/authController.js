const { signToken } = require('../middleware/auth');
const { User } = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { httpError } = require('../utils/httpError');
const { isValidEmail, isValidPhone } = require('../utils/validators');

function publicUser(user) {
  return user.toJSON();
}

const register = asyncHandler(async (req, res) => {
  const { fullName = '', email = '', password = '', phoneNumber = '' } = req.body;

  if (!fullName.trim() || !email.trim() || !password || !phoneNumber.trim()) {
    throw httpError(400, 'Full name, email, phone number and password are required.');
  }

  if (!isValidEmail(email)) {
    throw httpError(400, 'Enter a valid email address.');
  }

  if (!isValidPhone(phoneNumber)) {
    throw httpError(400, 'Enter a valid phone number.');
  }

  if (password.length < 8) {
    throw httpError(400, 'Password must be at least 8 characters long.');
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw httpError(409, 'An account with that email already exists.');
  }

  // Public self-registration always creates a passenger. Staff accounts are
  // created from the admin portal only.
  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    phoneNumber: phoneNumber.trim(),
    passwordHash: password,
    role: 'passenger',
    status: 'active',
    lastActiveAt: new Date(),
  });

  res.status(201).json({
    token: signToken(user.id),
    user: publicUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email = '', password = '' } = req.body;

  if (!email.trim() || !password) {
    throw httpError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    '+passwordHash'
  );

  if (!user || !(await user.comparePassword(password))) {
    throw httpError(401, 'Email or password is incorrect.');
  }

  if (user.status === 'deactive') {
    throw httpError(
      403,
      'This account has been deactivated. Contact an administrator to restore access.'
    );
  }

  if (user.status === 'invited') {
    user.status = 'active';
  }

  user.lastActiveAt = new Date();
  await user.save();

  res.json({
    token: signToken(user.id),
    user: publicUser(user),
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = { register, login, getMe };
