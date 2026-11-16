const crypto = require('crypto');
const mongoose = require('mongoose');
const { Booking } = require('../models/Booking');
const { Schedule } = require('../models/Schedule');
const { SeatReservation } = require('../models/SeatReservation');
const { Ticket } = require('../models/Ticket');
const { User } = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { httpError } = require('../utils/httpError');
const { isValidEmail, isValidPhone } = require('../utils/validators');
const {
  ensureLegacySeats,
  isSeatLabel,
  releaseExpiredHolds,
} = require('../utils/seats');
const { MAX_SEATS_PER_BOOKING } = require('./publicTripController');

const BOOKING_POPULATE = [
  {
    path: 'schedule',
    populate: [
      {
        path: 'route',
        select: 'origin destination routeCode fareRwf estimatedDurationMins',
      },
      { path: 'bus', select: 'busCode plateNumber totalCapacity' },
    ],
  },
];

const TICKET_POPULATE = [
  {
    path: 'schedule',
    populate: [
      { path: 'route', select: 'origin destination routeCode fareRwf' },
      { path: 'bus', select: 'busCode plateNumber totalCapacity' },
    ],
  },
  { path: 'booking', select: 'reference status source' },
];

const now = () => new Date();

function randomSegment(bytes = 5) {
  return crypto.randomBytes(bytes).toString('hex').toUpperCase().slice(0, bytes * 2);
}

function generateReference() {
  const day = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `SB${day}${randomSegment(4)}`;
}

function bookingStatus(booking) {
  if (booking.status === 'cancelled') return 'cancelled';
  const departure = booking.schedule?.departureTime;
  if (departure && new Date(departure) <= now()) return 'completed';
  return 'upcoming';
}

function serializeBooking(booking) {
  const schedule = booking.schedule || {};
  const route = schedule.route || null;
  const bus = schedule.bus || null;

  return {
    id: String(booking._id),
    reference: booking.reference,
    status: bookingStatus(booking),
    bookingStatus: booking.status,
    source: booking.source,
    seats: booking.seats,
    passengerCount: booking.passengerCount,
    unitPriceRwf: booking.unitPriceRwf,
    totalAmountRwf: booking.totalAmountRwf,
    contactName: booking.contactName,
    contactPhone: booking.contactPhone,
    createdAt: booking.createdAt,
    cancelledAt: booking.cancelledAt,
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
    },
  };
}

function ticketStatus(ticket) {
  if (ticket.status === 'cancelled' || ticket.booking?.status === 'cancelled') {
    return 'cancelled';
  }

  const departure = ticket.schedule?.departureTime;
  if (departure && new Date(departure) <= now()) return 'completed';

  return 'active';
}

function serializeTicket(ticket, passenger) {
  const schedule = ticket.schedule || {};
  const route = schedule.route || {};
  const bus = schedule.bus || {};

  return {
    id: String(ticket._id),
    code: ticket.ticketCode,
    reference: ticket.bookingReference || ticket.booking?.reference || '',
    seatNumber: ticket.seatNumber || '',
    status: ticketStatus(ticket),
    verificationCode: ticket.verificationCode || '',
    passengerName: passenger?.fullName || '',
    passengerEmail: passenger?.email || '',
    passengerPhone: passenger?.phoneNumber || '',
    departureTime: schedule.departureTime || null,
    arrivalTime: schedule.arrivalTime || null,
    route: {
      origin: route.origin || '',
      destination: route.destination || '',
      routeCode: route.routeCode || '',
    },
    bus: {
      busCode: bus.busCode || '',
      plateNumber: bus.plateNumber || '',
    },
    createdAt: ticket.createdAt,
  };
}

const createBooking = asyncHandler(async (req, res) => {
  const {
    scheduleId,
    seats = [],
    holdToken = '',
    contactName = '',
    contactPhone = '',
  } = req.body;

  if (!scheduleId) throw httpError(400, 'Select a trip before confirming.');

  const requested = [
    ...new Set(seats.map((seat) => String(seat).trim().toUpperCase())),
  ].filter(Boolean);

  if (!requested.length) throw httpError(400, 'Select at least one seat.');
  if (requested.length > MAX_SEATS_PER_BOOKING) {
    throw httpError(400, `You can reserve up to ${MAX_SEATS_PER_BOOKING} seats at a time.`);
  }

  const schedule = await Schedule.findById(scheduleId).populate([
    {
      path: 'route',
      select: 'origin destination routeCode fareRwf estimatedDurationMins',
    },
    { path: 'bus', select: 'busCode plateNumber totalCapacity' },
  ]);

  if (!schedule) throw httpError(404, 'Trip not found.');
  if (!['scheduled', 'delayed'].includes(schedule.status)) {
    throw httpError(400, 'This trip is no longer open for reservations.');
  }
  if (new Date(schedule.departureTime) <= now()) {
    throw httpError(400, 'This trip has already departed.');
  }

  const capacity = schedule.bus?.totalCapacity || 0;
  if (!capacity) throw httpError(400, 'This trip has no seat configuration.');

  if (requested.some((seat) => !isSeatLabel(capacity, seat))) {
    throw httpError(400, 'One or more selected seats are invalid.');
  }

  if ((Number(schedule.seatsBooked) || 0) + requested.length > capacity) {
    throw httpError(409, 'There are not enough seats left on this trip.');
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
        .join(', ')} ${conflicts.length > 1 ? 'are' : 'is'} no longer available. Refresh the trip to pick different seats.`
    );
  }

  const phone = String(contactPhone || req.user.phoneNumber || '').trim();
  if (!phone) {
    throw httpError(400, 'Add a phone number so the operator can reach you.');
  }
  if (!isValidPhone(phone)) {
    throw httpError(400, 'Enter a valid phone number.');
  }

  const unitPriceRwf = Number(schedule.route?.fareRwf) || 0;
  if (unitPriceRwf <= 0) {
    throw httpError(400, 'This trip does not have a valid fare yet.');
  }

  const totalAmountRwf = unitPriceRwf * requested.length;

  // Create the booking first so seat inventory can point at its id. Every later
  // step is compensated if it fails, keeping bookings and seats consistent.
  let booking = null;
  for (let attempt = 0; attempt < 3 && !booking; attempt += 1) {
    try {
      booking = await Booking.create({
        reference: generateReference(),
        passenger: req.user._id,
        schedule: schedule._id,
        seats: requested,
        passengerCount: requested.length,
        unitPriceRwf,
        totalAmountRwf,
        status: 'confirmed',
        source: 'online',
        contactName: String(contactName || req.user.fullName || '').trim(),
        contactPhone: phone,
        contactEmail: req.user.email,
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  }

  if (!booking) {
    throw httpError(503, 'Could not generate a booking reference. Please try again.');
  }

  let seatsIncremented = false;

  try {
    // A seat already has exactly one reservation document. Convert this
    // passenger's checkout holds into confirmed allocations instead of
    // inserting duplicates, and only insert seats that were never held.
    const heldSeats = new Set(
      existing
        .filter((row) => row.kind === 'hold' && row.holdToken === holdToken)
        .map((row) => row.seat)
    );

    if (heldSeats.size) {
      await SeatReservation.updateMany(
        {
          schedule: schedule._id,
          seat: { $in: [...heldSeats] },
          kind: 'hold',
          holdToken,
        },
        {
          $set: {
            kind: 'booking',
            booking: booking._id,
            holdToken: null,
            expiresAt: null,
          },
        }
      );
    }

    const unheldSeats = requested.filter((seat) => !heldSeats.has(seat));

    if (unheldSeats.length) {
      await SeatReservation.insertMany(
        unheldSeats.map((seat) => ({
          schedule: schedule._id,
          seat,
          kind: 'booking',
          booking: booking._id,
        }))
      );
    }

    // A hold can expire between the conflict check above and the conversion
    // below. Verify that every requested seat now belongs to this booking; if
    // not, fail so the caller's compensating cleanup releases everything.
    const allocated = await SeatReservation.countDocuments({
      schedule: schedule._id,
      booking: booking._id,
      kind: 'booking',
    });

    if (allocated !== requested.length) {
      throw httpError(
        409,
        'Those seats were just booked by another passenger. Please choose different seats.'
      );
    }

    await SeatReservation.deleteMany({
      schedule: schedule._id,
      kind: 'hold',
      holdToken,
    });

    await Schedule.updateOne(
      { _id: schedule._id },
      { $inc: { seatsBooked: requested.length } }
    );
    seatsIncremented = true;

    await Ticket.insertMany(
      requested.map((seat) => ({
        user: req.user._id,
        schedule: schedule._id,
        booking: booking._id,
        bookingReference: booking.reference,
        seatNumber: seat,
        seatsBooked: 1,
        totalAmountRwf: unitPriceRwf,
        paymentStatus: 'unpaid',
        status: 'active',
        ticketCode: `${booking.reference}-${seat}`,
        verificationCode: crypto.randomBytes(16).toString('hex'),
      }))
    );
  } catch (error) {
    await Ticket.deleteMany({ booking: booking._id }).catch(() => {});
    await SeatReservation.deleteMany({ booking: booking._id }).catch(() => {});
    await Booking.deleteOne({ _id: booking._id }).catch(() => {});
    if (seatsIncremented) {
      await Schedule.updateOne(
        { _id: schedule._id },
        { $inc: { seatsBooked: -requested.length } }
      ).catch(() => {});
    }

    if (error.code === 11000) {
      throw httpError(
        409,
        'Those seats were just booked by another passenger. Please choose different seats.'
      );
    }

    throw error;
  }

  const tickets = await Ticket.find({ booking: booking._id })
    .populate(TICKET_POPULATE)
    .lean();

  res.status(201).json({
    booking: serializeBooking(
      await Booking.findById(booking._id).populate(BOOKING_POPULATE).lean()
    ),
    tickets: tickets.map((ticket) => serializeTicket(ticket, req.user)),
    message: 'Reservation confirmed. Pay the conductor when you board.',
  });
});

const listBookings = asyncHandler(async (req, res) => {
  const { status = 'all' } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 6));

  const bookings = await Booking.find({ passenger: req.user._id })
    .sort({ createdAt: -1 })
    .limit(300)
    .populate(BOOKING_POPULATE)
    .lean();

  const decorated = bookings.map((booking) => ({
    ...booking,
    effectiveStatus: bookingStatus(booking),
  }));

  const counts = {
    all: decorated.length,
    upcoming: decorated.filter((booking) => booking.effectiveStatus === 'upcoming').length,
    completed: decorated.filter((booking) => booking.effectiveStatus === 'completed')
      .length,
    cancelled: decorated.filter((booking) => booking.effectiveStatus === 'cancelled')
      .length,
  };

  const filtered =
    status === 'all'
      ? decorated
      : decorated.filter((booking) => booking.effectiveStatus === status);

  const start = (page - 1) * limit;

  res.json({
    bookings: filtered.slice(start, start + limit).map(serializeBooking),
    total: filtered.length,
    page,
    limit,
    pages: Math.max(1, Math.ceil(filtered.length / limit)),
    counts,
  });
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    reference: String(req.params.reference).toUpperCase(),
    passenger: req.user._id,
  })
    .populate(BOOKING_POPULATE)
    .lean();

  if (!booking) throw httpError(404, 'Booking not found.');

  const tickets = await Ticket.find({ booking: booking._id })
    .populate(TICKET_POPULATE)
    .lean();

  res.json({
    booking: serializeBooking(booking),
    tickets: tickets.map((ticket) => serializeTicket(ticket, req.user)),
  });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const reference = String(req.params.reference).toUpperCase();

  const booking = await Booking.findOne({
    reference,
    passenger: req.user._id,
  }).populate(BOOKING_POPULATE);

  if (!booking) throw httpError(404, 'Booking not found.');

  if (booking.status === 'cancelled') {
    throw httpError(400, 'This booking is already cancelled.');
  }

  const departure = booking.schedule?.departureTime;
  if (!departure || new Date(departure) <= now()) {
    throw httpError(
      400,
      'Completed trips cannot be cancelled. Please contact support for help.'
    );
  }

  const seatCount = booking.seats.length;

  booking.status = 'cancelled';
  booking.cancelledAt = now();
  await booking.save();

  await Ticket.updateMany({ booking: booking._id }, { $set: { status: 'cancelled' } });
  await SeatReservation.deleteMany({ booking: booking._id });

  const schedule = await Schedule.findById(booking.schedule._id);
  if (schedule) {
    schedule.seatsBooked = Math.max(0, (Number(schedule.seatsBooked) || 0) - seatCount);
    await schedule.save();
  }

  res.json({
    booking: serializeBooking(
      await Booking.findById(booking._id).populate(BOOKING_POPULATE).lean()
    ),
    message: 'Reservation cancelled. The seats have been released.',
  });
});

const listTickets = asyncHandler(async (req, res) => {
  // Only per-seat digital tickets issued by the passenger portal are shown here.
  // Legacy counter sales have no seat number or scannable code.
  const tickets = await Ticket.find({
    user: req.user._id,
    verificationCode: { $exists: true, $nin: [null, ''] },
  })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate(TICKET_POPULATE)
    .lean();

  res.json({
    tickets: tickets.map((ticket) => serializeTicket(ticket, req.user)),
  });
});

const getTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate(TICKET_POPULATE)
    .lean();

  if (!ticket) throw httpError(404, 'Ticket not found.');
  if (!ticket.verificationCode) {
    throw httpError(400, 'This ticket does not have a scannable code.');
  }

  res.json({ ticket: serializeTicket(ticket, req.user) });
});

const verifyTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({
    verificationCode: String(req.params.code).trim(),
  })
    .populate([
      {
        path: 'schedule',
        populate: [
          { path: 'route', select: 'origin destination routeCode' },
          { path: 'bus', select: 'busCode plateNumber' },
        ],
      },
      { path: 'user', select: 'fullName email phoneNumber' },
      { path: 'booking', select: 'reference status source' },
    ])
    .lean();

  if (!ticket) throw httpError(404, 'No ticket matches that code.');

  const status = ticketStatus(ticket);
  const valid = status === 'active';

  res.json({
    valid,
    status,
    message: valid
      ? 'Ticket is valid for boarding.'
      : status === 'cancelled'
        ? 'This ticket was cancelled.'
        : 'This trip has already taken place.',
    ticket: {
      code: ticket.ticketCode,
      reference: ticket.bookingReference || ticket.booking?.reference || '',
      seatNumber: ticket.seatNumber,
      passengerName: ticket.user?.fullName || '',
      passengerPhone: ticket.user?.phoneNumber || '',
      route: {
        origin: ticket.schedule?.route?.origin || '',
        destination: ticket.schedule?.route?.destination || '',
      },
      bus: {
        plateNumber: ticket.schedule?.bus?.plateNumber || '',
        busCode: ticket.schedule?.bus?.busCode || '',
      },
      departureTime: ticket.schedule?.departureTime || null,
    },
  });
});

const getDashboard = asyncHandler(async (req, res) => {
  const [bookings, totalBookings, ticketCount] = await Promise.all([
    Booking.find({ passenger: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate(BOOKING_POPULATE)
      .lean(),
    Booking.countDocuments({ passenger: req.user._id }),
    Ticket.countDocuments({
      user: req.user._id,
      verificationCode: { $exists: true, $nin: [null, ''] },
    }),
  ]);

  const decorated = bookings.map((booking) => ({
    ...booking,
    effectiveStatus: bookingStatus(booking),
  }));

  const upcoming = decorated
    .filter((booking) => booking.effectiveStatus === 'upcoming')
    .sort(
      (a, b) =>
        new Date(a.schedule?.departureTime || 0) - new Date(b.schedule?.departureTime || 0)
    );

  res.json({
    stats: {
      totalBookings,
      upcoming: upcoming.length,
      completed: decorated.filter((booking) => booking.effectiveStatus === 'completed')
        .length,
      cancelled: decorated.filter((booking) => booking.effectiveStatus === 'cancelled')
        .length,
      tickets: ticketCount,
    },
    nextJourney: upcoming[0] ? serializeBooking(upcoming[0]) : null,
    upcomingJourneys: upcoming.slice(0, 3).map(serializeBooking),
    recent: decorated.slice(0, 5).map(serializeBooking),
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) throw httpError(404, 'Account not found.');

  if (fullName !== undefined) {
    if (!String(fullName).trim() || String(fullName).trim().length < 3) {
      throw httpError(400, 'Enter your full name.');
    }
    user.fullName = String(fullName).trim();
  }

  if (phoneNumber !== undefined) {
    if (!isValidPhone(String(phoneNumber))) {
      throw httpError(400, 'Enter a valid phone number.');
    }
    user.phoneNumber = String(phoneNumber).trim();
  }

  if (email !== undefined) {
    const nextEmail = String(email).toLowerCase().trim();
    if (!isValidEmail(nextEmail)) throw httpError(400, 'Enter a valid email address.');

    if (nextEmail !== user.email) {
      const existing = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (existing) throw httpError(409, 'An account with that email already exists.');
      user.email = nextEmail;
    }
  }

  await user.save();
  res.json({ user: user.toJSON(), message: 'Profile updated.' });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword = '', newPassword = '' } = req.body;

  if (!currentPassword || !newPassword) {
    throw httpError(400, 'Enter your current password and a new password.');
  }

  if (String(newPassword).length < 8) {
    throw httpError(400, 'Your new password must be at least 8 characters long.');
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user) throw httpError(404, 'Account not found.');

  const matches = await user.comparePassword(String(currentPassword));
  if (!matches) throw httpError(400, 'Your current password is incorrect.');

  user.passwordHash = String(newPassword);
  await user.save();

  res.json({ message: 'Password updated.' });
});

module.exports = {
  createBooking,
  listBookings,
  getBooking,
  cancelBooking,
  listTickets,
  getTicket,
  verifyTicket,
  getDashboard,
  updateProfile,
  changePassword,
  serializeBooking,
  serializeTicket,
  BOOKING_POPULATE,
  TICKET_POPULATE,
};
