const { SeatReservation } = require('../models/SeatReservation');

const SEAT_LETTERS = ['A', 'B', 'C', 'D'];

// Buses store a seat count, so the physical layout is derived deterministically:
// four seats per row (A-D) with a centre aisle. This keeps seat numbers stable
// for every request without adding a second seating source of truth.
function seatLabels(capacity) {
  const labels = [];
  const total = Math.max(0, Number(capacity) || 0);

  for (let index = 0; index < total; index += 1) {
    labels.push(
      `${Math.floor(index / SEAT_LETTERS.length) + 1}${SEAT_LETTERS[index % SEAT_LETTERS.length]}`
    );
  }

  return labels;
}

function isSeatLabel(capacity, value) {
  return seatLabels(capacity).includes(value);
}

async function releaseExpiredHolds(scheduleId) {
  await SeatReservation.deleteMany({
    schedule: scheduleId,
    kind: 'hold',
    expiresAt: { $lte: new Date() },
  });
}

// Seeded/agent departures only store a booked seat count. Materialise those as
// seat reservations so the seat map and new bookings share one inventory.
async function ensureLegacySeats(schedule, capacity) {
  const booked = Number(schedule.seatsBooked) || 0;
  if (booked <= 0) return;

  const fixed = await SeatReservation.countDocuments({
    schedule: schedule._id,
    kind: { $ne: 'hold' },
  });

  if (fixed >= booked) return;

  const existing = await SeatReservation.find({
    schedule: schedule._id,
    kind: { $ne: 'hold' },
  })
    .select('seat')
    .lean();

  const taken = new Set(existing.map((row) => row.seat));
  const operations = [];

  for (const label of seatLabels(capacity)) {
    if (fixed + operations.length >= booked) break;
    if (taken.has(label)) continue;

    operations.push({
      updateOne: {
        filter: { schedule: schedule._id, seat: label },
        update: {
          $setOnInsert: { schedule: schedule._id, seat: label, kind: 'legacy' },
        },
        upsert: true,
      },
    });
  }

  if (operations.length) {
    await SeatReservation.bulkWrite(operations, { ordered: false }).catch(() => {});
  }
}

async function holdCountsBySchedule(scheduleIds) {
  if (!scheduleIds?.length) return new Map();

  const rows = await SeatReservation.aggregate([
    {
      $match: {
        schedule: { $in: scheduleIds },
        kind: 'hold',
        expiresAt: { $gt: new Date() },
      },
    },
    { $group: { _id: '$schedule', count: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [String(row._id), row.count]));
}

async function buildSeatMap(schedule, capacity, holdToken) {
  await releaseExpiredHolds(schedule._id);
  await ensureLegacySeats(schedule, capacity);

  const reservations = await SeatReservation.find({ schedule: schedule._id }).lean();
  const taken = new Set();
  const mine = new Set();

  reservations.forEach((row) => {
    if (row.kind === 'hold') {
      if (holdToken && row.holdToken === holdToken) mine.add(row.seat);
      else taken.add(row.seat);
      return;
    }

    taken.add(row.seat);
  });

  const seats = seatLabels(capacity).map((label) => ({
    label,
    taken: taken.has(label),
    selected: mine.has(label),
  }));

  return {
    seats,
    availableSeats: seats.filter((seat) => !seat.taken && !seat.selected).length,
  };
}

module.exports = {
  seatLabels,
  isSeatLabel,
  ensureLegacySeats,
  holdCountsBySchedule,
  buildSeatMap,
  releaseExpiredHolds,
};
