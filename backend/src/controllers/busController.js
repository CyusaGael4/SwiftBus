const { Bus } = require('../models/Bus');
const { Schedule } = require('../models/Schedule');
const { asyncHandler } = require('../utils/asyncHandler');
const { httpError } = require('../utils/httpError');
const { escapeRegex } = require('../utils/validators');

const STATUS_FILTERS = {
  on_route: { status: 'active', assignedRoute: { $ne: null } },
  available: { status: 'active', assignedRoute: null },
  maintenance: { status: { $in: ['maintenance', 'out_of_service'] } },
};

const listBuses = asyncHandler(async (req, res) => {
  const { status = 'all', search = '' } = req.query;

  const query = { ...(STATUS_FILTERS[status] || {}) };

  if (search.trim()) {
    const pattern = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [{ busCode: pattern }, { plateNumber: pattern }];
  }

  const [buses, total, onRoute, available, maintenance] = await Promise.all([
    Bus.find(query)
      .sort({ busCode: 1 })
      .populate('assignedRoute', 'origin destination routeCode')
      .lean(),
    Bus.countDocuments(),
    Bus.countDocuments(STATUS_FILTERS.on_route),
    Bus.countDocuments(STATUS_FILTERS.available),
    Bus.countDocuments(STATUS_FILTERS.maintenance),
  ]);

  res.json({
    buses,
    stats: { total, onRoute, available, maintenance },
    counts: { all: total, on_route: onRoute, available, maintenance },
  });
});

const getBus = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id).populate(
    'assignedRoute',
    'origin destination routeCode'
  );

  if (!bus) throw httpError(404, 'Bus not found.');

  res.json({ bus });
});

const createBus = asyncHandler(async (req, res) => {
  const {
    busCode,
    plateNumber,
    companyName,
    totalCapacity,
    status,
    assignedRoute,
    nextServiceDate,
  } = req.body;

  if (!busCode?.trim() || !plateNumber?.trim() || !totalCapacity) {
    throw httpError(400, 'Bus ID, plate number and capacity are required.');
  }

  const bus = await Bus.create({
    busCode: busCode.trim(),
    plateNumber: plateNumber.trim(),
    companyName: companyName?.trim() || 'SwiftBus',
    totalCapacity,
    status: status || 'active',
    assignedRoute: assignedRoute || null,
    nextServiceDate: nextServiceDate || null,
  });

  await bus.populate('assignedRoute', 'origin destination routeCode');

  res.status(201).json({ bus });
});

const updateBus = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id);
  if (!bus) throw httpError(404, 'Bus not found.');

  const editable = [
    'busCode',
    'plateNumber',
    'companyName',
    'totalCapacity',
    'status',
    'assignedRoute',
    'nextServiceDate',
  ];

  for (const field of editable) {
    if (req.body[field] !== undefined) {
      bus[field] =
        field === 'assignedRoute' ? req.body[field] || null : req.body[field];
    }
  }

  await bus.save();
  await bus.populate('assignedRoute', 'origin destination routeCode');

  res.json({ bus });
});

const deleteBus = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id);
  if (!bus) throw httpError(404, 'Bus not found.');

  const scheduleCount = await Schedule.countDocuments({ bus: bus._id });
  if (scheduleCount > 0) {
    throw httpError(
      409,
      'This bus is attached to departures. Remove those departures before deleting it.'
    );
  }

  await bus.deleteOne();
  res.json({ message: 'Bus deleted.' });
});

module.exports = { listBuses, getBus, createBus, updateBus, deleteBus };
