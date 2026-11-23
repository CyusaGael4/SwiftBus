const { env } = require('../config/env');
const { httpError } = require('../utils/httpError');

function notFound(req, _res, next) {
  next(httpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Something went wrong.';

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'The requested record could not be found.';
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(' ');
  }

  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue || {})[0] || 'value';
    message = `A record with that ${field} already exists.`;
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please sign in again.';
  }

  if (statusCode >= 500) {
    console.error(error);
    // Internal failures keep their details in the server log instead of the
    // response, so stack frames or driver messages never reach a client.
    message = 'Something went wrong. Please try again.';
  }

  res.status(statusCode).json({
    message,
    ...(env.nodeEnv === 'development' && statusCode >= 500 ? { stack: error.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };
