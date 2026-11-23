const dotenv = require('dotenv');

dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI,
  mongoDb: process.env.MONGODB_DB || 'swiftbus',
  jwtSecret: process.env.JWT_SECRET,
  // Remembered sessions last a week; a session-only sign in gets a shorter
  // token as well as session storage in the browser.
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtSessionExpiresIn: process.env.JWT_SESSION_EXPIRES_IN || '12h',
  seatHoldMinutes: Number(process.env.SEAT_HOLD_MINUTES) || 10,
};

if (env.nodeEnv === 'production' && env.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}

module.exports = { env };
