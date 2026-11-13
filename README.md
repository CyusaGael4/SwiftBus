# SwiftBus

SwiftBus is a bus reservation and fleet-management portal built for the SwiftBus
admin team. It gives teams a single place to manage vehicles, routes, daily
departures, and staff access, with a dashboard that summarises bookings and
sales at a glance.

The interface follows the supplied SwiftBus design language: navy panels, warm
cream surfaces, DM Sans typography, and a single orange accent.

## Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Frontend   | React 18, Vite 6, React Router 7, Tailwind CSS 3 |
| Backend    | Node.js, Express 4, Mongoose 8, JWT, bcrypt     |
| Database   | MongoDB (local or MongoDB Atlas)                |
| Tooling    | npm workspaces (via prefix scripts), nodemon    |

## Features

- Session-based login and registration with JWT bearer authentication
- Dashboard with fleet, booking, passenger, and sales KPIs, a weekly booking
  chart, and upcoming departures
- Buses CRUD with status tabs, route assignment, capacity, and maintenance dates
- Schedule management with day navigation, status tabs, seat load indicators,
  driver assignment, and a "today" view that excludes closed departures
- Routes directory with search and filtering
- Team management with roles, team-member creation, access resend, and
  protected admin-only access
- Public passenger portal: trip search, seat selection, JWT checkout, digital
  QR tickets, passenger dashboard, bookings, cancellation and profile
- Responsive admin layout with collapsible mobile sidebar
- Seeded, realistic demo data relative to the current week

## Project structure

```
SwiftBus/
├─ backend/
│  ├─ src/
│  │  ├─ config/        # environment + database connection
│  │  ├─ controllers/   # auth, dashboard, buses, routes, schedules, users
│  │  ├─ middleware/    # auth guard, error handling
│  │  ├─ models/        # User, Bus, Route, Schedule, Ticket
│  │  ├─ routes/        # Express routers
│  │  ├─ utils/         # dates, validators, async wrapper
│  │  ├─ app.js         # Express application
│  │  └─ seed.js        # demo data seeder
│  ├─ server.js
│  └─ .env.example
├─ frontend/
│  ├─ public/icons/
│  ├─ src/
│  │  ├─ api/           # axios client + API wrappers
│  │  ├─ assets/icons/  # provided icon set
│  │  ├─ components/    # layout, form modals, UI primitives
│  │  ├─ context/       # authentication context
│  │  ├─ pages/         # dashboard, buses, schedule, routes, users, auth
│  │  └─ lib/           # formatting helpers
│  ├─ tailwind.config.js
│  └─ vite.config.js
├─ icons/               # original icon assets
└─ package.json         # root convenience scripts
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- A MongoDB connection string (local MongoDB or a MongoDB Atlas cluster)

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure the backend

Copy `backend/.env.example` to `backend/.env` and fill in the values:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
MONGODB_DB=swiftbus

JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
```

The frontend calls `/api` through the Vite proxy, so no extra configuration is
needed for local development. To point it at a different API host, copy
`frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`.

### 3. Seed demo data (recommended)

```bash
npm run seed
```

Seeding clears users, routes, buses, schedules, and tickets, then recreates a
full dataset for the current week.

### 4. Run the app

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Demo credentials

All seeded accounts use the password `Swiftbus@123`.

| Role          | Email                 |
| ------------- | --------------------- |
| Administrator | aline@example.com     |
| Administrator | eric@example.com      |
| Booking agent | diane@example.com     |
| Driver        | samuel@example.com    |

The public registration form creates a **passenger** account for the passenger
portal. Staff accounts are created from the Users page by an administrator;
self-registration can never create staff or admin roles.

Seeded passenger accounts (`passenger1@example.com` … `passenger10@example.com`)
use the same password and can be used to walk through the booking flow.

## Available scripts

Run from the repository root:

| Command               | Description                                    |
| --------------------- | ---------------------------------------------- |
| `npm run install:all` | Install backend and frontend dependencies      |
| `npm run seed`        | Reset and seed the database                    |
| `npm run dev`         | Run the API and Vite dev server together       |
| `npm run build`       | Build the frontend for production              |

## API overview

All routes except auth and health require `Authorization: Bearer <token>`.

| Method | Endpoint                    | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| POST   | `/api/auth/register`        | Create an administrator account      |
| POST   | `/api/auth/login`           | Sign in and receive a JWT            |
| GET    | `/api/auth/me`              | Current session profile              |
| GET    | `/api/dashboard`            | KPIs, weekly analytics, departures   |
| GET    | `/api/buses`                | List buses with filters and stats    |
| POST   | `/api/buses`                | Create a bus                         |
| GET    | `/api/buses/:id`            | Bus details                          |
| PUT    | `/api/buses/:id`            | Update a bus                         |
| DELETE | `/api/buses/:id`            | Delete a bus (admin)                 |
| GET    | `/api/routes`               | List routes                          |
| POST   | `/api/routes`               | Create a route                       |
| PUT    | `/api/routes/:id`           | Update a route                       |
| DELETE | `/api/routes/:id`           | Delete an unused route               |
| GET    | `/api/schedules`            | List departures by tab/date          |
| POST   | `/api/schedules`            | Create a departure                   |
| PUT    | `/api/schedules/:id`        | Update a departure                   |
| DELETE | `/api/schedules/:id`        | Delete a departure                   |
| GET    | `/api/public/destinations`  | Public origins, destinations, popular|
| GET    | `/api/public/trips`         | Public trip search (origin/date)     |
| GET    | `/api/public/trips/:id`     | Trip details and availability        |
| GET    | `/api/public/trips/:id/seats`| Seat map for a trip                 |
| POST   | `/api/public/trips/:id/hold`| Temporary seat hold during checkout  |
| GET    | `/api/passenger/dashboard`  | Passenger dashboard (passenger only) |
| GET    | `/api/passenger/bookings`   | Own bookings with status tabs        |
| POST   | `/api/passenger/bookings`   | Create an online reservation         |
| GET    | `/api/passenger/bookings/:reference` | Own booking details         |
| POST   | `/api/passenger/bookings/:reference/cancel` | Cancel a reservation  |
| GET    | `/api/passenger/tickets`    | Own digital tickets                  |
| PATCH  | `/api/passenger/profile`    | Update passenger profile             |
| POST   | `/api/passenger/profile/password` | Change passenger password      |
| GET    | `/api/tickets/verify/:code` | Staff ticket verification (staff)    |
| GET    | `/api/users/drivers`        | Active drivers for assignment        |
| GET    | `/api/users`                | List team members and stats (admin)  |
| POST   | `/api/users`                | Invite a team member (admin)         |
| POST   | `/api/users/:id/resend`     | Resend an invitation (admin)         |
| PUT    | `/api/users/:id`            | Update a team member (admin)         |
| DELETE | `/api/users/:id`            | Remove a team member (admin)         |

## Notes

- Passwords are hashed with bcrypt; JWTs are signed with `JWT_SECRET`.
- Deleting a bus, route, or driver that is still in use is blocked with a
  descriptive conflict response.
- `.env` files are git-ignored; keep `.env.example` files up to date.
