const { Bus } = require('../models/Bus');
const { Schedule } = require('../models/Schedule');
const { Ticket } = require('../models/Ticket');
const { asyncHandler } = require('../utils/asyncHandler');
const { addDays, startOfDay, startOfWeek, toDateKey } = require('../utils/dates');

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getDashboard = asyncHandler(async (_req, res) => {
  const today = startOfDay();
  const tomorrow = addDays(today, 1);
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 7);

  const [totalBuses, todaysTickets, weeklyTickets, upcomingDepartures] =
    await Promise.all([
      Bus.countDocuments(),
      Ticket.find({ createdAt: { $gte: today, $lt: tomorrow } })
        .select('seatsBooked totalAmountRwf paymentStatus')
        .lean(),
      Ticket.aggregate([
        { $match: { createdAt: { $gte: weekStart, $lt: weekEnd } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            bookings: { $sum: 1 },
          },
        },
      ]),
      Schedule.find({ status: { $in: ['scheduled', 'delayed'] } })
        .sort({ departureTime: 1 })
        .limit(3)
        .populate('route', 'origin destination routeCode')
        .lean(),
    ]);

  const paidTickets = todaysTickets.filter(
    (ticket) => ticket.paymentStatus === 'paid'
  );

  const stats = {
    totalBuses,
    todaysBookings: todaysTickets.length,
    todaysPassengers: paidTickets.reduce(
      (total, ticket) => total + ticket.seatsBooked,
      0
    ),
    salesToday: paidTickets.reduce(
      (total, ticket) => total + ticket.totalAmountRwf,
      0
    ),
  };

  const bookingsByDay = new Map(
    weeklyTickets.map((item) => [item._id, item.bookings])
  );

  const analytics = DAY_LABELS.map((day, index) => ({
    day,
    bookings: bookingsByDay.get(toDateKey(addDays(weekStart, index))) || 0,
  }));

  res.json({
    stats,
    analytics,
    upcomingDepartures,
  });
});

module.exports = { getDashboard };
