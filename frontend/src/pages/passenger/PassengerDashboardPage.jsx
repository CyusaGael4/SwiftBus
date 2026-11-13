import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { passengerApi } from '../../api/passenger.js';
import { statusLabel, statusStyle } from '../../lib/bookingStatus.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, formatRwf, formatTime } from '../../lib/format.js';

const STATS = [
  { key: 'upcoming', label: 'Upcoming trips' },
  { key: 'completed', label: 'Trips completed' },
  { key: 'totalBookings', label: 'Bookings made' },
];

export default function PassengerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    passengerApi
      .dashboard()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = data?.stats || {};
  const firstName = (user?.fullName || '').split(' ')[0] || 'traveller';
  const next = data?.nextJourney;

  return (
    <div className="passenger-shell py-6 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[27px] font-semibold leading-tight tracking-[-0.025em] text-navy sm:text-[32px]">
            Hello, {firstName}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-muted">
            Your reservations, tickets and travel history in one place.
          </p>
        </div>
        <Link
          to="/search"
          className="inline-flex h-10 shrink-0 items-center justify-center self-start rounded-[4px] bg-accent px-4 text-[12.5px] font-semibold text-white transition hover:bg-accent/90"
        >
          Book a trip
        </Link>
      </div>

      {error ? (
        <p className="mt-5 rounded-[4px] border border-[#E3C4B8] bg-warning-soft px-3.5 py-2.5 text-[12.5px] text-[#8E4A33]">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-6 h-[190px] animate-pulse rounded-[8px] border border-border bg-surface" />
      ) : next ? (
        <section className="mt-6 rounded-[8px] border border-border bg-surface">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
                Next journey
              </p>
              <h2 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-navy">
                {next.trip.route.origin} → {next.trip.route.destination}
              </h2>
              <p className="mt-1 text-[13px] text-muted">
                {formatDate(next.trip.departureTime)} · depart{' '}
                {formatTime(next.trip.departureTime)} · Bus{' '}
                {next.trip.bus.plateNumber || next.trip.bus.busCode}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {next.seats.map((seat) => (
                  <span
                    key={seat}
                    className="rounded-[3px] border border-border bg-table-head px-2 py-1 text-[11px] font-semibold text-navy"
                  >
                    Seat {seat}
                  </span>
                ))}
                <span className="ml-1 text-[11.5px] text-muted">{next.reference}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-5 sm:flex-col sm:items-end sm:gap-3">
              <div className="sm:text-right">
                <p className="text-[11px] text-muted">Pay on board</p>
                <p className="mt-0.5 text-[18px] font-semibold text-navy">
                  {formatRwf(next.totalAmountRwf)}
                </p>
              </div>
              <Link
                to={`/passenger/tickets?booking=${next.reference}`}
                className="inline-flex h-10 items-center rounded-[4px] bg-accent px-4 text-[12.5px] font-semibold text-white transition hover:bg-accent/90"
              >
                Show ticket
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-[8px] border border-border bg-surface px-5 py-8 text-center">
          <p className="text-[15px] font-semibold text-navy">No upcoming journeys</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
            Reserve a seat and it will appear here with its digital ticket.
          </p>
          <Link
            to="/search"
            className="mt-4 inline-flex h-9 items-center rounded-[4px] bg-accent px-4 text-[12px] font-semibold text-white"
          >
            Find a trip
          </Link>
        </section>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3">
        {STATS.map((item) => (
          <div
            key={item.key}
            className="rounded-[8px] border border-border bg-surface px-4 py-4"
          >
            <p className="text-[24px] font-semibold leading-none text-navy">
              {loading ? '—' : stats[item.key] || 0}
            </p>
            <p className="mt-2 text-[11.5px] leading-snug text-muted">{item.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 overflow-hidden rounded-[8px] border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-[15px] font-semibold text-navy">Recent bookings</h2>
          <Link to="/passenger/bookings" className="text-[12px] font-medium text-accent">
            View all
          </Link>
        </div>

        <div className="divide-y divide-border">
          {loading ? (
            <p className="px-5 py-8 text-center text-[12.5px] text-muted">Loading…</p>
          ) : data?.recent?.length ? (
            data.recent.map((booking) => (
              <Link
                key={booking.id}
                to={`/passenger/tickets?booking=${booking.reference}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-table-head/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium text-navy">
                    {booking.trip.route.origin} → {booking.trip.route.destination}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    {formatDate(booking.trip.departureTime)} ·{' '}
                    {formatTime(booking.trip.departureTime)} · {booking.reference}
                  </p>
                </div>
                <span className={`badge shrink-0 ${statusStyle(booking.status)}`}>
                  {statusLabel(booking.status)}
                </span>
              </Link>
            ))
          ) : (
            <p className="px-5 py-8 text-center text-[12.5px] text-muted">
              Your bookings will appear here after your first reservation.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
