const { Bus } = require('../models/Bus');
const { Route } = require('../models/Route');
const { Schedule } = require('../models/Schedule');
const { asyncHandler } = require('../utils/asyncHandler');
const { httpError } = require('../utils/httpError');
const { escapeRegex } = require('../utils/validators');

const listRoutes = asyncHandler(async (req, res) => {
  const { search = '', destination = '' } = req.query;
  const query = {};

  if (search.trim()) {
    const pattern = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [{ origin: pattern }, { destination: pattern }, { routeCode: pattern }];
  }

  if (destination) {
    query.destination = new RegExp(`^${escapeRegex(destination)}$`, 'i');
  }

  const routes = await Route.find(query).sort({ _id: 1 }).lean();

  res.json({ routes, total: routes.length });
});

const getRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);
  if (!route) throw httpError(404, 'Route not found.');
  res.json({ route });
});

const createRoute = asyncHandler(async (req, res) => {
  const { routeCode, origin, destination, fareRwf, estimatedDurationMins } = req.body;

  if (!routeCode?.trim() || !origin?.trim() || !destination?.trim()) {
    throw httpError(400, 'Route code, origin and destination are required.');
  }

  if (fareRwf === undefined || Number(fareRwf) < 0) {
    throw httpError(400, 'Enter a valid fare.');
  }

  const route = await Route.create({
    routeCode: routeCode.trim(),
    origin: origin.trim(),
    destination: destination.trim(),
    fareRwf,
    estimatedDurationMins: estimatedDurationMins || 0,
  });

  res.status(201).json({ route });
});

const updateRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);
  if (!route) throw httpError(404, 'Route not found.');

  const editable = [
    'routeCode',
    'origin',
    'destination',
    'fareRwf',
    'estimatedDurationMins',
    'isActive',
  ];

  for (const field of editable) {
    if (req.body[field] !== undefined) {
      route[field] = req.body[field];
    }
  }

  await route.save();
  res.json({ route });
});

const deleteRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);
  if (!route) throw httpError(404, 'Route not found.');

  const [busCount, scheduleCount] = await Promise.all([
    Bus.countDocuments({ assignedRoute: route._id }),
    Schedule.countDocuments({ route: route._id }),
  ]);

  if (busCount > 0 || scheduleCount > 0) {
    throw httpError(
      409,
      'This route is in use by buses or departures. Unassign it before deleting.'
    );
  }

  await route.deleteOne();
  res.json({ message: 'Route deleted.' });
});

module.exports = { listRoutes, getRoute, createRoute, updateRoute, deleteRoute };
