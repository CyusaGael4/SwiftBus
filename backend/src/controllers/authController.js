const { signToken } = require('../middleware/auth');
const { User } = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { httpError } = require('../utils/httpError');
const { isValidEmail, isValidPhone } = require('../utils/validators');

function publicUser(user) {
  return user.toJSON();
}

function assertAccountFields({ fullName, email, password, phoneNumber }) {
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
}

const register = asyncHandler(async (req, res) => {
  const { fullName = '', email = '', password = '', phoneNumber = '' } = req.body;

  assertAccountFields({ fullName, email, password, phoneNumber });

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw httpError(409, 'An account with that email already exists.');
  }

  // Public self-registration always creates a passenger. People who want to
  // sell seats use registerAgent below; other staff accounts are created from
  // the admin portal only.
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

// A booking agent applies with the counter they work from. The account is
// created but left pending, so nothing can be sold until an administrator
// reviews the business details and approves it.
const registerAgent = asyncHandler(async (req, res) => {
  const {
    fullName = '',
    email = '',
    password = '',
    phoneNumber = '',
    agencyName = '',
    agencyAddress = '',
    agencyRegistrationNo = '',
  } = req.body;

  assertAccountFields({ fullName, email, password, phoneNumber });

  if (!agencyName.trim() || !agencyAddress.trim()) {
    throw httpError(400, 'Agency name and counter address are required.');
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw httpError(409, 'An account with that email already exists.');
  }

  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    phoneNumber: phoneNumber.trim(),
    passwordHash: password,
    role: 'booking_agent',
    status: 'pending',
    agencyName: agencyName.trim(),
    agencyAddress: agencyAddress.trim(),
    agencyRegistrationNo: agencyRegistrationNo.trim() || null,
  });

  res.status(201).json({
    application: publicUser(user),
    message:
      'Application received. An administrator reviews it before the account can be used.',
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

  if (user.status === 'pending') {
    throw httpError(
      403,
      'Your booking agent application is still being reviewed. You can sign in once an administrator approves it.'
    );
  }

  if (user.status === 'rejected') {
    throw httpError(
      403,
      'This agent application was not approved. Contact SwiftBus if you think that is a mistake.'
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

module.exports = { register, registerAgent, login, getMe };
