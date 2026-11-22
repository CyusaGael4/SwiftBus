const { Route } = require('../models/Route');
const { Schedule } = require('../models/Schedule');
const { SeatReservation } = require('../models/SeatReservation');
const { env } = require('../config/env');
const { asyncHandler } = require('../utils/asyncHandler');
const { endOfDay, parseDateOnly, toDateKey } = require('../utils/dates');
const { httpError } = require('../utils/httpError');
const { escapeRegex } = require('../utils/validators');
const {
  buildSeatMap,
  ensureLegacySeats,
  holdCountsBySchedule,
  isSeatLabel,
  releaseExpiredHolds,
} = require('../utils/seats');

const POPULATE = [
  {
    path: 'route',
    select: 'origin destination routeCode fareRwf estimatedDurationMins',
  },
  { path: 'bus', select: 'busCode plateNumber totalCapacity companyName' },
];

const MAX_SEATS_PER_BOOKING = 10;

function resolveTravelDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    throw httpError(400, 'Choose a valid travel date.');
  }

  const dayStart = parseDateOnly(value);
  if (Number.isNaN(dayStart.getTime())) {
    throw httpError(400, 'Choose a valid travel date.');
  }

  const todayStart = parseDateOnly(toDateKey(new Date()));
  if (dayStart < todayStart) {
    throw httpError(400, 'The travel date cannot be in the past.');
  }

  return dayStart;
}

// Schema toObject/toJSON transforms rename _id to id, so both shapes are read
// here to keep the payload identical for lean and hydrated documents.
const idOf = (value) => (value ? String(value._id ?? value.id) : null);

function serializeTrip(schedule, holdCount = 0) {
  const route = schedule.route;
  const bus = schedule.bus;
  const totalSeats = Number(bus?.totalCapacity) || 0;
  const bookedSeats = Number(schedule.seatsBooked) || 0;

  return {
    id: idOf(schedule),
    status: schedule.status,
    departureTime: schedule.departureTime,
    arrivalTime: schedule.arrivalTime,
    durationMins: Number(route?.estimatedDurationMins) || 0,
    priceRwf: Number(route?.fareRwf) || 0,
    totalSeats,
    availableSeats: Math.max(0, totalSeats - bookedSeats - holdCount),
    route: route
      ? {
          id: idOf(route),
          routeCode: route.routeCode,
          origin: route.origin,
          destination: route.destination,
          fareRwf: route.fareRwf,
          estimatedDurationMins: route.estimatedDurationMins,
        }
      : null,
    bus: bus
      ? {
          id: idOf(bus),
          busCode: bus.busCode,
          plateNumber: bus.plateNumber,
          companyName: bus.companyName,
          totalCapacity: totalSeats,
        }
      : null,
  };
}

async function loadBookableSchedule(id) {
  const schedule = await Schedule.findById(id).populate(POPULATE);

  if (!schedule) throw httpError(404, 'Trip not found.');
  if (!['scheduled', 'delayed'].includes(schedule.status)) {
    throw httpError(400, 'This trip is no longer open for reservations.');
  }
  if (new Date(schedule.departureTime) <= new Date()) {
    throw httpError(400, 'This trip has already departed.');
  }

  return schedule;
}

const listDestinations = asyncHandler(async (_req, res) => {
  const [routes, tripStats] = await Promise.all([
    Route.find({ isActive: { $ne: false } }).lean(),
    Schedule.aggregate([
      {
        $match: {
          departureTime: { $gte: new Date() },
          status: { $in: ['scheduled', 'delayed'] },
        },
      },
      {
        $group: {
          _id: '$route',
          trips: { $sum: 1 },
          nextDeparture: { $min: '$departureTime' },
        },
      },
    ]),
  ]);

  const stats = new Map(tripStats.map((row) => [String(row._id), row]));
  const origins = [...new Set(routes.map((route) => route.origin))].sort((a, b) =>
    a.localeCompare(b)
  );
  const destinations = [...new Set(routes.map((route) => route.destination))].sort(
    (a, b) => a.localeCompare(b)
  );

  const popular = routes
    .map((route) => {
      const row = stats.get(String(route._id));
      return {
        routeCode: route.routeCode,
        origin: route.origin,
        destination: route.destination,
        fareRwf: route.fareRwf,
        estimatedDurationMins: route.estimatedDurationMins,
        trips: row?.trips || 0,
        nextDeparture: row?.nextDeparture || null,
      };
    })
    .sort((a, b) => b.trips - a.trips || a.destination.localeCompare(b.destination))
    .slice(0, 6);

  res.json({ origins, destinations, popular });
});

const searchTrips = asyncHandler(async (req, res) => {
  const { origin = '', destination = '', passengers = '1' } = req.query;
  const seatCount = Math.min(
    MAX_SEATS_PER_BOOKING,
    Math.max(1, Number(passengers) || 1)
  );

  // Empty filters intentionally mean "all departures", which lets visitors
  // browse the schedule before choosing a route.
  const dayStart = resolveTravelDate(req.query.date || toDateKey(new Date()));
  const dayEnd = endOfDay(dayStart);
  const now = new Date();
  const isToday = toDateKey(dayStart) === toDateKey(now);
  const windowStart = isToday ? now : dayStart;

  // Route records created before the isActive flag existed are treated as active.
  const routeQuery = { isActive: { $ne: false } };
  if (origin.trim()) {
    routeQuery.origin = new RegExp(`^${escapeRegex(origin.trim())}$`, 'i');
  }
  if (destination.trim()) {
    routeQuery.destination = new RegExp(`^${escapeRegex(destination.trim())}$`, 'i');
  }

  const routes = await Route.find(routeQuery).select('_id').lean();

  if (!routes.length) {
    return res.json({
      date: toDateKey(dayStart),
      passengers: seatCount,
      trips: [],
      count: 0,
    });
  }

  const schedules = await Schedule.find({
    route: { $in: routes.map((route) => route._id) },
    departureTime: { $gte: windowStart, $lte: dayEnd },
    status: { $in: ['scheduled', 'delayed'] },
  })
    .populate(POPULATE)
    .sort({ departureTime: 1 })
    .limit(80)
    .lean();

  const holds = await holdCountsBySchedule(schedules.map((schedule) => schedule._id));

  const trips = schedules
    .map((schedule) => serializeTrip(schedule, holds.get(String(schedule._id)) || 0))
    .filter((trip) => trip.availableSeats >= seatCount);

  return res.json({
    date: toDateKey(dayStart),
    passengers: seatCount,
    count: trips.length,
    trips,
  });
});

const getTrip = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id).populate(POPULATE).lean();

  if (!schedule) throw httpError(404, 'Trip not found.');

  const holds = await holdCountsBySchedule([schedule._id]);

  res.json({ trip: serializeTrip(schedule, holds.get(String(schedule._id)) || 0) });
});

const getTripSeats = asyncHandler(async (req, res) => {
  const schedule = await loadBookableSchedule(req.params.id);
  const capacity = schedule.bus?.totalCapacity || 0;
  const holdToken = typeof req.query.holdToken === 'string' ? req.query.holdToken : '';

  const { seats, availableSeats } = await buildSeatMap(schedule, capacity, holdToken);

  res.json({
    trip: serializeTrip(schedule),
    seats,
    availableSeats,
    holdMinutes: env.seatHoldMinutes,
  });
});

const holdSeats = asyncHandler(async (req, res) => {
  const { seats = [], holdToken = '' } = req.body;

  if (!Array.isArray(seats) || seats.length === 0) {
    throw httpError(400, 'Select at least one seat.');
  }

  if (typeof holdToken !== 'string' || holdToken.trim().length < 8) {
    throw httpError(400, 'Your seat selection session has expired. Refresh and try again.');
  }

  const requested = [
    ...new Set(seats.map((seat) => String(seat).trim().toUpperCase())),
  ].filter(Boolean);

  if (requested.length !== seats.length) {
    throw httpError(400, 'The same seat was selected twice.');
  }

  if (requested.length > MAX_SEATS_PER_BOOKING) {
    throw httpError(400, `You can reserve up to ${MAX_SEATS_PER_BOOKING} seats at a time.`);
  }

  const schedule = await loadBookableSchedule(req.params.id);
  const capacity = schedule.bus?.totalCapacity || 0;

  if (requested.some((seat) => !isSeatLabel(capacity, seat))) {
    throw httpError(400, 'One or more selected seats do not exist on this bus.');
  }

  await releaseExpiredHolds(schedule._id);
  await ensureLegacySeats(schedule, capacity);

  const existing = await SeatReservation.find({
    schedule: schedule._id,
    seat: { $in: requested },
  }).lean();

  const conflicts = existing.filter(
    (row) => row.kind !== 'hold' || row.holdToken !== holdToken
  );

  if (conflicts.length) {
    throw httpError(
      409,
      `Seat${conflicts.length > 1 ? 's' : ''} ${conflicts
        .map((row) => row.seat)
        .join(', ')} ${conflicts.length > 1 ? 'are' : 'is'} no longer available.`
    );
  }

  const expiresAt = new Date(Date.now() + env.seatHoldMinutes * 60 * 1000);
  const mine = new Set(
    existing
      .filter((row) => row.kind === 'hold' && row.holdToken === holdToken)
      .map((row) => row.seat)
  );

  await SeatReservation.deleteMany({
    schedule: schedule._id,
    kind: 'hold',
    holdToken,
    seat: { $nin: requested },
  });

  if (mine.size) {
    await SeatReservation.updateMany(
      { schedule: schedule._id, kind: 'hold', holdToken, seat: { $in: [...mine] } },
      { $set: { expiresAt } }
    );
  }

  const toCreate = requested.filter((seat) => !mine.has(seat));

  if (toCreate.length) {
    try {
      await SeatReservation.insertMany(
        toCreate.map((seat) => ({
          schedule: schedule._id,
          seat,
          kind: 'hold',
          holdToken,
          expiresAt,
        }))
      );
    } catch (error) {
      if (error.code === 11000) {
        throw httpError(
          409,
          'Someone just reserved one of those seats. Please pick different seats.'
        );
      }
      throw error;
    }
  }

  res.status(201).json({
    seats: requested,
    holdToken,
    expiresAt,
    holdMinutes: env.seatHoldMinutes,
  });
});

module.exports = {
  listDestinations,
  searchTrips,
  getTrip,
  getTripSeats,
  holdSeats,
  MAX_SEATS_PER_BOOKING,
};
