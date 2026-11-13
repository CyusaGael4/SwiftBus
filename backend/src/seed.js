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

const routeSeed = [
  ['NYA-HUY', 'Nyabugogo', 'Huye', 5000, 120],
  ['NYA-MUS', 'Nyabugogo', 'Musanze', 4000, 150],
  ['NYA-RUH', 'Nyabugogo', 'Ruhango', 3000, 75],
  ['NYA-RUB', 'Nyabugogo', 'Rubavu', 7000, 180],
];

const firstBuses = [
  ['SB-001', 'RAE 204 B', 48, 'active', 0, 5],
  ['SB-002', 'RAE 318 C', 48, 'active', 1, 8],
  ['SB-003', 'RAF 112 D', 36, 'active', 2, 11],
  ['SB-004', 'RAE 226 E', 48, 'active', null, 13],
  ['SB-005', 'RAE 340 F', 36, 'active', null, 15],
  ['SB-006', 'RAG 154 G', 48, 'maintenance', null, -3],
];

// time, route index, bus index, seats booked, status today
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

// Illustrative booking volume, Monday to Sunday.
const bookingsPerWeekday = [84, 112, 96, 146, 129, 177, 155];

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
      // Phone numbers are assigned by position so every record stays unique.
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

  const weekStart = startOfWeek(today);
  const schedulesByDate = new Map();
  const scheduleDocs = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    const date = addDays(weekStart, dayOffset);
    const dateKey = toDateKey(date);
    const daySchedules = [];

    departureTemplate.forEach(([time, routeIndex, busIndex, seats, todayStatus], index) => {
      const departureTime = atTime(date, time);
      const route = routeDocs[routeIndex];
      const bus = busDocs[busIndex];

      let status = 'scheduled';
      if (dateKey < todayKey) status = 'completed';
      if (dateKey === todayKey) status = todayStatus;
      if (dateKey > todayKey) status = 'scheduled';

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
    });

    schedulesByDate.set(dateKey, daySchedules);
  }

  const ticketDocs = [];
  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    const date = addDays(weekStart, dayOffset);
    const dateKey = toDateKey(date);
    const daySchedules = schedulesByDate.get(dateKey);
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

  // Every document already owns its ObjectId, so all five writes can go out
  // together instead of waiting on schedules/buses/routes one after another.
  // insertMany with timestamps disabled keeps the demo ticket dates used by
  // the dashboard chart.
  await Promise.all([
    User.insertMany(userDocs, { ordered: false, lean: true }),
    Route.insertMany(routeDocs, { ordered: false, lean: true }),
    Bus.insertMany(busDocs, { ordered: false, lean: true }),
    Schedule.insertMany(scheduleDocs, { ordered: false, lean: true }),
    Ticket.insertMany(ticketDocs, { timestamps: false, ordered: false, lean: true }),
  ]);

  const teamCount = userDocs.filter((user) => TEAM_ROLES.includes(user.role)).length;
  console.log(`Seeded ${teamCount} team members and ${passengerDocs.length} passengers.`);
  console.log(
    `Seeded ${routeDocs.length} routes, ${busDocs.length} buses, ${scheduleDocs.length} departures.`
  );
  console.log(`Seeded ${ticketDocs.length} bookings.`);
  console.log('');
  console.log('Demo administrator: aline@example.com / Swiftbus@123');
  console.log('All seeded accounts use the password: Swiftbus@123');

  await disconnectDatabase();
}

seed()
  .then(() => {
    console.log('Seed complete.');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await disconnectDatabase().catch(() => {});
    process.exit(1);
  });
