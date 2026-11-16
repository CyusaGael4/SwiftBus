const { Booking } = require('../models/Booking');
const { Schedule } = require('../models/Schedule');
const { User } = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { httpError } = require('../utils/httpError');
const { escapeRegex } = require('../utils/validators');
const { endOfDay, parseDateOnly, toDateKey } = require('../utils/dates');

// One aggregation resolves the passenger, agent, schedule, route, bus and driver
// in a single round trip. The equivalent nested populate costs six sequential
// queries, which is noticeable against a remote MongoDB deployment.
const LOOKUP_STAGES = [
  {
    $lookup: {
      from: 'users',
      localField: 'passenger',
      foreignField: '_id',
      as: 'passengerDoc',
    },
  },
  { $unwind: { path: '$passengerDoc', preserveNullAndEmptyArrays: true } },
  {
    $lookup: { from: 'users', localField: 'agent', foreignField: '_id', as: 'agentDoc' },
  },
  { $unwind: { path: '$agentDoc', preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: 'schedules',
      localField: 'schedule',
      foreignField: '_id',
      as: 'scheduleDoc',
    },
  },
  { $unwind: { path: '$scheduleDoc', preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: 'routes',
      localField: 'scheduleDoc.route',
      foreignField: '_id',
      as: 'routeDoc',
    },
  },
  { $unwind: { path: '$routeDoc', preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: 'buses',
      localField: 'scheduleDoc.bus',
      foreignField: '_id',
      as: 'busDoc',
    },
  },
  { $unwind: { path: '$busDoc', preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: 'users',
      localField: 'scheduleDoc.driver',
      foreignField: '_id',
      as: 'driverDoc',
    },
  },
  { $unwind: { path: '$driverDoc', preserveNullAndEmptyArrays: true } },
];

// Reshape a flattened aggregation row back into the document shape the
// serializer reads, so both aggregation and populate callers share one format.
function shapeRow(row) {
  return {
    ...row,
    passenger: row.passengerDoc || null,
    agent: row.agentDoc || null,
    schedule: row.scheduleDoc
      ? {
          ...row.scheduleDoc,
          route: row.routeDoc || null,
          bus: row.busDoc || null,
          driver: row.driverDoc || null,
        }
      : null,
  };
}

const SOURCE_LABELS = { online: 'Online', agent: 'Booking agent' };

function effectiveStatus(booking) {
  if (booking.status === 'cancelled') return 'cancelled';
  const departure = booking.schedule?.departureTime;
  if (departure && new Date(departure) <= new Date()) return 'completed';
  return 'upcoming';
}

function serializeBooking(booking) {
  const schedule = booking.schedule || {};
  const route = schedule.route || null;
  const bus = schedule.bus || null;
  const driver = schedule.driver || null;
  const passenger = booking.passenger || null;
  const agent = booking.agent || null;

  return {
    id: String(booking._id),
    reference: booking.reference,
    status: effectiveStatus(booking),
    bookingStatus: booking.status,
    source: booking.source,
    sourceLabel: SOURCE_LABELS[booking.source] || booking.source,
    seats: booking.seats,
    passengerCount: booking.passengerCount,
    unitPriceRwf: booking.unitPriceRwf,
    totalAmountRwf: booking.totalAmountRwf,
    contactName: booking.contactName,
    contactPhone: booking.contactPhone,
    contactEmail: booking.contactEmail,
    createdAt: booking.createdAt,
    cancelledAt: booking.cancelledAt || null,
    passenger: passenger
      ? {
          id: String(passenger._id),
          fullName: passenger.fullName,
          email: passenger.email,
          phoneNumber: passenger.phoneNumber || '',
        }
      : null,
    agent: agent
      ? { id: String(agent._id), fullName: agent.fullName, email: agent.email }
      : null,
    trip: {
      id: schedule._id ? String(schedule._id) : null,
      departureTime: schedule.departureTime || null,
      arrivalTime: schedule.arrivalTime || null,
      status: schedule.status || null,
      route: route
        ? {
            origin: route.origin,
            destination: route.destination,
            routeCode: route.routeCode,
            fareRwf: route.fareRwf,
            estimatedDurationMins: route.estimatedDurationMins,
          }
        : null,
      bus: bus
        ? {
            busCode: bus.busCode,
            plateNumber: bus.plateNumber,
            totalCapacity: bus.totalCapacity,
          }
        : null,
      driver: driver ? { fullName: driver.fullName, email: driver.email } : null,
    },
  };
}

// Staff view of the reservations created online by passengers and at the
// counter by booking agents. It reads the same Booking collection the
// passenger portal writes to, so a new online reservation appears here
// immediately without any syncing.
const listBookings = asyncHandler(async (req, res) => {
  const { status = 'all', source = 'all', q = '', date = '' } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  // The status and source filters are applied in memory after the shared query
  // so the stat cards always describe the same set of reservations.
  const query = {};

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    const dayStart = parseDateOnly(date);
    // The departure date lives on the referenced schedule, so the matching
    // schedule ids are resolved first and used as a filter.
    const scheduleIds = await Schedule.find({
      departureTime: { $gte: dayStart, $lte: endOfDay(dayStart) },
    })
      .select('_id')
      .lean();
    query.schedule = { $in: scheduleIds.map((row) => row._id) };
  }

  const term = String(q).trim();
  if (term) {
    const pattern = new RegExp(escapeRegex(term), 'i');
    const passengers = await User.find({
      role: 'passenger',
      $or: [{ fullName: pattern }, { email: pattern }, { phoneNumber: pattern }],
    })
      .select('_id')
      .limit(50)
      .lean();

    query.$or = [
      { reference: pattern },
      { contactName: pattern },
      { contactPhone: pattern },
      { contactEmail: pattern },
      { passenger: { $in: passengers.map((row) => row._id) } },
    ];
  }

  const rows = await Booking.aggregate([
    { $match: query },
    { $sort: { createdAt: -1 } },
    { $limit: 500 },
    ...LOOKUP_STAGES,
  ]);

  const decorated = rows.map(shapeRow).map((booking) => ({
    ...booking,
    effectiveStatus: effectiveStatus(booking),
  }));

  const stats = {
    total: decorated.length,
    online: decorated.filter((booking) => booking.source === 'online').length,
    agent: decorated.filter((booking) => booking.source === 'agent').length,
    upcoming: decorated.filter((booking) => booking.effectiveStatus === 'upcoming')
      .length,
    cancelled: decorated.filter((booking) => booking.effectiveStatus === 'cancelled')
      .length,
    seatsOnline: decorated
      .filter((booking) => booking.source === 'online')
      .reduce((total, booking) => total + (booking.passengerCount || 0), 0),
  };

  const byStatus =
    status === 'all'
      ? decorated
      : decorated.filter((booking) => booking.effectiveStatus === status);

  const filtered =
    source === 'online' || source === 'agent'
      ? byStatus.filter((booking) => booking.source === source)
      : byStatus;

  const start = (page - 1) * limit;
  const pages = Math.max(1, Math.ceil(filtered.length / limit));

  res.json({
    bookings: filtered.slice(start, start + limit).map(serializeBooking),
    total: filtered.length,
    page: Math.min(page, pages),
    limit,
    pages,
    stats,
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(date)) ? toDateKey(parseDateOnly(date)) : '',
  });
});

const getBooking = asyncHandler(async (req, res) => {
  const rows = await Booking.aggregate([
    { $match: { reference: String(req.params.reference).toUpperCase() } },
    { $limit: 1 },
    ...LOOKUP_STAGES,
  ]);

  if (!rows.length) throw httpError(404, 'Booking not found.');

  res.json({ booking: serializeBooking(shapeRow(rows[0])) });
});

module.exports = { listBookings, getBooking, serializeBooking };
