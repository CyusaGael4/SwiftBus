const { Schedule } = require('../models/Schedule');
const { User } = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { httpError } = require('../utils/httpError');
const { escapeRegex, isValidEmail } = require('../utils/validators');

const TEAM_ROLES = ['admin', 'booking_agent', 'driver'];
const TEMPORARY_PASSWORD = 'Swiftbus@123';

const listUsers = asyncHandler(async (req, res) => {
  const { status = 'all', search = '', role = '' } = req.query;
  const query = { role: { $in: TEAM_ROLES } };

  if (['active', 'invited', 'deactive'].includes(status)) {
    query.status = status;
  }

  if (role && TEAM_ROLES.includes(role)) {
    query.role = role;
  }

  if (search.trim()) {
    const pattern = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [{ fullName: pattern }, { email: pattern }];
  }

  const [users, total, administrators, agents, drivers, active, invited, deactivated] =
    await Promise.all([
      User.find(query).sort({ _id: 1 }).lean(),
      User.countDocuments({ role: { $in: TEAM_ROLES } }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'booking_agent' }),
      User.countDocuments({ role: 'driver' }),
      User.countDocuments({ status: 'active', role: { $in: TEAM_ROLES } }),
      User.countDocuments({ status: 'invited', role: { $in: TEAM_ROLES } }),
      User.countDocuments({ status: 'deactive', role: { $in: TEAM_ROLES } }),
    ]);

  res.json({
    users,
    stats: {
      total,
      administrators,
      agents,
      drivers,
    },
    counts: { all: total, active, invited, deactivated },
  });
});

const listDrivers = asyncHandler(async (_req, res) => {
  const drivers = await User.find({ role: 'driver', status: 'active' })
    .select('fullName email')
    .sort({ fullName: 1 })
    .lean();

  res.json({ drivers });
});

const inviteUser = asyncHandler(async (req, res) => {
  const { fullName = '', email = '', role = 'booking_agent' } = req.body;

  if (!fullName.trim() || !email.trim()) {
    throw httpError(400, 'Full name and email are required.');
  }

  if (!isValidEmail(email)) {
    throw httpError(400, 'Enter a valid email address.');
  }

  if (!TEAM_ROLES.includes(role)) {
    throw httpError(400, 'Select a valid team role.');
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw httpError(409, 'A user with that email already exists.');
  }

  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: TEMPORARY_PASSWORD,
    role,
    status: 'invited',
    inviteSentAt: new Date(),
  });

  res.status(201).json({
    user,
    temporaryPassword: TEMPORARY_PASSWORD,
    message: 'User added.',
  });
});

const resendInvite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found.');

  user.status = 'invited';
  user.inviteSentAt = new Date();
  await user.save();

  res.json({ user, message: 'Access resent.' });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found.');

  const { fullName, email, role, status } = req.body;

  if (fullName !== undefined) user.fullName = fullName;
  if (email !== undefined && email !== user.email) {
    if (!isValidEmail(email)) throw httpError(400, 'Enter a valid email address.');
    const existing = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: user._id },
    });
    if (existing) throw httpError(409, 'A user with that email already exists.');
    user.email = email.toLowerCase().trim();
  }

  if (role !== undefined) {
    if (!TEAM_ROLES.includes(role)) throw httpError(400, 'Select a valid team role.');
    user.role = role;
  }

  if (status !== undefined) {
    if (!['active', 'invited', 'deactive'].includes(status)) {
      throw httpError(400, 'Select a valid status.');
    }
    user.status = status;
  }

  await user.save();
  res.json({ user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found.');

  if (user.id === req.user.id) {
    throw httpError(400, 'You cannot remove your own account.');
  }

  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      throw httpError(400, 'At least one administrator account must remain.');
    }
  }

  const assignedDepartures = await Schedule.countDocuments({ driver: user._id });
  if (assignedDepartures > 0) {
    throw httpError(
      409,
      'This driver is assigned to departures. Reassign those departures first.'
    );
  }

  await user.deleteOne();
  res.json({ message: 'User removed.' });
});

module.exports = {
  listUsers,
  listDrivers,
  inviteUser,
  resendInvite,
  updateUser,
  deleteUser,
};
