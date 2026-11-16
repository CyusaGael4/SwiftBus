const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDatabase, disconnectDatabase } = require('./config/db');
const { Booking } = require('./models/Booking');
const { Bus } = require('./models/Bus');
const { Route } = require('./models/Route');
const { Schedule } = require('./models/Schedule');
const { SeatReservation } = require('./models/SeatReservation');
const { Ticket } = require('./models/Ticket');
const { User } = require('./models/User');
const { addDays, startOfDay, startOfWeek, toDateKey } = require('./utils/dates');
const { seatLabels } = require('./utils/seats');

const DEMO_PASSWORD = 'Swiftbus@123';
const TEAM_ROLES = ['admin', 'booking_agent', 'driver'];

const staff = [
  ['Aline Uwase', 'aline@example.com', 'admin', 'active', 9, 42],
  ['Eric Mugisha', 'eric@example.com', 'admin', 'active', 8, 15],
  ['Diane Ingabire', 'diane@example.com', 'booking_agent', 'active', 9, 38],
  ['Patrick Niyonzima', 'patrick@example.com', 'booking_agent', 'active', 9, 21],
  ['Claudine Uwimana', 'claudine@example.com', 'booking_agent', 'active', 8, 50],
  ['Kevin Nsengimana', 'kevin@example.com', 'booking_agent', 'active', 9, 5],
  ['Sandrine Uwera', 'sandrine@example.com', 'booking_agent', 'active', 7, 55],
  ['Olive Mukeshimana', 'olive@example.com', 'booking_agent', 'active', 8, 30],
  ['Samuel Nkurunziza', 'samuel@example.com', 'driver', 'active', 8, 10],
  ['Emmanuel Habiyaremye', 'emmanuel@example.com', 'driver', 'active', 9, 15],
  ['Jean Habimana', 'jean@example.com', 'driver', 'invited', null, null],
  ['Grace Mukamana', 'grace@example.com', 'driver', 'invited', null, null],
];

const passengers = [
  'Alice Mukamana',
  'Bernard Niyonsenga',
  'Chantal Uwase',
  'David Mugabo',
  'Esther Uwera',
  'Fabrice Ndayisaba',
  'Gloria Ineza',
  'Herve Nshimiyimana',
  'Irene Byukusenge',
  'James Rwema',
];

// Both directions are seeded so the passenger search has real options for every
// origin and destination it offers. Fares follow the standard Rwandan intercity
// fares for these routes (RURA 2026 tariff), rounded to the nearest 500 RWF.
const routeSeed = [
  ['NYA-HUY', 'Nyabugogo', 'Huye', 4000, 120],
  ['NYA-MUS', 'Nyabugogo', 'Musanze', 3000, 150],
  ['NYA-RUH', 'Nyabugogo', 'Ruhango', 2000, 75],
  ['NYA-RUB', 'Nyabugogo', 'Rubavu', 5000, 180],
  ['HUY-NYA', 'Huye', 'Nyabugogo', 4000, 120],
  ['MUS-NYA', 'Musanze', 'Nyabugogo', 3000, 150],
  ['RUB-NYA', 'Rubavu', 'Nyabugogo', 5000, 180],
  ['RUH-NYA', 'Ruhango', 'Nyabugogo', 2000, 75],
];

const firstBuses = [
  ['SB-001', 'RAE 204 B', 48, 'active', 0, 5],
  ['SB-002', 'RAE 318 C', 48, 'active', 1, 8],
  ['SB-003', 'RAF 112 D', 36, 'active', 2, 11],
  ['SB-004', 'RAE 226 E', 48, 'active', null, 13],
  ['SB-005', 'RAE 340 F', 36, 'active', null, 15],
  ['SB-006', 'RAG 154 G', 48, 'maintenance', null, -3],
];

// time, route index, bus index, seats already sold, status used for past days
const departureTemplate = [
  ['06:00', 0, 0, 32, 'completed'],
  ['07:15', 1, 1, 40, 'completed'],
  ['08:00', 0, 0, 44, 'departed'],
  ['09:30', 1, 1, 38, 'departed'],
  ['10:00', 2, 2, 28, 'delayed'],
  ['11:30', 0, 6, 32, 'scheduled'],
  ['12:15', 3, 7, 24, 'scheduled'],
  ['13:00', 1, 7, 21, 'scheduled'],
  ['14:30', 3, 8, 18, 'scheduled'],
  ['15:00', 2, 9, 26, 'scheduled'],
  ['16:30', 0, 10, 30, 'scheduled'],
  ['18:00', 1, 10, 22, 'scheduled'],
];

// Days of departures relative to today: yesterday and the day before are already
// completed, today is partly done, and the next week is open for booking.
const DAY_OFFSETS = [-2, -1, 0, 1, 2, 3, 4, 5, 6];

// Illustrative counter-sale volume, Monday to Sunday.
const bookingsPerWeekday = [42, 58, 49, 71, 63, 84, 74];

function atTime(date, time) {
  const [hours, minutes] = time.split(':').map(Number);
  const value = new Date(date);
  value.setHours(hours, minutes, 0, 0);
  return value;
}

function plateFor(index) {
  const letters = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L'];
  return `RA${letters[index % letters.length]} ${410 + index * 9} ${letters[(index + 3) % letters.length]}`;
}

function seedReference(dateKey, index) {
  return `SB${dateKey.replaceAll('-', '')}${String(index + 1).padStart(3, '0')}`;
}

async function seed() {
  const startedAt = Date.now();
  await connectDatabase();
  console.log('Connected to MongoDB. Seeding SwiftBus...');

  // Hashing the shared demo password is the slowest CPU step, so start it
  // while the collections are being cleared.
  const passwordHashPromise = bcrypt.hash(DEMO_PASSWORD, 12);

  await Promise.all([
    User.deleteMany({}),
    Route.deleteMany({}),
    Bus.deleteMany({}),
    Schedule.deleteMany({}),
    Ticket.deleteMany({}),
    Booking.deleteMany({}),
    SeatReservation.deleteMany({}),
  ]);

  const passwordHash = await passwordHashPromise;
  const today = startOfDay();
  const todayKey = toDateKey(today);
  const now = new Date();

  const staffDocs = staff.map(([fullName, email, role, status, hour, minute], index) => {
    let lastActiveAt = null;
    if (hour !== null) {
      const value = new Date(today);
      value.setHours(hour, minute, 0, 0);
      lastActiveAt = value;
    }

    return {
      _id: new mongoose.Types.ObjectId(),
      fullName,
      email,
      passwordHash,
      role,
      status,
      lastActiveAt,
      inviteSentAt: status === 'invited' ? addDays(today, -2) : null,
      phoneNumber: `+250 788 ${String(101 + index).padStart(3, '0')} 000`,
    };
  });

  const passengerDocs = passengers.map((fullName, index) => ({
    _id: new mongoose.Types.ObjectId(),
    fullName,
    email: `passenger${index + 1}@example.com`,
    passwordHash,
    role: 'passenger',
    status: 'active',
    lastActiveAt: addDays(today, -(index % 5)),
    phoneNumber: `+250 789 ${String(201 + index).padStart(3, '0')} 000`,
  }));

  const userDocs = [...staffDocs, ...passengerDocs];
  const drivers = staffDocs.filter((user) => user.role === 'driver' && user.status === 'active');
  const agents = staffDocs.filter((user) => user.role === 'booking_agent');
  const admin = staffDocs.find((user) => user.role === 'admin');

  const routeDocs = routeSeed.map(
    ([routeCode, origin, destination, fareRwf, estimatedDurationMins]) => ({
      _id: new mongoose.Types.ObjectId(),
      routeCode,
      origin,
      destination,
      fareRwf,
      estimatedDurationMins,
      isActive: true,
    })
  );

  const busDocs = [];
  for (let index = 0; index < 24; index += 1) {
    const number = index + 1;
    const code = `SB-${String(number).padStart(3, '0')}`;
    const preset = firstBuses[index];

    const isMaintenance = number === 6 || number === 24;
    const isAvailable = [4, 5, 22, 23].includes(number);
    const assignedIndex =
      isMaintenance || isAvailable ? null : index < 3 ? index : index % routeDocs.length;

    busDocs.push({
      _id: new mongoose.Types.ObjectId(),
      busCode: code,
      plateNumber: preset ? preset[1] : plateFor(index),
      companyName: 'SwiftBus',
      totalCapacity: preset ? preset[2] : [48, 48, 36][index % 3],
      status: isMaintenance ? 'maintenance' : 'active',
      assignedRoute: assignedIndex === null ? null : routeDocs[assignedIndex]._id,
      nextServiceDate: addDays(today, preset ? preset[5] : (number % 12) + 2),
      busStops: [],
    });
  }

  const capacityOf = (bus) => bus.totalCapacity;

  const schedulesByDate = new Map();
  const scheduleDocs = [];
  const scheduleMeta = [];

  for (const dayOffset of DAY_OFFSETS) {
    const date = addDays(today, dayOffset);
    const dateKey = toDateKey(date);
    const daySchedules = [];
    const isPastDay = dayOffset < 0;
    const isToday = dayOffset === 0;

    departureTemplate.forEach(([time, routeIndex, busIndex, seats, pastStatus], index) => {
      const departureTime = atTime(date, time);
      const route = routeDocs[routeIndex];
      const bus = busDocs[busIndex];

      let status = 'scheduled';

      if (isPastDay) {
        status = 'completed';
      } else if (isToday) {
        // Only departures that have not left yet stay open for booking, so a
        // search today never offers a bus that already departed.
        if (departureTime <= now) {
          status = index === 4 ? 'delayed' : 'completed';
        } else {
          status = 'scheduled';
        }
      } else if (index === 4) {
        status = 'delayed';
      } else {
        status = pastStatus === 'delayed' ? 'delayed' : 'scheduled';
      }

      const schedule = {
        _id: new mongoose.Types.ObjectId(),
        route: route._id,
        bus: bus._id,
        driver: drivers.length ? drivers[index % drivers.length]._id : null,
        departureTime,
        arrivalTime: new Date(
          departureTime.getTime() + route.estimatedDurationMins * 60 * 1000
        ),
        seatsBooked: seats,
        status,
        notes: '',
      };

      daySchedules.push({ _id: schedule._id, fareRwf: route.fareRwf });
      scheduleDocs.push(schedule);
      scheduleMeta.push({
        doc: schedule,
        dateKey,
        date,
        route,
        bus,
        capacity: capacityOf(bus),
        fareRwf: route.fareRwf,
      });
    });

    schedulesByDate.set(dateKey, daySchedules);
  }

  // Legacy counter sales: one ticket document per sale, with explicit dates so
  // the dashboard chart shows a full week.
  const ticketDocs = [];
  const weekStart = startOfWeek(today);
  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    const date = addDays(weekStart, dayOffset);
    const dateKey = toDateKey(date);
    const daySchedules = schedulesByDate.get(dateKey);

    // Days outside the seeded window (for example a week that started before
    // yesterday) still get activity so the chart is never empty.
    if (!daySchedules) continue;

    const count = bookingsPerWeekday[dayOffset];

    for (let index = 0; index < count; index += 1) {
      const schedule = daySchedules[index % daySchedules.length];
      const seatsBooked = 1 + (index % 3);
      const paid = index % 10 !== 0;
      const createdAt = new Date(date);
      createdAt.setHours(8 + (index % 10), (index * 7) % 60, 0, 0);

      ticketDocs.push({
        user: passengerDocs[index % passengerDocs.length]._id,
        schedule: schedule._id,
        seatsBooked,
        totalAmountRwf: schedule.fareRwf * seatsBooked,
        paymentStatus: paid ? 'paid' : 'unpaid',
        ticketCode: `SB-${dateKey.replaceAll('-', '')}-${String(index + 1).padStart(3, '0')}`,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  // Reservations in the shared Booking collection, so the staff Bookings page,
  // the passenger dashboard and the seat maps are populated from day one.
  const bookingDocs = [];
  const seatReservationDocs = [];
  const portalTicketDocs = [];
  const usedSeats = new Map();
  let referenceCounter = 0;

  const upcoming = scheduleMeta
    .filter((meta) => ['scheduled', 'delayed'].includes(meta.doc.status))
    .sort((first, second) => first.doc.departureTime - second.doc.departureTime);

  const completed = scheduleMeta
    .filter((meta) => meta.doc.status === 'completed')
    .sort((first, second) => second.doc.departureTime - first.doc.departureTime);

  let upcomingCursor = 0;

  function takeUpcomingSchedule(seatsNeeded) {
    while (upcomingCursor < upcoming.length) {
      const meta = upcoming[upcomingCursor];
      upcomingCursor += 1;

      if (meta.capacity - meta.doc.seatsBooked >= seatsNeeded + 2) {
        return meta;
      }
    }

    return null;
  }

  function takeSeats(meta, count) {
    const taken = usedSeats.get(String(meta.doc._id)) || new Set();
    const picks = [];

    for (const label of seatLabels(meta.capacity)) {
      if (picks.length >= count) break;
      if (taken.has(label)) continue;
      picks.push(label);
      taken.add(label);
    }

    usedSeats.set(String(meta.doc._id), taken);
    return picks;
  }

  function addBooking({ meta, passenger, seats, source, status, agent, createdOn }) {
    referenceCounter += 1;
    const reference = seedReference(
      meta.dateKey,
      referenceCounter
    );

    const bookingId = new mongoose.Types.ObjectId();
    const unitPriceRwf = meta.fareRwf;
    const createdAt = createdOn || addDays(meta.doc.departureTime, -1);

    bookingDocs.push({
      _id: bookingId,
      reference,
      passenger: passenger._id,
      schedule: meta.doc._id,
      seats,
      passengerCount: seats.length,
      unitPriceRwf,
      totalAmountRwf: unitPriceRwf * seats.length,
      status,
      source,
      agent: agent ? agent._id : null,
      contactName: passenger.fullName,
      contactPhone: passenger.phoneNumber,
      contactEmail: passenger.email,
      cancelledAt: status === 'cancelled' ? addDays(createdAt, 1) : null,
      createdAt,
      updatedAt: createdAt,
    });

    if (status === 'cancelled') {
      // Cancelled reservations keep the record but release their seats.
      return;
    }

    meta.doc.seatsBooked += seats.length;

    seats.forEach((seat) => {
      seatReservationDocs.push({
        schedule: meta.doc._id,
        seat,
        kind: 'booking',
        booking: bookingId,
        holdToken: null,
        expiresAt: null,
        createdAt,
        updatedAt: createdAt,
      });

      portalTicketDocs.push({
        user: passenger._id,
        schedule: meta.doc._id,
        booking: bookingId,
        bookingReference: reference,
        seatNumber: seat,
        seatsBooked: 1,
        totalAmountRwf: unitPriceRwf,
        paymentStatus: 'unpaid',
        status: meta.doc.status === 'completed' ? 'completed' : 'active',
        ticketCode: `${reference}-${seat}`,
        verificationCode: crypto.randomBytes(16).toString('hex'),
        createdAt,
        updatedAt: createdAt,
      });
    });
  }

  // Online reservations made through the passenger portal.
  const onlinePlans = [
    { passengerIndex: 0, seats: 2 },
    { passengerIndex: 1, seats: 1 },
    { passengerIndex: 2, seats: 2 },
    { passengerIndex: 3, seats: 3 },
    { passengerIndex: 4, seats: 1 },
    { passengerIndex: 5, seats: 2 },
    { passengerIndex: 6, seats: 1 },
    { passengerIndex: 7, seats: 2 },
    { passengerIndex: 0, seats: 1 },
    { passengerIndex: 0, seats: 2 },
    { passengerIndex: 8, seats: 2 },
    { passengerIndex: 9, seats: 1 },
  ];

  onlinePlans.forEach(({ passengerIndex, seats: seatCount }) => {
    const meta = takeUpcomingSchedule(seatCount);
    if (!meta) return;

    addBooking({
      meta,
      passenger: passengerDocs[passengerIndex],
      seats: takeSeats(meta, seatCount),
      source: 'online',
      status: 'confirmed',
      agent: null,
    });
  });

  // Counter reservations created by a booking agent keep their agent reference
  // and are identifiable as agent bookings.
  agents.slice(0, 3).forEach((agent, index) => {
    const meta = takeUpcomingSchedule(2);
    if (!meta) return;

    addBooking({
      meta,
      passenger: passengerDocs[(index + 2) % passengerDocs.length],
      seats: takeSeats(meta, 2),
      source: 'agent',
      status: 'confirmed',
      agent,
    });
  });

  // Completed journeys for the "completed" tab and passenger history.
  completed.slice(0, 5).forEach((meta, index) => {
    const seats = takeSeats(meta, 1 + (index % 2));

    addBooking({
      meta,
      passenger: passengerDocs[index % passengerDocs.length],
      seats,
      source: index === 3 ? 'agent' : 'online',
      status: 'confirmed',
      agent: index === 3 ? agents[1] : null,
      createdOn: addDays(meta.doc.departureTime, -2),
    });
  });

  // Cancelled reservations stay visible in both portals without holding seats.
  [0, 1, 2].forEach((index) => {
    const meta = upcoming.find(
      (candidate) =>
        candidate.doc.status !== 'cancelled' &&
        candidate.capacity - candidate.doc.seatsBooked >= 6
    );

    if (!meta) return;

    const booked = takeSeats(meta, 1);
    if (!booked.length) return;

    addBooking({
      meta,
      passenger: passengerDocs[(index + 4) % passengerDocs.length],
      seats: booked,
      source: 'online',
      status: 'cancelled',
      agent: null,
    });
  });

  // Every document already owns its ObjectId, so the writes can go out together
  // instead of waiting on each collection one after another.
  await Promise.all([
    User.insertMany(userDocs, { ordered: false, lean: true }),
    Route.insertMany(routeDocs, { ordered: false, lean: true }),
    Bus.insertMany(busDocs, { ordered: false, lean: true }),
    Schedule.insertMany(scheduleDocs, { ordered: false, lean: true }),
    Booking.insertMany(bookingDocs, { ordered: false, lean: true }),
    SeatReservation.insertMany(seatReservationDocs, { ordered: false, lean: true }),
    Ticket.insertMany([...ticketDocs, ...portalTicketDocs], {
      timestamps: false,
      ordered: false,
      lean: true,
    }),
  ]);

  const teamCount = userDocs.filter((user) => TEAM_ROLES.includes(user.role)).length;
  const todaySchedules = schedulesByDate.get(todayKey) || [];
  const openSchedules = scheduleDocs.filter((schedule) =>
    ['scheduled', 'delayed'].includes(schedule.status)
  );
  const onlineBookings = bookingDocs.filter((booking) => booking.source === 'online');
  const agentBookings = bookingDocs.filter((booking) => booking.source === 'agent');

  console.log(
    `Seeded ${teamCount} team members and ${passengerDocs.length} passengers.`
  );
  console.log(
    `Seeded ${routeDocs.length} routes, ${busDocs.length} buses, ${scheduleDocs.length} departures ` +
      `(${todaySchedules.length} today, ${openSchedules.length} open for booking).`
  );
  console.log(
    `Seeded ${bookingDocs.length} reservations (${onlineBookings.length} online, ` +
      `${agentBookings.length} agent, ${bookingDocs.filter((b) => b.status === 'cancelled').length} cancelled).`
  );
  console.log(
    `Seeded ${ticketDocs.length + portalTicketDocs.length} tickets (${portalTicketDocs.length} scannable portal tickets).`
  );
  console.log('');
  console.log(`Demo administrator: ${admin.email} / ${DEMO_PASSWORD}`);
  console.log('Demo booking agent: diane@example.com');
  console.log('Demo passenger: passenger1@example.com (has upcoming reservations)');
  console.log(`All seeded accounts use the password: ${DEMO_PASSWORD}`);
  console.log(`Seed finished in ${((Date.now() - startedAt) / 1000).toFixed(1)}s.`);

  await disconnectDatabase();
}

seed()
  .then(() => {
    console.log('Seed complete.');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Seed failed:', error.message);
    await disconnectDatabase().catch(() => {});
    process.exit(1);
  });
