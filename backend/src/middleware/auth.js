const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { User } = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { httpError } = require('../utils/httpError');

const signToken = (userId, remember = true) =>
  jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: remember ? env.jwtExpiresIn : env.jwtSessionExpiresIn,
    algorithm: 'HS256',
  });

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw httpError(401, 'You need to sign in to continue.');
  }

  const token = header.slice(7);

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw httpError(401, 'Your session has expired. Please sign in again.');
  }

  const user = await User.findById(payload.id);
  if (!user) {
    throw httpError(401, 'This account no longer exists.');
  }

  if (user.status === 'deactive') {
    throw httpError(
      403,
      'This account has been deactivated. Contact an administrator to restore access.'
    );
  }

  if (user.status === 'pending' || user.status === 'rejected') {
    throw httpError(403, 'This account is not approved for access yet.');
  }

  req.user = user;
  return next();
});

const restrictTo = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(httpError(403, 'You do not have permission to perform this action.'));
  }

  return next();
};

module.exports = { signToken, protect, restrictTo };
