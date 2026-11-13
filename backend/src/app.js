const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const { env } = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const busRoutes = require('./routes/busRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const publicRoutes = require('./routes/publicRoutes');
const routeRoutes = require('./routes/routeRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler, notFound } = require('./middleware/error');

const app = express();

const allowedOrigins = env.clientUrl
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'swiftbus-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/passenger', passengerRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
