const { Booking } = require('../models/Booking');
const { Bus } = require('../models/Bus');
const { Route } = require('../models/Route');
const { Schedule } = require('../models/Schedule');
const { SeatReservation } = require('../models/SeatReservation');
const { asyncHandler } = require('../utils/asyncHandler');
const { endOfDay, parseDateOnly, toDateKey } = require('../utils/dates');
const { httpError } = require('../utils/httpError');

const POPULATE = [
  { path: 'route', select: 'origin destination routeCode fareRwf estimatedDurationMins' },
  { path: 'bus', select: 'busCode plateNumber totalCapacity' },
  { path: 'driver', select: 'fullName email' },
];

async function assertBusCapacity(busId, seatsBooked) {
  const bus = await Bus.findById(busId);
  if (!bus) throw httpError(400, 'The selected bus does not exist.');
  if (Number(seatsBooked) > bus.totalCapacity) {
    throw httpError(400, `This bus only has ${bus.totalCapacity} seats.`);
  }
  return bus;
}

const listSchedules = asyncHandler(async (req, res) => {
  const { tab = 'today', date } = req.query;
  const dayStart = parseDateOnly(date);
  const dayEnd = endOfDay(dayStart);
  const dayFilter = { departureTime: { $gte: dayStart, $lte: dayEnd } };

  let query = dayFilter;
  let sort = { departureTime: 1 };

  if (tab === 'today') {
    query = { ...dayFilter, status: { $nin: ['completed', 'cancelled'] } };
  }

  if (tab === 'upcoming') {
    query = {
      departureTime: { $gte: new Date() },
      status: { $in: ['scheduled', 'delayed'] },
    };
  }

  if (tab === 'completed') {
    query = { status: 'completed' };
    sort = { departureTime: -1 };
  }

  const [schedules, departuresToday, routeIds, busIds, delayed] = await Promise.all([
    Schedule.find(query).sort(sort).limit(100).populate(POPULATE).lean(),
    Schedule.countDocuments(dayFilter),
    Schedule.distinct('route', dayFilter),
    Schedule.distinct('bus', dayFilter),
    Schedule.countDocuments({ ...dayFilter, status: 'delayed' }),
  ]);

  res.json({
    date: toDateKey(dayStart),
    schedules,
    stats: {
      departuresToday,
      routesScheduled: routeIds.length,
      busesAssigned: busIds.length,
      delayed,
    },
  });
});

const getSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id).populate(POPULATE);
  if (!schedule) throw httpError(404, 'Departure not found.');
  res.json({ schedule });
});

const createSchedule = asyncHandler(async (req, res) => {
  const {
    route: routeId,
    bus: busId,
    driver,
    departureTime,
    seatsBooked = 0,
    status = 'scheduled',
    notes = '',
  } = req.body;

  if (!routeId || !busId || !departureTime) {
    throw httpError(400, 'Route, bus and departure time are required.');
  }

  const departure = new Date(departureTime);
  if (Number.isNaN(departure.getTime())) {
    throw httpError(400, 'Enter a valid departure date and time.');
  }

  const [route, bus] = await Promise.all([
    Route.findById(routeId),
    assertBusCapacity(busId, seatsBooked),
  ]);

  if (!route) throw httpError(400, 'The selected route does not exist.');

  const arrival = new Date(
    departure.getTime() + (route.estimatedDurationMins || 0) * 60 * 1000
  );

  const schedule = await Schedule.create({
    route: route._id,
    bus: bus._id,
    driver: driver || null,
    departureTime: departure,
    arrivalTime: arrival,
    seatsBooked: Number(seatsBooked) || 0,
    status,
    notes,
  });

  await schedule.populate(POPULATE);

  res.status(201).json({ schedule });
});

const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);
  if (!schedule) throw httpError(404, 'Departure not found.');

  const { route, bus, driver, departureTime, seatsBooked, status, notes } = req.body;

  if (route) schedule.route = route;
  if (bus) schedule.bus = bus;
  if (driver !== undefined) schedule.driver = driver || null;
  if (status) schedule.status = status;
  if (notes !== undefined) schedule.notes = notes;

  if (seatsBooked !== undefined) {
    await assertBusCapacity(bus || schedule.bus, seatsBooked);
    schedule.seatsBooked = Number(seatsBooked) || 0;
  }

  if (departureTime) {
    const departure = new Date(departureTime);
    if (Number.isNaN(departure.getTime())) {
      throw httpError(400, 'Enter a valid departure date and time.');
    }

    const routeDoc = await Route.findById(schedule.route);
    schedule.departureTime = departure;
    schedule.arrivalTime = new Date(
      departure.getTime() + (routeDoc?.estimatedDurationMins || 0) * 60 * 1000
    );
  }

  await schedule.save();
  await schedule.populate(POPULATE);

  res.json({ schedule });
});

const deleteSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);
  if (!schedule) throw httpError(404, 'Departure not found.');

  const reservations = await Booking.countDocuments({ schedule: schedule._id });
  if (reservations > 0) {
    throw httpError(
      409,
      'This departure has passenger reservations. Cancel or move those bookings before deleting it.'
    );
  }

  await SeatReservation.deleteMany({ schedule: schedule._id });
  await schedule.deleteOne();
  res.json({ message: 'Departure deleted.' });
});

module.exports = {
  listSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
